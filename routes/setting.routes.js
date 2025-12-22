const express = require("express")
const router = express.Router();
const settingService = require("../services/settingService"); 
const verifyToken = require("../utils/verifyToken");

router.get('/downloadDb',verifyToken, settingService.downloadDb)  

module.exports = router 