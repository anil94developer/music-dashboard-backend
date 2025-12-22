const settingModel = require("../models/settingmodels");
const R = require("../utils/responseHelper");
const AppErr = require("../utils/error");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const reportModel = require("../models/reportdatamodel");
const financialReport = require("../models/financialreportmodels");


const uploadController = {};

// uploadController.reportUploadExcel = async (req, res, next) => {
//     try {
//         const { userId, toDate, fromDate } = req.body;
//         console.log("Upload Request Body:", req.body);
//         if (!toDate || !fromDate) {
//             throw new AppErr("Both 'fromDate' and 'toDate' are mandatory.", 400);
//         }

//         const filePath = req.file?.path;
//         console.log("Upload filePath:", filePath);
//         if (!filePath) {
//             throw new AppErr("No file provided or incorrect format.", 400);
//         }

//         const cloudinaryResult = await uploadOnCloudinary(filePath);
//         if (!cloudinaryResult?.url) {
//             throw new AppErr("File upload failed. Cloudinary did not return a valid URL.", 500);
//         }

//         // Create the document object first
//         const reportData = {
//             userId: userId,
//             toDate: toDate,
//             fromDate: fromDate,
//             excelUrl: cloudinaryResult.url
//         };

//         console.log("Attempting to save report data:", reportData);

//         // Use a different approach to create the document
//         ///const newReport = new reportModel(reportData);

//         const result = await reportModel.addReport(reportData);
//         if (result == false) {
//             return R(res, false, "Data not added successfully", {}, 400);
//         }

//         return R(res, true, "Excel uploaded and processed successfully!", result, 201);
//     } catch (error) {
//         console.error("Upload Error:", error);
//         return R(res, false, error.message || "Internal Server Error", error.statusCode || 500);
//     }
// }

// uploadController.getReport = async (req, res, next) => {
//     try {
//         const { userId } = req.body;
//         console.log("getReport Request Body:", req.body);
//         if (!userId) {
//             throw new AppErr("userId is mandatory.", 400);
//         }

//         // Create filter object with userId
//         const filter = { userId };



//         const result = await reportModel.getReport(filter);
//         if (result == false) {
//             return R(res, false, "Data not found", {}, 400);
//         }
//         return R(res, true, "Data found", result, 200);

//     } catch (error) {
//         next(error);
//     }
// }

// uploadController.deleteReport = async (req, res, next) => {
//     try {
//         const { reportId } = req.body;
//         console.log("deleteReport Request Body:", req.body);
//         if (!reportId) {
//             throw new AppErr("'reportId' are mandatory.", 400);
//         }
//         const filter = { _id: reportId };
//         const result = await reportModel.deleteReport(filter);
//         if (result == false) {
//             return R(res, false, "Data not found", {}, 400);
//         }
//         return R(res, true, "Data deleted", result, 200);
//     } catch (error) {
//         next(error);
//     }
// }



uploadController.trackReport = async (req, res, next) => {
    try {
        const { userId, data, toDate, fromDate } = req.body;

        if (!data) {
            return R(res, false, "Data not found", "", 400);
        }

        // console.log(data);

        let result = data.map(async (val, ind, arr) => {
            val = await financialReport.TrackReport.create(userId, arr[ind], toDate, fromDate   );
            if (!val) {
                return R(res, false, "Excel file not found", "", 400);
            }
            return val;
        })

        // console.log(result);

        // Process your data here and save it to the database or any other storage medium.
        return R(res, true, "Track upload successful", "", 200);
    }
    catch (e) {
        next();
    }
}

uploadController.getTrackReport = async (req, res, next) => {
    try {
        const userId =   req.doc.userId;
        const { startDate, endDate } = req.query; // Assuming the dates are passed as query parameters
        console.log(">>>>>>>>>>>>>>>>>>>",userId, startDate, endDate);
        const track = await financialReport.TrackReport.get(userId, startDate, endDate);

        if (track === false) {
            return R(res, false, "Track not found", [], 400);
        }

        return R(res, true, "Track fetched successfully", track, 200);
    } catch (err) {
        next(err);
    }
};

uploadController.storeReport = async (req, res, next) => {
    try {
        const { userId, data, toDate, fromDate } = req.body;

        if (!data) {
            return R(res, false, "Data not found", [], 400);
        }

        // console.log(data);

        let result = data.map(async (val, ind, arr) => {
            val = await financialReport.StoreReport.create(userId, arr[ind], toDate, fromDate);
            if (!val) {
                return R(res, false, "Excel file not found", [], 400);
            }
            return val;
        })

        // console.log(data);

        // Process your data here and save it to the database or any other storage medium.
        return R(res, true, "Track upload successful", "", 200);
    }
    catch (e) {
        next();
    }
}

