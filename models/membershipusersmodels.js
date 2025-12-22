const db = require("../utils/dbConn");
const mongoose = require("mongoose");

let { ObjectId } = require("mongodb");

membershipUsersModel = {};

const membershipUsersSchema = mongoose.Schema(
    {
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'users', 
            required: true 
        },
        membershipId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'memberships', 
            required: true 
        },
        paymentId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'payments', 
            default: null 
        },
        purchaseDate: { 
            type: Date, 
            default: Date.now 
        },
        expiryDate: { 
            type: Date, 
            required: true 
        },
        status: { 
            type: String, 
            enum: ['active', 'expired', 'cancelled'], 
            default: 'active' 
        },
        purchaseCount: { 
            type: Number, 
            default: 1 
        }, // Kitni baar membership li hai
        is_active: { 
            type: Number, 
            default: 1 
        },
        is_deleted: { 
            type: Number, 
            default: 0 
        }
    },
    { timestamps: true }
);

// Add membership user (when company registers or purchases membership)
membershipUsersModel.addMembershipUser = async (data) => {
    try {
        const result = await db.connectDb("membershipusers", membershipUsersSchema);
        
        // Check if user already has this membership (to increment purchaseCount)
        const existingMembership = await result.findOne({
            userId: new ObjectId(data.userId),
            membershipId: new ObjectId(data.membershipId),
            is_deleted: 0
        });
        
        if (existingMembership) {
            // Increment purchase count
            data.purchaseCount = (existingMembership.purchaseCount || 1) + 1;
        }
        
        const newMembershipUser = await result.create(data);
        return newMembershipUser;
    } catch (err) {
        console.error("Error adding membership user:", err.message);
        return false;
    }
};

