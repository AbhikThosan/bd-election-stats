const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    match: [
      /^[a-zA-Z0-9]+$/,
      "Username must be alphanumeric and at least 3 characters long",
    ],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  role: {
    type: String,
    enum: ["super_admin", "admin", "editor"],
    default: "editor",
  },
  status: {
    type: String,
    enum: ["pending", "active", "inactive"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt timestamp on save
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// TTL index for pending users: auto-delete after 48 hours
userSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 48 * 60 * 60,
    partialFilterExpression: { status: "pending" },
  }
);

module.exports = mongoose.model("User", userSchema);