uploadController.getStoreReport = async (req, res, next) => {
    try {
        const userId = req.doc.userId;
        const { startDate, endDate } = req.query; // Assume dates are passed as query parameters

        if (!userId) {
            return R(res, false, "User ID not found", [], 400);
        }
        console.log(">>>>>>>>>>>>>>>>>>>",userId, startDate, endDate);
        const store = await financialReport.StoreReport.get(userId, startDate, endDate);
        if (store === false) {
            return R(res, false, "Store not found", [], 400);
        }

        return R(res, true, "Store fetched successfully", store, 200);
    } catch (err) {
        console.log(err);
        next(err);
    }
};
 

uploadController.marketDataReport = async (req, res, next) => {
    try {
        const { userId, data, toDate, fromDate } = req.body;

        if (!userId) {
            return R(res, false, "User ID not found", [], 400);
        }

        if (!data) {
            return R(res, false, "Data not found", [], 400);
        }

        // console.log(data);

        let result = data.map(async (val, ind, arr) => {
            val = await financialReport.MarketReport.create(userId, arr[ind], toDate, fromDate);
            if (!val) {
                return R(res, false, "data not insert", [], 400);
            }
            return val;
        })

        // console.log(result);

        // Process your data here and save it to the database or any other storage medium.
        return R(res, true, "Market Data upload successful", "", 200);
    }
    catch (e) {
        // console
        next();
    }
}

uploadController.getMarketDataReport = async (req, res, next) => {
    try {
        const userId = req.doc.userId;
        const { startDate, endDate } = req.query; // Assume dates are passed as query parameters

        if (!userId) {
            return R(res, false, "User ID not found", "", 400);
        }

        const data = await financialReport.MarketReport.getData(userId, startDate, endDate);
        if (data === false) {
            return R(res, false, "Market Data not found", [], 400);
        }

        return R(res, true, "Market fetched successfully", data, 200);
    } catch (err) {
        console.log(">>>>>>>>>>>>>>>>>>>>>", err);
        next(err);
    }
};


uploadController.sentOverviewReport = async (req, res, next) => {
    try {
        const { userId, data, toDate, fromDate } = req.body;

        if (!userId) {
            return R(res, false, "User ID not found", "", 400);
        }

        if (!data) {
            return R(res, false, "Data not found", [], 400);
        }

        // console.log(data);

        let result = await Promise.all(
            data.map(async (val, ind, arr) => {
                const valInserted = await financialReport.OverviewReport.create(userId, arr[ind], toDate, fromDate  );
                return valInserted;
            })
        );

        // console.log(">>>>>>>>>>>>>>>>>>>>",result);

        // Process your data here and save it to the database or any other storage medium.
        return R(res, true, " Data upload successful", [], 200);
    }
    catch (e) {
        // console.log(e)
        next();
    }
}

uploadController.getOverviewReport = async (req, res, next) => {
    try {
        const userId = req.doc.userId;
        const { startDate, endDate } = req.query; // Assume dates are passed as query parameters

        if (!userId) {
            return R(res, false, "User ID not found", "", 400);
        }

        const data = await financialReport.OverviewReport.getData(userId, startDate, endDate);
        if (data === false) {
            return R(res, false, "Data not found", [], 400);
        }

        return R(res, true, "Data fetched successfully", data, 200);
    } catch (err) {
        console.log(err);
        next(err);
    }
};

 
uploadController.getAllFinancialReport = async (req, res, next) => {
    try {
      const userId = req.body.userId;
      const startDate = "";
      const endDate = "";
      const Label = "";
      const ISRC = "";
      const Stream = "";
      const Artist = "";
      const filters = { Label, ISRC, Stream, Artist };
  
       
  
      const trackData = await financialReport.TrackReport.get(userId, startDate, endDate); 
       const storeData = await financialReport.StoreReport.get(userId, startDate, endDate);
      const marketData = await financialReport.MarketReport.getData(userId, startDate, endDate);
      const overviewData = await financialReport.OverviewReport.getData(userId, startDate, endDate);
   
  
      let data={
        trackData:trackData,
        storeData:storeData,
        marketData:marketData,
        overviewData:overviewData,
      } 
  
      return R(res, true, "Data fetched successfully", data, 200);
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
  
  uploadController.deleteReport = async  (req, res, next) => {
    try {
      const userId = req.body.userId;
      const type = req.body.type;
      console.log(req.body)
       
      if(type == "store"){
        const result = await financialReport.StoreReport.delete(userId); 
        return R(res, true, "Delete successfully", result, 200);
      } 
      if(type == "track"){
        const result = await financialReport.TrackReport.delete(userId); 
        return R(res, true, "Delete successfully", result, 200);
      } 
      if(type == "market"){
        const result = await financialReport.MarketReport.delete(userId); 
        return R(res, true, "Delete successfully", result, 200);
      }
      if(type == "overview"){
        const result = await financialReport.OverviewReport.delete(userId); 
        return R(res, true, "Delete successfully", result, 200);
      }
      
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

module.exports = uploadController;
