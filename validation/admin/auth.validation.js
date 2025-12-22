const Joi = require("joi");
const validate = require("../../helper/ValidateHelper");

async function loginValidation(req, res, next) {
  const schema = Joi.object().keys({
    emailId: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  const isValid = await validate(req.body, res, schema);
  if (isValid) {
    next();
  }
}

async function forgotPasswordValidation(req, res, next) {
  const schema = Joi.object().keys({
    emailId: Joi.string().email().required(),
  });
  const isValid = await validate(req.body, res, schema);
  if (isValid) {
    next();
  }
}

module.exports = { loginValidation, forgotPasswordValidation };
