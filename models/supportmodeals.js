const mongoose = require('mongoose');
const db = require("../utils/dbConn");

const supportSchema = new mongoose.Schema({
    issueType: { type: String },
    email: { type: String },
    clientNumber: { type: String },
    country: { type: String },
    description: { type: String },
    motionType: { type: String },
    motionLink: { type: String },
    attachments: { type: [String] }, // Store filenames or links for attachments
    userId: { type: String, required: true },
    status: { type: String, required: true },
});

const SupportModal = mongoose.model('Support', supportSchema);


SupportModal.addSupport = async (body, userId) => {
    const newReq = {
        userId: userId,
        issueType: body.issueType,
        email: body.email,
        clientNumber: body.clientNumber,
        country: body.country,
        description: body.description,
        motionType: body.motionType,
        motionLink: body.motionLink,
        status: 'Pending',
        attachments: body.attachments,
    }
    
    const result = await db.connectDb("Support", supportSchema);
    let insData = await result.insertMany(newReq);
    console.log(newReq);
    if (insData.length > 0) {
        return insData[0];
    } else {
        return false
    }
};

SupportModal.supportList = async (uId) => {
    const result = await db.connectDb("Support", supportSchema);
    let fetData = await result.find({ userId: uId });
    return fetData;
};


module.exports = SupportModal;
