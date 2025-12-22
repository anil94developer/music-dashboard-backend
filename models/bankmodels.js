const db = require("../utils/dbConn");
const mongoose = require("mongoose");

bankModel = {}

 
    const bankSchema = new mongoose.Schema({
        userId: { 
            type: String, 
            required: true // Ensure every bank record is linked to a user
        },
        panNumber: {
            type: String,
            required: true, // PAN is usually mandatory
            unique: true,   // Ensure PAN is unique in the database
            trim: true,     // Remove extra whitespace
        },
        accountHolder: {
            type: String,
            required: true, // Account holder name should not be empty
            trim: true,
        },
        bankName: {
            type: String,
            required: true,
            trim: true,
        },
        ifscCode: {
            type: String,
            required: true,
            trim: true,
            // match: /^[A-Z]{4}0[A-Z0-9]{6}$/, // Validate IFSC format
        },
        accountNumber: {
            type: String,
            required: true,
            unique: true, // Account numbers should be unique
            trim: true,
        },
        accountType: {
            type: String,
            enum: ["Savings", "Current"], // Limit account type options
            default: "Savings",
        },
    }, { timestamps: true }); // Adds createdAt and updatedAt fields
    
   

bankModel.addbank = async (data) => {
    const result = await db.connectDb("bank", bankSchema);
    let insData = await result.insertMany(data);
    console.log(insData);
    if (insData.length > 0) {
        return insData[0];
    } else {
        return false
    }
};

bankModel.bankDetails = async (uId) => {
    const result = await db.connectDb("bank", bankSchema);
    let fetData = await result.find({ userId: uId });
 
    if (fetData.length > 0) {
        return fetData[0];
    } else {
        return [];
    }
};


module.exports = bankModel