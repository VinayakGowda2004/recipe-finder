const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Middleware to authenticate user based on token
const authenticate = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "❗ Access Denied: No Token Provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer "

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch the full user object from DB (excluding password)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "❌ Invalid Token: User not found" });
    }

    req.user = user; // Attach user info to request
    next(); // Continue to next middleware or route
  } catch (err) {
    console.error("❌ Invalid Token:", err.message);
    res.status(401).json({ message: "❌ Invalid or Expired Token" });
  }
};

// Middleware to authorize admin-only routes
const adminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "❌ Access Denied: Admins Only" });
  }
  next();
};

module.exports = { authenticate, adminAuth };
