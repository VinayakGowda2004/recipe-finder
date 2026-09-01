import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DeleteRecipe = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");

  // ================= FETCH RECIPES =================
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(`${API_BASE}/get-recipes`);

        setRecipes(response.data);
      } catch (error) {
        console.error("❌ Error fetching recipes:", error);

        setMessage("❌ Failed to fetch recipes.");
      }

      setLoading(false);
    };

    fetchRecipes();
  }, []);

  // ================= DELETE RECIPE =================
  const handleDelete = async (id) => {
    if (!token) {
      alert("❌ Unauthorized: Please log in.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE}/delete-recipe/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setRecipes((prevRecipes) =>
          prevRecipes.filter((recipe) => recipe._id !== id),
        );

        setMessage("✅ Recipe deleted successfully!");
      }
    } catch (error) {
      console.error("❌ Error deleting recipe:", error);

      const errMsg =
        error.response?.data?.message || "❌ Failed to delete recipe.";

      setMessage(errMsg);
    }
  };

  return (
    <div className="w-full">
      {/* ================= FONTS ================= */}
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

      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <h3
          className="rf-display text-xl sm:text-2xl"
          style={{
            color: "#FBF3E7",
          }}
        >
          🗑️ Delete a Recipe
        </h3>

        <p
          className="rf-font text-sm mt-1"
          style={{
            color: "rgba(251,243,231,0.6)",
          }}
        >
          Remove recipes that you no longer want in your PantryPlate collection.
        </p>
      </div>

      {/* ================= MESSAGE ================= */}
      {message && (
        <div
          className="rf-font mb-5 p-4 rounded-2xl text-sm font-medium"
          style={{
            backgroundColor: message.startsWith("✅")
              ? "rgba(74,222,128,0.12)"
              : "rgba(248,113,113,0.12)",

            border: message.startsWith("✅")
              ? "1px solid rgba(74,222,128,0.25)"
              : "1px solid rgba(248,113,113,0.25)",

            color: message.startsWith("✅") ? "#86efac" : "#fca5a5",
          }}
        >
          {message}
        </div>
      )}

      {/* ================= LOADING ================= */}
      {loading ? (
        <div
          className="flex flex-col items-center justify-center py-14 rounded-3xl"
          style={{
            backgroundColor: "rgba(251,243,231,0.06)",
            border: "1px solid rgba(251,243,231,0.1)",
          }}
        >
          {/* Loading spinner */}
          <div
            className="w-10 h-10 border-4 rounded-full animate-spin mb-4"
            style={{
              borderColor: "rgba(255,182,72,0.25)",
              borderTopColor: "#FFB648",
            }}
          />

          <p
            className="rf-font text-sm"
            style={{
              color: "rgba(251,243,231,0.65)",
            }}
          >
            Loading recipes...
          </p>
        </div>
      ) : recipes.length === 0 ? (
        /* ================= EMPTY STATE ================= */
        <div
          className="text-center py-14 px-5 rounded-3xl"
          style={{
            backgroundColor: "rgba(251,243,231,0.06)",
            border: "1px solid rgba(251,243,231,0.1)",
          }}
        >
          <div className="text-5xl mb-4">🍽️</div>

          <h4
            className="rf-display text-lg"
            style={{
              color: "#FBF3E7",
            }}
          >
            No recipes available
          </h4>

          <p
            className="rf-font text-sm mt-2"
            style={{
              color: "rgba(251,243,231,0.55)",
            }}
          >
            There are currently no recipes to delete.
          </p>
        </div>
      ) : (
        /* ================= RECIPE LIST ================= */
        <div>
          {/* List heading */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p
                className="rf-font text-sm font-medium"
                style={{
                  color: "#FBF3E7",
                }}
              >
                Available Recipes
              </p>

              <p
                className="rf-font text-xs mt-1"
                style={{
                  color: "rgba(251,243,231,0.45)",
                }}
              >
                {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}{" "}
                available
              </p>
            </div>

            <span
              className="rf-font text-xs px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: "rgba(255,182,72,0.14)",
                color: "#FFB648",
              }}
            >
              Admin
            </span>
          </div>

          {/* Recipe List */}
          <div className="space-y-3">
            {recipes.map((recipe) => (
              <div
                key={recipe._id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl transition-all duration-200"
                style={{
                  backgroundColor: "rgba(251,243,231,0.06)",
                  border: "1px solid rgba(251,243,231,0.1)",
                }}
              >
                {/* ================= IMAGE ================= */}
                <div className="flex-shrink-0">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl"
                      style={{
                        backgroundColor: "rgba(251,243,231,0.08)",
                      }}
                    >
                      🍽️
                    </div>
                  )}
                </div>

                {/* ================= RECIPE INFO ================= */}
                <div className="flex-1 min-w-0">
                  <h4
                    className="rf-display text-base sm:text-lg font-semibold truncate"
                    style={{
                      color: "#FBF3E7",
                    }}
                  >
                    {recipe.name}
                  </h4>

                  {recipe.category && (
                    <span
                      className="rf-font inline-block text-xs mt-1 px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: "rgba(255,182,72,0.12)",
                        color: "#FFB648",
                      }}
                    >
                      {recipe.category}
                    </span>
                  )}

                  {recipe.description && (
                    <p
                      className="rf-font text-xs sm:text-sm mt-2 line-clamp-2"
                      style={{
                        color: "rgba(251,243,231,0.5)",
                      }}
                    >
                      {recipe.description}
                    </p>
                  )}
                </div>

                {/* ================= DELETE BUTTON ================= */}
                <button
                  type="button"
                  onClick={() => handleDelete(recipe._id)}
                  className="rf-font flex-shrink-0 w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                  style={{
                    backgroundColor: "rgba(239,68,68,0.12)",
                    color: "#fca5a5",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                  title={`Delete recipe "${recipe.name}"`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ef4444";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(239,68,68,0.12)";
                    e.currentTarget.style.color = "#fca5a5";
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteRecipe;
