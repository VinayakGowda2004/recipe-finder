const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: { type: [String], required: true },
  description: { type: String, required: true },
  instructions: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String }, // Optional image URL
  videoUrl: { type: String }, // Optional video URL
});

const Recipe = mongoose.model('Recipe', RecipeSchema);

module.exports = Recipe;
