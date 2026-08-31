const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "❗ All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "❌ Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();

    res.json({ message: "✅ Registration successful!" });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "❌ Internal Server Error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "❌ User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "❌ Invalid password" });
    }

    if (user.role !== role) {
      return res.status(403).json({ message: `❌ You are not a ${role}` });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      message: "✅ Login successful",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "❌ Internal Server Error" });
  }
});

module.exports = router;
