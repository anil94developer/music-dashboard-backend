
const db = require("../utils/dbConn");
const mongoose = require("mongoose");


TrackReport = {}
const TrackSchema = new mongoose.Schema({
    userId: {
        type: String,
    },
    toDate: {
        type: String, // PAN is usually mandatory  // Ensure PAN is unique in the database
        trim: true,     // Remove extra whitespace
    },
    fromDate: {
        type: String, // PAN is usually mandatory  // Ensure PAN is unique in the database
        trim: true,     // Remove extra whitespace
    },
    Track: {
        type: String, // PAN is usually mandatory  // Ensure PAN is unique in the database
        trim: true,     // Remove extra whitespace
    },
    Earnings_GBP: {
        type: Number, // Account holder name should not be empty
        trim: true,
    },
    Excel: {
        type: String, // Account holder name should not be empty
        trim: true,
        default: ""
    }
}, { timestamps: true }); // Adds createdAt and updatedAt fields


TrackReport.create = async (userId, data, toDate, fromDate) => {
    const result = await db.connectDb("TrackReport", TrackSchema);
    data["userId"] = userId;
    data["toDate"] = toDate;
    data["fromDate"] = fromDate;
    let insData = await result.insertMany(data);
    console.log(insData);
    if (insData.length > 0) {
        return insData[0];
    } else {
        return false
    }
}

TrackReport.get = async (userId, startDate, endDate) => {
    const result = await db.connectDb("TrackReport", TrackSchema);

    console.log(">>>>>>>>>>>>>>>>>>> module function", userId, startDate, endDate);

    const query = { userId };

    // Function to parse date in YYYY-MM-DD format
    const parseDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // Month is zero-indexed
    };

    // Build createdAt filter if startDate or endDate is provided
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = parseDate(startDate);
        }
        if (endDate) {
            const end = parseDate(endDate);
            end.setHours(23, 59, 59, 999); // Include full end day
            query.createdAt.$lte = end;
        }
    }

    const trackData = await result.find(query);
    console.log(">>>>>>>>", trackData);

    return trackData.length > 0 ? trackData : false;
};

TrackReport.delete = async (userId) => {
    try {
        const result = await db.connectDb("TrackReport", TrackSchema);
        console.log(">>>>>>>", userId);

        let query = { userId: userId };
        let storeData = await result.deleteMany(query);

        if (storeData.deletedCount <= 0) {
            return false; // Nothing was deleted
        }

        return storeData; // Return the result object (e.g., number of deleted documents)
    } catch (error) {
        console.error("Error deleting store:", error);
        return false; // Return false in case of an error
    }
};

TrackReport.update = async (trackId, updateData) => {
    try {
        const model = await db.connectDb("TrackReport", TrackSchema);

        // Ensure updateData is an object
        if (typeof updateData !== 'object' || Array.isArray(updateData)) {
            throw new Error("Update data must be a valid object");
        }

        const updatedTrack = await model.findOneAndUpdate(
            { _id: trackId, }, // Match by track ID and user ID
            { $set: updateData },
            { new: true } // Return the updated document
        );

        if (!updatedTrack) {
            return false; // No document found or updated
        }

        return updatedTrack;
    } catch (error) {
        console.error("Track.update error:", error);
        return false;
    }
};


const StoreReport = {}

const StoreSchema = new mongoose.Schema({
    userId: {
        type: String,
        // Ensure every bank record is linked to a user
    },
    Store: {
        type: String, // PAN is usually mandator   // Ensure PAN is unique in the database
        trim: true,     // Remove extra whitespace
    },
    toDate: {
        type: String, // PAN is usually mandatory  // Ensure PAN is unique in the database
        trim: true,     // Remove extra whitespace
    },
    fromDate: {
        type: String, // PAN is usually mandatory  // Ensure PAN is unique in the database
        trim: true,     // Remove extra whitespace
    },
    Earnings_GBP: {
        type: Number, // Account holder name should not be empty
        trim: true,
    },
    Excel: {
        type: String, // Account holder name should not be empty
        trim: true,
        default: ""
    }
}, { timestamps: true }); // Adds createdAt and updatedAt fields


