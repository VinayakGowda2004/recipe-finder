const express = require("express");

const router = express.Router();

const recipeController = require("../controllers/recipeController");

const { authenticate, adminAuth } = require("../middleware/authMiddleware");

const upload = require("../middleware/multerMiddleware.js");

// Add Recipe
router.post(
  "/add-recipe",
  authenticate,
  adminAuth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  recipeController.addRecipe
);

// Get all recipes
router.get("/get-recipes", recipeController.getAllRecipes);

// Search recipes
router.post("/get-recipe", recipeController.searchRecipes);

// Get recipe by ID
router.get("/get-recipe/:id", recipeController.getRecipeById);

// Update Recipe
router.put(
  "/update-recipe/:id",
  authenticate,
  adminAuth,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  recipeController.updateRecipe
);

// Delete Recipe
router.delete(
  "/delete-recipe/:id",
  authenticate,
  adminAuth,
  recipeController.deleteRecipe
);

module.exports = router;