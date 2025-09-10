const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const connectDB = require("../config/db");
const logger = require("../utils/logger");
const dotenv = require("dotenv");

dotenv.config();

async function seedSuperAdmin() {
  try {
    await connectDB();
    const email = "superadmin@bdelectionstats.com";
    const username = "superadmin";
    const password = "SuperAdmin123!"; // Change in production

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.info("Super admin already exists");
      process.exit(0);
    }

    const user = new User({
      email,
      username,
      password: await bcrypt.hash(password, 10),
      role: "super_admin",
      status: "active",
    });
    await user.save();

    logger.info("Super admin seeded successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Error seeding super admin:", error);
    process.exit(1);
  }
}

seedSuperAdmin();
