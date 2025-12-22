const permissionmodel = require("../models/permissionmodel");
const R = require("../utils/responseHelper");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("../utils/bcrypt");

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', // Hostinger's SMTP server
  port: 465, // Use 465 for SSL or 587 for STARTTLS
  secure: true, // Use true for SSL and false for STARTTLS
    auth: {
        user: process.env.EMAIL_USER, // Your email from environment variables
        pass: process.env.EMAIL_PASSWORD, // Your email password from environment variables
    },

});


permission = {};


permission.add = async (req, res, next) => {
    try {
        const data = req.body;
        console.log(data)
        const userId = req.doc.userId;
        const email = req.body.email;
        const Name = req.body.name;
        const newpassword = await bcrypt.passwordEncryption(Name+"@123!", 12);
        data.password = newpassword
        console.log(data)

        if (!data) {
            return R(res, false, "Invalid data", "", 400);
        }
        const user = await authModel.permission(data);

        if (!user) {
            return R(res, false, "User alreaedy registered", "", 404);
        }

        let newUserRegisterId = user._id;
        //    console.log(">>>>>>>>>>>>>",newUserRegisterId.toString());
        const permissions = await permissionmodel.addPermission(userId, newUserRegisterId.toString(), data);
        if (!permissions) {
            return R(res, false, "Failed to add permission", "", 500);
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
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
                  <p>Hello <strong>${Name}</strong>,</p>
                  <p>Your account has been created. Please find your temporary login details below:</p>
                  <div class="login-box">
                    <p><span>Username:</span> ${email}</p>
                    <p><span>Password:</span>${Name + "@123!"}</p>
                  </div>
                  <p>Once Logged in ,You will be able to set a prsonalized and secure password.</p>
                  <p>with these log in details , you can now connect to:</p>
                  <h3>Click to Login</h3>
                  <a href="https://www.tuneplus.in" class="login-button">Log In</a>
                </div>
                <div class="footer">
                  <p>&copy; 2025  Tune Plus . All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>`
        };

        try {
            const emailResponse = await transporter.sendMail(mailOptions);
            console.log("Email sent:", emailResponse);
            return R(res, true, `Account created successfully! Login details sent to ${email}.`, "", 200);
        } catch (error) {
            console.error("Error sending email:", error.message);
            return R(res, false, "Failed to send email. Account created but no email sent.", "", 500);
        }


    }
    catch (err) {
        // console.log("Error in permission.addddddd", err);
        return R(res, false, "Failed to add permission", "", 500);
    }
}
permission.update = async (req, res, next) => {
    try {
        const data = req.body;
        if (!data) {
            return R(res, false, "Invalid data", "", 400);
        }

        const permissions = await permissionmodel.updatePermission(data.registeredUserId, data);
        if (!permissions) {
            return R(res, false, "Failed to update", "", 500);
        }
        return R(res, true, "Permissions Update successfully", permissions, 200);
    } catch (err) {
        // console.log("Error in permission.updateeeee", err);
        return R(res, false, "Failed to update permission", "", 500);
    }
}
permission.listWithUserDetails = async (req, res, next) => {
    try {
        const userId = req.doc.userId;
        const permissions = await permissionmodel.profilePermissions(userId);
        // console.log("Permissions", permissions);
        if (!permissions) {
            return R(res, false, "Failed to list permissions", "", 500);
        }
        return R(res, true, "Permissions listed successfully", permissions, 200);

    } catch (err) {
        // console.log("Error in permission.listtttttttt", err);
        return R(res, false, "Failed to list permissions", "", 500);
    }
}
permission.list = async (req, res, next) => {
    try {
        const userId = req.doc.userId;
        const permissions = await permissionmodel.listPermissions(userId);
        // console.log("Permissions", permissions);
        if (!permissions) {
            return R(res, false, "Failed to list permissions", "", 500);
        }
        return R(res, true, "Permissions listed successfully", permissions, 200);

    } catch (err) {
        // console.log("Error in permission.listtttttttt", err);
        return R(res, false, "Failed to list permissions", "", 500);
    }
}

module.exports = permission;