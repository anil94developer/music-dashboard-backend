const R = require("../utils/responseHelper");
const releaseModel = require('./../models/releasemodels')
const express = require('express');
const multer = require('multer');
const nodemailer = require("nodemailer");
const path = require('path');
const { uploadOnCloudinary } = require("../utils/cloudinary");
const auth = require("./authServices");
const permission = require('../models/permissionmodel')
const generateGlobalISRCCode = require("../utils/generateISRCCode");
const release = {};

release.addOneRelease = async (req, res, next) => {
    const { type, title } = req.body
    // console.log("userId=======",req.doc.userId); 

    try {
        const newReq = {
            userId: req.doc.userId,
            title: title,
            type: type
        }
        // console.error(newReq)
        const result = await releaseModel.addOneRelease(newReq)
        return R(res, true, "Add Successfully!!", result, 200)
    } catch (err) {
        next(err)
    }
};
release.addOneStepRelease = async (req, res, next) => {
    const body = req.body
    const { type, title } = req.body
    // console.log("userId=======",req.doc.userId); 
    if (req.file?.path) {
        const coverImage = req.file?.path
        console.log("###################", coverImage)
        const coverImageurl = await uploadOnCloudinary(coverImage)
        console.log("*******************", coverImageurl)
        body["coverImage"] = coverImageurl.url
    }

    try {
        // console.log("bodyData====",body);
        const result = await releaseModel.addOneStepRelease(body)
        return R(res, true, "Update Successfully!!", result, 200)
    } catch (err) {
        next(err)
    }
};
release.addTwoStepRelease = async (req, res) => {
    try {
        const { id } = req.body; // Extract release ID from the request body
        const localFilePath = req.file?.path; // Extract file path from the uploaded file

        // Log the file path for debugging
        console.log("Local File Path:", localFilePath);

        // Check if a file was uploaded
        if (!localFilePath) {
            return res.status(400).json({
                status: false,
                message: "File is missing.",
            });
        }

        // Upload the file to Cloudinary
        const cloudinaryUrl = await uploadOnCloudinary(localFilePath, "audio");
        console.log("Cloudinary URL:", cloudinaryUrl);

        // Prepare file data to be added to the release
        const fileDataSet = {
            fileName: req.file.originalname, // Get the file's original name
            fileData: cloudinaryUrl.url,    // Get the URL from Cloudinary's response
            fileType: req.file.mimetype.includes("audio") ? "audio" : "video", // Determine file type
        };

        // Update the release with the new file data
        const result = await releaseModel.addTwoStepRelease(id, fileDataSet);
        console.log("Database Update Result:", result);

        // Send the appropriate response based on the result
        if (result) {
            return res.status(200).json({
                status: true,
                message: "Files uploaded successfully!",
            });
        } else {
            return res.status(400).json({
                status: false,
                message: "Failed to update release.",
            });
        }
    } catch (error) {
        console.error("File upload error:", error);
        res.status(500).json({
            status: false,
            message: "File upload failed.",
            error: error.message || error,
        });
    }
};

release.deleteFile = async (req, res) => {
    try {
        
        const releaseId = req.body.releaseId;
        const fileId = req.body.fileId;

        const result = await releaseModel.deleteFileFromRelease( releaseId, fileId);
        
        if (result) {
            return res.status(200).json({
                status: true,
                message: "File deleted successfully!",
            });
        } else {
            return res.status(400).json({
                status: false,
                message: "Failed to delete file from release.",
            });
        }
    } catch (error) {
        console.error("File deletion error:", error);
        res.status(500).json({
            status: false,
            message: "File deletion failed.",
            error: error.message || error,
        });
    }

}
release.deleteTrack = async (req, res) => {
    try {
        
        const releaseId = req.body.releaseId;
        const trackId = req.body.trackId;

        const result = await releaseModel.deleteTrackFromRelease( releaseId, trackId);
        
        if (result) {
            return res.status(200).json({
                status: true,
                message: "File deleted successfully!",
            });
        } else {
            return res.status(400).json({
                status: false,
                message: "Failed to delete file from release.",
            });
        }
    } catch (error) {
        console.error("File deletion error:", error);
        res.status(500).json({
            status: false,
            message: "File deletion failed.",
            error: error.message || error,
        });
    }

}


