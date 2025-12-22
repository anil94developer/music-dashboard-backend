const R = require("../utils/responseHelper"); 
const artistModel =require('./../models/artistmodels')

const artist = {};

artist.addArtist = async (req, res, next) => {
     
    const body = {
        ...req.body,           // Spread the existing keys from req.body
        userId: req.doc.userId // Add a new key `userId` from req.doc
    };  


    try { 
        const result = await artistModel.addArtist(body) 
        if(result =="Cannot add more labels. Maximum limit reached.")
        {
            return R(res, false, "Cannot add more labels. Maximum limit reached." ,result ,400);
        }else{
            return R(res, true, "Add Successfully!!", result, 200)
        }
        
    } catch (err) { 
        next(err)
    }
};
artist.artistList = async (req, res, next) => {
    
    try { 
        const result = await artistModel.artistList(req.doc.userId) 
        return R(res, true, "Fetch Successfully!!", result, 200)
    } catch (err) { 
        next(err)
    }
};


module.exports = artist;



