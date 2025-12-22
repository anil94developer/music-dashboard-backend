const db = require("../utils/dbConn");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
let { ObjectId } = require("mongodb");

settingModel = {}

settingModel.downloaddb = async () => { 
    try {
        let val = await db.downloaddb();
        return val;
    } catch (error) {
        console.log(error);
    }
}

settingModel.getAllDbData = async () => {
    try {
        // Ensure database connection is established
        if (mongoose.connection.readyState !== 1) {
            // Try to connect if not already connected
            await new Promise((resolve, reject) => {
                // Set a timeout to avoid hanging indefinitely
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout after 10 seconds'));
                }, 10000);
                
                // Listen for connection events
                mongoose.connection.once('connected', () => {
                    clearTimeout(timeout);
                    resolve();
                });
                
                mongoose.connection.once('error', (err) => {
                    clearTimeout(timeout);
                    reject(err);
                });
                
                // If we're not already connecting, try to connect
                if (mongoose.connection.readyState === 0) {
                    // Use the connection string from your environment
                    const connectionString = process.env.LOCALDB;
                    mongoose.connect(connectionString, {
                        useNewUrlParser: true,
                        useUnifiedTopology: true
                    }).catch(err => {
                        reject(err);
                    });
                }
            });
        }
        
        // Now check again if we're connected
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Failed to establish database connection. Current state: ' + mongoose.connection.readyState);
        }
        
        // Get all collections in the database
        const collections = await mongoose.connection.db.collections();
        
        // Create an object to store all data
        const allData = {};
        
        // Iterate through each collection and get all documents
        for (const collection of collections) {
            const collectionName = collection.collectionName;
            const documents = await collection.find({}).toArray();
            allData[collectionName] = documents;
        }
        
        return allData;
    } catch (error) {
        console.log('Error in getAllDbData:', error);
        throw error;
    }
}

settingModel.downloadDbAsJson = async (filePath) => {
    try {
        const fs = require('fs');
        const path = require('path');
        
        // Get all database data
        const allData = await settingModel.getAllDbData();
        
        // If no file path is provided, create one with timestamp
        if (!filePath) {
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            filePath = path.join(process.cwd(), `database_backup_${timestamp}.json`);
        }
        
        // Convert data to JSON and write to file
        await fs.promises.writeFile(filePath, JSON.stringify(allData, null, 2));
        
        return {
            success: true,
            message: 'Database downloaded successfully',
            filePath: filePath
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: 'Failed to download database',
            error: error.message
        };
    }
}

module.exports = settingModel