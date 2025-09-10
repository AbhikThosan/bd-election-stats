const { validationResult } = require("express-validator");
const CustomError = require("../utils/errors");

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new CustomError("Validation failed", 400, errors.array());
  }
  next();
};
