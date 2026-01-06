const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET_KEY } = require('../config/constants');
// ====================================================================
// Protect routes - verify JWT token (Authentication)
// ====================================================================
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1].trim();
      // 🛑 CRITICAL DEBUGGING LOGS 🛑
      console.log("Token Received:", token.substring(0, 15) + '...');
      console.log("JWT Secret Status:", process.env.JWT_SECRET ? '✅ Loaded' : '❌ Failed to Load!');
            // Eikhane jodi '❌ Failed to Load!' dekhe, tahole .env shomossha, jeta amra ageo check korechi.
            // 🛑 END DEBUGGING LOGS 🛑
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET_KEY);

      // Get user from token (exclude password)
      // The user object (including req.user.role) is now attached to the request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// ====================================================================
// Admin middleware - check if user is Admin (Authorization for superuser)
// ====================================================================
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Not authorized as Admin" });
  }
};

// ====================================================================
// 🛑 NEW: Agent middleware - check if user is Agent OR Admin 
// (Authorization for Package Management)
// ====================================================================
const agent = (req, res, next) => {
  if (req.user && (req.user.role.toLowerCase() === "admin" || req.user.role.toLowerCase() === "agent")) {
    next();
  } else {
    res.status(403).json({ message: "Not authorized. Must be an Agent or Admin." });
  }
};

// ====================================================================
// Master Admin middleware - check if user is the SINGLE primary admin
// ====================================================================
const masterAdmin = (req, res, next) => {
  const masterEmail = process.env.MASTER_ADMIN_EMAIL || 'admin@example.com';
  if (req.user && req.user.role.toLowerCase() === "admin" && req.user.email === masterEmail) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Only the Master Admin can perform this action." });
  }
};

module.exports = { protect, admin, agent, masterAdmin };