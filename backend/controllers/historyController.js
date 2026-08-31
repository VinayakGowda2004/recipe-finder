const History = require("../models/historyModel");

// Save a recipe view to history
exports.saveHistory = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userId = req.user.id;

    if (!recipeId) return res.status(400).json({ message: "❗ Recipe ID is required" });

    // Try to upsert (insert only if not exists)
    await History.updateOne(
      { userId, recipeId },
      { $setOnInsert: { userId, recipeId } },
      { upsert: true }
    );

    res.status(201).json({ message: "✅ Recipe added to history (or already exists)" });
  } catch (error) {
    console.error("❌ History Save Error:", error);
    res.status(500).json({ message: "❌ Failed to save history" });
  }
};

// Get all history for the logged-in user
exports.getUserHistory = async (req, res) => {
  try {
    const userHistory = await History.find({ userId: req.user.id }).populate("recipeId");

    if (!userHistory || userHistory.length === 0) {
      return res.status(404).json({ message: "No history found." });
    }

    res.json(userHistory);
  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ message: "❌ Failed to load history" });
  }
};

// Delete one history entry
exports.deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await History.findByIdAndDelete(id);
    if (!entry) return res.status(404).json({ message: "❗ History entry not found" });

    res.status(200).json({ message: "✅ History entry deleted" });
  } catch (error) {
    console.error("❌ Delete History Error:", error);
    res.status(500).json({ message: "❌ Failed to delete history" });
  }
};

// Clear all history for user
exports.clearAllHistory = async (req, res) => {
  try {
    await History.deleteMany({ userId: req.user.id });
    res.status(200).json({ message: "🧹 Cleared all history" });
  } catch (error) {
    console.error("❌ Clear History Error:", error);
    res.status(500).json({ message: "❌ Failed to clear history" });
  }
};
