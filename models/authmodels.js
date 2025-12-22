const db = require("../utils/dbConn");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
let { ObjectId } = require("mongodb");

authModel = {}

// const usersSchema = mongoose.Schema(
//     {
//         name: { type: String },
//         email: { type: String, required: true, unique: true },
//         phone: { type: Number, unique: true },
//         password: { type: String, required: true },
//         role: { type: String, default: 'admin' },
//         is_active: { type: Number, default: 1 },
//         is_deleted: { type: Number, default: 0 },
//         companyName: { type: String },
//         clientNumber: { type: String },
//         mainEmailAddress: { type: String },
//         royaltiesEmailAddress: { type: String },
//         firstName: { type: String },
//         lastName: { type: String },
//         phoneNumber: { type: String },
//         postalAddress: { type: String },
//         postalCode: { type: String },
//         city: { type: String },
//         country: { type: String },
//         timeZone: { type: String },
//         language: { type: String },
//         wallet: { type: Number , default: 0 },
//         noOfLabel: { type: Number , default: 0 }
//     },
//     { timestamps: true }
// );
const usersSchema = mongoose.Schema(
    {
        name: { type: String },
        email: { type: String, required: true, unique: true },
        otp: { type: String },
        otpExpiresAt: { type: Date },
        phone: { type: Number },
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
        label: { type: Array },
        artist: { type: Array },
        pricePercentage: { type: Number },
        wallet: { type: Number, default: 0 },
        noOfLabel: { type: Number, default: 0 },
        noOfArtists: { type: Number, default: 0 }, // Number of artists allowed
        membershipId: { type: String }, // Membership ID selected during registration
        brandName: { type: String }, // Brand Name (for Admin)
        copyright: { type: String }, // Copyright (for Admin)
        logo: { type: String } // Logo URL (for Admin)
    },
    { timestamps: true }
);

authModel.cronForOneHour = async () => {
    const nowInMillis = Date.now();
    const check = await db.connectDb("users", usersSchema)
    const resultForCurrentAffairs = await check.updateMany(
        { is_subscribed_for_current_affairs: true, subscription_end_for_current_affairs: { $lt: nowInMillis } }, // Replace 'subscriptionDate' with your date field
        { $set: { is_subscribed_for_current_affairs: false, days_for_current_affairs: 0 } }
    );
    const resultForTestSeries = await check.updateMany(
        { is_subscribed_for_test_series: true, subscription_end_for_test_series: { $lt: nowInMillis } }, // Replace 'subscriptionDate' with your date field
        { $set: { is_subscribed_for_test_series: false, days_for_test_series: 0 } }
    );
}
authModel.cronForOneDay = async () => {
    const check = await db.connectDb("users", usersSchema)
    const resultForCurrentAffairs = await check.updateMany(
        { is_subscribed_for_current_affairs: true, days_for_current_affairs: { $gt: 0 } },
        { $inc: { days_for_current_affairs: -1 } }
    );
    const resultForTestSeries = await check.updateMany(
        { is_subscribed_for_test_series: true, days_for_test_series: { $gt: 0 } },
        { $inc: { days_for_test_series: -1 } }
    );
}
authModel.login = async (key, email) => {

    let check = {};
    check[key] = email;
    const result = await db.connectDb("users", usersSchema);
    let val = await result.findOne(check, { __v: 0 });
    if (!val) {
        return false
    }
    return val;
};

authModel.signUp = async (data) => {
    const Login = await db.connectDb("users", usersSchema);
    let insData = await Login.insertMany(data);
    // console.log(insData);
    if (insData.length > 0) {
        return insData[0];
    } else {
        return false
    }
};

authModel.forgetPassword = async (key, email) => {

    let check = {};
    check[key] = email;
    const result = await db.connectDb("users", usersSchema);
    let val = await result.findOne({ email: email });
    console.log('>>>>>>', val);
    if (!val) {
        return false
    }
    return val;
};


authModel.verifyOtp = async (key, email, otp) => {
    try {
        let query = {};
        query[key] = email;
        const result = await db.connectDb("users", usersSchema);
        const user = await result.findOne(query, { __v: 0 });
        if (!user) {
            return { success: false, message: "User not found." };
        }
        if (user.otp !== otp) {
            return { success: false, message: "Invalid OTP." };
        }
        const currentTime = new Date();
        if (currentTime > user.otpExpiresAt) {
            return { success: false, message: "OTP has expired." };
        }
        return { success: true, message: "OTP verified successfully." };
    } catch (error) {
        return { success: false, message: "An error occurred while verifying OTP." };
    }
};


