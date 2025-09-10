const CustomError = require("../utils/errors");
const logger = require("../utils/logger");

module.exports = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    throw new CustomError("Unauthorized", 403);
  }
  next();
};
