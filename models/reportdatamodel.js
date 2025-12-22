// const { string } = require("joi");
const mongoose = require("mongoose"); 
const db = require("../utils/dbConn");
const reportSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    toDate: { type: String, required: true },
    fromDate: { type: String, required: true },
    excelUrl: { type: String, required: true }
},
{ 
    timestamps: true,
    collection: 'reports' // Explicitly define collection name
}
);

// Add index for better query performance
reportSchema.index({ userId: 1 });
 
// Set write concern for better reliability
const reportModel = mongoose.model("Report", reportSchema);

reportModel.addReport = async (body) => {
    const newReq = {
        userId: body.userId,
        toDate: body.toDate,
        fromDate: body.fromDate,
        excelUrl: body.excelUrl,
        
    }
    
    const result = await db.connectDb("Report", reportSchema);
    let insData = await result.insertMany(newReq);
    console.log(newReq);
    if (insData.length > 0) {
        return insData[0];
    } else {
        return false
    }
};

reportModel.getReport = async (filter) => {
    const result = await db.connectDb("Report", reportSchema);
    // Use the filter object which can contain userId, toDate, fromDate
    const reportData = await result.find(filter);
    if (reportData.length > 0) {
        return reportData;
    } else {
        return false;
    }
};

reportModel.deleteReport = async (filter) => {
    const result = await db.connectDb("Report", reportSchema);
    // Use the filter object which can contain userId, toDate, fromDate
    const reportData = await result.deleteMany(filter);
    if (reportData.length > 0) {
        return reportData;
    } else {
        return false;
    }
}


module.exports = reportModel;