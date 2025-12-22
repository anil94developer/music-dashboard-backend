var jwt = require("jsonwebtoken");
const R = require("./responseHelper");

// var apiResponse = require("../helpers/apiResponses");
const verifyJWT = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader) {
      console.log("[verifyToken] No authorization header found");
      return R(res, false, "Unauthorized - No token provided", {}, 401);
    }

    // Remove 'Bearer ' prefix if present
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
      console.log("[verifyToken] Token is empty");
      return R(res, false, "Unauthorized - Invalid token", {}, 401);
    }

    // Verify token
    jwt.verify(
      token,
      process.env.JWT_SECRET,
      (err, verify) => {
        if (err) {
          console.log("[verifyToken] Token verification failed:", err.message);
          return R(res, false, "Unauthorized - Invalid or expired token", {}, 401);
        } else {
          let decoded = jwt.decode(token, {
            complete: true,
          });
          
          if (!decoded || !decoded.payload) {
            console.log("[verifyToken] Token decode failed");
            return R(res, false, "Unauthorized - Invalid token format", {}, 401);
          }
          
          req.doc = decoded.payload;
          console.log("[verifyToken] Token verified successfully for user:", req.doc.userId || req.doc.email || "Unknown");
          next();
        }
      }
    );
  } catch (e) {
    console.error("[verifyToken] Exception:", e.message);
    return R(res, false, "Unauthorized - Token verification failed", {}, 401);
  }
};

module.exports = verifyJWT;
