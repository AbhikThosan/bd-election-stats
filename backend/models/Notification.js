const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  role: { type: String, enum: ["admin", "editor"], required: true },
  type: {
    type: String,
    enum: ["registration_approval"],
    default: "registration_approval",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

// TTL index for pending notifications: auto-delete after 48 hours
notificationSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 48 * 60 * 60,
    partialFilterExpression: { status: "pending" },
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
