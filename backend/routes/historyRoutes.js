const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const historyController = require("../controllers/historyController");

// POST /api/history
router.post("/", authenticate, historyController.saveHistory);

// GET /api/history
router.get("/", authenticate, historyController.getUserHistory);

// Clear all history
router.delete("/clear", authenticate, historyController.clearAllHistory);

// DELETE single entry
router.delete("/:id", authenticate, historyController.deleteHistory);

module.exports = router;
