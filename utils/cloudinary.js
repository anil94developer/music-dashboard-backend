const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const dotenv = require("dotenv");
 

dotenv.config();


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary = async (localFilePath,type) =>{
    try {
        if(!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type : "auto"
        })
        fs.unlinkSync(localFilePath)
        console.log("response---------------",response)
        return response;
        
    } catch (error) {
        console.log("error ----------",error)

        fs.unlinkSync(localFilePath)
    }
}

module.exports = { uploadOnCloudinary };