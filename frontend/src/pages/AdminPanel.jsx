import React from "react";
import AddRecipe from "../components/AddRecipe";
import DeleteRecipe from "../components/DeleteRecipe";
import EditRecipe from "../components/EditRecipe";

const AdminPanel = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-200 to-purple-300 p-6">
      <div className="bg-white bg-opacity-90 shadow-2xl rounded-2xl p-8 w-full max-w-3xl backdrop-blur-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          🛠️ Admin Panel
        </h2>

        <div className="space-y-8">
          <div className="p-6 bg-blue-100 border-l-8 border-blue-500 rounded-lg shadow-md transition-transform transform hover:scale-105">
            <h3 className="text-xl font-bold text-blue-700 mb-3">➕ Add Recipe</h3>
            <AddRecipe />
          </div>

          <div className="p-6 bg-red-100 border-l-8 border-red-500 rounded-lg shadow-md transition-transform transform hover:scale-105">
            <h3 className="text-xl font-bold text-red-700 mb-3">🗑️ Delete Recipe</h3>
            <DeleteRecipe />
          </div>

          <EditRecipe />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
