const express = require("express");
const router = express.Router();
const paymentService = require("../services/paymentService");

// Public routes (no authentication required)
router.post("/create-order", paymentService.createPaymentOrder);
router.get("/verify", paymentService.verifyPayment);
router.post("/webhook", paymentService.paymentWebhook);

module.exports = router;

