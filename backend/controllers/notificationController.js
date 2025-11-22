const Notification = require("../models/Notification");
const User = require("../models/User");
const CustomError = require("../utils/errors");
const logger = require("../utils/logger");
const { getIO } = require("../socket");

exports.listNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { 
      recipientId: req.user.id,
      status: "pending" // Only show pending notifications
    };
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 }) // Most recent first
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

exports.updateNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const notification = await Notification.findById(id);
    if (!notification) {
      throw new CustomError("Notification not found", 404);
    }

    if (!notification.recipientId.equals(req.user.id)) {
      throw new CustomError("Unauthorized", 403);
    }

    if (req.user.role === "admin" && notification.role !== "editor") {
      throw new CustomError("Unauthorized", 403);
    }

    const user = await User.findById(notification.userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    if (status === "approved") {
      user.status = "active";
      await user.save();
    } else if (status === "rejected") {
      await user.deleteOne();
    }

    // Delete all corresponding notifications on approval or rejection
    await Notification.deleteMany({
      userId: notification.userId,
      type: "registration_approval",
    });

    if (status === "approved") {
      const io = getIO();
      io.to(user._id.toString()).emit("registrationApproved", {
        message: "Your registration has been approved",
      });
    }

    res.json({ message: "Notification updated" });
  } catch (error) {
    next(error);
  }
};
