// const { string } = require("joi");
const mongoose = require("mongoose");

const excelSchema = new mongoose.Schema({
    
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
},
    { timestamps: true }
);

const excelModel = mongoose.model("excel", excelSchema);

module.exports = excelModel;