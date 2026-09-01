import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AddRecipe = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ingredients: "",
    instructions: "",
    category: "",
  });

  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // ================= HANDLE FORM CHANGE =================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ================= HANDLE IMAGE =================
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // ================= HANDLE VIDEO =================
  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  // ================= SUBMIT RECIPE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, description, ingredients, instructions, category } = formData;

    // Validate required fields
    if (
      !name.trim() ||
      !description.trim() ||
      !ingredients.trim() ||
      !instructions.trim() ||
      !category.trim() ||
      !image
    ) {
      alert("❗ All fields including image and category are required.");
      return;
    }

    // Format ingredients
    const formattedIngredients = ingredients
      .split(",")
      .map((ing) => ing.trim().toLowerCase())
      .filter(Boolean);

    if (formattedIngredients.length === 0) {
      alert("❗ Please provide at least one valid ingredient.");
      return;
    }

    // Create FormData
    const recipeData = new FormData();

    recipeData.append("name", name.trim());
    recipeData.append("description", description.trim());
    recipeData.append("ingredients", JSON.stringify(formattedIngredients));
    recipeData.append("instructions", instructions.trim());
    recipeData.append("category", category.trim());
    recipeData.append("image", image);

    if (video) {
      recipeData.append("video", video);
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/add-recipe`, recipeData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      alert(response.data.message);

      // Reset form
      setFormData({
        name: "",
        description: "",
        ingredients: "",
        instructions: "",
        category: "",
      });

      setImage(null);
      setVideo(null);
    } catch (error) {
      console.error(
        "❌ Error adding recipe:",
        error.response?.data || error.message,
      );

      alert("❌ Failed to add recipe.");
    } finally {
      setLoading(false);
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

        .rf-input::placeholder {
          color: rgba(28, 22, 32, 0.48);
        }

        .rf-file::file-selector-button {
          border: none;
          background: #FFB648;
          color: #1C1620;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          border-radius: 10px;
          padding: 8px 12px;
          margin-right: 10px;
          cursor: pointer;
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
          🍳 Add a New Recipe
        </h3>

        <p
          className="rf-font text-sm mt-1"
          style={{
            color: "rgba(251,243,231,0.6)",
          }}
        >
          Add a delicious recipe to your PantryPlate collection.
        </p>
      </div>

      {/* ================= FORM ================= */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ================= RECIPE NAME ================= */}
        <div>
          <label
            className="rf-font block text-sm font-medium mb-2"
            style={{
              color: "#FBF3E7",
            }}
          >
            Recipe Name
          </label>

          <input
            type="text"
            name="name"
            placeholder="e.g. Creamy Garlic Pasta"
            value={formData.name}
            onChange={handleChange}
            required
            className="rf-font rf-input w-full px-4 py-3 rounded-2xl border-0 outline-none text-sm sm:text-base"
            style={{
              backgroundColor: "#FBF3E7",
              color: "#1C1620",
            }}
          />
        </div>

        {/* ================= DESCRIPTION ================= */}
        <div>
          <label
            className="rf-font block text-sm font-medium mb-2"
            style={{
              color: "#FBF3E7",
            }}
          >
            Short Description
          </label>

          <textarea
            name="description"
            placeholder="Give a short description of the recipe..."
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            className="rf-font rf-input w-full px-4 py-3 rounded-2xl border-0 outline-none text-sm sm:text-base resize-none"
            style={{
              backgroundColor: "#FBF3E7",
              color: "#1C1620",
            }}
          ></textarea>
        </div>

        {/* ================= INGREDIENTS ================= */}
        <div>
          <label
            className="rf-font block text-sm font-medium mb-2"
            style={{
              color: "#FBF3E7",
            }}
          >
            Ingredients
          </label>

          <textarea
            name="ingredients"
            placeholder="Ingredients separated by commas: tomato, onion, garlic, salt"
            value={formData.ingredients}
            onChange={handleChange}
            required
            rows="4"
            className="rf-font rf-input w-full px-4 py-3 rounded-2xl border-0 outline-none text-sm sm:text-base resize-none"
            style={{
              backgroundColor: "#FBF3E7",
              color: "#1C1620",
            }}
          ></textarea>

          <p
            className="rf-font text-xs mt-2"
            style={{
              color: "rgba(251,243,231,0.5)",
            }}
          >
            💡 Separate each ingredient using a comma.
          </p>
        </div>

        {/* ================= INSTRUCTIONS ================= */}
        <div>
          <label
            className="rf-font block text-sm font-medium mb-2"
            style={{
              color: "#FBF3E7",
            }}
          >
            Instructions
          </label>

          <textarea
            name="instructions"
            placeholder="Write the preparation instructions..."
            value={formData.instructions}
            onChange={handleChange}
            required
            rows="7"
            className="rf-font rf-input w-full px-4 py-3 rounded-2xl border-0 outline-none text-sm sm:text-base resize-none"
            style={{
              backgroundColor: "#FBF3E7",
              color: "#1C1620",
            }}
          ></textarea>
        </div>

        {/* ================= CATEGORY ================= */}
        <div>
          <label
            className="rf-font block text-sm font-medium mb-2"
            style={{
              color: "#FBF3E7",
            }}
          >
            Category
          </label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="rf-font w-full px-4 py-3 rounded-2xl border-0 outline-none text-sm sm:text-base cursor-pointer"
            style={{
              backgroundColor: "#FBF3E7",
              color: "#1C1620",
            }}
          >
            <option value="">Select Category</option>

            <option value="Vegetarian">Vegetarian</option>

            <option value="Non-Vegetarian">Non-Vegetarian</option>

            <option value="Dessert">Dessert</option>

            <option value="Quick Meals">Quick Meals</option>

            <option value="Coffees">Coffees</option>

            <option value="Soups">Soups</option>
          </select>
        </div>

        {/* ================= IMAGE UPLOAD ================= */}
        <div
          className="p-4 rounded-2xl"
          style={{
            backgroundColor: "rgba(251,243,231,0.06)",
            border: "1px solid rgba(251,243,231,0.1)",
          }}
        >
          <label
            className="rf-font block text-sm font-medium mb-2"
            style={{
              color: "#FBF3E7",
            }}
          >
            🖼️ Recipe Image
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="rf-file rf-font w-full text-sm"
            style={{
              color: "rgba(251,243,231,0.7)",
            }}
          />

          <p
            className="rf-font text-xs mt-2"
            style={{
              color: "rgba(251,243,231,0.45)",
            }}
          >
            A recipe image is required.
          </p>

          {/* Image Preview */}
          {image && (
            <div className="mt-4">
              <p
                className="rf-font text-xs mb-2"
                style={{
                  color: "#FFB648",
                }}
              >
                Image Preview
              </p>

              <div
                className="p-2 rounded-2xl inline-block"
                style={{
                  backgroundColor: "rgba(251,243,231,0.08)",
                }}
              >
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="w-full max-w-xs h-48 object-cover rounded-xl"
                />
              </div>
            </div>
          )}
        </div>

        {/* ================= VIDEO UPLOAD ================= */}
        <div
          className="p-4 rounded-2xl"
          style={{
            backgroundColor: "rgba(251,243,231,0.06)",
            border: "1px solid rgba(251,243,231,0.1)",
          }}
        >
          <label
            className="rf-font block text-sm font-medium mb-2"
            style={{
              color: "#FBF3E7",
            }}
          >
            🎬 Recipe Video
          </label>

          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            className="rf-file rf-font w-full text-sm"
            style={{
              color: "rgba(251,243,231,0.7)",
            }}
          />

          <p
            className="rf-font text-xs mt-2"
            style={{
              color: "rgba(251,243,231,0.45)",
            }}
          >
            Optional. You can add a video showing the recipe preparation.
          </p>

          {/* Video Preview */}
          {video && (
            <div className="mt-4">
              <p
                className="rf-font text-xs mb-2"
                style={{
                  color: "#FFB648",
                }}
              >
                Video Preview
              </p>

              <div
                className="p-2 rounded-2xl"
                style={{
                  backgroundColor: "rgba(251,243,231,0.08)",
                }}
              >
                <video className="w-full max-h-72 rounded-xl" controls>
                  <source src={URL.createObjectURL(video)} type={video.type} />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
        </div>

        {/* ================= SUBMIT BUTTON ================= */}
        <button
          type="submit"
          disabled={loading}
          className="rf-display w-full py-3.5 rounded-2xl font-semibold transition-all duration-200"
          style={{
            backgroundColor: loading ? "rgba(255,182,72,0.5)" : "#FFB648",
            color: "#1C1620",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span
                className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{
                  borderColor: "rgba(28,22,32,0.25)",
                  borderTopColor: "#1C1620",
                }}
              />
              Adding Recipe...
            </span>
          ) : (
            "🍳 Add Recipe"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddRecipe;