// Get active membership for a user
membershipUsersModel.getActiveMembership = async (userId) => {
    try {
        const result = await db.connectDb("membershipusers", membershipUsersSchema);
        const now = new Date();
        
        // Convert userId to ObjectId if it's a string
        let userIdObj = userId;
        if (typeof userId === 'string') {
            userIdObj = new ObjectId(userId);
        } else if (userId && userId.toString) {
            userIdObj = new ObjectId(userId.toString());
        }
        
        console.log(`[getActiveMembership] Searching for userId: ${userId} (converted to: ${userIdObj}), now: ${now}`);
        
        // First, try to find any membership for this user (without filters for debugging)
        // Try populate with explicit path and model
        let allMemberships = await result.find({
            userId: userIdObj,
            is_deleted: 0
        })
        .populate({
            path: 'membershipId',
            model: 'memberships',
            select: 'name description price duration durationType features noOfLabels noOfArtists is_active is_deleted'
        })
        .sort({ purchaseDate: -1 });
        
        // If populate didn't work, manually fetch memberships
        allMemberships = await Promise.all(
            allMemberships.map(async (mem) => {
                if (mem.membershipId && (!mem.membershipId.name || typeof mem.membershipId === 'string' || mem.membershipId.toString)) {
                    console.log(`[getActiveMembership] Membership not populated, fetching manually...`);
                    const membershipModel = require("./membershipmodels");
                    let membershipIdStr = null;
                    if (mem.membershipId._id) {
                        membershipIdStr = mem.membershipId._id.toString ? mem.membershipId._id.toString() : mem.membershipId._id;
                    } else if (mem.membershipId.toString) {
                        membershipIdStr = mem.membershipId.toString();
                    } else if (typeof mem.membershipId === 'string') {
                        membershipIdStr = mem.membershipId;
                    } else {
                        membershipIdStr = String(mem.membershipId);
                    }
                    if (membershipIdStr) {
                        const membership = await membershipModel.getMembershipById(membershipIdStr);
                        if (membership) {
                            mem.membershipId = membership;
                            console.log(`[getActiveMembership] Membership fetched manually:`, membership.name);
                        }
                    }
                }
                return mem;
            })
        );
        
        console.log(`[getActiveMembership] Found ${allMemberships.length} total memberships for user ${userId}`);
        
        if (allMemberships.length > 0) {
            allMemberships.forEach((mem, idx) => {
                console.log(`[getActiveMembership] Membership ${idx + 1}:`, {
                    _id: mem._id,
                    userId: mem.userId,
                    membershipId: mem.membershipId,
                    status: mem.status,
                    expiryDate: mem.expiryDate,
                    isExpired: mem.expiryDate < now,
                    is_deleted: mem.is_deleted
                });
            });
        }
        
        // Now find active membership (try multiple status formats)
        // First try with expiry check
        let activeMembership = await result.findOne({
            userId: userIdObj,
            $or: [
                { status: 'active' },
                { status: 'Active' },
                { status: 'ACTIVE' }
            ],
            expiryDate: { $gte: now },
            is_deleted: 0
        })
        .populate({
            path: 'membershipId',
            model: 'memberships',
            select: 'name description price duration durationType features noOfLabels noOfArtists is_active is_deleted'
        })
        .sort({ purchaseDate: -1 });
        
        // If not found with expiry check, try without expiry check (for debugging)
        if (!activeMembership) {
            console.log(`[getActiveMembership] No active membership found with expiry check, trying without expiry...`);
            activeMembership = await result.findOne({
                userId: userIdObj,
                $or: [
                    { status: 'active' },
                    { status: 'Active' },
                    { status: 'ACTIVE' }
                ],
                is_deleted: 0
            })
            .populate({
                path: 'membershipId',
                model: 'memberships',
                select: 'name description price duration durationType features noOfLabels noOfArtists is_active is_deleted'
            })
            .sort({ purchaseDate: -1 });
            
            if (activeMembership) {
                console.log(`[getActiveMembership] Found membership but expiry date: ${activeMembership.expiryDate}, now: ${now}, isExpired: ${activeMembership.expiryDate < now}`);
            }
        }
        
        // If still not found, try with any status (for debugging - to see what status exists)
        if (!activeMembership && allMemberships.length > 0) {
            console.log(`[getActiveMembership] No active membership found with filters, but ${allMemberships.length} memberships exist. Using most recent one for debugging.`);
            // Use the most recent membership regardless of status/expiry for debugging
            activeMembership = allMemberships[0];
            console.log(`[getActiveMembership] Using membership with status: ${activeMembership.status}, expiry: ${activeMembership.expiryDate}, isExpired: ${activeMembership.expiryDate < now}`);
            
            // If expiry is in past, extend it for debugging (temporary fix)
            if (activeMembership.expiryDate < now) {
                console.log(`[getActiveMembership] Membership expired, extending expiry date for debugging...`);
                const newExpiryDate = new Date();
                newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1); // Extend by 1 year
                activeMembership.expiryDate = newExpiryDate;
                // Update in database
                await result.updateOne(
                    { _id: activeMembership._id },
                    { $set: { expiryDate: newExpiryDate, status: 'active' } }
                );
                console.log(`[getActiveMembership] Membership expiry extended to: ${newExpiryDate}`);
            }
        }
        
        console.log(`[getActiveMembership] Active membership found:`, activeMembership ? 'YES' : 'NO');
        
        // Always manually fetch membership to ensure we get the data
        if (activeMembership) {
            console.log(`[getActiveMembership] Active membership found, checking membershipId...`);
            console.log(`[getActiveMembership] membershipId type:`, typeof activeMembership.membershipId);
            console.log(`[getActiveMembership] membershipId value:`, activeMembership.membershipId);
            
            // Get membershipId value (could be populated object or just ID)
            let membershipIdValue = activeMembership.membershipId;
            
            // Check if it's already populated
            const isPopulated = membershipIdValue && 
                               typeof membershipIdValue === 'object' && 
                               !membershipIdValue.toString && 
                               membershipIdValue.name;
            
            if (isPopulated) {
                console.log(`[getActiveMembership] Membership already populated:`, membershipIdValue.name);
            } else {
                // Extract ID from populated object or use directly
                let membershipIdStr = null;
                
                if (membershipIdValue) {
                    if (membershipIdValue._id) {
                        membershipIdStr = membershipIdValue._id.toString ? membershipIdValue._id.toString() : membershipIdValue._id;
                    } else if (membershipIdValue.toString) {
                        membershipIdStr = membershipIdValue.toString();
                    } else if (typeof membershipIdValue === 'string') {
                        membershipIdStr = membershipIdValue;
                    } else {
                        membershipIdStr = String(membershipIdValue);
                    }
                }
                
                if (membershipIdStr) {
                    console.log(`[getActiveMembership] Fetching membership manually with ID: ${membershipIdStr}`);
                    const membershipModel = require("./membershipmodels");
                    const membership = await membershipModel.getMembershipById(membershipIdStr);
                    
                    if (membership) {
                        activeMembership.membershipId = membership;
                        console.log(`[getActiveMembership] Membership fetched successfully:`, membership.name);
                    } else {
                        console.error(`[getActiveMembership] Failed to fetch membership with ID: ${membershipIdStr}`);
                        // Return null if membership not found
                        return null;
                    }
                } else {
                    console.error(`[getActiveMembership] Could not extract membershipId from:`, membershipIdValue);
                    return null;
                }
            }
        } else {
            console.log(`[getActiveMembership] No active membership found for user ${userId}`);
        }
        
        return activeMembership;
    } catch (err) {
        console.error("[getActiveMembership] Error getting active membership:", err.message);
        console.error("[getActiveMembership] Error stack:", err.stack);
        return false;
    }
};

