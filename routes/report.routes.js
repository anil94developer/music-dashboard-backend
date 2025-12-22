const express = require("express")
const router = express.Router();
const reportUploadServices = require("../services/reportUploadServices");
 
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

// router.post('/reportExcel', upload.single('file'), reportUploadServices.reportUploadExcel)
// router.post('/getReport', verifyToken, reportUploadServices.getReport)
// router.post('/deleteReport', verifyToken, reportUploadServices.deleteReport)


router.post("/send-track-report",verifyToken,reportUploadServices.trackReport);
router.get("/get-track-report",verifyToken,reportUploadServices.getTrackReport);


router.post("/sent-store-report",verifyToken,reportUploadServices.storeReport);
router.get("/get-store-report",verifyToken,reportUploadServices.getStoreReport);

router.post("/sent-market-report",verifyToken,reportUploadServices.marketDataReport);
router.get("/get-market-report",verifyToken,reportUploadServices.getMarketDataReport);


router.post("/send-overview-report",verifyToken,reportUploadServices.sentOverviewReport);
router.get("/get-overview-report",verifyToken,reportUploadServices.getOverviewReport);
 

router.post("/get-all-financial-report",verifyToken,reportUploadServices.getAllFinancialReport);

router.post("/delete-financial-report",verifyToken,reportUploadServices.deleteReport);



module.exports = router 