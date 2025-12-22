const express = require("express")
const router = express.Router();
const authService = require("../services/authServices");
const verifyToken = require("../utils/verifyToken");
const { loginValidation, signUpValidation, forgotPasswordValidation, otpSendValidation, otpVerifyValidation } = require("../validation/app/auth.validation");
const multer = require("multer");
// const flashService = require("../services/flashMessageService");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})

const upload = multer({
    storage,
}) 

router.post('/signup', authService.signUp)
router.post('/login', authService.login)
router.post('/forgetpassword', authService.forgetPassword)
router.post('/setPassword', authService.setPassword)
router.post('/verifyOtp', authService.verifyOtp)
router.get('/user-profile', verifyToken, authService.getUsers)
router.post('/get-user', verifyToken, authService.getSingleUser)
router.post('/user-change-password', verifyToken, authService.passwordChange)
router.post('/profile-update', verifyToken, upload.single('logo'), authService.profileUpdate)
router.post('/user-delete', verifyToken, authService.is_deleted);
router.get('/user-list', verifyToken, authService.userList);
router.post('/user-permanentdelete', verifyToken, authService.userDelete);
router.post('/walletUpdate', verifyToken, authService.walletUpdate);

// router.post('/get-otp',otpSendValidation, authService.getOtpForMobileAndEmail)
// router.post("/verifyOtp",otpVerifyValidation, authService.verifyOtp)



// router.get('/get-flash-message', flashService.getInArray)



// router.post("/change-forgot-password",forgotPasswordValidation,authService.forgotPassword)


module.exports = router 