import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DeleteRecipe = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const token = localStorage.getItem("token");

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

  const handleDelete = async (id) => {
    if (!token) {
      alert("❌ Unauthorized: Please log in.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this recipe?")) return;

    try {
      const response = await axios.delete(`${API_BASE}/delete-recipe/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
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
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow mt-10">
      <h3 className="text-xl font-semibold mb-4">Delete a Recipe</h3>

      {loading ? (
        <p>Loading recipes...</p>
      ) : recipes.length === 0 ? (
        <p>No recipes available.</p>
      ) : (
        <ul className="space-y-3">
          {recipes.map((recipe) => (
            <li
              key={recipe._id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <span className="font-medium">{recipe.name}</span>
              <button
                onClick={() => handleDelete(recipe._id)}
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded"
                title={`Delete recipe "${recipe.name}"`}
              >
                🗑️ Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {message && (
        <p
          className={`mt-4 text-center font-semibold ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default DeleteRecipe;
