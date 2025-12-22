const db = require("../utils/dbConn");
const mongoose = require("mongoose");
const { ObjectId } = require('mongodb');

paymentModel = {};

const paymentSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    membershipId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    paymentSessionId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
        default: "PENDING"
    },
    paymentId: {
        type: String
    },
    paymentMethod: {
        type: String
    },
    paymentTime: {
        type: Date
    },
    companyData: {
        type: Object
    },
    cashfreeResponse: {
        type: Object
    }
}, { timestamps: true });

// Create payment record
paymentModel.createPayment = async (data) => {
    try {
        const result = await db.connectDb("payments", paymentSchema);
        const payment = await result.create(data);
        return payment;
    } catch (err) {
        console.error("Error creating payment:", err.message);
        return false;
    }
};

// Get payment by order ID
paymentModel.getPaymentByOrderId = async (orderId) => {
    try {
        const result = await db.connectDb("payments", paymentSchema);
        const payment = await result.findOne({ orderId: orderId });
        return payment;
    } catch (err) {
        console.error("Error getting payment:", err.message);
        return false;
    }
};

// Update payment status
paymentModel.updatePayment = async (orderId, updateData) => {
    try {
        const result = await db.connectDb("payments", paymentSchema);
        const payment = await result.updateOne(
            { orderId: orderId },
            { $set: updateData }
        );
        return payment;
    } catch (err) {
        console.error("Error updating payment:", err.message);
        return false;
    }
};

// Get payments by user ID
paymentModel.getPaymentsByUserId = async (userId) => {
    try {
        const result = await db.connectDb("payments", paymentSchema);
        const payments = await result.find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 });
        return payments;
    } catch (err) {
        console.error("Error getting payments:", err.message);
        return false;
    }
};

module.exports = paymentModel;

