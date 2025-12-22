const Joi = require("joi");
const validate = require("../../helper/ValidateHelper");

async function loginValidation(req, res, next) {
  const schema = Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  const isValid = await validate(req.body, res, schema);
  if (isValid) {
    next();
  }
}

async function forgotPasswordValidation(req, res, next) {
  const schema = Joi.object().keys({
    password: Joi.string().required().messages({
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),
    cpassword: Joi.string().required().messages({
      "string.empty": "Confirm password is required",
      "any.required": "Confirm password is required",
    }),
    otpkey: Joi.string().required().messages({
      "string.empty": "Email Id or mobile number is required",
      "any.required": "Email Id or mobile number is required",
    }),
  });
  const isValid = await validate(req.body, res, schema);
  if (isValid) {
    next();
  }
}

async function otpSendValidation(req, res, next) {
  const schema = Joi.object().keys({
    otpkey: Joi.string().required().messages({
      "string.empty": "Email Id or mobile number is required",
      "any.required": "Email Id or mobile number is required",
    }),
  });
  const isValid = await validate(req.body, res, schema);
  if (isValid) {
    next();
  }
}

async function otpVerifyValidation(req, res, next) {
  const schema = Joi.object().keys({
    otpkey: Joi.string().required().messages({
      "string.empty": "Email Id or mobile number is required",
      "any.required": "Email Id or mobile number is required",
    }),
    otp: Joi.string().required().messages({
      "string.empty": "Otp is required",
      "any.required": "Otp is required",
    }),
  });
  const isValid = await validate(req.body, res, schema);
  if (isValid) {
    next();
  }
}

async function signUpValidation(req, res, next) {
  const schema = Joi.object().keys({
    emailId: Joi.string().email().required(),
    name: Joi.string().required(),
    // lastName: Joi.string().required(),
    state: Joi.string().required(),
    mobileNumber: Joi.string()
      .pattern(new RegExp("^[0-9]{10}$"))
      .required()
      .messages({
        "string.pattern.base": "Mobile number must be a 10-digit",
        "any.required": "Mobile number is required",
      }),
    // type: Joi.string().required(),
    password: Joi.string()
      .min(8)
      .required()
      .pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$"))
      .message({
        "string.pattern.base":
          "Password must have at least 1 uppercase letter, 1 lowercase letter, and 1 number",
        "string.min": "Password must be at least 8 characters long",
        "any.required": "Password is required",
      }),
    Cpassword: Joi.string().valid(Joi.ref("password")).required().messages({
      "any.only": "Password and confirm password do not match",
      "any.required": "Confirm password is required",
    }),
    // referral_from_id: Joi.string().allow('').optional(),
  });
  const isValid = await validate(req.body, res, schema);
  if (isValid) {
    next();
  }
}

module.exports = {
  loginValidation,
  signUpValidation,
  forgotPasswordValidation,
  otpVerifyValidation,
  otpSendValidation,
};
