const User = require("../models/User");
const Notification = require("../models/Notification");
const CustomError = require("../utils/errors");
const logger = require("../utils/logger");
const { getIO } = require("../socket");

exports.listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, email, role, status } = req.query;
    const query = {};
    if (email) query.email = { $regex: email, $options: "i" };
    if (role) query.role = role;
    if (status) query.status = status;

    // Restrict admins to see only editors
    if (req.user.role === "admin") {
      query.role = "editor";
    }

    const users = await User.find(query)
      .select("email username role status createdAt")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const total = await User.countDocuments(query);

    res.json({ users, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("email username role status createdAt")
      .lean();
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Restrict admins from accessing super_admin/admin data
    if (req.user.role === "admin" && user.role !== "editor") {
      throw new CustomError("Unauthorized", 403);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

exports.approveUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { approve } = req.body;
    const user = await User.findById(id);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Restrict admins from approving non-editors
    if (req.user.role === "admin" && user.role !== "editor") {
      throw new CustomError("Unauthorized", 403);
    }

    if (approve) {
      user.status = "active";
      await user.save();
    } else {
      await user.deleteOne();
    }

    // Delete all corresponding notifications on approval or rejection
    await Notification.deleteMany({
      userId: id,
      type: "registration_approval",
    });

    // Notify user (optional, via Socket.IO)
    if (approve) {
      const io = getIO();
      io.to(user._id.toString()).emit("registrationApproved", {
        message: "Your registration has been approved",
      });
    }

    res.json({
      message: `User ${approve ? "approved" : "rejected and deleted"}`,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findById(id);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Restrict admins from modifying non-editors
    if (req.user.role === "admin" && user.role !== "editor") {
      throw new CustomError("Unauthorized", 403);
    }

    user.role = role;
    await user.save();

    res.json({ message: "Role updated" });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    // Restrict admins from deleting non-editors
    if (req.user.role === "admin" && user.role !== "editor") {
      throw new CustomError("Unauthorized", 403);
    }

    await user.deleteOne();
    await Notification.deleteMany({ userId: id });

    res.json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};
