const R = require("../utils/responseHelper");
const masterArtistModel = require("../models/masterArtistModel");

masterArtistService = {};

// Add master artist
masterArtistService.addMasterArtist = async (req, res, next) => {
    try {
        const { name, linkId, itunesLinkId, description, is_active } = req.body;

        console.log("[addMasterArtist] Request body:", req.body);
        console.log("[addMasterArtist] User from token:", req.doc);

        if (!name || name.trim() === "") {
            return R(res, false, "Artist name is required", {}, 400);
        }

        const userId = req.doc?.userId || req.doc?._id || req.doc?.id || null;

        const data = {
            name: name.trim(),
            linkId: linkId || "",
            itunesLinkId: itunesLinkId || "",
            description: description || "",
            is_active: is_active !== undefined ? parseInt(is_active) : 1,
            is_deleted: 0,
            createdBy: userId
        };

        console.log("[addMasterArtist] Data to save:", data);

        const result = await masterArtistModel.addMasterArtist(data);

        console.log("[addMasterArtist] Model result:", result);

        if (result) {
            return R(res, true, "Master artist added successfully", result, 200);
        } else {
            return R(res, false, "Failed to add master artist", {}, 500);
        }
    } catch (error) {
        console.error("Error in addMasterArtist service:", error);
        console.error("Error stack:", error.stack);
        return R(res, false, error.message || "Failed to add master artist", {}, 500);
    }
};

// Get master artist list
masterArtistService.getMasterArtistList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";

        const result = await masterArtistModel.getMasterArtistList(page, limit, search);

        if (result) {
            return R(res, true, "Master artists fetched successfully", result, 200);
        } else {
            return R(res, false, "Failed to fetch master artists", {}, 500);
        }
    } catch (error) {
        console.error("Error in getMasterArtistList service:", error);
        next(error);
    }
};

// Get master artist by ID
masterArtistService.getMasterArtistById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return R(res, false, "Artist ID is required", {}, 400);
        }

        const result = await masterArtistModel.getMasterArtistById(id);

        if (result) {
            return R(res, true, "Master artist fetched successfully", result, 200);
        } else {
            return R(res, false, "Master artist not found", {}, 404);
        }
    } catch (error) {
        console.error("Error in getMasterArtistById service:", error);
        next(error);
    }
};

// Update master artist
masterArtistService.updateMasterArtist = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, linkId, itunesLinkId, description, is_active } = req.body;

        if (!id) {
            return R(res, false, "Artist ID is required", {}, 400);
        }

        if (!name || name.trim() === "") {
            return R(res, false, "Artist name is required", {}, 400);
        }

        const userId = req.doc?.userId || req.doc?._id || req.doc?.id || null;

        const updateData = {
            name: name.trim(),
            linkId: linkId || "",
            itunesLinkId: itunesLinkId || "",
            description: description || "",
            updatedBy: userId
        };

        if (is_active !== undefined) {
            updateData.is_active = parseInt(is_active);
        }

        const result = await masterArtistModel.updateMasterArtist(id, updateData);

        if (result && result.modifiedCount > 0) {
            const updatedArtist = await masterArtistModel.getMasterArtistById(id);
            return R(res, true, "Master artist updated successfully", updatedArtist, 200);
        } else {
            return R(res, false, "Failed to update master artist or no changes made", {}, 500);
        }
    } catch (error) {
        console.error("Error in updateMasterArtist service:", error);
        return R(res, false, error.message || "Failed to update master artist", {}, 500);
    }
};

// Delete master artist
masterArtistService.deleteMasterArtist = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            return R(res, false, "Artist ID is required", {}, 400);
        }

        const result = await masterArtistModel.deleteMasterArtist(id);

        if (result && result.modifiedCount > 0) {
            return R(res, true, "Master artist deleted successfully", {}, 200);
        } else {
            return R(res, false, "Failed to delete master artist", {}, 500);
        }
    } catch (error) {
        console.error("Error in deleteMasterArtist service:", error);
        return R(res, false, error.message || "Failed to delete master artist", {}, 500);
    }
};

// Change master artist status
masterArtistService.changeStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id) {
            return R(res, false, "Artist ID is required", {}, 400);
        }

        if (status === undefined || (status !== 0 && status !== 1)) {
            return R(res, false, "Valid status (0 or 1) is required", {}, 400);
        }

        const result = await masterArtistModel.changeStatus(id, parseInt(status));

        if (result && result.modifiedCount > 0) {
            return R(res, true, `Master artist ${status === 1 ? 'activated' : 'deactivated'} successfully`, {}, 200);
        } else {
            return R(res, false, "Failed to change master artist status", {}, 500);
        }
    } catch (error) {
        console.error("Error in changeStatus service:", error);
        return R(res, false, error.message || "Failed to change master artist status", {}, 500);
    }
};

// Get active master artists
masterArtistService.getActiveMasterArtists = async (req, res, next) => {
    try {
        const result = await masterArtistModel.getActiveMasterArtists();

        if (result) {
            return R(res, true, "Active master artists fetched successfully", result, 200);
        } else {
            return R(res, false, "Failed to fetch active master artists", {}, 500);
        }
    } catch (error) {
        console.error("Error in getActiveMasterArtists service:", error);
        next(error);
    }
};

module.exports = masterArtistService;