StoreReport.create = async (userId, data, toDate, fromDate) => {
    const result = await db.connectDb("StoreReport", StoreSchema);
    data["userId"] = userId;
    data["toDate"] = toDate;
    data["fromDate"] = fromDate;
    let insData = await result.insertMany(data);
    console.log(insData);
    if (insData.length > 0) {
        return insData[0];
    } else {
        return false
    }
}

StoreReport.get = async (userId, startDate, endDate) => {
    const result = await db.connectDb("StoreReport", StoreSchema);
    console.log("User ID:", userId);

    let query = { userId: new mongoose.Types.ObjectId(userId) };

    const parseDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    let dateFilter = {};
    if (startDate) {
        dateFilter.$gte = parseDate(startDate);
    }
    if (endDate) {
        let d = parseDate(endDate);
        d.setHours(23, 59, 59, 999);
        dateFilter.$lte = d;
    }

    if (Object.keys(dateFilter).length > 0) {
        query.createdAt = dateFilter;
    }

    const storeData = await result.find(query);
    console.log("Store Data:", storeData);

    return storeData.length ? storeData : false;
};


StoreReport.delete = async (userId) => {
    try {
        const result = await db.connectDb("StoreReport", StoreSchema);
        console.log(">>>>>>>", userId);

        let query = { userId: userId };
        let storeData = await result.deleteMany(query);

        if (storeData.deletedCount <= 0) {
            return false; // Nothing was deleted
        }

        return storeData; // Return the result object (e.g., number of deleted documents)
    } catch (error) {
        console.error("Error deleting store:", error);
        return false; // Return false in case of an error
    }
};

StoreReport.update = async (storeId, updateData) => {
    try {
        const model = await db.connectDb("StoreReport", StoreSchema);

        // Ensure updateData is an object
        if (typeof updateData !== 'object' || Array.isArray(updateData)) {
            throw new Error("Update data must be a valid object");
        }

        const updatedStore = await model.findOneAndUpdate(
            { _id: storeId, }, // Match by Store ID and user ID
            { $set: updateData },
            { new: true } // Return the updated document
        );

        if (!updatedStore) {
            return false; // No document found or updated
        }

        return updatedStore;
    } catch (error) {
        console.error("Store.update error:", error);
        return false;
    }
};


const MarketSchema = new mongoose.Schema({
    userId: {
        type: String,
        // Ensure every bank record is linked to a user
    },
    Market: {
        type: String, // PAN is usually mandatory  // Ensure PAN is unique in the database
        trim: true,     // Remove extra whitespace
    },
    toDate: {
        type: String, // PAN is usually mandatory  // Ensure PAN is unique in the database
        trim: true,     // Remove extra whitespace
    },
    fromDate: {
        type: String, // PAN is usually mandatory  // Ensure PAN is unique in the database
        trim: true,     // Remove extra whitespace
    },
    Earnings_GBP: {
        type: Number, // Account holder name should not be empty
        trim: true,
    },
    Excel: {
        type: String, // Account holder name should not be empty
        trim: true,
        default: ""
    }
}, { timestamps: true }); // Adds createdAt and updatedAt fields

MarketReport = {}

MarketReport.create = async (userId, data, toDate, fromDate) => {
    const result = await db.connectDb("MarketReport", MarketSchema);
    data["userId"] = userId;
    data["toDate"] = toDate;
    data["fromDate"] = fromDate;
    let insData = await result.insertMany(data);
    console.log(insData);
    if (insData.length > 0) {
        return insData[0];
    } else {
        return false
    }
}

MarketReport.getData = async (userId, startDate, endDate) => {
    const result = await db.connectDb("MarketReport", MarketSchema);
    console.log(">>>>>>>", userId, startDate, endDate);

    const query = { userId };

    // Helper to parse date string (YYYY-MM-DD) to JS Date
    const parseDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed
    };

    // If either date is provided, create createdAt filter
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = parseDate(startDate);
        }
        if (endDate) {
            const end = parseDate(endDate);
            end.setHours(23, 59, 59, 999); // include the full end date
            query.createdAt.$lte = end;
        }
    }

    const data = await result.find(query);
    console.log(">>>>>>>>", data);

    return data.length > 0 ? data : false;
};


