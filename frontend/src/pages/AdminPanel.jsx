import React, { useState } from "react";
import AddRecipe from "../components/AddRecipe";
import DeleteRecipe from "../components/DeleteRecipe";
import EditRecipe from "../components/EditRecipe";
import { motion, AnimatePresence } from "framer-motion";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("add");

  const tabs = [
    {
      id: "add",
      label: "Add Recipe",
      icon: "➕",
    },
    {
      id: "delete",
      label: "Delete Recipe",
      icon: "🗑️",
    },
    {
      id: "edit",
      label: "Edit Recipe",
      icon: "✏️",
    },
  ];

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

      {/* ================= MAIN CONTAINER ================= */}
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
          transition={{ delay: 0.15 }}
          className="text-center mb-8"
        >
          <h1
            className="rf-display text-3xl sm:text-4xl lg:text-5xl font-bold"
            style={{
              color: "#FBF3E7",
            }}
          >
            🛠️ Admin Panel
          </h1>

          <p
            className="rf-font text-sm mt-3"
            style={{
              color: "rgba(251,243,231,0.65)",
            }}
          >
            Manage your PantryPlate recipes from one place.
          </p>
        </motion.div>

        {/* ================= TABS ================= */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-3 gap-1 sm:gap-2 p-1.5 rounded-2xl mb-7"
          style={{
            backgroundColor: "rgba(251,243,231,0.08)",
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="rf-font relative py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: isActive ? "#FFB648" : "transparent",
                  color: isActive ? "#1C1620" : "rgba(251,243,231,0.65)",
                }}
              >
                <span className="mr-1 sm:mr-2">{tab.icon}</span>

                <span>{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* ================= ACTIVE TAB CONTENT ================= */}
        <AnimatePresence mode="wait">
          {activeTab === "add" && (
            <motion.div
              key="add"
              initial={{
                opacity: 0,
                x: -15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: 15,
              }}
              transition={{
                duration: 0.2,
              }}
              className="rounded-3xl p-5 sm:p-7"
              style={{
                backgroundColor: "rgba(251,243,231,0.08)",
                border: "1px solid rgba(251,243,231,0.1)",
              }}
            >
              {/* Add Header */}
              <div className="mb-6">
                <h2
                  className="rf-display text-xl sm:text-2xl"
                  style={{
                    color: "#FBF3E7",
                  }}
                >
                  ➕ Add Recipe
                </h2>

                <p
                  className="rf-font text-sm mt-1"
                  style={{
                    color: "rgba(251,243,231,0.6)",
                  }}
                >
                  Add a new recipe to your PantryPlate collection.
                </p>
              </div>

              {/* Existing AddRecipe component */}
              <AddRecipe />
            </motion.div>
          )}

          {activeTab === "delete" && (
            <motion.div
              key="delete"
              initial={{
                opacity: 0,
                x: 15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -15,
              }}
              transition={{
                duration: 0.2,
              }}
              className="rounded-3xl p-5 sm:p-7"
              style={{
                backgroundColor: "rgba(251,243,231,0.08)",
                border: "1px solid rgba(251,243,231,0.1)",
              }}
            >
              {/* Delete Header */}
              <div className="mb-6">
                <h2
                  className="rf-display text-xl sm:text-2xl"
                  style={{
                    color: "#FBF3E7",
                  }}
                >
                  🗑️ Delete Recipe
                </h2>

                <p
                  className="rf-font text-sm mt-1"
                  style={{
                    color: "rgba(251,243,231,0.6)",
                  }}
                >
                  Remove an existing recipe from your collection.
                </p>
              </div>

              {/* Existing DeleteRecipe component */}
              <DeleteRecipe />
            </motion.div>
          )}

          {activeTab === "edit" && (
            <motion.div
              key="edit"
              initial={{
                opacity: 0,
                x: 15,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -15,
              }}
              transition={{
                duration: 0.2,
              }}
              className="rounded-3xl p-5 sm:p-7"
              style={{
                backgroundColor: "rgba(251,243,231,0.08)",
                border: "1px solid rgba(251,243,231,0.1)",
              }}
            >
              {/* Edit Header */}
              <div className="mb-6">
                <h2
                  className="rf-display text-xl sm:text-2xl"
                  style={{
                    color: "#FBF3E7",
                  }}
                >
                  ✏️ Edit Recipe
                </h2>

                <p
                  className="rf-font text-sm mt-1"
                  style={{
                    color: "rgba(251,243,231,0.6)",
                  }}
                >
                  Update the details of an existing recipe.
                </p>
              </div>

              {/* Existing EditRecipe component */}
              <EditRecipe />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AdminPanel;
