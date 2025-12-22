const db = require("../utils/dbConn");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

let { ObjectId } = require("mongodb");

companyModel = {}

const usersSchema = mongoose.Schema(
    {
        name: { type: String },
        email: { type: String, required: true, unique: true },
        phone: { type: Number, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: 'company' },
        is_active: { type: Number, default: 1 },
        is_deleted: { type: Number, default: 0 },
        companyName: { type: String },
        noOfLabel: { type: String },
        panNo: { type: String },
        aadharCard: { type: String }, 
        clientNumber: { type: String },
        mainEmailAddress: { type: String },
        royaltiesEmailAddress: { type: String },
        firstName: { type: String },
        lastName: { type: String },
        phoneNumber: { type: String },
        postalAddress: { type: String },
        postalCode: { type: String },
        city: { type: String },
        country: { type: String },
        timeZone: { type: String },
        language: { type: String },
        wallet: { type: Number , default: 0 },
        noOfLabel: { type: Number , default: 0 }
    },
    { timestamps: true }
);
 

companyModel.addCompany = async (data) => { 
    const result = await db.connectDb("users", usersSchema);
    let insData = await result.insertMany(data); 
    if (insData.length > 0) {
        return insData[0];
    } else {
        return false
    }
};
// companyModel.getUser = async (userId) => {
//     const add = await db.connectDb("users", usersSchema)
//     const getUser = await add.find({ _id: userId })
//     return getUser[0]
// }
// companyModel.changePassword = async (userId, oldpass, pass) => {
//     try {
//         // Connect to the database
//         const Login = await db.connectDb("users", usersSchema);

//         // Fetch the user by their ID
//         const user = await Login.findOne({ _id: userId });
//         console.log("Fetched User:", user);

//         // If user is not found, return false
//         if (!user) {
//             return false;
//         }

//         // Compare the old password with the stored one
//         const isOldPassValid = await bcrypt.compare(oldpass, user.password);
//         console.log("Is Old Password Valid:", isOldPassValid);

//         // If the old password is invalid, return false
//         if (isOldPassValid === false) {
//             return false;
//         }

//         // Update the password with the new one
//         const hashedPassword = await bcrypt.hash(pass, 10);
//         console.log("Hashed New Password:", hashedPassword);

//         const passData = await Login.updateOne(
//             { _id: userId },
//             { $set: { password: hashedPassword } },
//             { runValidators: true }
//         );

//         console.log("Password Update Result:", passData);

//         // Return true if password was updated, else false
//         return passData.modifiedCount > 0;
//     } catch (error) {
//         console.error("Error changing password:", error);
//         return false;
//     }
// };
// companyModel.updateProfile = async (id, data) => {
//     try {
//         const result = await db.connectDb("users", usersSchema);
//         let updateData = await result.updateOne(
//             { _id: id },
//             { $set: data },
//             { runValidators: true }
//         );
//         return updateData;
//     }
//     catch (err) {
//         console.error("Error updating profile:", err);
//         return false;
//     }
// }


// companyModel.transaction = async (data) => {
//     const result = await db.connectDb("users", usersSchema); // Ensure proper connection
//     try {
//         const userId = new ObjectId(data.userId); // Convert to ObjectId
//         const amount = data.amount;

//         // Ensure the user has sufficient balance and perform the deduction
//         const updateData = await result.updateOne(
//             { _id: userId, wallet: { $gte: amount } }, // Ensure sufficient balance
//             { $inc: { wallet: -amount } } // Deduct directly
//         );

//         console.log("Transaction result:", updateData);

//         // Check if any document was matched and modified
//         if (updateData.matchedCount === 0) {
//             console.error("Insufficient balance or user not found.");
//             return false;
//         }

//         return true; // Transaction successful
//     } catch (err) {
//         console.error("Error in transaction:", err.message);
//         return false; // Return false on error
//     }
// };

// companyModel.permission = async (data) => {
//     const result = await db.connectDb("users", usersSchema);
//     try {
//         console.log(data.email);
//         let val = await result.findOne({ email: data.email });
//         if (val) {
//             return false;
//         }
//         const saltRounds = 10;
//         const hashedPassword = await bcrypt.hash(data.password, saltRounds);
//         const user = await result.create({
//             email: data.email,
//             password: hashedPassword,
//             name: data.name,
//             noOfLabel: data.noOfLabel,
//             role: data.role,

//         });
//         console.log("permission permission permission ======>>>", user)

//         return user;
//     } catch (err) {
//         console.error("Error in permission:", err.message);
//         return false; // Return false on error
//     }
// }

// companyModel.is_deleted =async (userId)=>{
//     const result = await db.connectDb("users", usersSchema);
//     try{
//         let updateData = await result.updateOne(
//         { _id: userId },
//         { $set: { is_deleted: 1 } },
//         { runValidators: true }
//     );
//     return updateData;
// }catch(err){
//     console.error("Error in is_deleted:", err.message);
//     return false; // Return false on error
// }
// }

// companyModel.userList = async () => {
//     const users = await db.connectDb("users", usersSchema)
//     const getUser = await users.find({role:"company"})
//     return getUser;
// }
module.exports = companyModel