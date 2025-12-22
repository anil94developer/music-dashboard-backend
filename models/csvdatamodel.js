
const db = require("../utils/dbConn");
const mongoose = require("mongoose");


Track = {}
const TrackSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  Track: {
    type: String, // PAN is usually mandatory  // Ensure PAN is unique in the database
    trim: true,     // Remove extra whitespace
  },
  Quantity: {
    type: Number, // Account holder name should not be empty
    trim: true,
  },
  Excel: {
    type: String, // Account holder name should not be empty
    trim: true,
    default: ""
  }
}, { timestamps: true }); // Adds createdAt and updatedAt fields


Track.create = async (userId, data) => {
  const result = await db.connectDb("Track", TrackSchema);
  data["userId"] = userId;
  let insData = await result.insertMany(data);
  console.log(insData);
  if (insData.length > 0) {
    return insData[0];
  } else {
    return false
  }
}

Track.get = async (userId, startDate, endDate) => {
  const result = await db.connectDb("Track", TrackSchema);
  let query = { userId: userId };

  // Function to parse date in YYYY-MM-DD format
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // Month is zero-indexed in Date constructor
  };

  if (startDate) {
    query.createdAt = { ...query.createdAt, $gte: parseDate(startDate) };
  }
  if (endDate) {
    query.createdAt = { ...query.createdAt, $lte: parseDate(endDate) };
  }

  let trackData = await result.find(query);
  console.log(">>>>>>>>", trackData);

  if (trackData.length <= 0) {
    return false;
  }

  return trackData;
};


