require("dotenv").config();
const mongoose = require("mongoose")
mongoose.Promise = global.Promise;
let collection = {};

collection.connectDb = async (collectionName, schema) => {
    try {
        mongoose.set("strict", false);
        mongoose.set("strictQuery", false);
        
        // Check if already connected
        if (mongoose.connection.readyState === 1) {
            console.log(`✅ Using existing MongoDB connection for collection: ${collectionName}`);
            return mongoose.model(collectionName, schema);
        }
        
        // If not connected, this should not happen as connection is initialized in index.js
        console.warn(`⚠️  MongoDB not connected. Attempting connection for collection: ${collectionName}`);
        
        const connection = await mongoose.connect(
            process.env.LOCALDB,
            {
                useNewUrlParser: true, 
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 30000,
                socketTimeoutMS: 45000,
                heartbeatFrequencyMS: 10000,
                retryWrites: true,
                retryReads: true
            }
        );
        
        console.log(`✅ MongoDB connection established for collection: ${collectionName}`);
        return connection.model(collectionName, schema);
    } catch (err) {
        console.error(`❌ Database connection error for ${collectionName}:`, err.message);
        let error = new Error("Could not connect to database")
        error.status = 500
        throw error
    }
}

module.exports = collection;