// release.addTwoStepRelease = async (req, res, next) => {
//     try {
//         const { id } = req.body_id;
//         const files = req.files;
//        console.log("filesfilesfilesfiles=====",files)
//         // Extract paths and file metadata to store in DB
//         const fileData = files.map(file => ({
//             fileName: file.originalname,
//             fileData: file.path,
//             fileType: file.mimetype.includes("audio") ? "audio" : "video"
//         }));

//         // Save to DB here, e.g., via your release model or database handler
//         console.log("fileData===",fileData);
//         const result = await releaseModel.addTwoStepRelease(id,fileData) 
//         console.log("video audio upload log=====>",result)
//         res.status(200).json({ status: true, message: 'Files uploaded successfully!' });
//     } catch (error) {
//         res.status(500).json({ status: false, message: 'File upload failed', error });
//     }

//     // const  body  = req.body 
//     // try {  
//     //     const result = await releaseModel.addTwoStepRelease(body) 
//     //     return R(res, true, "Update Successfully!!", result, 200)
//     // } catch (err) { 
//     //     next(err)
//     // }
// };

const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com', // Hostinger's SMTP server
    port: 465, // Use 465 for SSL or 587 for STARTTLS
    secure: true, // Use true for SSL and false for STARTTLS
    auth: {
        user: process.env.EMAIL_USER, // Your email from environment variables
        pass: process.env.EMAIL_PASSWORD, // Your email password from environment variables
    },

});


release.addThreeStepRelease = async (req, res, next) => {
    const body = req.body


    for (let i = 0; i < body.step3.length; i++) {
        if (!body.step3[i].ISRC || body.step3[i].ISRC.trim() === "") {
            body.step3[i].ISRC = await generateGlobalISRCCode();
        }
    }

    try {
        const result = await releaseModel.addThreeStepRelease(body)
        return R(res, true, "Update Successfully!!", result, 200)
    } catch (err) {
        next(err)
    }
};
release.addFourStepRelease = async (req, res, next) => {
    const body = req.body
    try {
        const result = await releaseModel.addFourStepRelease(body)
        return R(res, true, "Update Successfully!!", result, 200)
    } catch (err) {
        next(err)
    }
};
release.addFiveStepRelease = async (req, res, next) => {
    const body = req.body
    try {
        const result = await releaseModel.addFiveStepRelease(body)
        return R(res, true, "Update Successfully!!", result, 200)
    } catch (err) {
        next(err)
    }
};

release.SubmitFinalRelease = async (req, res, next) => {
    const body = req.body;
    const userid = req.doc.userId
    let status = "Submit";
    const parentId = await permission.findparentId(userid);
    if (parentId != false) {
        status = "Pending";
    } else {
        status = "Submit";
    }

    try {
        const result = await releaseModel.SubmitFinalRelease(body, parentId, status)
        return R(res, true, "Final Update Successfully!!", result, 200)
    } catch (err) {
        next(err)
    }
};

release.releaseList = async (req, res, next) => {
    try {
        const statusFilter = req.query.status; // Default to all statuses if none are provided
        // console.log(">>>>>>>", statusFilter);
        const result = await releaseModel.releaseList(req.doc.userId, statusFilter);
        return R(res, true, "Fetch Successfully!!", result, 200);
    } catch (err) {
        next(err);
    }
};

release.releaseDelete = async (req, res, next) => {
    try {
        const id = req.body.id;

        const result = await releaseModel.releaseDelete(id);
        return R(res, true, "Delete Successfully!!", result, 200);
    } catch (err) {
        next(err);
    }
};

