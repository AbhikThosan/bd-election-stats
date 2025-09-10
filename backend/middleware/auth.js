const jwt = require("jsonwebtoken");
const CustomError = require("../utils/errors");
const logger = require("../utils/logger");

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new CustomError("No token provided", 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    logger.error("Token verification failed:", error);
    throw new CustomError("Invalid token", 401);
  }
};
