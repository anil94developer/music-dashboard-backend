const express = require("express")
const router = express.Router();
const uploadServices = require("../services/uploadServices");
const verifyToken = require("../utils/verifyToken");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {

        cb(null, file.originalname)
    }
})

const upload = multer({
    storage,
})

router.post('/excel', upload.single('file'), uploadServices.uploadExcel);
router.post('/reportExcel', upload.single('file'), uploadServices.reportUploadExcel);
module.exports = router 