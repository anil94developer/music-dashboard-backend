const Joi = require("joi");
const validate = require("../../helper/ValidateHelper");

async function masterLabelValidation(req, res, next) {
    const schema = Joi.object().keys({
        name: Joi.string().trim().min(2).max(100).required().messages({
            "string.empty": "Label name is required",
            "string.min": "Label name must be at least 2 characters",
            "string.max": "Label name must not exceed 100 characters",
            "any.required": "Label name is required"
        }),
        description: Joi.string().max(500).optional().allow('').default(''),
        is_active: Joi.number().valid(0, 1).optional().default(1)
    }).unknown(true);
    
    const isValid = await validate(req.body, res, schema);
    if (isValid) {
        next();
    }
}

async function updateMasterLabelValidation(req, res, next) {
    const schema = Joi.object().keys({
        name: Joi.string().trim().min(2).max(100).required().messages({
            "string.empty": "Label name is required",
            "string.min": "Label name must be at least 2 characters",
            "string.max": "Label name must not exceed 100 characters",
            "any.required": "Label name is required"
        }),
        description: Joi.string().max(500).optional().allow(''),
        is_active: Joi.number().valid(0, 1).optional()
    }).unknown(true);
    
    const isValid = await validate(req.body, res, schema);
    if (isValid) {
        next();
    }
}

module.exports = { masterLabelValidation, updateMasterLabelValidation };

