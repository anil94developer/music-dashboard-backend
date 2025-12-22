const settingModel = require("../models/settingmodels");
const R = require("../utils/responseHelper");
const AppErr = require("../utils/error");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const { Track, Store, Market, salesAssets, salesYoutube, stream } = require("../models/csvdatamodel");
const { override } = require("joi");
const { OverviewReport, TrackReport, StoreReport } = require("../models/financialreportmodels");

const uploadController = {};

// Mapping types to their corresponding models
const modelMap = {
    track: Track,
    store: Store,
    market: Market,
    salesAsset: salesAssets,
    salesYoutube: salesYoutube,
    salesStream: stream,
};

const modelReportMap = {
    track: TrackReport,
    store: StoreReport,
    market: MarketReport,
    overview: OverviewReport
};

uploadController.uploadExcel = async (req, res, next) => {
    try {
        const { id, type } = req.body;

        if (!id || !type) {
            throw new AppErr("Both 'id' and 'type' are mandatory.", 400);
        }

        const model = modelMap[type];
        if (!model) {
            throw new AppErr(`Invalid type. Supported types: ${Object.keys(modelMap).join(", ")}`, 400);
        }

        const filePath = req.file?.path;
        if (!filePath) {
            throw new AppErr("No file provided or incorrect format.", 400);
        }

        const cloudinaryResult = await uploadOnCloudinary(filePath);
        if (!cloudinaryResult?.url) {
            throw new AppErr("File upload failed. Cloudinary did not return a valid URL.", 500);
        }

        const updated = await model.update(id, { Excel: cloudinaryResult.url });
        if (!updated) {
            throw new AppErr(`${type} record not found for the given ID.`, 404);
        }

        return R(res, true, "Excel uploaded and processed successfully!", { url: cloudinaryResult.url }, 200);
    } catch (error) {
        console.error("Upload Error:", error);
        return R(res, false, error.message || "Internal Server Error", 500);
    }
};

uploadController.reportUploadExcel = async (req, res, next) => {
    try {
        const { id, type } = req.body;

        if (!id || !type) {
            throw new AppErr("Both 'id' and 'type' are mandatory.", 400);
        }

        const model = modelReportMap[type];
        if (!model) {
            throw new AppErr(`Invalid type. Supported types: ${Object.keys(modelReportMap).join(", ")}`, 400);
        }

        const filePath = req.file?.path;
        if (!filePath) {
            throw new AppErr("No file provided or incorrect format.", 400);
        }

        const cloudinaryResult = await uploadOnCloudinary(filePath);
        if (!cloudinaryResult?.url) {
            throw new AppErr("File upload failed. Cloudinary did not return a valid URL.", 500);
        }

        const updated = await model.update(id, { Excel: cloudinaryResult.url });
        if (!updated) {
            throw new AppErr(`${type} record not found for the given ID.`, 404);
        }

        return R(res, true, "Excel uploaded and processed successfully!", { url: cloudinaryResult.url }, 200);
    } catch (error) {
        console.error("Upload Error:", error);
        return R(res, false, error.message || "Internal Server Error", 500);
    }
};
module.exports = uploadController;
