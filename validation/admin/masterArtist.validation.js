const Joi = require("joi");
const validate = require("../../helper/ValidateHelper");

async function masterArtistValidation(req, res, next) {
    const schema = Joi.object().keys({
        name: Joi.string().trim().min(2).max(100).required().messages({
            "string.empty": "Artist name is required",
            "string.min": "Artist name must be at least 2 characters",
            "string.max": "Artist name must not exceed 100 characters",
            "any.required": "Artist name is required"
        }),
        linkId: Joi.string().trim().max(200).optional().allow('').default(''),
        itunesLinkId: Joi.string().trim().max(200).optional().allow('').default(''),
        description: Joi.string().max(500).optional().allow('').default(''),
        is_active: Joi.number().valid(0, 1).optional().default(1)
    }).unknown(true);
    
    const isValid = await validate(req.body, res, schema);
    if (isValid) {
        next();
    }
}

async function updateMasterArtistValidation(req, res, next) {
    const schema = Joi.object().keys({
        name: Joi.string().trim().min(2).max(100).required().messages({
            "string.empty": "Artist name is required",
            "string.min": "Artist name must be at least 2 characters",
            "string.max": "Artist name must not exceed 100 characters",
            "any.required": "Artist name is required"
        }),
        linkId: Joi.string().trim().max(200).optional().allow(''),
        itunesLinkId: Joi.string().trim().max(200).optional().allow(''),
        description: Joi.string().max(500).optional().allow(''),
        is_active: Joi.number().valid(0, 1).optional()
    }).unknown(true);
    
    const isValid = await validate(req.body, res, schema);
    if (isValid) {
        next();
    }
}

module.exports = { masterArtistValidation, updateMasterArtistValidation };