MarketReport.delete = async (userId) => {
    try {
        const result = await db.connectDb("MarketReport", MarketSchema);
        console.log(">>>>>>>", userId);

        let query = { userId: userId };
        let storeData = await result.deleteMany(query);

        if (storeData.deletedCount <= 0) {
            return false; // Nothing was deleted
        }

        return storeData; // Return the result object (e.g., number of deleted documents)
    } catch (error) {
        console.error("Error deleting store:", error);
        return false; // Return false in case of an error
    }
};

MarketReport.update = async (marketId, updateData) => {
    try {
        const model = await db.connectDb("MarketReport", MarketSchema);

        // Ensure updateData is an object
        if (typeof updateData !== 'object' || Array.isArray(updateData)) {
            throw new Error("Update data must be a valid object");
        }

        const updatedMarket = await model.findOneAndUpdate(
            { _id: marketId, }, // Match by Market ID and user ID
            { $set: updateData },
            { new: true } // Return the updated document
        );

        if (!updatedMarket) {
            return false; // No document found or updated
        }

        return updatedMarket;
    } catch (error) {
        console.error("Market.update error:", error);
        return false;
    }
};



const OverviewSchema = new mongoose.Schema({
    userId: {
        type: String,
        // Ensure every bank record is linked to a user
    },
    Date: {
        type: String, // PAN is usually mandatory  // Ensure PAN is unique in the database
        trim: true,     // Remove extra whitespace
    },
    toDate: {
        type: String, // PAN is usually mandatory  // Ensure PAN is unique in the database
        trim: true,     // Remove extra whitespace
    },
    fromDate: {
        type: String, // PAN is usually mandatory  // Ensure PAN is unique in the database
        trim: true,     // Remove extra whitespace
    },
    Earnings_GBP: {
        type: Number, // Account holder name should not be empty
        trim: true,
    },
    Excel: {
        type: String, // Account holder name should not be empty
        trim: true,
        default: ""
    }
}, { timestamps: true }); // Adds createdAt and updatedAt fields

OverviewReport = {}

OverviewReport.create = async (userId, data, toDate, fromDate) => {
    const result = await db.connectDb("OverviewReport", OverviewSchema);
    data["userId"] = userId;
    data["toDate"] = toDate;
    data["fromDate"] = fromDate;
    let insData = await result.insertMany(data);
    console.log(insData);
    if (insData.length > 0) {
        return insData[0];
    } else {
        return false
    }
}

OverviewReport.getData = async (userId, startDate, endDate) => {
    const result = await db.connectDb("OverviewReport", OverviewSchema);
    console.log(">>>>>>>", userId, startDate, endDate);

    const query = { userId };

    // Helper to parse "YYYY-MM-DD" into Date object
    const parseDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // Month is 0-indexed
    };

    // Apply createdAt date filter only if startDate or endDate exists
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
            query.createdAt.$gte = parseDate(startDate);
        }
        if (endDate) {
            const end = parseDate(endDate);
            end.setHours(23, 59, 59, 999); // Include the full end date
            query.createdAt.$lte = end;
        }
    }

    const data = await result.find(query);
    console.log(">>>>>>>>", data);

    return data.length > 0 ? data : false;
};


OverviewReport.delete = async (userId) => {
    try {
        const result = await db.connectDb("OverviewReport", OverviewSchema);
        console.log(">>>>>>>", userId);

        let query = { userId: userId };
        let storeData = await result.deleteMany(query);

        if (storeData.deletedCount <= 0) {
            return false; // Nothing was deleted
        }

        return storeData; // Return the result object (e.g., number of deleted documents)
    } catch (error) {
        console.error("Error deleting store:", error);
        return false; // Return false in case of an error
    }
};

OverviewReport.update = async (overviewId, updateData) => {
    try {
        const model = await db.connectDb("OverviewReport", OverviewSchema);

        // Ensure updateData is an object
        if (typeof updateData !== 'object' || Array.isArray(updateData)) {
            throw new Error("Update data must be a valid object");
        }

        const updatedOverview = await model.findOneAndUpdate(
            { _id: overviewId, }, // Match by Market ID and user ID
            { $set: updateData },
            { new: true } // Return the updated document
        );

        if (!updatedOverview) {
            return false; // No document found or updated
        }

        return updatedOverview;
    } catch (error) {
        console.error("Overview.update error:", error);
        return false;
    }
};



module.exports = {
    MarketReport,
    TrackReport,
    StoreReport,
    OverviewReport
} 