import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const [ingredients, setIngredients] = useState("");
  const [category, setCategory] = useState("All");
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const shouldRestore = sessionStorage.getItem("restoreFromDetails");
    if (shouldRestore === "true") {
      const previousRecipes = sessionStorage.getItem("searchedRecipes");
      const previousCategory = sessionStorage.getItem("selectedCategory");
      if (previousRecipes) {
        setRecipes(JSON.parse(previousRecipes));
      }
      if (previousCategory) {
        setCategory(previousCategory);
      }
      sessionStorage.removeItem("restoreFromDetails");
    }
  }, []);

  const handleSearch = async () => {
    if (!ingredients.trim() && category === "All") {
      setError("Please enter ingredients or select a category.");
      setRecipes([]);
      return;
    }

    setLoading(true);
    setError("");
    try {
      let response;

      // Handle the case where ingredients are provided
      if (ingredients.trim()) {
        response = await axios.post("http://localhost:5000/get-recipe", {
          ingredients: ingredients.split(",").map((ing) => ing.trim()),
          category: category === "All" ? "" : category, // Send empty string for "All"
        });
      } else {
        // If ingredients are empty, get all recipes for the selected category (or all if "All")
        response = await axios.get(
          `http://localhost:5000/get-recipes?category=${
            category === "All" ? "" : category
          }`,
        );
      }

      console.log("API Response Data:", response.data); // For debugging

      if (response.data.length === 0) {
        setError("No recipes found for these ingredients and category.");
        setRecipes([]);
        sessionStorage.removeItem("searchedRecipes");
      } else {
        setRecipes(response.data);
        sessionStorage.setItem(
          "searchedRecipes",
          JSON.stringify(response.data),
        );
        sessionStorage.setItem("selectedCategory", category);
      }
    } catch (err) {
      setError("Something went wrong while searching.");
      setRecipes([]);
      console.error("❌ Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecipe = (id) => {
    sessionStorage.setItem("restoreFromDetails", "true");
    navigate(`/recipe/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-200 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-4xl font-bold text-center text-orange-700 mb-4">
          Smart Recipe Finder
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter ingredients (comma-separated), select a category, and discover
          delicious recipes!
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. tomato, onion, cheese"
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-md"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg shadow-md"
          >
            <option value="All">All Categories</option>
            <option value="Vegetarian">Vegetarian</option>
            <option value="Non-Vegetarian">Non-Vegetarian</option>
            <option value="Dessert">Dessert</option>
            <option value="Quick Meals">Quick Meals</option>
            <option value="Coffees">Coffees</option>
            <option value="Soups">Soups</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition"
          >
            Search
          </button>
        </div>

        {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        {loading && (
          <p className="mt-4 text-center animate-pulse">
            ⏳ Searching for recipes...
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {recipes.map((recipe, index) => (
            <motion.div
              key={recipe.id || recipe._id}
              className="bg-orange-50 p-4 rounded-xl shadow-md hover:shadow-lg cursor-pointer transition"
              onClick={() => handleViewRecipe(recipe.id || recipe._id)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h2 className="text-xl font-bold text-orange-800">
                {recipe.name}
              </h2>

              <p className="text-sm text-gray-600 mt-1 italic">
                {recipe.description.length > 100
                  ? `${recipe.description.substring(0, 100)}...`
                  : recipe.description}
              </p>

              {recipe.imageUrl && (
                <div className="w-full aspect-[4/3] mt-3 rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
