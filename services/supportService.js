const SupportModal = require("../models/supportmodeals");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const R = require("../utils/responseHelper");
const support = {};

support.addData = async (req, res, next) => {
  try {
    let data = req.body;
    // console.log(data);
    if (!data) {
      return R(res, false, "Data is required", {}, 400);
    }
    console.log(">>>>>>>>>>>>>>>>>>>>>>",data)
    console.log(">>>>>>>>>>>>>>>>>>>>>>",req.files)

    if (!req.files || !req.files || !Array.isArray(req.files)) {
      return R(res, false, "Attachments are required and should be an array", {}, 400);
    }

    // Process the attachments
    const uploadedUrls = [];
    for (const file of req.files) {
      const localFilePath = file.path; // Ensure `path` is set in your file object
      try {
        const cloudinaryUrl = await uploadOnCloudinary(localFilePath); // Upload to Cloudinary
        console.log("Cloudinary URL:", cloudinaryUrl); 
        uploadedUrls.push(cloudinaryUrl.url);

      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return R(res, false, "Failed to upload attachments", {}, 500);
      }
    }

    // Add uploaded URLs to the data object
    data.attachments = uploadedUrls;
    //Add your data logic here
    const supportData = await SupportModal.addSupport(data,req.doc.userId);
    if (supportData == false) {
      return R(res, false, "Data not added successfully", {}, 400);
    }

    return R(res, true, "Data added successfully", supportData, 201);
  } catch (error) {
    next(error);
  }
};

support.listdata=async (req,res,next) => {
    try {
        let userId=req.doc.userId
        const supportData = await SupportModal.supportList(userId);
        if (!supportData) {
            return R(res, false, "Data not found", {}, 404);
        }

        return R(res, true, "Data fetched successfully", supportData, 200);
    } catch(error){
        next(error);
    }
}

module.exports = support;
