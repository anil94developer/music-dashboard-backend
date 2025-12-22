const db = require("../utils/dbConn");
const mongoose = require("mongoose");

const withdrawalSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    amount: {
        type: Number,
        default: 0
    },
    remark: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["active", "Pending", "complete"]
    }
}, { timestamps: true })

const withdrawalModel = mongoose.model("withdrawal", withdrawalSchema);


withdrawalModel.add = async (data) => {
    const result = await db.connectDb("withdrawal", withdrawalSchema);
    try {
        const newWithdrawal = new withdrawalModel(data);
        await newWithdrawal.save();
        // console.log("this is what",newWithdrawal)
        return newWithdrawal;
    } catch (e) {
        // console.log(e);
        return false;
    }
}
withdrawalModel.getWithdrawalbyId = async (userId) => {
    const result = await db.connectDb("withdrawal", withdrawalSchema); 
    try {
        const transactions = await withdrawalModel.find({ userId:userId }); // Retrieve all transactions for the given user
        // console.log("Transactions retrieved successfully:", transactions);
        return transactions; // Return the retrieved transactions
    } catch (error) {
        // console.error("Error retrieving transactions:", error.message);
        return false; // Return false on error
    }
};

withdrawalModel.withdrawList = async () => {
    const result = await db.connectDb("withdrawal", withdrawalSchema);

    try {
        const transactions = await result.find(); // Fetch all transactions

        if (!transactions || transactions.length === 0) {
            // console.log("No transactions found");
            return false;
        }

        // Fetch user data in parallel using Promise.all
        const updatedTransactions = await Promise.all(
            transactions.map(async (transaction) => {
                const userData = await authModel.getUser(transaction.userId);
                return {
                    ...transaction,
                    userdetails: userData || null, // Add userdetails or null if not found
                };
            })
        );

        return updatedTransactions; // Return the transactions with user details
    } catch (error) {
        // console.error("Error retrieving transactions:", error.message);
        return false;
    }
};

withdrawalModel.updateStatus = async (id, status) => {
    // console.log(id,status);
    const result = await db.connectDb("withdrawal", withdrawalSchema);
    try {
        let updateData = await result.updateOne(
            { _id: id },
            { $set: { status: status } }
        );
        return updateData;
    } catch (err) {
        // console.error("Error in is_deleted:", err.message);
        return false; // Return false on error
    }
}

module.exports = withdrawalModel;