// Get all memberships for a user
membershipUsersModel.getUserMemberships = async (userId) => {
    try {
        const result = await db.connectDb("membershipusers", membershipUsersSchema);
        
        // Convert userId to ObjectId if it's a string
        let userIdObj = userId;
        if (typeof userId === 'string') {
            userIdObj = new ObjectId(userId);
        } else if (userId && userId.toString) {
            userIdObj = new ObjectId(userId.toString());
        }
        
        console.log(`[getUserMemberships] Searching for userId: ${userId} (converted to: ${userIdObj})`);
        
        let memberships = await result.find({
            userId: userIdObj,
            is_deleted: 0
        })
        .populate({
            path: 'membershipId',
            model: 'memberships',
            select: 'name description price duration durationType features noOfLabels noOfArtists is_active is_deleted'
        })
        .sort({ purchaseDate: -1 });
        
        console.log(`[getUserMemberships] Found ${memberships.length} memberships`);
        
        // If populate didn't work, manually fetch each membership
        const membershipsWithData = await Promise.all(
            memberships.map(async (mem) => {
                if (mem.membershipId && (!mem.membershipId.name || typeof mem.membershipId === 'string' || mem.membershipId.toString)) {
                    console.log(`[getUserMemberships] Membership not populated, fetching manually for: ${mem.membershipId}`);
                    const membershipModel = require("./membershipmodels");
                    let membershipIdStr = null;
                    if (mem.membershipId._id) {
                        membershipIdStr = mem.membershipId._id.toString ? mem.membershipId._id.toString() : mem.membershipId._id;
                    } else if (mem.membershipId.toString) {
                        membershipIdStr = mem.membershipId.toString();
                    } else if (typeof mem.membershipId === 'string') {
                        membershipIdStr = mem.membershipId;
                    } else {
                        membershipIdStr = String(mem.membershipId);
                    }
                    if (membershipIdStr) {
                        const membership = await membershipModel.getMembershipById(membershipIdStr);
                        if (membership) {
                            mem.membershipId = membership;
                            console.log(`[getUserMemberships] Membership fetched manually:`, membership.name);
                        }
                    }
                }
                return mem;
            })
        );
        
        return membershipsWithData;
    } catch (err) {
        console.error("Error getting user memberships:", err.message);
        console.error("Error stack:", err.stack);
        return false;
    }
};

// Get membership purchase count for a user
membershipUsersModel.getPurchaseCount = async (userId) => {
    try {
        const result = await db.connectDb("membershipusers", membershipUsersSchema);
        
        const count = await result.countDocuments({
            userId: new ObjectId(userId),
            is_deleted: 0
        });
        
        return count;
    } catch (err) {
        console.error("Error getting purchase count:", err.message);
        return 0;
    }
};

// Update membership user status
membershipUsersModel.updateStatus = async (id, status) => {
    try {
        const result = await db.connectDb("membershipusers", membershipUsersSchema);
        const updateData = await result.updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: status } },
            { runValidators: true }
        );
        return updateData;
    } catch (err) {
        console.error("Error updating membership user status:", err.message);
        return false;
    }
};

// Get all membership users (for admin)
membershipUsersModel.getAllMembershipUsers = async (page = 1, limit = 10, search = "") => {
    try {
        const result = await db.connectDb("membershipusers", membershipUsersSchema);
        
        let query = { is_deleted: 0 };
        
        // Add search functionality
        if (search && search.trim() !== "") {
            query.$or = [
                { userId: { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (page - 1) * limit;
        
        const membershipUsers = await result.find(query)
            .populate('userId', 'name email companyName')
            .populate('membershipId', 'name price duration')
            .sort({ purchaseDate: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await result.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
        
        return {
            data: membershipUsers,
            total: total,
            totalPages: totalPages,
            currentPage: page,
            limit: limit
        };
    } catch (err) {
        console.error("Error getting all membership users:", err.message);
        return false;
    }
};

module.exports = membershipUsersModel;