Track.delete = async (userId) => {
  try {
    const result = await db.connectDb("Track", TrackSchema);
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

Track.update = async (trackId, updateData) => {
  try {
    const model = await db.connectDb("Track", TrackSchema);

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


const Store = {}

const StoreSchema = new mongoose.Schema({
  userId: {
    type: String,
    // Ensure every bank record is linked to a user
  },
  Store: {
    type: String, // PAN is usually mandator   // Ensure PAN is unique in the database
    trim: true,     // Remove extra whitespace
  },
  Quantity: {
    type: Number, // Account holder name should not be empty
    trim: true,
  },
  Excel: {
    type: String, // Account holder name should not be empty
    trim: true,
    default: ""
  }
}, { timestamps: true }); // Adds createdAt and updatedAt fields


Store.create = async (userId, data) => {
  const result = await db.connectDb("Store", StoreSchema);
  data["userId"] = userId;
  let insData = await result.insertMany(data);
  console.log(insData);
  if (insData.length > 0) {
    return insData[0];
  } else {
    return false
  }
}

Store.get = async (userId, startDate, endDate) => {
  const result = await db.connectDb("Store", StoreSchema);
  console.log(">>>>>>>", userId);

  let query = { userId: userId };

  // Function to parse date in YYYY-MM-DD format
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // Month is zero-indexed in Date constructor
  };

  // Initialize date filters
  let dateFilter = {};
  if (startDate) {
    dateFilter.$gte = parseDate(startDate);
  }
  if (endDate) {
    dateFilter.$lte = parseDate(endDate);
  }

  // Add date filters to query if applicable
  if (Object.keys(dateFilter).length > 0) {
    query.createdAt = dateFilter;
  }

  let storeData = await result.find(query);
  console.log(">>>>>>>>", storeData);

  if (storeData.length <= 0) {
    return false;
  }

  return storeData;
};


Store.delete = async (userId) => {
  try {
    const result = await db.connectDb("Store", StoreSchema);
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

Store.update = async (storeId, updateData) => {
  try {
    const model = await db.connectDb("Store", StoreSchema);

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




const dateSchema = new mongoose.Schema({
  userId: {
    type: String,  // Ensure every bank record is linked to a user
  },
  date: {
    type: Date,// PAN is usually mandatory
    unique: true,   // Ensure PAN is unique in the database
    trim: true,     // Remove extra whitespace
  },
  Quantity: {
    type: Number,
    // Account holder name should not be empty
    trim: true,
  }
}, { timestamps: true }); // Adds createdAt and updatedAt fields






const MarketSchema = new mongoose.Schema({
  userId: {
    type: String,
    // Ensure every bank record is linked to a user
  },
  Market: {
    type: String, // PAN is usually mandatory  // Ensure PAN is unique in the database
    trim: true,     // Remove extra whitespace
  },
  Quantity: {
    type: Number, // Account holder name should not be empty
    trim: true,
  },
  Excel: {
    type: String, // Account holder name should not be empty
    trim: true,
    default: ""
  }
}, { timestamps: true }); // Adds createdAt and updatedAt fields

Market = {}

Market.create = async (userId, data) => {
  const result = await db.connectDb("Market", MarketSchema);
  data["userId"] = userId;
  let insData = await result.insertMany(data);
  console.log(insData);
  if (insData.length > 0) {
    return insData[0];
  } else {
    return false
  }
}

Market.getData = async (userId, startDate, endDate) => {
  const result = await db.connectDb("Market", MarketSchema);
  console.log(">>>>>>>", userId);

  let query = { userId: userId };

  // Function to parse date in YYYY-MM-DD format
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // Month is zero-indexed in Date constructor
  };

  // Initialize date filters
  let dateFilter = {};
  if (startDate) {
    dateFilter.$gte = parseDate(startDate);
  }
  if (endDate) {
    dateFilter.$lte = parseDate(endDate);
  }

  // Add date filters to query if applicable
  if (Object.keys(dateFilter).length > 0) {
    query.createdAt = dateFilter;
  }

  let Data = await result.find(query);
  console.log(">>>>>>>>", Data);

  if (Data.length <= 0) {
    return false;
  }

  return Data;
};

Market.delete = async (userId) => {
  try {
    const result = await db.connectDb("Market", MarketSchema);
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

Market.update = async (marketId, updateData) => {
  try {
    const model = await db.connectDb("Market", MarketSchema);

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


const salesYoutube = {}

const salesSchemaYoutube = new mongoose.Schema({
  userId: {
    type: String,
    // Ensure every bank record is linked to a user
  },
  SaleStartdate: {
    type: Date,

  },
  SaleEnddate: {
    type: Date,

  },
  YouTubeVideoID: {
    type: String,

  },
  YouTubeVideoTitle: {
    type: String,

  },
  YouTubeAssetID: {
    type: String,

  },
  YouTubeAssetTitle: {
    type: String,

  },
  YouTubeAssetISRC: {
    type: String,

  },
  YouTubeAssetArtists: {
    type: String,

  },
  YouTubeChannelID: {
    type: String,

  },
  YouTubeChannelDisplayName: {
    type: String,

  },
  FUGAAssetID: {
    type: String,

  },
  Quantity: {
    type: Number,

  },
  Territory: {
    type: String,

  },
  EarningsType: {
    type: String,

  },
  Service: {
    type: String,

  },
  ConvertedGrossIncome: {
    type: mongoose.Decimal128,  // Use Decimal128 for more precision with decimals

  },
  Contractdealterm: {
    type: String,

  },
  ReportedRoyalty: {
    type: mongoose.Decimal128,  // Use Decimal128 for royalty amounts

  },
  Currency: {
    type: String,

  },
  YouTubeAssetType: {
    type: String,

  },
  YouTubeClaimType: {
    type: String,

  },
  Excel: {
    type: String, // Account holder name should not be empty
    trim: true,
    default: ""
  }
}, {
  timestamps: true,  // Optional: to automatically add createdAt and updatedAt fields
});


const salesModel = mongoose.model("SalesYoutube", salesSchemaYoutube)

salesYoutube.create = async (userId, data) => {
  const result = db.connectDb("SalesYoutube", salesSchemaYoutube);
  data["userId"] = userId;

  console.log(">>>>>>>>>>>>>>>>>>>>", data);

  let data1 = new salesModel(data);
  let insData = await data1.save();
  console.log(data1);
  if (insData) {
    return insData;
  } else {
    return false
  }
}

salesYoutube.getData = async (userId, startDate, endDate) => {
  const result = await db.connectDb("SalesYoutube", salesSchemaYoutube);
  console.log(">>>>>>>", userId);

  let query = { userId: userId };

  // Function to parse date in YYYY-MM-DD format
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // Month is zero-indexed in Date constructor
  };

  // Initialize date filters
  let dateFilter = {};
  if (startDate) {
    dateFilter.$gte = parseDate(startDate);
  }
  if (endDate) {
    dateFilter.$lte = parseDate(endDate);
  }

  // Add date filters to query if applicable
  if (Object.keys(dateFilter).length > 0) {
    query.createdAt = dateFilter;
  }

  let Data = await result.find(query);
  console.log(">>>>>>>>", Data);

  if (Data.length <= 0) {
    return false;
  }

  return Data;
};


salesYoutube.delete = async (userId) => {
  try {
    const result = await db.connectDb("SalesYoutube", salesModel);
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

salesYoutube.update = async (salesYoutubeId, updateData) => {
  try {
    const model = await db.connectDb("salesYoutube", salesModel);

    // Ensure updateData is an object
    if (typeof updateData !== 'object' || Array.isArray(updateData)) {
      throw new Error("Update data must be a valid object");
    }

    const updatedSalesYoutube = await model.findOneAndUpdate(
      { _id: salesYoutubeId, }, // Match by salesYoutube ID and user ID
      { $set: updateData },
      { new: true } // Return the updated document
    );

    if (!updatedSalesYoutube) {
      return false; // No document found or updated
    }

    return updatedSalesYoutube;
  } catch (error) {
    console.error("salesYoutube.update error:", error);
    return false;
  }
};



const salesAssets = {};
const salesSchemaAssets = new mongoose.Schema({
  userId: {
    type: String, // Ensure every bank record is linked to a user
  },
  SaleStartdate: {
    type: Date,
  },
  SaleEnddate: {
    type: Date,
  },
  DSP: {
    type: String,
  },
  SaleStoreName: {
    type: String,
  },
  SaleType: {
    type: String,
  },
  SaleUserType: {
    type: String,
  },
  Territory: {
    type: String,
  },
  ProductUPC: {
    type: String,
  },
  ProductReference: {
    type: String,
  },
  ProductCatalogNumber: {
    type: String,
  },
  ProductLabel: {
    type: String,
  },
  ProductArtist: {
    type: String,
  },
  ProductTitle: {
    type: String,
  },
  AssetArtist: {
    type: String,
  },
  AssetTitle: {
    type: String,
  },
  AssetVersion: {
    type: String,
    default: '',
  },
  AssetDuration: {
    type: String,
  },
  AssetISRC: {
    type: String,
  },
  AssetReference: {
    type: String,
  },
  AssetProduct: {
    type: String,
  },
  ProductQuantity: {
    type: String,
    default: '',  // Assuming empty strings are allowed
  },
  AssetQuantity: {
    type: String,
  },
  OriginalGrossIncome: {
    type: mongoose.Decimal128,  // For precision with financial values
  },
  Originalcurrency: {
    type: String,
  },
  ExchangeRate: {
    type: String,  // This could be a float or string based on how it's used
  },
  ConvertedGrossIncome: {
    type: mongoose.Decimal128,  // For precision with financial values
  },
  Contractdealterm: {
    type: String,
  },
  ReportedRoyalty: {
    type: mongoose.Decimal128,  // For precision with financial values
  },
  Currency: {
    type: String,
  },
  ReportRunID: {
    type: String,
  },
  ReportID: {
    type: String,
  },
  SaleID: {
    type: String,
  },
  AudioFormat: {
    type: String,
    default: '',  // Assuming empty string is allowed for this field
  },
  Excel: {
    type: String, // Account holder name should not be empty
    trim: true,
    default: ""
  }
}, {
  timestamps: true,  // Optional: to automatically add createdAt and updatedAt fields
});

const AssetModel = mongoose.model('SalesAssets', salesSchemaAssets)

salesAssets.create = async (userId, data) => {
  const result = db.connectDb("SalesAssets", salesSchemaAssets);
  data["userId"] = userId;
  const data1 = new AssetModel(data);
  const insData = await data1.save();
  console.log(insData);
  if (insData.length > 0) {
    return insData[0];
  } else {
    return false
  }
}
salesAssets.getData = async (userId, startDate, endDate) => {
  const result = db.connectDb("SalesAssets", salesSchemaAssets);
  console.log(">>>>>>>", userId);

  let query = { userId: userId };

  // Function to parse date in YYYY-MM-DD format
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // Month is zero-indexed in Date constructor
  };

  // Initialize date filters
  let dateFilter = {};
  if (startDate) {
    dateFilter.$gte = parseDate(startDate);
  }
  if (endDate) {
    dateFilter.$lte = parseDate(endDate);
  }

  // Add date filters to query if applicable
  if (Object.keys(dateFilter).length > 0) {
    query.createdAt = dateFilter; // Ensure 'createdAt' is the correct date field in your schema
  }

  let Data = await AssetModel.find(query);
  console.log(">>>>>>>>", Data);

  if (Data.length <= 0) {
    return false;
  }

  return Data;
};


salesAssets.delete = async (userId) => {
  try {
    const result = await db.connectDb("SalesAssets", salesSchemaAssets);
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

salesAssets.update = async (salesAssetsId, updateData) => {
  try {
    const model = await db.connectDb("SalesAssets", salesSchemaAssets);

    // Ensure updateData is an object
    if (typeof updateData !== 'object' || Array.isArray(updateData)) {
      throw new Error("Update data must be a valid object");
    }

    const updatedSalesAssets = await model.findOneAndUpdate(
      { _id: salesAssetsId, }, // Match by Market ID and user ID
      { $set: updateData },
      { new: true } // Return the updated document
    );

    if (!updatedSalesAssets) {
      return false; // No document found or updated
    }

    return updatedSalesAssets;
  } catch (error) {
    console.error("Market.update error:", error);
    return false;
  }
};




const stream = {};

const dataStream = new mongoose.Schema({
  userId: {
    type: String
  },
  dsp: {
    type: String,  // Distribution Service Provider (e.g., Spotify, Apple Music)
  },
  amountDue: {
    type: Number,  // Amount due for royalties or sales
  },
  downloads: {
    type: Number,  // Number of downloads
  },
  streams: {
    type: Number,  // Number of streams
  },
  Excel: {
    type: String, // Account holder name should not be empty
    trim: true,
    default: ""
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt timestamps
});

const dataModel = mongoose.model("stream", dataStream)

stream.create = async (userId, data) => {
  const result = db.connectDb("stream", dataStream);
  data["userId"] = userId;
  console.log(">>>>>>", data);
  const data1 = new dataModel(data);
  await data1.save();

  console.log(data1);
  if (data1.length > 0) {
    return data1[0];
  } else {
    return false
  }
}

stream.getData = async (userId, startDate, endDate) => {
  const result = await db.connectDb("stream", dataStream);
  console.log(">>>>>>>", userId);

  let query = { userId: userId };

  // Function to parse date in YYYY-MM-DD format
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // Month is zero-indexed in Date constructor
  };

  // Initialize date filters
  let dateFilter = {};
  if (startDate) {
    dateFilter.$gte = parseDate(startDate);
  }
  if (endDate) {
    dateFilter.$lte = parseDate(endDate);
  }

  // Add date filters to query if applicable
  if (Object.keys(dateFilter).length > 0) {
    query.createdAt = dateFilter; // Ensure 'createdAt' is the correct date field in your schema
  }

  let Data = await dataModel.find(query);
  console.log(">>>>>>>>", Data);

  if (Data.length <= 0) {
    return false;
  }

  return Data;
};


stream.delete = async (userId) => {
  try {
    const result = await db.connectDb("stream", dataStream);
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

stream.update = async (streamId, updateData) => {
  try {
    const model = await db.connectDb("stream", dataStream);

    // Ensure updateData is an object
    if (typeof updateData !== 'object' || Array.isArray(updateData)) {
      throw new Error("Update data must be a valid object");
    }

    const updatedStream = await model.findOneAndUpdate(
      { _id: streamId, }, // Match by Market ID and user ID
      { $set: updateData },
      { new: true } // Return the updated document
    );

    if (!updatedStream) {
      return false; // No document found or updated
    }

    return updatedStream;
  } catch (error) {
    console.error("Market.update error:", error);
    return false;
  }
};



insides = {}

const insidiesSchema = new mongoose.Schema({
  userId: {
    type: String
  },
  Title: {
    type: String,
  },
  Artist: {
    type: String,
  },
  ISRC: {
    type: String,
  },
  Label: {
    type: String
  },
  Streams: {
    type: Number,
  },
  Streamschange: {
    type: Number,
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

const insidesModel = mongoose.model('insides', insidiesSchema);

insides.create = async (userId, data) => {
  const result = db.connectDb("insides", insidiesSchema);
  data["userId"] = userId;
  const data1 = new insidesModel(data);
  await data1.save();

  console.log(data1);
  if (data1.length > 0) {
    return data1[0];
  } else {
    return false
  }
}

insides.getData = async (userId, startDate, endDate, filters) => {
  const result = await db.connectDb("insides", insidiesSchema);
  console.log(">>>>>>>", userId);
  let query = { userId: userId };

  // Function to parse date in YYYY-MM-DD format
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day); // Month is zero-indexed in Date constructor
  };

  // Initialize date filters
  let dateFilter = {};
  if (startDate) {
    dateFilter.$gte = parseDate(startDate);
  }
  if (endDate) {
    dateFilter.$lte = parseDate(endDate);
  }

  // Add date filters to query if applicable
  if (Object.keys(dateFilter).length > 0) {
    query.createdAt = dateFilter; // Ensure 'createdAt' is the correct date field in your schema
  }

  // Apply additional filters
  if (filters) {
    if (filters.Label) query.Label = filters.Label;
    if (filters.ISRC) query.ISRC = filters.ISRC;
    if (filters.Stream) query.Stream = filters.Stream;
    if (filters.Artist) query.Artist = filters.Artist;
  }

  let Data = await insidesModel.find(query);
  console.log(">>>>>>>>", Data);
  if (Data.length <= 0) {
    return false;
  }
  return Data;
};

insides.delete = async (userId) => {
  try {
    const result = await db.connectDb("insides", insidiesSchema);
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

module.exports = {
  Track,
  Store,
  Market,
  salesYoutube,
  salesAssets,
  stream,
  insides,
} 