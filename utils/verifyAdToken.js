var jwt = require("jsonwebtoken");
const R = require("./responseHelper");
const authModel = require("../models/authmodels");
// var apiResponse = require("../helpers/apiResponses");
const verifyJWT = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization || req.headers.Authorization;
        
        if (!authHeader) {
            console.log("No authorization header found");
            return R(res, false, "Unauthorized - No token provided", {}, 401);
        }

        // Remove 'Bearer ' prefix if present
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

        if (!token) {
            console.log("Token is empty");
            return R(res, false, "Unauthorized - Invalid token", {}, 401);
        }

        // First decode to check token structure without verification
        let decoded = jwt.decode(token, {
            complete: true
        });
        
        if (!decoded || !decoded.payload) {
            console.log("Token decode failed");
            return R(res, false, "Unauthorized - Invalid token format", {}, 401);
        }

        const payload = decoded.payload;
        
        // Extract user ID from token
        const userId = payload.userId || payload.user_id || (payload.profile && payload.profile._id);
        
        // Try JWT_AD_SECRET first (for admin/login tokens)
        let tokenVerified = false;
        let verifiedPayload = null;
        
        try {
            jwt.verify(token, process.env.JWT_AD_SECRET);
            tokenVerified = true;
            verifiedPayload = payload;
        } catch (err) {
            // If JWT_AD_SECRET fails, try JWT_SECRET (for auth/login tokens)
            try {
                jwt.verify(token, process.env.JWT_SECRET);
                tokenVerified = true;
                verifiedPayload = payload;
            } catch (err2) {
                console.log("JWT verification error with both secrets. AD_SECRET:", err.message, "SECRET:", err2.message);
                return R(res, false, "Unauthorized - Invalid or expired token", {}, 401);
            }
        }
        
        if (!tokenVerified || !verifiedPayload) {
            return R(res, false, "Unauthorized - Token verification failed", {}, 401);
        }
        
        req.doc = verifiedPayload;
        
        // Extract role from multiple possible locations
        let userRole = verifiedPayload.role || 
                      (verifiedPayload.profile && verifiedPayload.profile.role) ||
                      (verifiedPayload.profile && typeof verifiedPayload.profile === 'object' && verifiedPayload.profile.role);
        
        // If role is Admin, allow by default (default admin permission for membership)
        if (userRole === "Admin" || userRole === "admin") {
            req.doc.userType = 1;
            req.doc.role = "Admin";
            if (verifiedPayload.profile) {
                Object.assign(req.doc, verifiedPayload.profile);
            }
            console.log("Admin access granted by default. Role:", userRole);
            return next();
        }
        
        // Also check userType
        if (req.doc.userType == 1 || req.doc.userType == "1") {
            console.log("Admin access granted via userType:", req.doc.userType);
            return next();
        }
        
        // If role not found in token, fetch from database using userId
        if (userId && !userRole) {
            try {
                const user = await authModel.getUser(userId);
                if (user && (user.role === "Admin" || user.role === "admin")) {
                    req.doc.userType = 1;
                    req.doc.role = "Admin";
                    Object.assign(req.doc, user);
                    console.log("Admin access granted after database check. Role:", user.role);
                    return next();
                }
            } catch (dbErr) {
                console.log("Database check error:", dbErr.message);
            }
        }
        
        // If still no Admin role found, deny access
        console.log("Access denied. userType:", req.doc.userType, "role:", userRole, "userId:", userId);
        return R(res, false, "Unauthorized - Admin access required", {}, 403);
    } catch (e) {
        console.error("Token verification exception:", e);
        return R(res, false, "Unauthorized - Token verification failed", {}, 401);
    }
}

module.exports = verifyJWT