// release.allReleaseList = async (req, res, next) => {
//     try {
//         const result = await releaseModel.allReleaseList(req.doc.userId)
//         return R(res, true, "Fetch Successfully!!", result, 200)
//     } catch (err) {
//         next(err)
//     }
// };

release.allDraftList = async (req, res, next) => {
    try {
        let { page, limit, search } = req.query;
        page = parseInt(page) || 1;  // Default to page 1
        limit = parseInt(limit) || 10; // Default to 10 results per page 
        const result = await releaseModel.allDraftList(req.doc.userId, page, limit, search);
        return R(res, true, "Fetch Successfully!!", result, 200);
    } catch (err) {
        next(err);
    }
};

release.allReleaseList = async (req, res, next) => {
    try {
        let { page, limit, search } = req.query;
        page = parseInt(page) || 1;  // Default to page 1
        limit = parseInt(limit) || 10; // Default to 10 results per page 
        const result = await releaseModel.allReleaseList(req.doc.userId, page, limit, search);
        return R(res, true, "Fetch Successfully!!", result, 200);
    } catch (err) {
        next(err);
    }
};


release.adminAllReleaseList = async (req, res, next) => {
    try {
        let { page, limit, search } = req.query;
        page = parseInt(page) || 1;  // Default to page 1
        limit = parseInt(limit) || 10; // Default to 10 results per page 
        const result = await releaseModel.adminAllReleaseList(req.doc.userId, page, limit, search);
        return R(res, true, "Fetch Successfully!!", result, 200);
    } catch (err) {
        next(err);
    }
};


release.releaseDetails = async (req, res, next) => {
    let { releaseId } = req.body;
    try {
        const result = await releaseModel.releaseDetails(releaseId)
        return R(res, true, "Fetch Successfully!!", result, 200)
    } catch (err) {
        next(err)
    }
};


// release.updateStatus = async (req, res, next) => {
//     const body = req.body;
//     const trackName = body.trackName;
//     try {
//         // Update status
//         const result = await releaseModel.updateStatus(body);
//         if (!result) {
//             return R(res, true, "Failed to update status" , result, 400) 
//         }

//         // Get user email
//         const email = await releaseModel.getEmail(body);
//         if (!email) {
//             return R(res, true, "Email not found" , result, 404) 


//         }

//         console.log(`Sending email to: ${email}`);


