import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const RECIPES_PER_PAGE = 5;

const History = () => {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ================= FETCH RECIPE VIEW HISTORY =================
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("❌ You need to log in to view your history.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_URL}/api/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (Array.isArray(res.data)) {
        setHistory(res.data);
      } else {
        setError("❌ Invalid history data format.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("❌ Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ================= NAVIGATION =================
  const handleRecipeClick = (id) => {
    navigate(`/recipe/${id}`);
  };

  // ================= DELETE ALL HISTORY =================
  const handleDeleteHistory = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      await axios.delete(`${API_URL}/api/history/clear`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHistory([]);
      setCurrentPage(1);
    } catch (err) {
      setError("❌ Failed to clear history.");
    }
  };

  // ================= DELETE SINGLE HISTORY ITEM =================
  const handleDeleteSingleHistory = async (historyId) => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      await axios.delete(`${API_URL}/api/history/${historyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHistory((prev) => prev.filter((item) => item._id !== historyId));
    } catch (err) {
      setError("❌ Failed to delete history item.");
    }
  };

  // ================= FILTER + PAGINATION =================
  const filteredHistory = history.filter((item) => item.recipeId);

  const totalPages = Math.ceil(filteredHistory.length / RECIPES_PER_PAGE);

  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE,
  );

  return (
    <div
      className="min-h-screen p-5 sm:p-8 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #3B1F39 0%, #D1502F 100%)",
      }}
    >
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

      {/* ================= DECORATIVE SVG TOP RIGHT ================= */}
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

      {/* ================= DECORATIVE SVG BOTTOM LEFT ================= */}
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

      {/* ================= MAIN CARD ================= */}
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
            style={{
              color: "#FBF3E7",
            }}
          >
            Pantry
            <span style={{ color: "#FFB648" }}>Plate</span>
          </span>
        </div>

        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h1
            className="rf-display text-3xl sm:text-4xl lg:text-5xl font-bold"
            style={{
              color: "#FBF3E7",
            }}
          >
            🕰 Your Recipe History
          </h1>

          <p
            className="rf-font text-sm mt-3"
            style={{
              color: "rgba(251,243,231,0.65)",
            }}
          >
            Revisit the recipes you've explored before.
          </p>
        </motion.div>

        {/* ================= ERROR ================= */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 rounded-2xl text-center"
            style={{
              backgroundColor: "rgba(255,80,80,0.12)",
              border: "1px solid rgba(255,120,120,0.2)",
            }}
          >
            <p
              className="rf-font text-sm"
              style={{
                color: "#ffb4b4",
              }}
            >
              {error}
            </p>
          </motion.div>
        )}

        {/* ================= LOADING ================= */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div
              className="w-12 h-12 rounded-full border-4 animate-spin mb-5"
              style={{
                borderColor: "rgba(251,243,231,0.15)",
                borderTopColor: "#FFB648",
              }}
            />

            <p
              className="rf-font text-sm animate-pulse"
              style={{
                color: "rgba(251,243,231,0.7)",
              }}
            >
              ⏳ Loading your history...
            </p>
          </motion.div>
        ) : filteredHistory.length === 0 ? (
          /* ================= EMPTY STATE ================= */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 text-center rounded-3xl p-10"
            style={{
              backgroundColor: "rgba(251,243,231,0.06)",
              border: "1px solid rgba(251,243,231,0.1)",
            }}
          >
            <div className="text-5xl mb-5">🫤</div>

            <h2
              className="rf-display text-xl sm:text-2xl"
              style={{
                color: "#FBF3E7",
              }}
            >
              No history yet
            </h2>

            <p
              className="rf-font text-sm mt-2"
              style={{
                color: "rgba(251,243,231,0.6)",
              }}
            >
              Start exploring recipes and they'll appear here.
            </p>

            <button
              onClick={() => navigate("/")}
              className="rf-display mt-6 px-6 py-3 rounded-2xl font-semibold transition-transform hover:scale-[1.02]"
              style={{
                backgroundColor: "#FFB648",
                color: "#1C1620",
              }}
            >
              🍳 Explore Recipes
            </button>
          </motion.div>
        ) : (
          <>
            {/* ================= HISTORY LIST ================= */}
            <motion.div
              className="mt-8 space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              {paginatedHistory.map((item, index) => {
                const recipe = item.recipeId;

                return (
                  <motion.div
                    key={item._id}
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.07,
                    }}
                    className="group flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-3xl transition-transform hover:scale-[1.01]"
                    style={{
                      backgroundColor: "rgba(251,243,231,0.08)",
                      border: "1px solid rgba(251,243,231,0.1)",
                    }}
                  >
                    {/* ================= RECIPE INFO ================= */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full min-w-0">
                      {/* Image */}
                      <div
                        className="flex-shrink-0 p-1 rounded-2xl"
                        style={{
                          backgroundColor: "rgba(251,243,231,0.08)",
                        }}
                      >
                        <img
                          src={recipe.imageUrl || "/default-image.jpg"}
                          alt={recipe.name}
                          className="w-full sm:w-28 h-40 sm:h-28 object-cover rounded-xl"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="rf-display text-lg sm:text-xl font-semibold cursor-pointer truncate"
                          style={{
                            color: "#FBF3E7",
                          }}
                          onClick={() => handleRecipeClick(recipe._id)}
                        >
                          {recipe.name}
                        </h3>

                        {recipe.description && (
                          <p
                            className="rf-font text-sm mt-1 line-clamp-2"
                            style={{
                              color: "rgba(251,243,231,0.6)",
                            }}
                          >
                            {recipe.description}
                          </p>
                        )}

                        {recipe.category && (
                          <span
                            className="rf-font inline-block mt-3 px-3 py-1 rounded-full text-xs"
                            style={{
                              backgroundColor: "rgba(255,182,72,0.15)",
                              color: "#FFB648",
                            }}
                          >
                            {recipe.category}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ================= DELETE BUTTON ================= */}
                    <button
                      onClick={() => handleDeleteSingleHistory(item._id)}
                      className="rf-font mt-4 sm:mt-0 sm:ml-5 flex-shrink-0 px-4 py-2 rounded-xl text-sm transition-colors"
                      style={{
                        backgroundColor: "rgba(255,100,100,0.1)",
                        color: "#ffb4b4",
                      }}
                    >
                      🗑 Delete
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* ================= PAGINATION ================= */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-7 p-4 rounded-3xl"
                style={{
                  backgroundColor: "rgba(251,243,231,0.06)",
                  border: "1px solid rgba(251,243,231,0.08)",
                }}
              >
                {/* Previous */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="rf-font w-full sm:w-auto px-5 py-2.5 rounded-2xl font-medium transition-transform hover:scale-[1.02] disabled:cursor-not-allowed"
                  style={{
                    backgroundColor:
                      currentPage === 1 ? "rgba(251,243,231,0.08)" : "#FFB648",
                    color:
                      currentPage === 1 ? "rgba(251,243,231,0.3)" : "#1C1620",
                  }}
                >
                  ← Previous
                </button>

                {/* Page Number */}
                <span
                  className="rf-font text-sm font-semibold"
                  style={{
                    color: "#FBF3E7",
                  }}
                >
                  Page <span style={{ color: "#FFB648" }}>{currentPage}</span>{" "}
                  of {totalPages}
                </span>

                {/* Next */}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="rf-font w-full sm:w-auto px-5 py-2.5 rounded-2xl font-medium transition-transform hover:scale-[1.02] disabled:cursor-not-allowed"
                  style={{
                    backgroundColor:
                      currentPage === totalPages
                        ? "rgba(251,243,231,0.08)"
                        : "#FFB648",
                    color:
                      currentPage === totalPages
                        ? "rgba(251,243,231,0.3)"
                        : "#1C1620",
                  }}
                >
                  Next →
                </button>
              </motion.div>
            )}

            {/* ================= CLEAR ALL ================= */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="text-center mt-7"
            >
              <button
                onClick={handleDeleteHistory}
                className="rf-font px-6 py-3 rounded-2xl font-semibold transition-transform hover:scale-[1.02]"
                style={{
                  backgroundColor: "rgba(255,80,80,0.12)",
                  color: "#ffb4b4",
                  border: "1px solid rgba(255,120,120,0.15)",
                }}
              >
                🧹 Clear All History
              </button>
            </motion.div>
          </>
        )}

        {/* ================= BACK HOME ================= */}
        {!loading && (
          <motion.button
            onClick={() => navigate("/")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="rf-display mt-7 w-full py-3 rounded-2xl font-semibold transition-transform"
            style={{
              backgroundColor: "#FFB648",
              color: "#1C1620",
            }}
          >
            🔙 Back to Home
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default History;
