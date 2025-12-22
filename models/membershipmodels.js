const db = require("../utils/dbConn");
const mongoose = require("mongoose");

let { ObjectId } = require("mongodb");

membershipModel = {}

const membershipSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        duration: { type: Number, required: true }, // Duration in months
        durationType: { type: String, enum: ['days', 'months', 'years'], default: 'months' },
        features: { type: Array, default: [] }, // Array of feature strings
        is_active: { type: Number, default: 1 },
        is_deleted: { type: Number, default: 0 },
        discount: { type: Number, default: 0 }, // Discount percentage
        maxUsers: { type: Number, default: 1 }, // Maximum number of users allowed
        priority: { type: Number, default: 0 }, // For sorting/ordering
        noOfLabels: { type: Number, default: 0 }, // Number of labels allowed
        noOfArtists: { type: Number, default: 0 }, // Number of artists allowed
        users: { type: [mongoose.Schema.Types.ObjectId], ref: 'users', default: [] } // Array of user IDs who have this membership
    },
    { timestamps: true }
);

// Add membership
membershipModel.addMembership = async (data) => {
    try {
        const result = await db.connectDb("memberships", membershipSchema);
        // Use create() for single document or insertMany() for array
        let insData = await result.create(data);
        if (insData) {
            return insData;
        } else {
            return false;
        }
    } catch (err) {
        console.error("Error adding membership:", err.message);
        return false;
    }
};

// Get all memberships
membershipModel.getMembershipList = async (page = 1, limit = 10, search = "") => {
    try {
        const result = await db.connectDb("memberships", membershipSchema);
        let query = { is_deleted: 0 };
        
        // Add search functionality
        if (search && search.trim() !== "") {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (page - 1) * limit;
        const memberships = await result.find(query)
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await result.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        
        return {
            data: memberships,
            total: total,
            totalPages: totalPages,
            currentPage: page,
            limit: limit
        };
    } catch (err) {
        console.error("Error getting membership list:", err.message);
        return false;
    }
};

// Get membership by ID
membershipModel.getMembershipById = async (id) => {
    try {
        const result = await db.connectDb("memberships", membershipSchema);
        const membership = await result.findOne({ _id: new ObjectId(id), is_deleted: 0 });
        return membership;
    } catch (err) {
        console.error("Error getting membership by ID:", err.message);
        return false;
    }
};

// Update membership
membershipModel.updateMembership = async (id, data) => {
    try {
        const result = await db.connectDb("memberships", membershipSchema);
        const updateData = await result.updateOne(
            { _id: new ObjectId(id) },
            { $set: data },
            { runValidators: true }
        );
        return updateData;
    } catch (err) {
        console.error("Error updating membership:", err.message);
        return false;
    }
};

// Delete membership (soft delete)
membershipModel.deleteMembership = async (id) => {
    try {
        const result = await db.connectDb("memberships", membershipSchema);
        const updateData = await result.updateOne(
            { _id: new ObjectId(id) },
            { $set: { is_deleted: 1 } },
            { runValidators: true }
        );
        return updateData;
    } catch (err) {
        console.error("Error deleting membership:", err.message);
        return false;
    }
};

// Change active status
membershipModel.changeStatus = async (id, status) => {
    try {
        const result = await db.connectDb("memberships", membershipSchema);
        const updateData = await result.updateOne(
            { _id: new ObjectId(id) },
            { $set: { is_active: status } },
            { runValidators: true }
        );
        return updateData;
    } catch (err) {
        console.error("Error changing membership status:", err.message);
        return false;
    }
};

// Get all active memberships (for public use)
membershipModel.getActiveMemberships = async () => {
    try {
        const result = await db.connectDb("memberships", membershipSchema);
        const memberships = await result.find({ is_active: 1, is_deleted: 0 })
            .sort({ priority: -1, createdAt: -1 });
        return memberships;
    } catch (err) {
        console.error("Error getting active memberships:", err.message);
        return false;
    }
};

// Add user to membership (when company registers with a membership)
membershipModel.addUserToMembership = async (membershipId, userId) => {
    try {
        const result = await db.connectDb("memberships", membershipSchema);
        const membership = await result.findOne({ _id: new ObjectId(membershipId) });
        
        if (!membership) {
            console.error("Membership not found:", membershipId);
            return false;
        }
        
        // Check if user already exists in the array
        const userIdString = userId.toString();
        const existingUsers = membership.users || [];
        const userExists = existingUsers.some(u => u.toString() === userIdString);
        
        if (!userExists) {
            // Add user to membership
            const updateData = await result.updateOne(
                { _id: new ObjectId(membershipId) },
                { $push: { users: new ObjectId(userId) } },
                { runValidators: true }
            );
            
            if (updateData.modifiedCount > 0) {
                console.log(`User ${userId} added to membership ${membershipId}`);
                return true;
            } else {
                console.error("Failed to add user to membership");
                return false;
            }
        } else {
            console.log(`User ${userId} already exists in membership ${membershipId}`);
            return true; // User already exists, consider it success
        }
    } catch (err) {
        console.error("Error adding user to membership:", err.message);
        return false;
    }
};

module.exports = membershipModel;

