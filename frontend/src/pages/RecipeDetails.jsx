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

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-5"
        style={{
          background: "linear-gradient(135deg, #3B1F39 0%, #D1502F 100%)",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

          .rf-font {
            font-family: 'Inter', sans-serif;
          }

          .rf-display {
            font-family: 'Poppins', sans-serif;
          }
        `}</style>

        <div
          className="rounded-3xl p-8 text-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.32)",
          }}
        >
          <p
            className="rf-font text-lg animate-pulse"
            style={{ color: "#FBF3E7" }}
          >
            ⏳ Loading recipe details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-5"
        style={{
          background: "linear-gradient(135deg, #3B1F39 0%, #D1502F 100%)",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

          .rf-font {
            font-family: 'Inter', sans-serif;
          }

          .rf-display {
            font-family: 'Poppins', sans-serif;
          }
        `}</style>

        <div
          className="rounded-3xl p-8 text-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.32)",
          }}
        >
          <p className="rf-font text-lg" style={{ color: "#FBF3E7" }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-5"
        style={{
          background: "linear-gradient(135deg, #3B1F39 0%, #D1502F 100%)",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

          .rf-font {
            font-family: 'Inter', sans-serif;
          }

          .rf-display {
            font-family: 'Poppins', sans-serif;
          }
        `}</style>

        <div
          className="rounded-3xl p-8 text-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.32)",
          }}
        >
          <p className="rf-font text-lg" style={{ color: "#FBF3E7" }}>
            ❌ Recipe not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-5 sm:p-8 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #3B1F39 0%, #D1502F 100%)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

        .rf-font {
          font-family: 'Inter', sans-serif;
        }

        .rf-display {
          font-family: 'Poppins', sans-serif;
        }

        .rf-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .rf-scroll::-webkit-scrollbar-track {
          background: rgba(251,243,231,0.08);
          border-radius: 10px;
        }

        .rf-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,182,72,0.6);
          border-radius: 10px;
        }
      `}</style>

      {/* Decorative SVG - Top Right */}
      <svg
        className="absolute top-6 right-6 pointer-events-none opacity-30"
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
      >
        <path
          d="M10 140 C 60 60, 100 100, 150 20"
          stroke="#FBF3E7"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="20" cy="30" r="3" fill="#FBF3E7" />
      </svg>

      {/* Decorative SVG - Bottom Left */}
      <svg
        className="absolute bottom-6 left-6 pointer-events-none opacity-20"
        width="130"
        height="130"
        viewBox="0 0 130 130"
        fill="none"
      >
        <path
          d="M15 110 C 50 80, 75 95, 115 20"
          stroke="#FFB648"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="105" cy="105" r="4" fill="#FFB648" />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto w-full max-w-5xl rounded-3xl p-6 sm:p-8 lg:p-10"
        style={{
          backgroundColor: "rgba(0,0,0,0.32)",
        }}
      >
        {/* ================= BRAND ================= */}
        <div className="mb-8">
          <span
            className="rf-display text-lg block"
            style={{ color: "#FBF3E7" }}
          >
            Pantry
            <span style={{ color: "#FFB648" }}>Plate</span>
          </span>
        </div>

        {/* ================= RECIPE HEADER ================= */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rf-display text-3xl sm:text-4xl lg:text-5xl font-bold"
            style={{ color: "#FBF3E7" }}
          >
            🍽 {recipe.name}
          </motion.h1>

          {recipe.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="rf-font text-sm sm:text-base mt-3 max-w-2xl mx-auto"
              style={{
                color: "rgba(251,243,231,0.7)",
              }}
            >
              {recipe.description}
            </motion.p>
          )}
        </div>

        {/* ================= RECIPE IMAGE ================= */}
        {recipe.imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="flex justify-center mt-7"
          >
            <div
              className="p-2 rounded-3xl"
              style={{
                backgroundColor: "rgba(251,243,231,0.08)",
              }}
            >
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-full max-w-2xl max-h-[420px] object-cover rounded-2xl"
              />
            </div>
          </motion.div>
        )}

        {/* ================= INGREDIENTS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-7 p-5 sm:p-6 rounded-3xl"
          style={{
            backgroundColor: "rgba(251,243,231,0.08)",
            border: "1px solid rgba(251,243,231,0.12)",
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3
              className="rf-display text-xl sm:text-2xl"
              style={{ color: "#FBF3E7" }}
            >
              🛒 Ingredients
            </h3>

            {adjustedPeople && (
              <span
                className="rf-font text-xs sm:text-sm px-3 py-1.5 rounded-full"
                style={{
                  backgroundColor: "rgba(255,182,72,0.18)",
                  color: "#FFB648",
                }}
              >
                For {adjustedPeople} people
              </span>
            )}
          </div>

          {displayIngredients.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayIngredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="rf-font p-3 rounded-2xl text-sm sm:text-base"
                  style={{
                    backgroundColor: "rgba(251,243,231,0.08)",
                    color: "#FBF3E7",
                  }}
                >
                  <span style={{ color: "#FFB648" }}>✓</span> {ingredient}
                </li>
              ))}
            </ul>
          ) : (
            <p
              className="rf-font text-sm"
              style={{
                color: "rgba(251,243,231,0.55)",
              }}
            >
              No ingredients available.
            </p>
          )}
        </motion.div>

        {/* ================= AI PREPARATION ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-6 p-5 sm:p-6 rounded-3xl"
          style={{
            backgroundColor: "rgba(251,243,231,0.08)",
            border: "1px solid rgba(251,243,231,0.12)",
          }}
        >
          <h3
            className="rf-display text-xl sm:text-2xl"
            style={{ color: "#FBF3E7" }}
          >
            🤖 Assisted Preparation
          </h3>

          <p
            className="rf-font text-sm mt-1"
            style={{
              color: "rgba(251,243,231,0.6)",
            }}
          >
            Tell us how many people you're cooking for and we'll adjust the
            recipe for you.
          </p>

          {/* People + Generate */}
          <div className="flex items-center mt-5 flex-wrap gap-3">
            <label
              className="rf-font text-sm sm:text-base"
              style={{ color: "#FBF3E7" }}
            >
              🔢 Number of People
            </label>

            <input
              type="number"
              min="1"
              max="25"
              value={people}
              onChange={handlePeopleChange}
              className="rf-font border-0 outline-none w-20 text-center px-3 py-2.5 rounded-xl"
              style={{
                backgroundColor: "#FBF3E7",
                color: "#1C1620",
              }}
            />

            <button
              onClick={handleGenerate}
              className="rf-display px-5 py-2.5 rounded-2xl font-semibold transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: "#FFB648",
                color: "#1C1620",
              }}
            >
              🔄 View Steps
            </button>
          </div>

          {/* Adjusted Information */}
          {(adjustedTime || adjustedPeople) && (
            <div className="flex flex-wrap gap-3 mt-5">
              {adjustedTime && (
                <div
                  className="rf-font px-4 py-2 rounded-2xl text-sm"
                  style={{
                    backgroundColor: "rgba(255,182,72,0.15)",
                    color: "#FFB648",
                  }}
                >
                  ⏳ Time: {adjustedTime}
                </div>
              )}

              {adjustedPeople && (
                <div
                  className="rf-font px-4 py-2 rounded-2xl text-sm"
                  style={{
                    backgroundColor: "rgba(255,182,72,0.15)",
                    color: "#FFB648",
                  }}
                >
                  👥 {adjustedPeople} people
                </div>
              )}
            </div>
          )}

          {/* ================= INSTRUCTIONS ================= */}
          {displayInstructions.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <h3
                className="rf-display text-lg sm:text-xl mb-4"
                style={{ color: "#FBF3E7" }}
              >
                📜 Instructions
              </h3>

              <ol className="space-y-3">
                {displayInstructions.map((step, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: index * 0.04,
                    }}
                    className="flex gap-4 p-4 rounded-2xl"
                    style={{
                      backgroundColor: "rgba(251,243,231,0.08)",
                    }}
                  >
                    <span
                      className="rf-display flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                      style={{
                        backgroundColor: "#FFB648",
                        color: "#1C1620",
                      }}
                    >
                      {index + 1}
                    </span>

                    <span
                      className="rf-font text-sm sm:text-base leading-relaxed"
                      style={{
                        color: "#FBF3E7",
                      }}
                    >
                      {step}
                    </span>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          ) : (
            <p
              className="rf-font mt-5 text-sm italic"
              style={{
                color: "rgba(251,243,231,0.5)",
              }}
            >
              📌 Click "View Steps" to see preparation instructions.
            </p>
          )}

          {/* ================= VIDEO ================= */}
          {showVideo && recipe.videoUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-7"
            >
              <h3
                className="rf-display text-xl sm:text-2xl mb-4"
                style={{ color: "#FBF3E7" }}
              >
                🎬 Recipe Video
              </h3>

              <div
                className="p-2 rounded-3xl"
                style={{
                  backgroundColor: "rgba(251,243,231,0.08)",
                }}
              >
                <video controls className="w-full max-h-[500px] rounded-2xl">
                  <source src={recipe.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ================= BACK BUTTON ================= */}
        <motion.button
          onClick={() => {
            sessionStorage.setItem("restoreFromDetails", "true");
            navigate("/");
          }}
          className="rf-display mt-6 w-full py-3 rounded-2xl font-semibold transition-transform"
          style={{
            backgroundColor: "#FFB648",
            color: "#1C1620",
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          🔙 Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default RecipeDetails;
