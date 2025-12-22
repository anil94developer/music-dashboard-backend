const express = require("express")
const router = express.Router(); 
const verifyToken = require("../utils/verifyToken");
const wallet = require("../services/walletService");

router.post('/send-withdrawal',verifyToken,wallet.transactions);
router.get('/list-transactions',verifyToken,wallet.listTransactions);
router.get('/get-withdraw-request',verifyToken,wallet.withdrowList);
router.get('/get-withdrawal-by-id',verifyToken,wallet.getWithdrawalbyId);

router.post('/withdraw-status',verifyToken,wallet.withdrawStatus);
router.get('/get-all-transcations',verifyToken,wallet.getTranscations);

module.exports = router;