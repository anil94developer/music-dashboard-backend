const express = require("express")
const router = express.Router(); 
const verifyToken = require("../utils/verifyToken");
const uploadSingleIcon=require("../helper/FileUploadHelper");
const support= require("../services/supportService");
const uploadMultipleIcons = require("../helper/FileUploadHelper");
  
router.post('/add-support',verifyToken, uploadMultipleIcons.array('attachments[]', 10),support.addData)
router.get('/support-list', verifyToken, support.listdata)

module.exports = router 