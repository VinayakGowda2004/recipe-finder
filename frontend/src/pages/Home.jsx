import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const CATEGORIES = [
  "All",
  "Vegetarian",
  "Non-Vegetarian",
  "Dessert",
  "Quick Meals",
  "Coffees",
  "Soups",
];

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
        response = await axios.post(`${API_URL}/get-recipe`, {
          ingredients: ingredients.split(",").map((ing) => ing.trim()),
          category: category === "All" ? "" : category, // Send empty string for "All"
        });
      } else {
        // If ingredients are empty, get all recipes for the selected category (or all if "All")
        response = await axios.get(
          `${API_URL}/get-recipes?category=${
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

  const tagColor =
    category === "Vegetarian"
      ? { backgroundColor: "rgba(143,214,148,0.18)", color: "#8FD694" }
      : category === "Non-Vegetarian"
        ? { backgroundColor: "rgba(255,122,92,0.18)", color: "#FF7A5C" }
        : category !== "All"
          ? { backgroundColor: "rgba(255,182,72,0.18)", color: "#FFB648" }
          : null;

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #3B1F39 0%, #D1502F 100%)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
        .rf-font { font-family: 'Inter', sans-serif; }
        .rf-display { font-family: 'Poppins', sans-serif; }
        .rf-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* decorative line art */}
      <svg
        className="absolute top-0 left-0 pointer-events-none opacity-30"
        width="220"
        height="220"
        viewBox="0 0 220 220"
        fill="none"
      >
        <path
          d="M10 120 C 60 40, 140 40, 150 10"
          stroke="#FBF3E7"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="190" cy="30" r="3" fill="#FBF3E7" />
      </svg>

      <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
        {/* Top label */}
        <div className="flex items-center justify-between mb-10 sm:mb-14">
          <span
            className="rf-display text-lg sm:text-xl"
            style={{ color: "#FBF3E7" }}
          >
            Pantry<span style={{ color: "#FFB648" }}>Plate</span>
          </span>
          <span
            className="rf-font text-xs sm:text-sm hidden sm:block"
            style={{ color: "rgba(251,243,231,0.6)" }}
          >
            Real recipes from what's already in your kitchen
          </span>
        </div>

        {/* Hero */}
        <div className="max-w-2xl mb-10 sm:mb-12">
          <h1
            className="rf-display text-4xl sm:text-5xl lg:text-6xl leading-[1.1] mb-4"
            style={{ color: "#FBF3E7" }}
          >
            What's in your
            <br />
            kitchen?
          </h1>
          <p
            className="rf-font text-base sm:text-lg"
            style={{ color: "rgba(251,243,231,0.75)" }}
          >
            List your ingredients or pick a category — we'll match you with
            recipes you can actually cook.
          </p>
        </div>

        {/* Search console */}
        <div
          className="rounded-3xl p-4 sm:p-5 mb-10 sm:mb-12"
          style={{ backgroundColor: "rgba(0,0,0,0.28)" }}
        >
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="tomato, onion, cheese..."
              className="rf-font flex-1 px-5 py-3 rounded-2xl border-0 focus:outline-none text-base"
              style={{ backgroundColor: "#FBF3E7", color: "#1C1620" }}
            />
            <button
              onClick={handleSearch}
              className="rf-display px-8 py-3 rounded-2xl font-semibold transition-transform hover:scale-[1.02] whitespace-nowrap"
              style={{ backgroundColor: "#FFB648", color: "#1C1620" }}
            >
              Find recipes
            </button>
          </div>

          <div className="rf-scroll flex gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="rf-font px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors flex-shrink-0"
                style={
                  category === cat
                    ? { backgroundColor: "#FBF3E7", color: "#1C1620" }
                    : {
                        backgroundColor: "rgba(251,243,231,0.12)",
                        color: "#FBF3E7",
                      }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        {error && (
          <p className="rf-font mb-8 text-sm px-1" style={{ color: "#FFD9C7" }}>
            {error}
          </p>
        )}
        {loading && (
          <p
            className="rf-font mb-8 text-sm px-1"
            style={{ color: "rgba(251,243,231,0.75)" }}
          >
            Searching your pantry…
          </p>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {recipes.map((recipe, index) => (
            <motion.div
              key={recipe.id || recipe._id}
              onClick={() => handleViewRecipe(recipe.id || recipe._id)}
              className="cursor-pointer rounded-3xl overflow-hidden group"
              style={{ backgroundColor: "#1C1620" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className="w-full aspect-[4/3] overflow-hidden"
                style={{ backgroundColor: "#2A2028" }}
              >
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center rf-font text-sm"
                    style={{ color: "rgba(251,243,231,0.4)" }}
                  >
                    No photo yet
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-5">
                {tagColor && (
                  <span
                    className="rf-font inline-block text-xs px-3 py-1 rounded-full mb-2"
                    style={tagColor}
                  >
                    {category}
                  </span>
                )}
                <h2
                  className="rf-display text-lg sm:text-xl mb-1"
                  style={{ color: "#FBF3E7" }}
                >
                  {recipe.name}
                </h2>
                <p
                  className="rf-font text-sm leading-relaxed"
                  style={{ color: "rgba(251,243,231,0.65)" }}
                >
                  {recipe.description.length > 100
                    ? `${recipe.description.substring(0, 100)}...`
                    : recipe.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
