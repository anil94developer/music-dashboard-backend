 
const settingModal = require("../models/settingmodels");
const validators = require("../utils/validator");
const AppErr = require("../utils/error")
const bcrypt = require("../utils/bcrypt")
const jwt = require("jsonwebtoken");
const R = require("../utils/responseHelper");
const path = require('path');

setting = {}

setting.downloadDb = async (req, res, next) => {
    try {
         
        // Pass the file path to the model function
        let val = await settingModal.getAllDbData();
        
        if (val) {
            return R(res, true, "Database downloaded successfully!!", val, 200)
        }
    } catch (error) {
        next(error)
    }
}

module.exports = setting