//         const mailOptionsForApprove = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: `Release ${trackName} delivered successfully`,
//             // text: `Hello, your status has been updated to: ${body.status}`,
//             html: `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <style>
//     body {
//       font-family: Arial, sans-serif;
//       background-color: #121212;
//       margin: 0;
//       padding: 0;
//       color: #ffffff;
//     }
//     .container {
//       max-width: 600px;
//       margin: 20px auto;
//       background-color: #1e1e1e;
//       padding: 20px;
//       border-radius: 8px;
//       box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
//     }
//     .header {
//       text-align: center;
//       padding-bottom: 20px;
//     }
//     .header img {
//       max-width: 150px;
//     }
//     .content {
//       text-align: center;
//       font-size: 16px;
//       color: #e0e0e0;
//     }
//     .release-info {
//       margin: 20px 0;
//       padding: 10px;
//       background-color: #2b2b2b;
//       border: 1px solid #444;
//       border-radius: 4px;
//       text-align: left;
//     }
//     .release-info span {
//       font-weight: bold;
//       color: #ffffff;
//     }
//     .footer {
//       text-align: center;
//       font-size: 12px;
//       color: #888888;
//       margin-top: 20px;
//     }
//     .link {
//       color: #007bff;
//       text-decoration: none;
//     }
//     .link:hover {
//       text-decoration: underline;
//     }
//   </style>
// </head>
// <body>
//   <div class="container">
//     <div class="header">
//       <img src="https://via.placeholder.com/150" alt="Company Logo">
//     </div>
//     <div class="content">
//       <p>Hello <strong>janumex</strong>,</p>
//       <p>Your release  with Tuneplus at Tune Plus Distribution (ID: <strong>8472025918673</strong>) has now been sent out to stores.</p>
//       <div class="release-info">
//         <p>Please note that once received by the stores, they will process your release in accordance with their internal processes. We have no control over how soon stores will process your release.</p>
//         <p>If you need any further assistance, please use the Contact Us form available on your dashboard and we will get back to you as soon as possible.</p>
//       </div>
//       <p>For further details on YouTube’s Content ID system, please visit the following link:</p>
//       <p><a href="https://support.google.com/youtube/answer/2797370?hl=en-GB" class="link">YouTube Content ID System</a></p>
//     </div>
//     <div class="footer">
//       <p>&copy; 2025 Believe Digital. All rights reserved.</p>
//     </div>
//   </div>
// </body>
// </html>
// `
//         };
//         const mailOptionsForReject = {
//             from: process.env.EMAIL_USER,
//             to: email,
//             subject: `Release ${trackName} delivered successfully`,
//             // text: `Hello, your status has been updated to: ${body.status}`,
//             html: `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <style>
//     body {
//       font-family: Arial, sans-serif;
//       background-color: #121212;
//       margin: 0;
//       padding: 0;
//       color: #ffffff;
//     }
//     .container {
//       max-width: 600px;
//       margin: 20px auto;
//       background-color: #1e1e1e;
//       padding: 20px;
//       border-radius: 8px;
//       box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
//     }
//     .header {
//       text-align: center;
//       padding-bottom: 20px;
//     }
//     .header img {
//       max-width: 150px;
//     }
//     .content {
//       text-align: center;
//       font-size: 16px;
//       color: #e0e0e0;
//     }
//     .release-info {
//       margin: 20px 0;
//       padding: 10px;
//       background-color: #2b2b2b;
//       border: 1px solid #444;
//       border-radius: 4px;
//       text-align: left;
//     }
//     .release-info span {
//       font-weight: bold;
//       color: #ffffff;
//     }
//     .footer {
//       text-align: center;
//       font-size: 12px;
//       color: #888888;
//       margin-top: 20px;
//     }
//     .link {
//       color: #007bff;
//       text-decoration: none;
//     }
//     .link:hover {
//       text-decoration: underline;
//     }
//   </style>
// </head>
// <body>
//   <div class="container">
//     <div class="header">
//       <img src="https://via.placeholder.com/150" alt="Company Logo">
//     </div>
//     <div class="content">
//       <p>Hello <strong>janumex</strong>,</p>
//       <p>Your release "<strong>Vaar</strong>" (ID: <strong>8920242320156</strong>) has been unsubmitted and moved back to draft status.</p>
//       <div class="release-info">
//         <p><strong>Profile:</strong> Tuneplus</p>
//         <p><strong>Service:</strong> My Music Distribution Zone</p>
//         <p><strong>Reason for Unsubmission:</strong></p>
//         <p>Due to a policy change, this release is not suitable to be sent to Content ID platforms. We have reason to believe this release may contain non-exclusive samples/beats/loops, which cannot be sent to Facebook/Instagram, YouTube Content ID, and SoundCloud Content ID. Please update your service selection to exclude YouTube, Facebook, and SoundCloud. Your release will still be distributed to YouTube Music and SoundCloud.</p>
//         <p>If you have exclusive rights to the samples/beats/loops used in your release or have created the music from scratch, please contact your label manager and provide proof of this. Please note that the label name cannot be the same as the artist name.</p>
//       </div>
//     </div>
//     <div class="footer">
//       <p>&copy; 2025 Believe Digital. All rights reserved.</p>
//     </div>
//   </div>
// </body>
// </html>
// `
//         };


//         let mailOptions;
//         if (body.status === "Approve") {
//             mailOptions = mailOptionsForApprove;
//         } else if (body.status === "Reject") {
//             mailOptions = mailOptionsForReject;
//         } 


