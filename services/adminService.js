 
const authModal = require("../models/authmodels");
const validators = require("../utils/validator");
const AppErr = require("../utils/error")
const bcrypt = require("../utils/bcrypt")
const jwt = require("jsonwebtoken");
const R = require("../utils/responseHelper");

adminS = {}

adminS.login = async (req,res,next) => {
    // console.log("req.",req.body)
    try {
        let {
            emailId,
            password
        } = req.body
        if (!emailId) {
               return R(res,false,"Email not found",{},404)
        }
        else if (!password) {
            return R(res,false,"Password not found",{},404)
        }
    
        let emailVal = await validators.emailValidation(emailId);
        // let val = await authModel.adminLogin(userId, password)
        let findadmin = await authModal.findAdmin(emailId, password);
    
        if (!findadmin) {
           return R(res,false,"No user found with this email address!!",{},403)
        }
    
        // Handle permissions - check if permissions exist and is an array
        let findPermisson = findadmin.permissions || [];
        let perArr = [];
        if (Array.isArray(findPermisson)) {
            perArr = findPermisson.map(a => {
                return a.value || a
            })
        }
    
        if (findadmin.is_active != 1 && findadmin.is_active != "1") {
            return R(res,false,"Account is not active!!",{},403)
        }
        if (findadmin) {
            const compare = await bcrypt.passwordComparision(password, findadmin.password);
            if (compare) {
                const userData = {
                    // userId: val["userId"],
                    userId: findadmin._id,
                    emailId: findadmin.email,
                    firstName: findadmin.firstName || findadmin.first_name || "",
                    lastName: findadmin.lastName || findadmin.last_name || "",
                    role: findadmin.role,
                    permissions: perArr,
                    userType: 1
                }
                // userData.emailId === '' ? userData.userType = 1 : userData.userType = 0
                const jwtdata = {
                    expiresIn: process.env.JWT_TIMEOUT_DURATION,
                }
                const secret = process.env.JWT_AD_SECRET;
                userData.token = jwt.sign(userData, secret, jwtdata);
    
                return R(res,true,"Login Successfully!!",userData,200)
    
            } else {
               return R(res,false,"Password is invalid!!",{},403)
            }
        } else {
           return R(res,false,"No user found!!",{},403)
        }
    } catch (error) {
        next(error)
    }
   

}

adminS.forgotPassword = async (req,res,next) => {
    try{
        // console.log("req.body.emailId",req.body)
        let val = await authModel.checkAvailablityForAdmin(req.body.emailId);
        if(!val){
            return R(res,false,"No user exist",{},403)
        }
            const password = await bcrypt.passwordEncryption("123456");
            const insData = await authModel.forgotPasswordForAdmin(req.body.emailId, password);

            if (insData) {
                return R(res,true,`Password changed successfully your new password is: 123456`,{},200)
            }
    }catch(error){
        // console.log("erroroororor",error)
        next(error)
    }
   
};

adminS.getPermission = async(req,res,next) => {
    try {
        let findAdmin = await authModal.findPermission(req.doc.userId)
        if (!findAdmin) {
            return R(res, false, "Admin not found", {}, 404);
        }
        
        // Handle permissions - check if permissions exist and is an array
        let findPermisson = findAdmin.permissions || [];
        let perArr = [];
        if (Array.isArray(findPermisson)) {
            perArr = findPermisson.map(a => {
                return a.value || a
            })
        }
        
        const userData = {
            // userId: val["userId"],
            userId: findAdmin._id,
            emailId: findAdmin.email,
            firstName: findAdmin.firstName || findAdmin.first_name || "",
            lastName: findAdmin.lastName || findAdmin.last_name || "",
            permissions: perArr,
            userType: 1,
            role: findAdmin.role
        }
        return R(res,true,"Data Found successfully!!",userData,200)
    } catch (error) {
        next(error)
    }
  

}

module.exports = adminS