authModel.updateOtp = async (key, email, otp, expiresAt) => {
    const result = await db.connectDb("users", usersSchema);
    const updatedUser = await result.findOneAndUpdate(
        { email }, // Query by email
        { $set: { otp, otpExpiresAt: expiresAt } }, // Update OTP and expiry time
        { new: true, projection: { __v: 0 } } // Return the updated document without the __v field
    );

    // Check if the user was found and updated
    if (!updatedUser) {
        return false
    }
    return true;
};



authModel.setPassword = async (key, email, newPassword) => {

    const result = await db.connectDb("users", usersSchema);
    const updatedUser = await result.findOneAndUpdate(

        { email }, // Query by email
        { $set: { password: newPassword } }, // Update OTP and expiry time
        { new: true, projection: { __v: 0 } } // Return the updated document without the __v field
    );

    // Check if the user was found and updated
    if (!updatedUser) {
        return false
    }
    return true;
};

authModel.addCompany = async (data) => {
    const result = await db.connectDb("users", usersSchema);
    let insData = await result.insertMany(data);
    if (insData.length > 0) {
        return insData[0];
    } else {
        return false
    }
};

authModel.getUser = async (userId) => {
    const add = await db.connectDb("users", usersSchema)
    const getUser = await add.find({ _id: userId })
    return getUser[0]
}
authModel.changePassword = async (userId, oldpass, pass) => {
    try {
        const Login = await db.connectDb("users", usersSchema);

        const user = await Login.findOne({ _id: userId });
        // console.log("Fetched User:", user);

        if (!user) {
            return false;
        }

        // Compare the old password with the stored one
        const isOldPassValid = await bcrypt.compare(oldpass, user.password);
        // console.log("Is Old Password Valid:", isOldPassValid);

        // If the old password is invalid, return false
        if (isOldPassValid === false) {
            return false;
        }

        // Update the password with the new one
        const hashedPassword = await bcrypt.hash(pass, 10);
        // console.log("Hashed New Password:", hashedPassword);

        const passData = await Login.updateOne(
            { _id: userId },
            { $set: { password: hashedPassword } },
            { runValidators: true }
        );

        // console.log("Password Update Result:", passData);

        // Return true if password was updated, else false
        return passData.modifiedCount > 0;
    } catch (error) {
        // console.error("Error changing password:", error);
        return false;
    }
};
authModel.updateProfile = async (id, data) => {
    try {
        const result = await db.connectDb("users", usersSchema);
        let updateData = await result.updateOne(
            { _id: id },
            { $set: data },
            { runValidators: true }
        );
        return updateData;
    }
    catch (err) {
        // console.error("Error updating profile:", err);
        return false;
    }
}
authModel.transaction = async (data) => {
    const result = await db.connectDb("users", usersSchema); // Ensure proper connection
    // const transactionsResult = await db.connectDb("transactions", transactionsSchema); // Connect to transactions collection

    try {
        const userId = data.userId; // User ID
        const amount = data.amount;

        // Calculate the date three months ago
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        // Check if the user has any transactions within the last three months
        const recentTransaction = await trans.recentTransaction(userId);
        console.log("Recent transaction:", recentTransaction);

        if (recentTransaction) {
            console.error("Transaction blocked: User has recent transactions within the last three months.");
            return false; // Block the transaction
        }

        // Ensure the user has sufficient balance and perform the deduction
        const updateData = await result.updateOne(
            { _id: userId, wallet: { $gte: amount } }, // Ensure sufficient balance
            { $inc: { wallet: -amount } } // Deduct directly
        );

        if (updateData.modifiedCount === 0) {
            console.error("Transaction failed: Insufficient balance or user not found.");
            return false;
        }

        // Log the transaction (optional)

        return true; // Transaction successful
    } catch (err) {
        console.error("Error in transaction:", err.message);
        return false; // Return false on error
    }
};


