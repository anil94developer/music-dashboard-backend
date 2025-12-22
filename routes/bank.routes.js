const express = require("express")
const router = express.Router();
const bankService = require("../services/bankService"); 
const verifyToken = require("../utils/verifyToken");

router.post('/add-bank',verifyToken, bankService.addbank)
router.get('/bank-details',verifyToken, bankService.bankDetails)

module.exports = router 