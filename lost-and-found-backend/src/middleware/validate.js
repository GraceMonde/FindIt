// error handling middleware for validation
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => err.msg);
    return res.status(400).json({ success: false, errors: extractedErrors });
  }
  next();
};

module.exports = validate;