authModel.permission = async (data) => {
    const result = await db.connectDb("users", usersSchema);
    try {
        // console.log(data.email);
        let val = await result.findOne({ email: data.email });
        if (val) {
            return false;
        }

        const user = await result.create({
            email: data.email,
            password: data.password,
            name: data.name,
            noOfLabel: data.noOfLabel,
            role: data.role,
            label: data.label,
            artist: data.artist,
            pricePercentage: data.pricePercentage,
            clientNumber: Math.floor(10000000 + Math.random() * 90000000)

        });
        console.log("user>>>>>>>>>>>>", user);
        releaseModel.addUserlabel(data.label, user._id);
        artistModel.addUserartist(data.artist, user._id);

        // console.log("permission permission permission ======>>>", user)

        return user;
    } catch (err) {
        // console.error("Error in permission:", err.message);
        return false; // Return false on error
    }
}





authModel.is_deleted = async (userId, status) => {
    const result = await db.connectDb("users", usersSchema);
    try {
        let updateData = await result.updateOne(
            { _id: userId },
            { $set: { is_deleted: status } },
            { runValidators: true }
        );
        return updateData;
    } catch (err) {
        // console.error("Error in is_deleted:", err.message);
        return false; // Return false on error
    }
}

authModel.userDelete = async (id) => {
    const result = await db.connectDb("user", usersSchema);
    try {
        const fetData = await result.find({ _id: id }); // Ensure you're using the correct query syntax

        if (fetData.length > 0) {
            await result.deleteOne({ _id: id }); // Deletes the record
        }
        const result2 = permission.userDelete(id);
        console.log(result2)
        return { success: true, message: "Record deleted successfully." };
    } catch (err) {
        return { success: false, message: "Record not found." };
    }
};

