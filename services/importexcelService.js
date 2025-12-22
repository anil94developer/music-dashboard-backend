const R = require("../utils/responseHelper");
const { Track, Store, Market, salesYoutube, salesAssets, stream } = require("../models/csvdatamodel");
const { string } = require("joi");
const upload = {}

upload.track = async (req, res, next) => {
  try {
    const { userId, data } = req.body;

  if(!data){
    return R(res,false,"Data not found","",400);
  }

  // console.log(data);
 
  let result = data.map(async (val,ind,arr)=>{
    val = await Track.create(userId,arr[ind]);
     if(!val){
      return R(res,false,"Excel file not found","",400);
     }
     return val;
  })

  // console.log(result);

  // Process your data here and save it to the database or any other storage medium.
  return R(res,true,"Track upload successful","",200); 
}
catch(e){
  next();
}
}

upload.getTrack = async (req, res, next) => {
  try {
    const userId = req.doc.userId;
    const { startDate, endDate } = req.query; // Assuming the dates are passed as query parameters

    const track = await Track.get(userId, startDate, endDate);

    if (track === false) {
      return R(res, false, "Track not found", [], 400);
    }

    return R(res, true, "Track fetched successfully", track, 200);
  } catch (err) {
    next(err);
  }
};

upload.store = async (req,res,next)=>{
  try{
    const {userId,data} =req.body;
  
    if(!data){
      return R(res,false,"Data not found",[],400);
    }
  
    // console.log(data);
   
    let result = data.map(async (val,ind,arr)=>{
      val = await Store.create(userId,arr[ind]);
       if(!val){
        return R(res,false,"Excel file not found",[],400);
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

upload.getStore = async (req, res, next) => {
  try {
    const userId = req.doc.userId;
    const { startDate, endDate } = req.query; // Assume dates are passed as query parameters

    if (!userId) {
      return R(res, false, "User ID not found", [], 400);
    }

    const store = await Store.get(userId, startDate, endDate);
    if (store === false) {
      return R(res, false, "Store not found", [], 400);
    }

    return R(res, true, "Store fetched successfully", store, 200);
  } catch (err) {
    console.log(err);
    next(err);
  }
};


upload.store = async (req, res, next) => {
  try {
    const { userId, data } = req.body;

    if (!data) {
      return R(res, false, "Data not found", [], 400);
    }

    console.log(data);

    let result = data.map(async (val, ind, arr) => {
      val = await Store.create(userId, arr[ind]);
      if (!val) {
        return R(res, false, "Excel file not found", [], 400);
      }
      return val;
    })

    console.log(data);

    // Process your data here and save it to the database or any other storage medium.
    return R(res, true, "Store upload successful", [], 200);
  }
  catch (e) {
    next();
  }
}


upload.getStore = async (req, res, next) => {
  try {
    const userId = req.doc.userId;
    const { startDate, endDate } = req.query; // Assume dates are passed as query parameters

    if (!userId) {
      return R(res, false, "User ID not found", [], 400);
    }

    const store = await Store.get(userId, startDate, endDate);
    if (store === false) {
      return R(res, false, "Store not found", [], 400);
    }

    return R(res, true, "Store fetched successfully", store, 200);
  } catch (err) {
    console.log(err);
    next(err);
  }
};


upload.marketData = async (req, res, next) => {
  try {
    const { userId, data } = req.body;

    if (!userId) {
      return R(res, false, "User ID not found", [], 400);
    }

    if (!data) {
      return R(res, false, "Data not found", [], 400);
    }
  
    // console.log(data);
   
   let result = data.map(async (val,ind,arr)=>{
      val = await Market.create(userId,arr[ind]);
       if(!val){
        return R(res,false,"data not insert",[],400);
       }
       return val;
    })
  
    // console.log(result);
  
    // Process your data here and save it to the database or any other storage medium.
    return R(res, true, "Market Data upload successful", "", 200);
  }
  catch(e){
    // console
    next();
  }
}

upload.getMarketData = async (req, res, next) => {
  try {
    const userId = req.doc.userId;
    const { startDate, endDate } = req.query; // Assume dates are passed as query parameters

    if (!userId) {
      return R(res, false, "User ID not found", "", 400);
    }

    const data = await Market.getData(userId, startDate, endDate);
    if (data === false) {
      return R(res, false, "Market Data not found", [], 400);
    }

    return R(res, true, "Market fetched successfully", data, 200);
  } catch (err) {
    console.log(">>>>>>>>>>>>>>>>>>>>>", err);
    next(err);
  }
};


upload.salesYoutube = async (req, res, next) => {
  try {
    const { userId, data } = req.body;

    if (!userId) {
      return R(res, false, "User ID not found", "", 400);
    }

    if (!data) {
      return R(res, false, "Data not found", [], 400);
    }
  
    // console.log(data);
   
    let result = await Promise.all(
      data.map(async (val, ind, arr) => {
        const valInserted = await salesYoutube.create(userId, arr[ind]);
        return valInserted;
      })
    );
  
    // console.log(">>>>>>>>>>>>>>>>>>>>",result);
  
    // Process your data here and save it to the database or any other storage medium.
    return R(res, true, " Data upload successful", [], 200);
  }
  catch(e){
    // console.log(e)
    next();
  }
}

upload.getSalesYoutube = async (req, res, next) => {
  try {
    const userId = req.doc.userId;
    const { startDate, endDate } = req.query; // Assume dates are passed as query parameters

    if (!userId) {
      return R(res, false, "User ID not found", "", 400);
    }

    const data = await salesYoutube.getData(userId, startDate, endDate);
    if (data === false) {
      return R(res, false, "Data not found", [], 400);
    }

    return R(res, true, "Data fetched successfully", data, 200);
  } catch (err) {
    console.log(err);
    next(err);
  }
};



upload.salesAsset = async (req, res, next) => {
  try {
    const { userId, data } = req.body;
    if (!userId) {
      return R(res, false, "User ID not found", [], 400);
    }
    if (!data) {
      return R(res, false, "Data not found", [], 400);
    }
    // console.log(data);
    let result = await Promise.all(data.map(async (val,ind,arr)=>{
      val = await salesAssets.create(userId,arr[ind]);
       return val;
    }))
  
    // console.log(result);
  
    // Process your data here and save it to the database or any other storage medium.
    return R(res,true,"Data upload successful",[],200); 
}catch(err){
  // console.log(err)
  next();
}
}

upload.getSalesAssets = async (req, res, next) => {
  try {
    const userId = req.doc.userId;
    const { startDate, endDate } = req.query; // Assume dates are passed as query parameters

    if (!userId) {
      return R(res, false, "User ID not found", [], 400);
    }

    const data = await salesAssets.getData(userId, startDate, endDate);
    if (data === false) {
      return R(res, false, "Data not found", [], 400);
    }

    return R(res, true, "Data fetched successfully", data, 200);
  } catch (err) {
    console.log(err);
    next(err);
  }
};


upload.salesStream = async (req, res, next) => {
  try {
    const { userId, data } = req.body;

    if (!userId) {
      return R(res, false, "User ID not found", [], 400);
    }
    if (!data) {
      return R(res, false, "Data not found", [], 400);
    }
    // console.log(data);
    let result = await Promise.all (data.map(async (val,ind,arr)=>{
      val = await stream.create(String(userId),arr[ind]);
       return val;
    }))
  
    // console.log(result);
  
    // Process your data here and save it to the database or any other storage medium.
    return R(res,true,"Data upload successful","",200);
  }catch(err){
    // console.log(err)
    next();
  }
}

upload.getStream = async (req, res, next) => {
  try {
    const userId = req.doc.userId;
    const { startDate, endDate } = req.query; // Assume dates are passed as query parameters

    if (!userId) {
      return R(res, false, "User ID not found", [], 400);
    }

    const data = await stream.getData(userId, startDate, endDate);
    if (data === false) {
      return R(res, false, "Data not found", [], 400);
    }

    return R(res, true, "Data fetched successfully", data, 200);
  } catch (err) {
    console.log(err);
    next(err);
  }
};


upload.sendReport = async (req, res, next) => {
  try {
    const { userId, data } = req.body;

    if (!userId) {
      return R(res, false, "User ID not found", [], 400);
    }
    if (!data) {
      return R(res, false, "Data not found", [], 400);
    }

    let result = await Promise.all(data.map(async (val, ind, arr) => {
      val = await stream.create(String(userId), arr[ind]);
      return val;
    }))
  
    // console.log(result);
  
    // Process your data here and save it to the database or any other storage medium.
    return R(res,true,"Data upload successful","",200);
  }catch(err){
    // console.log(err)
    next();
  }
}


upload.insiderStream = async (req, res, next) => {
  try {
    const { userId, data } = req.body;
    if (!userId) {
      return R(res, false, "User ID not found", [], 400);
    }
    if (!data) {
      return R(res, false, "Data not found", [], 400);
    }
    // console.log(data);
    let result = await Promise.all(data.map(async (val,ind,arr)=>{
      val = await insides.create(String(userId),arr[ind]);
       return val;
    }))
    // console.log(result);
    // Process your data here and save it to the database or any other storage medium.
    return R(res,true,"Data upload successful",[],200);
  }catch(err){
    // console.log(err)
    next();
  }
}

upload.insiderReport = async (req, res, next) => {
  try {
    const userId = req.doc.userId;
    const { startDate, endDate, Label, ISRC, Stream, Artist } = req.query; // Extract filters from query parameters

    if (!userId) {
      return R(res, false, "User ID not found", "", 400);
    }

    // Construct filters object
    const filters = { Label, ISRC, Stream, Artist };

    // Call getData with additional filters
    const data = await insides.getData(userId, startDate, endDate, filters);

    if (data === false) {
      return R(res, false, "Data not found", "", 400);
    }

    return R(res, true, "Data fetched successfully", data, 200);
  } catch (err) {
    console.log(err);
    next(err);
  }
};





upload.getAllReport = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const startDate = "";
    const endDate = "";
    const Label = "";
    const ISRC = "";
    const Stream = "";
    const Artist = "";
    const filters = { Label, ISRC, Stream, Artist };

     

    const trackData = await Track.get(userId, startDate, endDate); 
    // Call getData with additional filters
    const insidesData = await insides.getData(userId, startDate, endDate, filters);
    const storeData = await Store.get(userId, startDate, endDate);
    const marketData = await Market.getData(userId, startDate, endDate);
    const salesYoutubeData = await salesYoutube.getData(userId, startDate, endDate);
    const salesAssetsData = await salesAssets.getData(userId, startDate, endDate);
    const streamData = await stream.getData(userId, startDate, endDate);


    let data={
      trackData:trackData,
      insidesData:insidesData,
      storeData:storeData,
      marketData:marketData,
      salesYoutubeData:salesYoutubeData,
      salesAssetsData:salesAssetsData,
      streamData:streamData
    } 

    return R(res, true, "Data fetched successfully", data, 200);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

upload.deleteReport = async  (req, res, next) => {
  try {
    const userId = req.body.userId;
    const type = req.body.type;
    console.log(req.body)
     
    if(type == "store"){
      const result = await Store.delete(userId); 
      return R(res, true, "Delete successfully", result, 200);
    }
    if(type == "stream"){
      const result = await stream.delete(userId); 
      return R(res, true, "Delete successfully", result, 200);
    }
    if(type == "track"){
      const result = await Track.delete(userId); 
      return R(res, true, "Delete successfully", result, 200);
    }
     if(type == "salesAssets"){
      const result = await salesAssets.delete(userId); 
      return R(res, true, "Delete successfully", result, 200);
    }
    if(type == "salesYoutube"){
      const result = await salesYoutube.delete(userId); 
      return R(res, true, "Delete successfully", result, 200);
    } 
    if(type == "market"){
      const result = await Market.delete(userId); 
      return R(res, true, "Delete successfully", result, 200);
    }
    if(type == "inside"){
      const result = await insides.delete(userId); 
      return R(res, true, "Delete successfully", result, 200);
    }
    
  } catch (err) {
    console.log(err);
    next(err);
  }
};






module.exports = upload;