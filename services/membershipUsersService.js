const membershipUsersModel = require("../models/membershipusersmodels");
const R = require("../utils/responseHelper");

membershipUsersService = {};

// Get all membership users (for admin debugging)
membershipUsersService.getAllMembershipUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        
        const result = await membershipUsersModel.getAllMembershipUsers(page, limit, search);
        
        if (!result || !result.data || result.data.length === 0) {
            return R(res, true, "No membership users found", {
                data: [],
                total: 0,
                totalPages: 0,
                currentPage: page,
                limit: limit
            }, 200);
        }
        
        return R(res, true, "Membership users retrieved successfully", result, 200);
    } catch (error) {
        console.error("Error in getAllMembershipUsers service:", error);
        return R(res, false, error.message || "Failed to get membership users", {}, 500);
    }
};

// Get membership users for a specific user
membershipUsersService.getUserMemberships = async (req, res, next) => {
    try {
        const { userId } = req.query;
        
        if (!userId) {
            return R(res, false, "User ID is required", {}, 400);
        }
        
        console.log(`[getUserMemberships] Fetching memberships for userId: ${userId}`);
        
        const memberships = await membershipUsersModel.getUserMemberships(userId);
        
        console.log(`[getUserMemberships] Found ${memberships?.length || 0} memberships`);
        
        if (!memberships || memberships.length === 0) {
            return R(res, true, "No memberships found for this user", [], 200);
        }
        
        // Get active membership
        const activeMembership = await membershipUsersModel.getActiveMembership(userId);
        console.log(`[getUserMemberships] Active membership:`, activeMembership ? 'Found' : 'Not found');
        
        return R(res, true, "User memberships retrieved successfully", {
            allMemberships: memberships,
            activeMembership: activeMembership
        }, 200);
    } catch (error) {
        console.error("Error in getUserMemberships service:", error);
        return R(res, false, error.message || "Failed to get user memberships", {}, 500);
    }
};

module.exports = membershipUsersService;

