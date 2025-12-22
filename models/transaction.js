const db = require("../utils/dbConn");
const mongoose = require("mongoose");
const { ObjectId } = require('mongodb');
trans={}

const transcationSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    amount:{
        type:Number,
        default:0
    },
    remark:{
      type:String,
      default:""
    },
    status:{
        type:String,
        enum:["active", "Pending", "complete"]
    },
    creditAmount:{
        type:Number,
        default:0
    },
    debitAmount:{
        type:Number,
        default:0
    }

}, { timestamps: true })

const transcationModel = mongoose.model("transcation", transcationSchema);
trans.add = async (data) => {
    const result = await db.connectDb("transactions", transcationSchema); // Ensure proper connection
    
    try {
        const transaction = new transcationModel(data); // Create a new transaction instance
        const savedTransaction = await transaction.save(); // Save the transaction to the database
        console.log("Transaction successfully saved:", savedTransaction);
        return savedTransaction; // Return the saved transaction
    } catch (error) {
        console.error("Error saving transaction:", error.message);
        return false; // Return false on error
    }
};

trans.list = async (userId) => {
    const result = await db.connectDb("transactions", transcationSchema); 

    try {
        const transactions = await transcationModel.find({ userId:userId }); // Retrieve all transactions for the given user
        console.log("Transactions retrieved successfully:", transactions);
        return transactions; // Return the retrieved transactions
    } catch (error) {
        console.error("Error retrieving transactions:", error.message);
        return false; // Return false on error
    }
};

trans.profile = async (userId) => {
    // Connect to the "transactions" collection with the transaction schema
    const result = await db.connectDb("transactions", transcationSchema);

    try {
        // Validate the userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return false;
        }

        // Retrieve the user's transaction profile with populated user details
        const userProfile = await transcationModel
            .findOne({ userId: userId});

        // Check if a user profile was found
        if (!userProfile) {
            console.log(`No transaction profile found for userId: ${userId}`);
            return null;
        }

        const userData= await authModel.getUser(userId);

        if(!userData) {
            console.log(`No user found for userId: ${userId}`);
            return false;
        }

console.log(`User profile`, userData);
        userProfile.userId=userData;
        

        console.log("User profile retrieved successfully:", userProfile);
        return userProfile; // Return the retrieved user profile with user details
    } catch (error) {
        console.error("Error retrieving user profile:", error.message);
        return false;
    }
};

trans.getTranscations = async (req, res, next) => {
    const result = await db.connectDb("transactions", transcationSchema); 
    try {
        const transactions = await result.find(); // Retrieve all transactions for the given user
        console.log("Transactions retrieved successfully:", transactions);
        return transactions; // Return the retrieved transactions
    } catch (error) {
        console.error("Error retrieving transactions:", error.message);
        return false; // Return false on error
    }
  }

  trans.recentTransaction = async (userId) => {
      const result = await db.connectDb("transactions", transcationSchema); 
      try {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
          console.log("User ID:", userId);
          console.log("Three months ago:", threeMonthsAgo.toISOString());
  
          // Convert userId to ObjectId
          const objectId = new ObjectId(userId);
  
          // Find all transactions within the last three months for the given user
          const transactions = await result.find({ 
              userId: objectId, 
              createdAt: { $gte: threeMonthsAgo } 
          }).sort({ createdAt: -1 });
  
          if (transactions.length > 0) {
              console.log("Most recent transaction retrieved successfully:", transactions[0]);
              return transactions[0]; // Return the most recent transaction
          } else {
              console.log("No transactions found in the last three months for user:", userId);
              return false; // Return false if no transactions are found
          }
      } catch (error) {
          console.error("Error retrieving most recent transaction:", error); // Log full error object
          return false; // Return false on error
      }
  }
  



module.exports = trans;
