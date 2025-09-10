const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Notification = require("../models/Notification");
const CustomError = require("../utils/errors");
const logger = require("../utils/logger");
const { getIO } = require("../socket");

exports.register = async (req, res, next) => {
  try {
    const { email, username, password, role } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new CustomError("Email or username already exists", 400);
    }

    const user = new User({
      email,
      username,
      password: await bcrypt.hash(password, 10),
      role,
      status: "pending",
    });
    await user.save();

    const recipients = await User.find({
      role: {
        $in: role === "editor" ? ["super_admin", "admin"] : ["super_admin"],
      },
      status: "active",
    });
    const notifications = recipients.map((recipient) => ({
      recipientId: recipient._id,
      userId: user._id,
      email: user.email,
      username: user.username,
      role,
      type: "registration_approval",
    }));
    const savedNotifications = await Notification.insertMany(notifications);

    const io = getIO();
    recipients.forEach((recipient, index) => {
      io.to(recipient._id.toString()).emit("newRegistration", {
        notificationId: savedNotifications[index]._id,
        userId: user._id,
        email: user.email,
        username: user.username,
        role,
      });
    });

    res.status(201).json({
      message: "Registration successful, awaiting approval",
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, status: "active" });
    if (!user) {
      throw new CustomError("Invalid credentials or account not approved", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new CustomError("Invalid credentials", 401);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    throw new CustomError("Refresh token not implemented", 501);
  } catch (error) {
    next(error);
  }
};

exports.adminResetPassword = async (req, res, next) => {
  try {
    const { userId, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      throw new CustomError("User not found", 404);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};
