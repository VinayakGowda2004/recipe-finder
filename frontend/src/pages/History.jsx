import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const RECIPES_PER_PAGE = 5;

const History = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recipe view history
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("❌ You need to log in to view your history.");
        setLoading(false);
        return;
      }

      const res = await axios.get("http://localhost:5000/api/history", {
        headers: { Authorization: `Bearer ${token}` },
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

  // Navigation
  const handleRecipeClick = (id) => {
    navigate(`/recipe/${id}`);
  };

  // Delete all history
  const handleDeleteHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete("http://localhost:5000/api/history/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory([]);
    } catch (err) {
      setError("❌ Failed to clear history.");
    }
  };

  // Delete single history item
  const handleDeleteSingleHistory = async (historyId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`http://localhost:5000/api/history/${historyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory((prev) => prev.filter((item) => item._id !== historyId));
    } catch (err) {
      setError("❌ Failed to delete history item.");
    }
  };

  // Filter out null recipes before pagination
  const filteredHistory = history.filter((item) => item.recipeId);
  const totalPages = Math.ceil(filteredHistory.length / RECIPES_PER_PAGE);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * RECIPES_PER_PAGE,
    currentPage * RECIPES_PER_PAGE,
  );

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-200 min-h-screen p-6">
      <motion.div
        className="bg-white rounded-2xl shadow-xl p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h1
          className="text-4xl font-extrabold text-center text-orange-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          🕰 Your Recipe History
        </motion.h1>

        {error && (
          <motion.p
            className="text-center text-red-500 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {error}
          </motion.p>
        )}

        {loading ? (
          <motion.p
            className="text-center text-lg animate-pulse mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            ⏳ Loading your history...
          </motion.p>
        ) : filteredHistory.length === 0 ? (
          <motion.p
            className="text-center text-gray-500 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            🫤 No history found. Start exploring recipes!
          </motion.p>
        ) : (
          <>
            <motion.div
              className="mt-6 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {paginatedHistory.map((item) => {
                const recipe = item.recipeId;
                return (
                  <div
                    key={item._id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-orange-100 rounded-lg shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full">
                      <img
                        src={recipe.imageUrl || "/default-image.jpg"}
                        alt={recipe.name}
                        className="w-28 h-28 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3
                          className="text-lg font-semibold text-orange-800 cursor-pointer"
                          onClick={() => handleRecipeClick(recipe._id)}
                        >
                          {recipe.name}
                        </h3>
                        <p className="text-gray-600 text-sm italic">
                          {recipe.description}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {recipe.category}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSingleHistory(item._id)}
                      className="text-red-500 hover:text-red-700 mt-2 sm:mt-0 sm:ml-4"
                    >
                      🗑 Delete
                    </button>
                  </div>
                );
              })}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="bg-orange-600 text-white rounded-lg px-4 py-2 disabled:bg-gray-400"
                >
                  ← Previous
                </button>
                <span className="text-orange-700 font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="bg-orange-600 text-white rounded-lg px-4 py-2 disabled:bg-gray-400"
                >
                  Next →
                </button>
              </div>
            )}

            {/* Clear All Button */}
            <div className="text-center mt-6">
              <button
                onClick={handleDeleteHistory}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                🧹 Clear All History
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default History;
