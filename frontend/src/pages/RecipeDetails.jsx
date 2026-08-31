import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const RecipeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [people, setPeople] = useState(1);
  const [adjustedTime, setAdjustedTime] = useState("");
  const [adjustedPeople, setAdjustedPeople] = useState(null);

  const [originalIngredients, setOriginalIngredients] = useState([]);
  const [displayIngredients, setDisplayIngredients] = useState([]);
  const [originalInstructions, setOriginalInstructions] = useState([]);
  const [displayInstructions, setDisplayInstructions] = useState([]);

  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/get-recipe/${id}`);
        const data = response.data;

        setRecipe(data);

        const ingredients = data.ingredients || [];
        const instructions = Array.isArray(data.instructions)
          ? data.instructions
          : typeof data.instructions === "string"
            ? data.instructions.split("\n")
            : [];

        setOriginalIngredients(ingredients);
        setOriginalInstructions(instructions);
        setDisplayIngredients(ingredients);
        setDisplayInstructions([]);
        setShowVideo(false);
      } catch (err) {
        setError("❌ Failed to load recipe details.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  useEffect(() => {
    if (recipe) {
      const token = localStorage.getItem("token");

      const saveHistoryToBackend = async () => {
        try {
          await axios.post(
            `${API_URL}/api/history`,
            {
              recipeId: recipe._id,
              name: recipe.name,
              imageUrl: recipe.imageUrl,
              category: recipe.category,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
        } catch (err) {
          console.error("⚠ Failed to save recipe history:", err);
        }
      };

      if (token) saveHistoryToBackend();
    }
  }, [recipe]);

  const cleanNaNText = (text) =>
    text.replace(/NaN/g, "some").replace(/undefined/g, "");
  const cleanStepPrefix = (line) => line.replace(/^step\s*\d+[:.-]?\s*/i, "");

  const handleGenerate = async () => {
    try {
      const response = await axios.post(`${API_URL}/ai-preparation`, {
        instructions: originalInstructions.join("\n"),
        ingredients: originalIngredients,
        people,
      });

      const aiInstructions = response.data.stepByStep || "";
      const aiInstructionsArray = Array.isArray(aiInstructions)
        ? aiInstructions
        : typeof aiInstructions === "string"
          ? aiInstructions.split("\n")
          : [];

      const cleanedSteps = aiInstructionsArray.map((line) =>
        cleanStepPrefix(cleanNaNText(line)),
      );

      setDisplayInstructions(cleanedSteps);
      setDisplayIngredients(
        (response.data.adjustedIngredients || []).map((ing) =>
          cleanNaNText(ing),
        ),
      );

      setAdjustedTime(response.data.time || "");
      setAdjustedPeople(people);
      setShowVideo(true);
    } catch (err) {
      setError("❌ Failed to generate steps.");
    }
  };

  const handlePeopleChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 25) {
      setPeople(value);
    }
  };

  if (loading)
    return (
      <p className="text-center text-lg animate-pulse">
        ⏳ Loading recipe details...
      </p>
    );

  if (error) return <p className="text-center text-red-500 text-lg">{error}</p>;

  if (!recipe)
    return <p className="text-center text-red-500">❌ Recipe not found.</p>;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-orange-50 to-orange-200 p-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-4xl transform hover:scale-[1.02] transition duration-300"
      >
        <motion.h1 className="text-5xl font-extrabold text-center text-orange-700">
          🍽 {recipe.name}
        </motion.h1>

        {recipe.description && (
          <motion.p className="text-gray-600 text-center mt-3 italic text-lg">
            {recipe.description}
          </motion.p>
        )}

        {recipe.imageUrl && (
          <div className="flex justify-center mt-6">
            <img
              src={recipe.imageUrl}
              alt={recipe.name}
              className="max-w-full max-h-[400px] object-cover rounded-2xl shadow-md"
            />
          </div>
        )}

        <motion.div className="mt-6 p-6 border border-gray-300 rounded-xl shadow-md bg-white">
          <h3 className="text-2xl font-semibold text-orange-800">
            🛒 Ingredients
          </h3>
          <ul className="grid grid-cols-2 gap-3 mt-3 text-gray-700">
            {displayIngredients.map((ingredient, index) => (
              <li
                key={index}
                className="bg-orange-100 p-2 rounded-lg shadow-sm"
              >
                ✅ {ingredient}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          className="mt-6 p-6 border border-gray-300 rounded-xl shadow-md bg-orange-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-semibold text-orange-800">
            🤖 Assisted Preparation
          </h3>

          <div className="flex items-center mt-3 flex-wrap gap-3">
            <label className="font-medium text-lg">🔢 Number of People:</label>
            <input
              type="number"
              min="1"
              max="25"
              value={people}
              onChange={handlePeopleChange}
              className="border rounded-lg p-2 w-20 text-center shadow-md"
            />
            <button
              onClick={handleGenerate}
              className="px-5 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold shadow-lg"
            >
              🔄 View Steps
            </button>
          </div>

          {adjustedTime && (
            <p className="mt-3 text-gray-700 text-lg">
              ⏳ Adjusted Time: {adjustedTime}
            </p>
          )}

          {adjustedPeople && (
            <p className="mt-1 text-gray-700 text-lg">
              👥 Adjusted for {adjustedPeople} people
            </p>
          )}

          {displayInstructions.length > 0 ? (
            <>
              <h3 className="text-xl font-semibold mt-4">📜 Instructions</h3>
              <ol className="list-decimal pl-5 text-gray-800 mt-2 bg-white p-4 rounded-lg shadow-inner space-y-2">
                {displayInstructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </>
          ) : (
            <p className="mt-4 text-gray-500 italic">
              📌 Click "View Steps" to see preparation instructions.
            </p>
          )}

          {showVideo && recipe.videoUrl && (
            <motion.div
              className="mt-6 p-6 border border-gray-300 rounded-xl shadow-md bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-2xl font-semibold text-orange-800 mb-4">
                🎬 Recipe Video
              </h3>
              <video
                controls
                className="w-full max-h-[500px] rounded-lg shadow-lg border border-orange-200"
              >
                <source src={recipe.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </motion.div>
          )}
        </motion.div>

        <motion.button
          onClick={() => {
            sessionStorage.setItem("restoreFromDetails", "true");
            navigate("/");
          }}
          className="mt-6 px-6 py-3 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition w-full text-lg font-semibold shadow-xl"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔙 Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default RecipeDetails;
