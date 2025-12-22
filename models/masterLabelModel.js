const db = require("../utils/dbConn");
const mongoose = require("mongoose");
let { ObjectId } = require("mongodb");

masterLabelModel = {};

const masterLabelSchema = mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        is_active: { type: Number, default: 1 },
        is_deleted: { type: Number, default: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null }
    },
    { timestamps: true }
);

// Add master label
masterLabelModel.addMasterLabel = async (data) => {
    try {
        const result = await db.connectDb("masterlabels", masterLabelSchema);
        console.log("[addMasterLabel] Data received:", data);
        const newLabel = await result.create(data);
        console.log("[addMasterLabel] Created label:", newLabel);
        return newLabel;
    } catch (err) {
        console.error("Error adding master label:", err.message);
        console.error("Error stack:", err.stack);
        console.error("Error details:", err);
        return false;
    }
};

// Get master label list with pagination and search
masterLabelModel.getMasterLabelList = async (page = 1, limit = 10, search = "") => {
    try {
        const result = await db.connectDb("masterlabels", masterLabelSchema);
        let query = { is_deleted: 0 };
        
        // Add search functionality
        if (search && search.trim() !== "") {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (page - 1) * limit;
        const labels = await result.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await result.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        
        return {
            data: labels,
            total: total,
            totalPages: totalPages,
            currentPage: page,
            limit: limit
        };
    } catch (err) {
        console.error("Error getting master label list:", err.message);
        return false;
    }
};

// Get master label by ID
masterLabelModel.getMasterLabelById = async (id) => {
    try {
        const result = await db.connectDb("masterlabels", masterLabelSchema);
        const label = await result.findOne({ _id: new ObjectId(id), is_deleted: 0 });
        return label;
    } catch (err) {
        console.error("Error getting master label by ID:", err.message);
        return false;
    }
};

// Update master label
masterLabelModel.updateMasterLabel = async (id, data) => {
    try {
        const result = await db.connectDb("masterlabels", masterLabelSchema);
        const updateData = await result.updateOne(
            { _id: new ObjectId(id) },
            { $set: data },
            { runValidators: true }
        );
        return updateData;
    } catch (err) {
        console.error("Error updating master label:", err.message);
        return false;
    }
};

// Delete master label (soft delete)
masterLabelModel.deleteMasterLabel = async (id) => {
    try {
        const result = await db.connectDb("masterlabels", masterLabelSchema);
        const updateData = await result.updateOne(
            { _id: new ObjectId(id) },
            { $set: { is_deleted: 1 } },
            { runValidators: true }
        );
        return updateData;
    } catch (err) {
        console.error("Error deleting master label:", err.message);
        return false;
    }
};

// Change active status
masterLabelModel.changeStatus = async (id, status) => {
    try {
        const result = await db.connectDb("masterlabels", masterLabelSchema);
        const updateData = await result.updateOne(
            { _id: new ObjectId(id) },
            { $set: { is_active: status } },
            { runValidators: true }
        );
        return updateData;
    } catch (err) {
        console.error("Error changing master label status:", err.message);
        return false;
    }
};

// Get all active master labels (for dropdowns, etc.)
masterLabelModel.getActiveMasterLabels = async () => {
    try {
        const result = await db.connectDb("masterlabels", masterLabelSchema);
        const labels = await result.find({ is_active: 1, is_deleted: 0 })
            .sort({ name: 1 });
        return labels;
    } catch (err) {
        console.error("Error getting active master labels:", err.message);
        return false;
    }
};

module.exports = masterLabelModel;

