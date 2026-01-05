const walletModel = require('../models/withdrawalmodel');
const transcationModel = require('../models/transaction');
const bcrypt = require("../utils/bcrypt")
const jwt = require("jsonwebtoken");
const R = require("../utils/responseHelper");
const validateInput = require("../helper/emailmobileVal")
const sendOtpEmail = require("../utils/Sendgrid")
const IP = require('ip');
// const companyModel = require("../models/companymodels");
const authModel = require("../models/authmodels");
const membershipModel = require("../models/membershipmodels");
const { generateRandomPassword } = require('../utils/genratepassword');
const auth = {};
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', // Hostinger's SMTP server
  port: 465, // Use 465 for SSL or 587 for STARTTLS
  secure: true, // Use true for SSL and false for STARTTLS
    auth: {
        user: process.env.EMAIL_USER, // Your email from environment variables
        pass: process.env.EMAIL_PASSWORD, // Your email password from environment variables
    },
  // Add connection timeout and retry options
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
  // Retry configuration
  pool: true,
  maxConnections: 1,
  maxMessages: 3
});

// Verify email configuration on startup (optional - logs warning if not configured)
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('⚠️  EMAIL_USER or EMAIL_PASSWORD not set in environment variables. Email sending will fail.');
} else {
  console.log('✅ Email configuration loaded successfully');
}
auth.addCompany = async (req, res, next) => {
  const {
    aadharNo,
    city,
    companyName,
    country, email,
    firstName, language,
    lastName, panNo,
    phoneNumber, postalAddress,
    postalCode, role,
    royaltiesEmail,
    noOfLabel,
    membershipId  // New field for membership selection
  } = req.body;

  const now = new Date();
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  const futureTimeInMillis = futureDate.getTime();
  const ipAddress = IP.address();

  try {
    // Check if email already exists
    let isUserExist = await authModel.checkAvailablity(email);
    if (isUserExist?.length > 0) {
      return R(res,false,"Email already exists","",400);
    }

    // Fetch membership details if membershipId is provided
    let membershipData = null;
    let noOfLabelsFromMembership = 0;
    let noOfArtistsFromMembership = 0;
    
    if (membershipId) {
      membershipData = await membershipModel.getMembershipById(membershipId);
      if (!membershipData) {
        return R(res, false, "Invalid membership selected", "", 400);
      }
      if (membershipData.is_active !== 1 || membershipData.is_deleted !== 0) {
        return R(res, false, "Selected membership is not active", "", 400);
      }
      noOfLabelsFromMembership = membershipData.noOfLabels || 0;
      noOfArtistsFromMembership = membershipData.noOfArtists || 0;
    }

    // Use membership values if provided, otherwise use noOfLabel from form
    const finalNoOfLabel = membershipId ? noOfLabelsFromMembership : (noOfLabel || 0);

    const newPassword = generateRandomPassword(12); // Random password generator function

    const newUser = {
      email,
      name:firstName + " "+lastName,
      phone:phoneNumber,
      password:await bcrypt.passwordEncryption(firstName+"@123!", 12), // Encrypt password
      noOfLabel: finalNoOfLabel,
      noOfArtists: noOfArtistsFromMembership, // Set from membership
      membershipId: membershipId || null, // Store membership ID
      panNo: panNo || "",
      aadharNo: aadharNo || "",
      role: role || "company",
      is_deleted: 0,
      ip_address: ipAddress || "0.0.0.0",
      create_at: futureTimeInMillis,
      is_active: 1,
      clientNumber:Math.floor(10000000 + Math.random() * 90000000),
      companyName: companyName || "",
      mainEmail: email || "",
      royaltiesEmail: royaltiesEmail || "",
      firstName: firstName || "",
      lastName: lastName || "",
      postalAddress: postalAddress || "",
      postalCode: postalCode || "",
      city: city || "",
      country: country || "",
      language: language || "",
    };

    const register = await authModel.addCompany(newUser);

    if (!register) {
      return R(res,false,"Failed to register Company!","",400);
    }

    // Add user ID to membership's users array if membershipId is provided
    if (membershipId && register._id) {
      try {
        const membershipModel = require("../models/membershipmodels");
        await membershipModel.addUserToMembership(membershipId, register._id);
        console.log(`User ${register._id} added to membership ${membershipId}`);
      } catch (err) {
        console.error("Error adding user to membership:", err.message);
        // Don't fail the registration if this fails, just log the error
      }
    }

    // Add entry to membershipusers table
    if (membershipId && register._id && membershipData) {
      try {
        const membershipUsersModel = require("../models/membershipusersmodels");
        
        // Calculate expiry date based on membership duration
        const purchaseDate = new Date();
        let expiryDate = new Date();
        
        if (membershipData.durationType === 'days') {
          expiryDate.setDate(expiryDate.getDate() + membershipData.duration);
        } else if (membershipData.durationType === 'months') {
          expiryDate.setMonth(expiryDate.getMonth() + membershipData.duration);
        } else if (membershipData.durationType === 'years') {
          expiryDate.setFullYear(expiryDate.getFullYear() + membershipData.duration);
        }
        
        const membershipUserData = {
          userId: register._id,
          membershipId: membershipId,
          purchaseDate: purchaseDate,
          expiryDate: expiryDate,
          status: 'active',
          purchaseCount: 1,
          is_active: 1,
          is_deleted: 0
        };
        
        // If payment ID is available, add it
        if (req.body.paymentId) {
          membershipUserData.paymentId = req.body.paymentId;
        }
        
        const membershipUser = await membershipUsersModel.addMembershipUser(membershipUserData);
        
        if (membershipUser) {
          console.log(`Membership user entry created: ${membershipUser._id} for user ${register._id}`);
        } else {
          console.error("Failed to create membership user entry");
        }
      } catch (err) {
        console.error("Error creating membership user entry:", err.message);
        // Don't fail the registration if this fails, just log the error
      }
    }

    // Verify email configuration before sending
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("❌ EMAIL CONFIGURATION ERROR: EMAIL_USER or EMAIL_PASSWORD not set in environment variables");
      console.error("Email will not be sent. Please configure environment variables.");
    } else {
      console.log("✅ Email configuration found - EMAIL_USER:", process.env.EMAIL_USER);
    }

    // Send Email with Password
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@tuneplusmusic.com',
      to: email,
      subject: "Welcome to Our Platform",
      // text: `Thanks for being part of us. Your email for login is ${email} and your password is ${firstName+"@123!"}.`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #121212;
            margin: 0;
            padding: 0;
            color: #ffffff;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #1e1e1e;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
          }
          .header img {
            max-width: 150px;
          }
          .content {
            text-align: center;
            font-size: 16px;
            color: #e0e0e0;
          }
          .login-box {
            margin: 20px 0;
            padding: 10px;
            background-color: #2b2b2b;
            border: 1px solid #444;
            border-radius: 4px;
            text-align: left;
          }
          .login-box span {
            font-weight: bold;
            color: #ffffff;
          }
          .login-button {
            display: inline-block;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 4px;
            margin-top: 20px;
          }
          .login-button:hover {
            background-color: #0056b3;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #888888;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/dh2izd0iu/image/upload/v1744977813/lc4ibi7ama2ff5udzvwn.png" alt="Company Logo">
          </div>
          <div class="content">
            <p>Hello <strong>${firstName}</strong>,</p>
            <p>Your account has been created. Please find your temporary login details below:</p>
            <div class="login-box">
              <p><span>Username:</span> ${email}</p>
              <p><span>Password:</span>${firstName+"@123!"}</p>
            </div>
            <p>Once Logged in ,You will be able to set a prsonalized and secure password.</p>
            <p>with these log in details , you can now connect to:</p>
            <h3>Click to Login</h3>
            <a href="https://music-dashboard-frontend-1.onrender.com" class="login-button">Log In</a>
          </div>
          <div class="footer">
            <p>&copy; 2025  Tune Plus . All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>`
    };

    // Send email in background (non-blocking)
    // Don't fail registration if email fails - account is already created
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("❌ Cannot send email: EMAIL_USER or EMAIL_PASSWORD not configured");
      console.error("Registration successful but email not sent. User email:", email);
    } else {
      // Verify transporter connection first
      transporter.verify(function (error, success) {
        if (error) {
          console.error("❌ SMTP Connection Error:", error.message);
          console.error("SMTP Error Code:", error.code);
          console.error("SMTP Error Response:", error.response);
          console.error("Full Error:", JSON.stringify(error, null, 2));
        } else {
          console.log("✅ SMTP Server is ready to send emails");
          
          // Now send the email
          transporter.sendMail(mailOptions)
            .then((emailResponse) => {
              console.log("✅ Email sent successfully!");
              console.log("Email Response:", {
                messageId: emailResponse.messageId,
                accepted: emailResponse.accepted,
                rejected: emailResponse.rejected,
                response: emailResponse.response
              });
            })
            .catch((error) => {
              console.error("❌ Error sending email:");
              console.error("Error Message:", error.message);
              console.error("Error Code:", error.code);
              console.error("Error Response:", error.response);
              console.error("Error Command:", error.command);
              console.error("Full Error Object:", JSON.stringify(error, null, 2));
              console.error("Email Details:", {
                from: mailOptions.from,
                to: mailOptions.to,
                subject: mailOptions.subject
              });
            });
        }
      });
    }
    
    // Return success immediately - account is created
    // Email is sent in background, if it fails, user can still login and reset password
    return R(res, true, `Account created successfully! Login details will be sent to ${email}. Please check your email.`, {
      email: email,
      message: "If you don't receive the email, you can use 'Forgot Password' to set a new password."
    }, 200);
  } catch (err) {
    next(err);
  }
};

// auth.addCompany = async (req, res, next) => {
//     const { email, phone, name, role ,panNo,aadharNo ,companyName,
//         mainEmail,
//         royaltiesEmail,
//         firstName,
//         lastName,
//         postalAddress,
//         postalCode,
//         city,
//         country,
//         timeZone,
//         language } = req.body
//     // console.log("newUsernewUsernewUsernewUser",req.body.email)

//     const now = new Date();
//     const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
//     const futureTimeInMillis = futureDate.getTime()
//     const ipAddress = IP.address();
//     try {
//         let isUserExist = await authModel.checkAvailablity(email)
//         if (isUserExist?.length > 0) {
//             return R(res, false, "Email Id already exists!!", {}, 406)
//         }
//         const newPassword = generateRandomPassword(12);
//         const newUser = {
//             email: email,
//             name: name,
//             phone: phone,
//             password: await bcrypt.passwordEncryption(newPassword),
//             noOfLabel: noOfLabel || "",
//             panNo: panNo || "",
//             aadharNo: aadharNo || "",
//             role: role || "company",
//             is_deleted: 0,
//             ip_address: ipAddress || "0.0.0.0",
//             create_at: futureTimeInMillis,
//             is_active: 1,
//             clientNumber: Date.now(),
//             companyName: companyName || "",
//             mainEmail: mainEmail || "",
//             royaltiesEmail: royaltiesEmail || "",
//             firstName: firstName || "",
//             lastName: lastName || "",
//             postalAddress: postalAddress || "",
//             postalCode: postalCode || "",
//             city: city || "",
//             country: country || "",
//             // timeZone: timeZone || "",
//             language: language || "",
//         };


//         const register = await authModel.addCompany(newUser)

//         if(!register){
//             return R(res, false, "Failed to register Company!!", {}, 500)
//         }

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: "Password Reset OTP",
//             text: `thanks being part of us . your email for login is ${email} and paswword is ${newPassword} `,
//           };

//           // Send email
//           try {
//             const emailResponse = await transporter.sendMail(mailOptions);
//             console.log("Email sent:", emailResponse);
//             res.status(200).json({ success: true, message: ` Email of id , password is sent to ${email} .` });
//           } catch (error) {
//             console.error("Error sending email:", error);
//             res.status(500).json({ success: false, message: "Failed to  send Email But Account is Created" });
//           }
//     } catch (err) {
//         next(err)
//     }
// };


// auth.getUsers = async (req, res, next) => {

//     try {
//         const get = await authModel.getUser(req.doc.userId)
//         if (!get) {
//             return R(res, false, "No data found!!", {}, 200)
//         }
//         return R(res, true, "Data successfully!!", get, 200)
//     } catch (error) {
//         next(error)
//     }
// };
// auth.passwordChange = async (req, res, next) => {
//     const { newPassword, oldPassword } = req.body

//     try {
//         const result = await authModel.changePassword(req.doc.userId, oldPassword, newPassword);
//         if (!result) {
//             return R(res, false, "old password is not correct", "", 400)
//         }

//         return R(res, true, "Update successfully!!", req.doc.userId, 200)
//     } catch (error) {
//         next(error)
//     }
// };
// auth.profileUpdate = async (req, res, next) => {
//     try {
//         const id = req.doc.userId;
//         if (!id) {
//             return R(res, false, "ID is required", {}, 400);
//         }

//         let data = req.body;
//         console.log(data);
//         if (!data) {
//             return R(res, false, "Data is required", {}, 400);
//         }

//         const profileData = authModel.updateProfile(id, data);

//         return R(res, true, "Profile updated successfully", profileData, 201);
//     } catch (error) {
//         next(error);
//     }
// }

// auth.is_deleted = async (req, res, next) => {
//     try {
//         const { userId } = req.body;

//         if (!userId) {
//             return R(res, false, "User ID is required", "", 400)
//         }

//         const update = await authModel.is_deleted(userId);

//         if (!update) {
//             return R(res, false, "User not found", "", 404)
//         }

//         return R(res, true, "User deleted successfully", "", 200)

//     } catch (error) {
//         next(error)
//     }
// }

// auth.userList = async (req, res, next) => { 
//     try {
//         const get = await authModel.userList()
//         if (!get) {
//             return R(res, false, "No data found!!", [], 200)
//         }
//         return R(res, true, "Data successfully!!", get, 200)
//     } catch (error) {
//         next(error)
//     }
// };

module.exports = auth;