authModel.userList = async (page = 1, limit = 10, search = "") => {
    try {
        const users = await db.connectDb("users", usersSchema);
        const membershipUsersModel = require("./membershipusersmodels");
        
        // Build query - filter by company role and not deleted
        let query = { 
            role: "company",
            is_deleted: 0 
        };
        
        // Add search functionality
        if (search && search.trim() !== "") {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
                { clientNumber: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Calculate skip for pagination
        const skip = (page - 1) * limit;
        
        // Get users with pagination
        const getUser = await users.find(query)
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(limit);
        
        // Get active membership for each user
        const usersWithMembership = await Promise.all(
            getUser.map(async (user) => {
                try {
                    const userIdStr = user._id.toString ? user._id.toString() : user._id;
                    console.log(`[userList] Processing user: ${userIdStr}, email: ${user.email}`);
                    const activeMembership = await membershipUsersModel.getActiveMembership(userIdStr);
                    const userObj = user.toObject ? user.toObject() : user;
                    
                    if (activeMembership && activeMembership.membershipId) {
                        // Handle both populated and non-populated membershipId
                        const membership = activeMembership.membershipId.toObject 
                            ? activeMembership.membershipId.toObject() 
                            : activeMembership.membershipId;
                        
                        const membershipData = {
                            _id: membership._id || membership.toString(),
                            name: membership.name || "N/A",
                            noOfLabels: membership.noOfLabels || 0,
                            noOfArtists: membership.noOfArtists || 0,
                            expiryDate: activeMembership.expiryDate,
                            purchaseDate: activeMembership.purchaseDate,
                            purchaseCount: activeMembership.purchaseCount || 1
                        };
                        
                        console.log(`[userList] User ${user._id} has active membership:`, membershipData.name);
                        userObj.activeMembership = membershipData;
                    } else {
                        console.log(`[userList] User ${user._id} has NO active membership`);
                        userObj.activeMembership = null;
                    }
                    
                    return userObj;
                } catch (err) {
                    console.error(`[userList] Error getting membership for user ${user._id}:`, err.message);
                    console.error(`[userList] Error stack:`, err.stack);
                    const userObj = user.toObject ? user.toObject() : user;
                    userObj.activeMembership = null;
                    return userObj;
                }
            })
        );
        
        // Get total count for pagination
        const total = await users.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        
        return {
            data: usersWithMembership,
            total: total,
            totalPages: totalPages,
            currentPage: page,
            limit: limit
        };
    } catch (err) {
        console.error("Error in userList:", err.message);
        return false;
    }
}
authModel.checkAvailablity = async (email) => {
    const checkUser = await db.connectDb("users", usersSchema);
    let val = await checkUser.find({
        $or: [
            { email: email }
        ]
    })
    return val
}

authModel.getNoOfLabels = async (userId) => {
    const result = await db.connectDb("users", usersSchema);
    let val = await result.findOne({ _id: new ObjectId(userId) });
    return val.noOfLabel;
}

authModel.getRole = async (userId) => {
    const result = await db.connectDb("users", usersSchema);
    let val = await result.findOne({ _id: new ObjectId(userId) });
    return val.role;
}

authModel.getCompanyCount = async () => {
    const result = await db.connectDb("users", usersSchema);
    let val = await result.countDocuments({ role: "company" });
    return val;
}

authModel.getEmail = async (id) => {
    const result = await db.connectDb("users", usersSchema);
    let val = await result.findOne({ _id: mongoose.Types.ObjectId(id) });
    return val.email;
}
authModel.updateWallet = async (userId, amount) => {
    const result = await db.connectDb("users", usersSchema);
    
    // No need to fetch the current value when using $inc
    const updatedUser = await result.findOneAndUpdate(
        { _id: userId },
        { $inc: { wallet: amount } }, // Simply increment by the amount
        { new: true, projection: { __v: 0 } }
    );
    
    if (updatedUser) {
        return true;
    } else {
        return false;
    }
};

// Admin login helper - find admin user by email and role
authModel.findAdmin = async (email, password) => {
    const result = await db.connectDb("users", usersSchema);
    let val = await result.findOne({ email: email, role: "Admin" }, { __v: 0 });
    if (!val) {
        return false;
    }
    return val;
};

// Find admin permission
authModel.findPermission = async (userId) => {
    const result = await db.connectDb("users", usersSchema);
    let val = await result.findOne({ _id: userId, role: "Admin" }, { __v: 0 });
    if (!val) {
        return false;
    }
    return val;
};

// authModel.findAdminByRole = async(email, password) => {
//     let findadmin = await db.connectDb("usersSchemas",usersSchema)
//     let val = await findadmin.findOne(
//         { role: "admin" },
//         { __v: 0 }
//     );
//     console.log("findfindfind======>>>",val)
//     if(Object.keys(val).length>0){
//         return val
//     }
//     else{
//         return false
//     }
// }

// authModel.findAdmin = async(email, password) => {
//     let findadmin = await db.connectDb("usersSchemas",usersSchema)
//     let val = await findadmin.findOne(
//         { email: email },
//         { __v: 0 }
//     );
//     console.log("findfindfind======>>>",val)
//     if(Object.keys(val).length>0){
//         return val
//     }
//     else{
//         return false
//     }
// }


// authModel.getUserByMobileOrEmail = async()=> {
//     const add = await db.connectDb("users",usersSchema)
//     const getUser = await add.find({})
//     return getUser
// }

// authModel.changeStatus = async(data) => {
//     try{
//         let userstatus = await db.connectDb("users",usersSchema)
//         let statusCategory = await userstatus.updateOne({_id:data.id},{$set:{is_active:data.isActive}})
//         if (statusCategory) {
//             return true;
//         } else {
//             return false;
//         }
//     }
//     catch(err){
//         return err
//     }
// }

// authModel.changeDeleteStatus = async(data) => {
//     try{
//         let userstatus = await db.connectDb("users",usersSchema)
//         let statusCategory = await userstatus.updateOne({_id:data.id},{$set:{is_deleted:data.isDelete}})
//         if (statusCategory) {
//             return true;
//         } else {
//             return false;
//         }
//     }
//     catch(err){
//         return err
//     }
// }

// authModel.findPermission = async(userId) => {
//     let connect = await db.connectDb("usersSchemas",usersSchema)
//     let find = await connect.findOne({_id:userId})
//     if(Object.keys(find).length>0){
//         return find
//     }
//     else{
//         return false
//     }
// }


// authModel.checkAvailablityWithUserId = async(user_id)=>{
//     const checkUser = await db.connectDb("users", usersSchema);
//     let val = await checkUser.findOne({_id:user_id})
//       return val
// }


// authModel.checkAvailablityForAdmin = async(email)=>{
//     const checkUser = await db.connectDb("usersSchemas",usersSchema)
//     let val = await checkUser.find({ email: email })
//       return val
// }

// authModel.checkAvailablityWithoutASpecificUser = async(userId,email,mobile)=>{
//     const checkUser = await db.connectDb("users", usersSchema);
//     let val = await checkUser.find({
//         $and: [
//             { _id: { $ne: userId } },
//             { $or: [{ email: email }, { mobileNumber: mobile }] }

//         ]
//       })
//       return val
// }


// authModel.profileupdate = async (id,data) => {
//     const Login = await db.connectDb("users", usersSchema);
//     let insData = await Login.updateOne({_id:id},{$set:data});
//     if (insData.modifiedCount > 0 || insData.upsertedCount > 0) {
//         return true;
//     } else {
//         return false
//         // return apiResponse.err("Registration Failed", 403);
//     }
// };
// authModel.showprofile = async (id) => {
//     try{
//     const user = await db.connectDb("users", usersSchema);
//     let insData = await user.findOne({_id:id});
//         return insData
//     }catch(error){
//         // return R(res, false, "Error occurs", {},403)
//         console.log(error)
//     }
// };
// authModel.updateemailandmobile = async (id,data) => {
//     console.log('changestatus=======>>>>>>>>',id,data);
//     const Login = await db.connectDb("users", usersSchema);
//     let insData = await Login.updateOne({_id:id},{$set:{email:data.email,mobileNumber:data.mobileNumber}});
//     if (insData.modifiedCount > 0 || insData.upsertedCount > 0) {
//         return true;
//     } else {
//         return false
//         // return apiResponse.err("Registration Failed", 403);
//     }
// };

// authModel.usersSchema = async (data) => {
//     const sub = await db.connectDb("usersSchemas", usersSchema);
//     let insData = await sub.create(data);
//     console.log(insData)
//     if (insData || insData.length > 0) {
//         return insData;
//     } else {
//         return apiResponse.err("Registration Failed", 403);
//     }
// };
// authModel.findusersSchema = async (email) => {
//     const sub = await db.connectDb("usersSchema", usersSchema);
//     let val = await sub.findOne(
//         { email: email },
//         { __v: 0 }
//     );
//     // console.log(val);
//     if (val) {
//         console.log("resolve");
//         return val;
//     }
// }
// authModel.findusersSchemalist = async (type) => {
//     const sub = await db.connectDb("usersSchemas", usersSchema);
//     let val = await sub.find({
//         $and: [
//             { email: { $ne: "admin@gmail.com" } }, // Condition 1: email not equal to 'admin@gmail.com'
//             { role: type } // Condition 2: role equals a certain value stored in the variable 'type'
//         ]
//     });

//     if (val.length>0) {
//         return val;
//     }
//     else{
//         return false
//     }
// }
// authModel.setusersSchema = async (data) => {
//     const login = await db.connectDb("usersSchema", usersSchema);
//     const insdata = await login.updateOne(
//         { _id: ObjectId(data._id) },
//         {
//             $set:data
//         },
//         { upsert: true, runValidators: true }
//     );

//     if (insdata.modifiedCount > 0 || insdata.upsertedCount > 0) {
//         return true;
//     } else {
//         return false;
//     }
// };
// authModel.userstatus = async (_id, status) => {
//     const login = await db.connectDb("usersSchema", usersSchema);
//     const insdata = await login.updateOne(
//         { _id: ObjectId(_id) },
//         { $set: { active: status }},
//         { upsert: true, runValidators: true }
//     );

//     if (insdata.modifiedCount > 0 || insdata.upsertedCount > 0) {
//         return true;
//     } else {
//         return false;
//     }
// };

// authModel.userdelete = async (_id) => {
//     const Login = await db.connectDb("usersSchema", usersSchema);
//     const getId = await Login.findByIdAndDelete(_id);
//     // console.log('mob', getId, val, pro)
//     if (getId) {
//         return getId;
//     } else {
//         return apiResponse.err("User not Found!!", 403);
//     }
// };



// authModel.forgotPassword = async (email, pass) => {
//     const Login = await db.connectDb("users", usersSchema);
//     const passData = await Login.updateOne(
//         { email: email },
//         { $set: { password: pass } },
//         { runValidators: true }
//     );
//     if (passData.modifiedCount > 0) {
//         return true;
//     } else {
//         return false;
//     }
// };

// authModel.forgotPasswordForAdmin = async (email, pass) => {
//     const dbConnect = await db.connectDb("usersSchemas",usersSchema)
//     const passData = await dbConnect.updateOne(
//         { email: email },
//         { $set: { password: pass } },
//         { runValidators: true }
//     );
//     if (passData.modifiedCount > 0) {
//         return true;
//     } else {
//         return false;
//     }
// };

// authModel.getUserbyId = async (userId) => {
//     const Login = await db.connectDb("users", usersSchema);
//     let val = await Login.findOne({ _id: ObjectId(userId) }, { __v: 0 });
//     if (val) {
//         console.log("resolve");
//         console.log('val: ', val);
//         return val;
//     }
// };

module.exports = authModel