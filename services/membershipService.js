const membershipModel = require("../models/membershipmodels");
const R = require("../utils/responseHelper");

membershipService = {}

// Add membership
membershipService.addMembership = async (req, res, next) => {
    try {
        const {
            name,
            description,
            price,
            duration,
            durationType,
            features,
            discount,
            maxUsers,
            priority,
            noOfLabels,
            noOfArtists,
            is_active
        } = req.body;

        if (!name || !price || !duration) {
            return R(res, false, "Name, price, and duration are required", {}, 400);
        }

        const data = {
            name: name.trim(),
            description: description || "",
            price: parseFloat(price),
            duration: parseInt(duration),
            durationType: durationType || "months",
            features: Array.isArray(features) ? features : (features ? [features] : []),
            discount: discount ? parseFloat(discount) : 0,
            maxUsers: maxUsers ? parseInt(maxUsers) : 1,
            priority: priority ? parseInt(priority) : 0,
            noOfLabels: noOfLabels ? parseInt(noOfLabels) : 0,
            noOfArtists: noOfArtists ? parseInt(noOfArtists) : 0,
            is_active: is_active !== undefined ? parseInt(is_active) : 1,
            is_deleted: 0
        };

        console.log("Membership data to be saved:", data);

        const result = await membershipModel.addMembership(data);
        
        console.log("Membership model result:", result);
        
        if (result) {
            return R(res, true, "Membership added successfully", result, 200);
        } else {
            return R(res, false, "Failed to add membership", {}, 500);
        }
    } catch (error) {
        console.error("Error in addMembership service:", error);
        return R(res, false, error.message || "Failed to add membership", {}, 500);
    }
};

// Get membership list
membershipService.getMembershipList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";

        const result = await membershipModel.getMembershipList(page, limit, search);
        
        if (result) {
            return R(res, true, "Memberships fetched successfully", result, 200);
        } else {
            return R(res, false, "Failed to fetch memberships", {}, 500);
        }
    } catch (error) {
        next(error);
    }
};

// Get membership by ID
membershipService.getMembershipById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return R(res, false, "Membership ID is required", {}, 400);
        }

        const result = await membershipModel.getMembershipById(id);
        
        if (result) {
            return R(res, true, "Membership fetched successfully", result, 200);
        } else {
            return R(res, false, "Membership not found", {}, 404);
        }
    } catch (error) {
        next(error);
    }
};

// Update membership
membershipService.updateMembership = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name,
            description,
            price,
            duration,
            durationType,
            features,
            discount,
            maxUsers,
            priority,
            is_active,
            noOfLabels,
            noOfArtists
        } = req.body;

        if (!id) {
            return R(res, false, "Membership ID is required", {}, 400);
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (duration !== undefined) updateData.duration = parseInt(duration);
        if (durationType !== undefined) updateData.durationType = durationType;
        if (features !== undefined) updateData.features = Array.isArray(features) ? features : [];
        if (discount !== undefined) updateData.discount = parseFloat(discount);
        if (maxUsers !== undefined) updateData.maxUsers = parseInt(maxUsers);
        if (priority !== undefined) updateData.priority = parseInt(priority);
        if (noOfLabels !== undefined) updateData.noOfLabels = parseInt(noOfLabels);
        if (noOfArtists !== undefined) updateData.noOfArtists = parseInt(noOfArtists);
        if (is_active !== undefined) updateData.is_active = parseInt(is_active);

        const result = await membershipModel.updateMembership(id, updateData);
        
        if (result && result.modifiedCount > 0) {
            const updatedMembership = await membershipModel.getMembershipById(id);
            return R(res, true, "Membership updated successfully", updatedMembership, 200);
        } else {
            return R(res, false, "Failed to update membership or no changes made", {}, 500);
        }
    } catch (error) {
        next(error);
    }
};

// Delete membership
membershipService.deleteMembership = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return R(res, false, "Membership ID is required", {}, 400);
        }

        const result = await membershipModel.deleteMembership(id);
        
        if (result && result.modifiedCount > 0) {
            return R(res, true, "Membership deleted successfully", {}, 200);
        } else {
            return R(res, false, "Failed to delete membership", {}, 500);
        }
    } catch (error) {
        next(error);
    }
};

// Change status
membershipService.changeStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id) {
            return R(res, false, "Membership ID is required", {}, 400);
        }

        if (status === undefined || (status !== 0 && status !== 1)) {
            return R(res, false, "Valid status (0 or 1) is required", {}, 400);
        }

        const result = await membershipModel.changeStatus(id, status);
        
        if (result && result.modifiedCount > 0) {
            return R(res, true, "Membership status updated successfully", {}, 200);
        } else {
            return R(res, false, "Failed to update membership status", {}, 500);
        }
    } catch (error) {
        next(error);
    }
};

// Get active memberships (public endpoint)
membershipService.getActiveMemberships = async (req, res, next) => {
    try {
        const result = await membershipModel.getActiveMemberships();
        
        if (result !== false) {
            return R(res, true, "Active memberships fetched successfully", result, 200);
        } else {
            return R(res, false, "Failed to fetch active memberships", {}, 500);
        }
    } catch (error) {
        next(error);
    }
};

module.exports = membershipService;