//         if (body.status === "Approve" || body.status === "Reject") {
//             // Send email notification
//             try {
//                 const emailResponse = await transporter.mailOptionsForApprove(mailOptions);
//                 console.log("Email sent:", emailResponse);
//                 return R(res, true, "Status updated and email sent successfully", result, 200)


//             } catch (error) {
//                 console.error("Error sending email:", error.message);
//                 return R(res, true,  "Status updated but email not sent", result, 400)
//              }
//         }


//         return R(res, true, "Status updated and email sent successfully", result, 200)

//     } catch (error) {
//         console.error("Error in updateStatus:", error.message);
//         next(error);
//     }
// };

release.updateStatus = async (req, res, next) => {
    const body = req.body;
    const title = body.title;
    const UPCEAN = body.UPCEAN;
    const reason = body.reason;
    const status = body.status;
    try {
        // Update status
        const result = await releaseModel.updateStatus(body);
        if (!result) {
            return R(res, true, "Failed to update status", result, 400);
        }
        console.log("result====", result);

        // Get user email
        const email = await releaseModel.getEmail(body);
        if (!email) {
            return R(res, true, "Email not found", result, 404);
        }
        console.log(`Sending email to: ${email}`);

        // Define email options
        const mailOptionsForApprove = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Release ${title} delivered successfully`,
            // text: `Hello, your status has been updated to: ${body.status}`,
            html: `<!DOCTYPE html>
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
                .release-info {
                  margin: 20px 0;
                  padding: 10px;
                  background-color: #2b2b2b;
                  border: 1px solid #444;
                  border-radius: 4px;
                  text-align: left;
                }
                .release-info span {
                  font-weight: bold;
                  color: #ffffff;
                }
                .footer {
                  text-align: center;
                  font-size: 12px;
                  color: #888888;
                  margin-top: 20px;
                }
                .link {
                  color: #007bff;
                  text-decoration: none;
                }
                .link:hover {
                  text-decoration: underline;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <img src="https://res.cloudinary.com/dh2izd0iu/image/upload/v1744977813/lc4ibi7ama2ff5udzvwn.png" alt="Company Logo">
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>Your release "<strong>${title}</strong>" UPC Code: <strong>${UPCEAN}</strong> at Tune Plus Distribution has now been sent out to stores.</p>
                  <div class="release-info">
                    <p>Please note that once received by the stores, they will process your release in accordance with their internal processes. We have no control over how soon stores will process your release.</p>
                    <p>If you need any further assistance, please use the Contact Us form available on your dashboard and we will get back to you as soon as possible.</p>
                  </div>
                  <p>For further details on YouTube’s Content ID system, please visit the following link:</p>
                  <p><a href="https://support.google.com/youtube/answer/2797370?hl=en-GB" class="link">YouTube Content ID System</a></p>
                </div>
                <div class="footer">
                  <p>If you have questions, please contact Tune Plus Team at:</p>
                  <p><a href="mailto:support-ind@tuneplus.org" class="link">support-ind@tuneplus.org</a></p>
                  <p>&copy; 2025  Tune Plus . All rights reserved.</p>
                </div>
              </div>
            </body>
            </html>`

        };
        const mailOptionsForReject = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Release ${title} has been unsubmitted`,
            // text: `Hello, your status has been updated to: ${body.status}`,
            html: `<!DOCTYPE html>
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
                .release-info {
                margin: 20px 0;
                padding: 10px;
                background-color: #2b2b2b;
                border: 1px solid #444;
                border-radius: 4px;
                text-align: left;
                }
                .release-info p {
                margin: 5px 0;
                }
                .release-info span {
                font-weight: bold;
                color: #ffffff;
                }
                .footer {
                text-align: center;
                font-size: 12px;
                color: #888888;
                margin-top: 20px;
                }
                .link {
                color: #007bff;
                text-decoration: none;
                }
                .link:hover {
                text-decoration: underline;
                }
            </style>
            </head>
            <body>
            <div class="container">
                <div class="header">
                <img src="https://res.cloudinary.com/dh2izd0iu/image/upload/v1744977813/lc4ibi7ama2ff5udzvwn.png" alt="Company Logo">
                </div>
                <div class="content">
                <p>Hello,</p>
                <p>Your release "<strong>${title} </strong>" UPC Code: <strong>${UPCEAN}</strong> has been unsubmitted and moved back to draft status.</p>
                <div class="release-info">
                    <p><strong>Track Name:</strong> ${title}</p>
                    <p><strong>Service:</strong> Tune Plus Distribution</p>
                    <p><strong>Reason for Unsubmission:</strong></p>
                    <p>${reason}</p>
                </div>
                <p>If you have further questions, please email the distribution team at:</p>
                <p><a href="mailto:support-ind@tuneplus.org" class="link">support-ind@tuneplus.org</a></p>
                </div>
                <div class="footer">
                <p>&copy; 2025  Tune Plus . All rights reserved.</p>
                </div>
            </div>
            </body>
            </html>
            `
        };

        // Determine which email to send
        let mailOptions;
        if (body.status === "Approve") {
            mailOptions = mailOptionsForApprove;
        } else if (body.status === "Reject") {
            mailOptions = mailOptionsForReject;
        }

        // Send email notification
        if (status === "Approve" || status === "Reject") {
            {
                try {
                    const emailResponse = await transporter.sendMail(mailOptions);
                    console.log("Email sent:", emailResponse);
                    return R(res, true, "Status updated and email sent successfully", result, 200);
                } catch (error) {
                    console.error("Error sending email:", error.message);
                    return R(res, true, "Status updated but email not sent", result, 400);
                }
            }
        }

        return R(res, true, "Status updated but email not sent", result, 400);
        if (status === "Approve" || status === "Reject") {
            {
                try {
                    const emailResponse = await transporter.sendMail(mailOptions);
                    console.log("Email sent:", emailResponse);
                    return R(res, true, "Status updated and email sent successfully", result, 200);
                } catch (error) {
                    console.error("Error sending email:", error.message);
                    return R(res, true, "Status updated but email not sent", result, 400);
                }
            }
        }
        return R(res, true, "Status updated but email not sent", result, 400);

    } catch (error) {
        console.error("Error in updateStatus:", error.message);
        next(error);
    }
};





