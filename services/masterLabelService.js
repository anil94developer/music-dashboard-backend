const R = require("../utils/responseHelper");
const masterLabelModel = require("../models/masterLabelModel");

masterLabelService = {};

// Add master label
masterLabelService.addMasterLabel = async (req, res, next) => {
    try {
        const { name, description, is_active } = req.body;

        console.log("[addMasterLabel] Request body:", req.body);
        console.log("[addMasterLabel] User from token:", req.doc);

        if (!name || name.trim() === "") {
            return R(res, false, "Label name is required", {}, 400);
        }

        const userId = req.doc?.userId || req.doc?._id || req.doc?.id || null;

        const data = {
            name: name.trim(),
            description: description || "",
            is_active: is_active !== undefined ? parseInt(is_active) : 1,
            is_deleted: 0,
            createdBy: userId
        };

        console.log("[addMasterLabel] Data to save:", data);

        const result = await masterLabelModel.addMasterLabel(data);

        console.log("[addMasterLabel] Model result:", result);

        if (result) {
            return R(res, true, "Master label added successfully", result, 200);
        } else {
            return R(res, false, "Failed to add master label", {}, 500);
        }
    } catch (error) {
        console.error("Error in addMasterLabel service:", error);
        console.error("Error stack:", error.stack);
        return R(res, false, error.message || "Failed to add master label", {}, 500);
    }
};

// Get master label list
masterLabelService.getMasterLabelList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";

        const result = await masterLabelModel.getMasterLabelList(page, limit, search);

        if (result) {
            return R(res, true, "Master labels fetched successfully", result, 200);
        } else {
            return R(res, false, "Failed to fetch master labels", {}, 500);
        }
    } catch (error) {
        console.error("Error in getMasterLabelList service:", error);
        next(error);
    }
};

// Get master label by ID
masterLabelService.getMasterLabelById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return R(res, false, "Label ID is required", {}, 400);
        }

        const result = await masterLabelModel.getMasterLabelById(id);

        if (result) {
            return R(res, true, "Master label fetched successfully", result, 200);
        } else {
            return R(res, false, "Master label not found", {}, 404);
        }
    } catch (error) {
        console.error("Error in getMasterLabelById service:", error);
        next(error);
    }
};

// Update master label
masterLabelService.updateMasterLabel = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, is_active } = req.body;

        if (!id) {
            return R(res, false, "Label ID is required", {}, 400);
        }

        if (!name || name.trim() === "") {
            return R(res, false, "Label name is required", {}, 400);
        }

        const userId = req.doc?.userId || req.doc?._id || req.doc?.id || null;

        const updateData = {
            name: name.trim(),
            description: description || "",
            updatedBy: userId
        };

        if (is_active !== undefined) {
            updateData.is_active = parseInt(is_active);
        }

        const result = await masterLabelModel.updateMasterLabel(id, updateData);

        if (result && result.modifiedCount > 0) {
            const updatedLabel = await masterLabelModel.getMasterLabelById(id);
            return R(res, true, "Master label updated successfully", updatedLabel, 200);
        } else {
            return R(res, false, "Failed to update master label or no changes made", {}, 500);
        }
    } catch (error) {
        console.error("Error in updateMasterLabel service:", error);
        return R(res, false, error.message || "Failed to update master label", {}, 500);
    }
};

// Delete master label
masterLabelService.deleteMasterLabel = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return R(res, false, "Label ID is required", {}, 400);
        }

        const result = await masterLabelModel.deleteMasterLabel(id);

        if (result && result.modifiedCount > 0) {
            return R(res, true, "Master label deleted successfully", {}, 200);
        } else {
            return R(res, false, "Failed to delete master label", {}, 500);
        }
    } catch (error) {
        console.error("Error in deleteMasterLabel service:", error);
        return R(res, false, error.message || "Failed to delete master label", {}, 500);
    }
};

// Change master label status
masterLabelService.changeStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id) {
            return R(res, false, "Label ID is required", {}, 400);
        }

        if (status === undefined || (status !== 0 && status !== 1)) {
            return R(res, false, "Valid status (0 or 1) is required", {}, 400);
        }

        const result = await masterLabelModel.changeStatus(id, parseInt(status));

        if (result && result.modifiedCount > 0) {
            return R(res, true, `Master label ${status === 1 ? 'activated' : 'deactivated'} successfully`, {}, 200);
        } else {
            return R(res, false, "Failed to change master label status", {}, 500);
        }
    } catch (error) {
        console.error("Error in changeStatus service:", error);
        return R(res, false, error.message || "Failed to change master label status", {}, 500);
    }
};

// Get active master labels
masterLabelService.getActiveMasterLabels = async (req, res, next) => {
    try {
        const result = await masterLabelModel.getActiveMasterLabels();

        if (result) {
            return R(res, true, "Active master labels fetched successfully", result, 200);
        } else {
            return R(res, false, "Failed to fetch active master labels", {}, 500);
        }
    } catch (error) {
        console.error("Error in getActiveMasterLabels service:", error);
        next(error);
    }
};

module.exports = masterLabelService;

