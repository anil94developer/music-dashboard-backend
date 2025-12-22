const db = require("../utils/dbConn");
const mongoose = require("mongoose");
let { ObjectId } = require("mongodb");

masterArtistModel = {};

const masterArtistSchema = mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        linkId: { type: String, default: "" },
        itunesLinkId: { type: String, default: "" },
        description: { type: String, default: "" },
        is_active: { type: Number, default: 1 },
        is_deleted: { type: Number, default: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null }
    },
    { timestamps: true }
);

// Add master artist
masterArtistModel.addMasterArtist = async (data) => {
    try {
        const result = await db.connectDb("masterartists", masterArtistSchema);
        console.log("[addMasterArtist] Data received:", data);
        const newArtist = await result.create(data);
        console.log("[addMasterArtist] Created artist:", newArtist);
        return newArtist;
    } catch (err) {
        console.error("Error adding master artist:", err.message);
        console.error("Error stack:", err.stack);
        console.error("Error details:", err);
        return false;
    }
};

// Get master artist list with pagination and search
masterArtistModel.getMasterArtistList = async (page = 1, limit = 10, search = "") => {
    try {
        const result = await db.connectDb("masterartists", masterArtistSchema);
        let query = { is_deleted: 0 };
        
        // Add search functionality
        if (search && search.trim() !== "") {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (page - 1) * limit;
        const artists = await result.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await result.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        
        return {
            data: artists,
            total: total,
            totalPages: totalPages,
            currentPage: page,
            limit: limit
        };
    } catch (err) {
        console.error("Error getting master artist list:", err.message);
        return false;
    }
};

// Get master artist by ID
masterArtistModel.getMasterArtistById = async (id) => {
    try {
        const result = await db.connectDb("masterartists", masterArtistSchema);
        const artist = await result.findOne({ _id: new ObjectId(id), is_deleted: 0 });
        return artist;
    } catch (err) {
        console.error("Error getting master artist by ID:", err.message);
        return false;
    }
};

// Update master artist
masterArtistModel.updateMasterArtist = async (id, data) => {
    try {
        const result = await db.connectDb("masterartists", masterArtistSchema);
        const updateData = await result.updateOne(
            { _id: new ObjectId(id) },
            { $set: data },
            { runValidators: true }
        );
        return updateData;
    } catch (err) {
        console.error("Error updating master artist:", err.message);
        return false;
    }
};

// Delete master artist (soft delete)
masterArtistModel.deleteMasterArtist = async (id) => {
    try {
        const result = await db.connectDb("masterartists", masterArtistSchema);
        const updateData = await result.updateOne(
            { _id: new ObjectId(id) },
            { $set: { is_deleted: 1 } },
            { runValidators: true }
        );
        return updateData;
    } catch (err) {
        console.error("Error deleting master artist:", err.message);
        return false;
    }
};

// Change active status
masterArtistModel.changeStatus = async (id, status) => {
    try {
        const result = await db.connectDb("masterartists", masterArtistSchema);
        const updateData = await result.updateOne(
            { _id: new ObjectId(id) },
            { $set: { is_active: status } },
            { runValidators: true }
        );
        return updateData;
    } catch (err) {
        console.error("Error changing master artist status:", err.message);
        return false;
    }
};

// Get all active master artists (for dropdowns, etc.)
masterArtistModel.getActiveMasterArtists = async () => {
    try {
        const result = await db.connectDb("masterartists", masterArtistSchema);
        const artists = await result.find({ is_active: 1, is_deleted: 0 })
            .sort({ name: 1 });
        return artists;
    } catch (err) {
        console.error("Error getting active master artists:", err.message);
        return false;
    }
};

module.exports = masterArtistModel;

