const Joi = require("joi");
const validate = require("../../helper/ValidateHelper");

async function membershipValidation(req, res, next) {
  const schema = Joi.object().keys({
    name: Joi.string().trim().min(2).max(100).required().messages({
      "string.empty": "Membership name is required",
      "string.min": "Membership name must be at least 2 characters",
      "string.max": "Membership name must not exceed 100 characters",
      "any.required": "Membership name is required"
    }),
    price: Joi.number().positive().required().messages({
      "number.base": "Price must be a number",
      "number.positive": "Price must be a positive number",
      "any.required": "Price is required"
    }),
    duration: Joi.number().integer().positive().required().messages({
      "number.base": "Duration must be a number",
      "number.integer": "Duration must be an integer",
      "number.positive": "Duration must be a positive number",
      "any.required": "Duration is required"
    }),
    durationType: Joi.string().valid('days', 'months', 'years').optional().default('months'),
    discount: Joi.number().min(0).max(100).optional().default(0),
    maxUsers: Joi.number().integer().positive().optional().default(1),
    priority: Joi.number().integer().optional().default(0),
    features: Joi.array().items(Joi.string()).optional().default([]),
    description: Joi.string().max(500).optional().allow('').default(''),
    noOfLabels: Joi.number().integer().min(0).optional().default(0),
    noOfArtists: Joi.number().integer().min(0).optional().default(0),
    is_active: Joi.number().valid(0, 1).optional().default(1),
    is_deleted: Joi.number().valid(0, 1).optional()
  }).unknown(true); // Allow unknown fields to prevent "is not allowed" errors
  const isValid = await validate(req.body, res, schema);
  if (isValid) {
    next();
  }
}

async function updateMembershipValidation(req, res, next) {
  const schema = Joi.object().keys({
    name: Joi.string().trim().min(2).max(100).optional().messages({
      "string.min": "Membership name must be at least 2 characters",
      "string.max": "Membership name must not exceed 100 characters"
    }),
    price: Joi.number().positive().optional().messages({
      "number.base": "Price must be a number",
      "number.positive": "Price must be a positive number"
    }),
    duration: Joi.number().integer().positive().optional().messages({
      "number.base": "Duration must be a number",
      "number.integer": "Duration must be an integer",
      "number.positive": "Duration must be a positive number"
    }),
    durationType: Joi.string().valid('days', 'months', 'years').optional(),
    discount: Joi.number().min(0).max(100).optional(),
    maxUsers: Joi.number().integer().positive().optional(),
    priority: Joi.number().integer().optional(),
    features: Joi.array().items(Joi.string()).optional(),
    description: Joi.string().max(500).optional().allow(''),
    noOfLabels: Joi.number().integer().min(0).optional(),
    noOfArtists: Joi.number().integer().min(0).optional(),
    is_active: Joi.number().valid(0, 1).optional().messages({
      "number.base": "Status must be a number",
      "any.only": "Status must be 0 or 1"
    }),
    is_deleted: Joi.number().valid(0, 1).optional()
  }).unknown(true); // Allow unknown fields
  const isValid = await validate(req.body, res, schema);
  if (isValid) {
    next();
  }
}

module.exports = {
  membershipValidation,
  updateMembershipValidation
};

