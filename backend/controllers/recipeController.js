const Recipe = require("../models/recipeModel");
const cloudinary = require("../config/cloudinary");

// Add Recipe
exports.addRecipe = async (req, res) => {
  try {
    const {
      name,
      description,
      ingredients,
      instructions,
      category,
    } = req.body;

    if (!name || !ingredients || !description || !instructions || !category) {
      return res.status(400).json({
        message: "❗ All fields are required, including category",
      });
    }

    const formattedIngredients = Array.isArray(ingredients)
      ? ingredients
      : ingredients.split(",").map((ing) => ing.trim());

    const imageUrl = req.files?.image
      ? req.files.image[0].path
      : "";

    const videoUrl = req.files?.video
      ? req.files.video[0].path
      : "";

    const newRecipe = new Recipe({
      name,
      description,
      ingredients: formattedIngredients,
      instructions,
      category,
      imageUrl,
      videoUrl,
    });

    await newRecipe.save();

    res.status(201).json({
      message: "✅ Recipe added successfully",
      recipe: newRecipe,
    });
  } catch (error) {
    console.error("❌ Add Recipe Error:", error);
    res.status(500).json({
      message: "❌ Failed to add recipe",
    });
  }
};

// Get all recipes
exports.getAllRecipes = async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};

    if (category && category.trim() !== "") {
      query.category = category.trim();
    }

    const recipes = await Recipe.find(query).select(
      "name description category imageUrl videoUrl"
    );

    res.json(recipes);
  } catch (error) {
    console.error("❌ Fetch Recipe Error:", error);
    res.status(500).json({
      message: "❌ Internal Server Error",
    });
  }
};

// Get recipe by ID
exports.getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        message: "❌ Recipe not found",
      });
    }

    res.json(recipe);
  } catch (error) {
    console.error("❌ Get Recipe by ID Error:", error);
    res.status(500).json({
      message: "❌ Internal Server Error",
    });
  }
};

// Search recipes by ingredients and optional category
exports.searchRecipes = async (req, res) => {
  try {
    const { ingredients, category } = req.body;

    if (
      !ingredients ||
      !Array.isArray(ingredients) ||
      ingredients.length === 0
    ) {
      return res.status(400).json({
        message: "❗ Ingredients are required as an array",
      });
    }

    if (category && typeof category !== "string") {
      return res.status(400).json({
        message: "❗ Invalid category format",
      });
    }

    const formattedIngredients = ingredients.map((ing) =>
      ing.trim().toLowerCase()
    );

    const ingredientRegex = formattedIngredients.map(
      (ing) => new RegExp(ing, "i")
    );

    const query = {
      ingredients: { $in: ingredientRegex },
    };

    if (category && category.trim() !== "") {
      query.category = category.trim();
    }

    const recipes = await Recipe.find(query);

    if (recipes.length === 0) {
      return res.status(404).json({
        message: "❌ No matching recipes found",
      });
    }

    res.json(
      recipes.map((recipe) => ({
        id: recipe._id,
        name: recipe.name,
        description: recipe.description,
        instructions: recipe.instructions,
        category: recipe.category,
        imageUrl: recipe.imageUrl,
        videoUrl: recipe.videoUrl,
      }))
    );
  } catch (error) {
    console.error("❌ Search Recipe Error:", error);
    res.status(500).json({
      message: "❌ Internal Server Error",
    });
  }
};

// Update Recipe
exports.updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      ingredients,
      instructions,
      category,
    } = req.body;

    const existingRecipe = await Recipe.findById(id);

    if (!existingRecipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    const updatedData = {
      name,
      description,
      instructions,
      category,
    };

    updatedData.ingredients = Array.isArray(ingredients)
      ? ingredients
      : ingredients.split(",").map((i) => i.trim());

    // Replace old image
    if (req.files?.image) {
      if (existingRecipe.imageUrl) {
        try {
          const publicId = existingRecipe.imageUrl
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];

          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error("⚠️ Old image deletion failed:", error);
        }
      }

      updatedData.imageUrl = req.files.image[0].path;
    }

    // Replace old video
    if (req.files?.video) {
      if (existingRecipe.videoUrl) {
        try {
          const publicId = existingRecipe.videoUrl
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];

          await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
          });
        } catch (error) {
          console.error("⚠️ Old video deletion failed:", error);
        }
      }

      updatedData.videoUrl = req.files.video[0].path;
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    res.status(200).json(updatedRecipe);
  } catch (error) {
    console.error("❌ Update Recipe Error:", error);

    res.status(500).json({
      error: "Failed to update recipe",
    });
  }
};

// Delete Recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await Recipe.findById(id);

    if (!recipe) {
      return res.status(404).json({
        message: "❌ Recipe not found",
      });
    }

    // Delete image from Cloudinary
    if (recipe.imageUrl) {
      try {
        const publicId = recipe.imageUrl
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];

        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("⚠️ Image deletion failed:", error);
      }
    }

    // Delete video from Cloudinary
    if (recipe.videoUrl) {
      try {
        const publicId = recipe.videoUrl
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];

        await cloudinary.uploader.destroy(publicId, {
          resource_type: "video",
        });
      } catch (error) {
        console.error("⚠️ Video deletion failed:", error);
      }
    }

    await Recipe.findByIdAndDelete(id);

    res.json({
      message: "✅ Recipe deleted successfully!",
    });
  } catch (error) {
    console.error("❌ Delete Recipe Error:", error);

    res.status(500).json({
      message: "❌ Internal Server Error",
    });
  }
};