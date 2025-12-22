const authModel = require("../models/authmodels");
const membershipUsersModel = require("../models/membershipusersmodels");
const membershipModel = require("../models/membershipmodels");
const R = require("../utils/responseHelper");

userPlanService = {}

// Update user plan (labels and artists) - based on active membership
userPlanService.updateUserPlan = async (req, res, next) => {
    try {
        const { userId, noOfLabels, noOfArtists } = req.body;

        if (!userId) {
            return R(res, false, "User ID is required", {}, 400);
        }

        // Get active membership for user
        const activeMembership = await membershipUsersModel.getActiveMembership(userId);
        
        if (!activeMembership || !activeMembership.membershipId) {
            return R(res, false, "No active membership found for this user", {}, 400);
        }

        // Get membership details
        const membership = await membershipModel.getMembershipById(activeMembership.membershipId._id || activeMembership.membershipId);
        
        if (!membership) {
            return R(res, false, "Membership not found", {}, 404);
        }

        // Use membership values if not provided, otherwise use provided values
        const finalNoOfLabels = noOfLabels !== undefined ? parseInt(noOfLabels) : (membership.noOfLabels || 0);
        const finalNoOfArtists = noOfArtists !== undefined ? parseInt(noOfArtists) : (membership.noOfArtists || 0);

        const updateData = {
            noOfLabel: finalNoOfLabels,
            noOfArtists: finalNoOfArtists
        };

        const result = await authModel.updateProfile(userId, updateData);
        
        if (result && result.modifiedCount > 0) {
            const updatedUser = await authModel.getUser(userId);
            return R(res, true, "User plan updated successfully based on active membership", {
                user: updatedUser,
                membership: {
                    name: membership.name,
                    noOfLabels: membership.noOfLabels,
                    noOfArtists: membership.noOfArtists
                },
                updated: {
                    noOfLabels: finalNoOfLabels,
                    noOfArtists: finalNoOfArtists
                }
            }, 200);
        } else {
            return R(res, false, "Failed to update user plan or no changes made", {}, 500);
        }
    } catch (error) {
        console.error("Error in updateUserPlan service:", error);
        return R(res, false, error.message || "Failed to update user plan", {}, 500);
    }
};

module.exports = userPlanService;