release.addLabel = async (req, res, next) => {
    const body = {
        ...req.body,           // Spread the existing keys from req.body
        userId: req.doc.userId // Add a new key `userId` from req.doc
    };
    try {
        const result = await releaseModel.addLabel(body)
        if (result === "Cannot add more labels. Maximum limit reached.") {
            return R(res, false, "Cannot add more labels. Maximum limit reached.", {}, 400)
        }
        return R(res, true, "Add Successfully!!", result, 200)
    } catch (err) {
        next(err)
    }
};

release.labelList = async (req, res, next) => {
    try {
        const result = await releaseModel.labelList(req.doc.userId)
        return R(res, true, "Fetch Successfully!!", result, 200)
    } catch (err) {
        next(err)
    }
};

release.trackUpdate = async (req, res, next) => {
    const body = req.body
    try {
        const result = await releaseModel.trackUpdate(body)
        return R(res, true, "Update Successfully!!", result, 200)
    } catch (err) {
        next(err)
    }
};
release.tracksList = async (req, res, next) => {
    const userId = req.doc.userId
    try {
        const result = await releaseModel.tracksList(userId)
        return R(res, true, "Tracks Successfully!!", result, 200)
    } catch (err) {
        next(err)
    }
};


release.addStore = async (req, res, next) => {
    const body = req.body
    try {
        const result = await releaseModel.addStore(body)
        return R(res, true, "Add Successfully!!", result, 200)
    } catch (err) {
        next(err)
    }
};
release.storeList = async (req, res, next) => {
    try {
        const result = await releaseModel.storeList(req.doc.userId)
        return R(res, true, "Fetch Successfully!!", result, 200)
    } catch (err) {
        next(err)
    }
};


module.exports = release;