const db = require("../utils/dbConn");
const mongoose = require("mongoose");
let { ObjectId } = require("mongodb");

artistModel = {}


const artistSchema = mongoose.Schema({
    userId: { type: [String] },
    name: { type: String, required: true },
    linkId: { type: String, required: false },
    itunesLinkId: { type: String, required: false },
},
    { timestamps: true }
);

artistModel.addArtist = async (data) => {
    const result = await db.connectDb("artist", artistSchema);
    let insData = await result.insertMany(data);
    // console.log(insData);
    if (insData.length > 0) {
        return insData[0];
    } else {
        return false
    }
};

artistModel.artistList = async (uId) => {
    const result = await db.connectDb("artist", artistSchema);
    let fetData = await result.find({ userId: uId });
 
    if (fetData.length > 0) {
        return fetData;
    } else {
        return [];
    }
};

artistModel.addUserartist= async (artist,id)=>{
  const result = await db.connectDb("artist", artistSchema);
  artist.map(async(val)=>{
    console.log("val>>>>>>>>>",val);
    const findLabel = await result.findOne({_id:new ObjectId(val)});
    findLabel.userId.push(String(id));
    findLabel.save();
  })
}


module.exports = artistModel