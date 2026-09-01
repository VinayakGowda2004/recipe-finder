import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function EditRecipe() {
  const [recipes, setRecipes] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ingredients: "",
    instructions: "",
    category: "",
    image: null, // File object for new upload
    video: null, // File object for new upload
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Store URLs for previews of newly selected files
  const imagePreviewRef = useRef(null);
  const videoPreviewRef = useRef(null);

  // Store existing media URLs from backend
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [existingVideoUrl, setExistingVideoUrl] = useState("");

  // ================= FETCH RECIPES =================
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await axios.get(`${API_URL}/get-recipes`);
        setRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setError("Failed to load recipes.");
      }
    };

    fetchRecipes();
  }, []);

  // ================= SELECT RECIPE =================
  const handleSelectChange = async (e) => {
    const id = e.target.value;

    setSelectedId(id);
    setMessage("");
    setError("");
    setExistingImageUrl("");
    setExistingVideoUrl("");

    // Reset form if no selection
    if (!id) {
      clearForm();
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/get-recipe/${id}`);
      const recipe = response.data;

      // Revoke old object URLs if any
      if (imagePreviewRef.current) {
        URL.revokeObjectURL(imagePreviewRef.current);
        imagePreviewRef.current = null;
      }

      if (videoPreviewRef.current) {
        URL.revokeObjectURL(videoPreviewRef.current);
        videoPreviewRef.current = null;
      }

      setFormData({
        name: recipe.name || "",
        description: recipe.description || "",
        ingredients: Array.isArray(recipe.ingredients)
          ? recipe.ingredients.join(", ")
          : recipe.ingredients || "",
        instructions: recipe.instructions || "",
        category: recipe.category || "",
        image: null,
        video: null,
      });

      setExistingImageUrl(recipe.imageUrl || "");
      setExistingVideoUrl(recipe.videoUrl || "");
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      setError("Failed to load recipe details.");
      clearForm();
    } finally {
      setLoading(false);
    }
  };

  // ================= CLEAR FORM =================
  const clearForm = () => {
    setFormData({
      name: "",
      description: "",
      ingredients: "",
      instructions: "",
      category: "",
      image: null,
      video: null,
    });

    setExistingImageUrl("");
    setExistingVideoUrl("");

    if (imagePreviewRef.current) {
      URL.revokeObjectURL(imagePreviewRef.current);
      imagePreviewRef.current = null;
    }

    if (videoPreviewRef.current) {
      URL.revokeObjectURL(videoPreviewRef.current);
      videoPreviewRef.current = null;
    }
  };

  // ================= HANDLE INPUT CHANGES =================
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setError("");
    setMessage("");

    if (name === "image" && files.length > 0) {
      // Revoke previous preview URL
      if (imagePreviewRef.current) {
        URL.revokeObjectURL(imagePreviewRef.current);
      }

      const newUrl = URL.createObjectURL(files[0]);
      imagePreviewRef.current = newUrl;

      setFormData((prev) => ({
        ...prev,
        image: files[0],
      }));

      // When user picks a new image, clear old preview
      setExistingImageUrl("");
    } else if (name === "video" && files.length > 0) {
      if (videoPreviewRef.current) {
        URL.revokeObjectURL(videoPreviewRef.current);
      }

      const newUrl = URL.createObjectURL(files[0]);
      videoPreviewRef.current = newUrl;

      setFormData((prev) => ({
        ...prev,
        video: files[0],
      }));

      // Clear old backend video preview
      setExistingVideoUrl("");
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // ================= SUBMIT UPDATED RECIPE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!selectedId) {
      setError("Please select a recipe to update.");
      return;
    }

    setLoading(true);

    const updatedData = new FormData();

    updatedData.append("name", formData.name);
    updatedData.append("description", formData.description);
    updatedData.append("ingredients", formData.ingredients);
    updatedData.append("instructions", formData.instructions);
    updatedData.append("category", formData.category);

    if (formData.image) {
      updatedData.append("image", formData.image);
    }

    if (formData.video) {
      updatedData.append("video", formData.video);
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(`${API_URL}/update-recipe/${selectedId}`, updatedData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("✅ Recipe updated successfully!");

      // Refresh recipes list to reflect changes
      const response = await axios.get(`${API_URL}/get-recipes`);
      setRecipes(response.data);

      // Keep selected recipe and form as before
      // setSelectedId("");
      // clearForm();
    } catch (error) {
      console.error("Update error:", error);
      setError("❌ Failed to update recipe.");
    } finally {
      setLoading(false);

      setTimeout(() => {
        setMessage("");
        setError("");
      }, 5000);
    }
  };

  // ================= CLEANUP PREVIEW URLS =================
  useEffect(() => {
    return () => {
      if (imagePreviewRef.current) {
        URL.revokeObjectURL(imagePreviewRef.current);
      }

      if (videoPreviewRef.current) {
        URL.revokeObjectURL(videoPreviewRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full">
      {/* ================= FONTS + CUSTOM STYLES ================= */}
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

        .rf-input::placeholder {
          color: rgba(251,243,231,0.35);
        }

        .rf-input:focus {
          outline: none;
          border-color: rgba(255,182,72,0.65) !important;
          box-shadow: 0 0 0 3px rgba(255,182,72,0.08);
        }

        .rf-file::-webkit-file-upload-button {
          margin-right: 12px;
          padding: 9px 14px;
          border: 0;
          border-radius: 10px;
          background: rgba(255,182,72,0.14);
          color: #FFB648;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          cursor: pointer;
        }

        .rf-file::-webkit-file-upload-button:hover {
          background: rgba(255,182,72,0.22);
        }

        .rf-update-btn:hover:not(:disabled) {
          background: #f5a62f !important;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(255,182,72,0.16);
        }

        .rf-update-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .rf-update-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .rf-select {
          appearance: none;
          -webkit-appearance: none;
          background-image:
            linear-gradient(45deg, transparent 50%, #FFB648 50%),
            linear-gradient(135deg, #FFB648 50%, transparent 50%);
          background-position:
            calc(100% - 18px) 50%,
            calc(100% - 12px) 50%;
          background-size: 6px 6px, 6px 6px;
          background-repeat: no-repeat;
          padding-right: 40px !important;
        }

        .rf-select option {
          background: #241b16;
          color: #FBF3E7;
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
          ✏️ Edit a Recipe
        </h3>

        <p
          className="rf-font text-sm mt-1"
          style={{
            color: "rgba(251,243,231,0.6)",
          }}
        >
          Update recipe details, ingredients, instructions, images, or videos in
          your PantryPlate collection.
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

      {/* ================= ERROR ================= */}
      {error && (
        <div
          className="rf-font mb-5 p-4 rounded-2xl text-sm font-medium"
          style={{
            backgroundColor: "rgba(248,113,113,0.12)",
            border: "1px solid rgba(248,113,113,0.25)",
            color: "#fca5a5",
          }}
        >
          {error}
        </div>
      )}

      {/* ================= RECIPE SELECTOR ================= */}
      <div
        className="p-4 sm:p-5 rounded-3xl mb-5"
        style={{
          backgroundColor: "rgba(251,243,231,0.06)",
          border: "1px solid rgba(251,243,231,0.1)",
        }}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p
              className="rf-font text-sm font-medium"
              style={{
                color: "#FBF3E7",
              }}
            >
              Select Recipe
            </p>

            <p
              className="rf-font text-xs mt-1"
              style={{
                color: "rgba(251,243,231,0.45)",
              }}
            >
              Choose the recipe you want to edit.
            </p>
          </div>

          <span
            className="rf-font text-xs px-3 py-1.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: "rgba(255,182,72,0.14)",
              color: "#FFB648",
            }}
          >
            Admin
          </span>
        </div>

        <label
          htmlFor="recipe-select"
          className="rf-font block text-xs font-semibold mb-2"
          style={{
            color: "rgba(251,243,231,0.65)",
          }}
        >
          Recipe
        </label>

        <select
          id="recipe-select"
          className="rf-font rf-select w-full px-4 py-3 rounded-xl text-sm transition-all"
          style={{
            backgroundColor: "rgba(251,243,231,0.06)",
            border: "1px solid rgba(251,243,231,0.12)",
            color: "#FBF3E7",
          }}
          value={selectedId}
          onChange={handleSelectChange}
          disabled={loading}
        >
          <option value="">Select a recipe to edit</option>

          {recipes.map((recipe) => (
            <option key={recipe._id} value={recipe._id}>
              {recipe.name}
            </option>
          ))}
        </select>
      </div>

      {/* ================= LOADING RECIPE ================= */}
      {loading && !selectedId ? (
        <div
          className="flex flex-col items-center justify-center py-14 rounded-3xl"
          style={{
            backgroundColor: "rgba(251,243,231,0.06)",
            border: "1px solid rgba(251,243,231,0.1)",
          }}
        >
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
      ) : (
        <>
          {/* ================= EDIT FORM ================= */}
          {selectedId && (
            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="space-y-5"
            >
              {/* ================= BASIC DETAILS CARD ================= */}
              <div
                className="p-4 sm:p-6 rounded-3xl"
                style={{
                  backgroundColor: "rgba(251,243,231,0.06)",
                  border: "1px solid rgba(251,243,231,0.1)",
                }}
              >
                <div className="mb-5">
                  <p
                    className="rf-display text-base sm:text-lg font-semibold"
                    style={{
                      color: "#FBF3E7",
                    }}
                  >
                    Recipe Details
                  </p>

                  <p
                    className="rf-font text-xs sm:text-sm mt-1"
                    style={{
                      color: "rgba(251,243,231,0.45)",
                    }}
                  >
                    Update the basic information for your recipe.
                  </p>
                </div>

                {/* ================= RECIPE NAME ================= */}
                <div className="mb-4">
                  <label
                    className="rf-font block text-xs font-semibold mb-2"
                    style={{
                      color: "rgba(251,243,231,0.7)",
                    }}
                    htmlFor="name"
                  >
                    Recipe Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter recipe name"
                    value={formData.name}
                    onChange={handleChange}
                    className="rf-font rf-input w-full px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      backgroundColor: "rgba(251,243,231,0.06)",
                      border: "1px solid rgba(251,243,231,0.12)",
                      color: "#FBF3E7",
                    }}
                    required
                    disabled={loading}
                  />
                </div>

                {/* ================= DESCRIPTION ================= */}
                <div className="mb-4">
                  <label
                    className="rf-font block text-xs font-semibold mb-2"
                    style={{
                      color: "rgba(251,243,231,0.7)",
                    }}
                    htmlFor="description"
                  >
                    Description
                  </label>

                  <input
                    id="description"
                    type="text"
                    name="description"
                    placeholder="Enter recipe description"
                    value={formData.description}
                    onChange={handleChange}
                    className="rf-font rf-input w-full px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      backgroundColor: "rgba(251,243,231,0.06)",
                      border: "1px solid rgba(251,243,231,0.12)",
                      color: "#FBF3E7",
                    }}
                    required
                    disabled={loading}
                  />
                </div>

                {/* ================= CATEGORY ================= */}
                <div>
                  <label
                    className="rf-font block text-xs font-semibold mb-2"
                    style={{
                      color: "rgba(251,243,231,0.7)",
                    }}
                    htmlFor="category"
                  >
                    Category
                  </label>

                  <input
                    id="category"
                    type="text"
                    name="category"
                    placeholder="e.g. Breakfast, Lunch, Dessert"
                    value={formData.category}
                    onChange={handleChange}
                    className="rf-font rf-input w-full px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      backgroundColor: "rgba(251,243,231,0.06)",
                      border: "1px solid rgba(251,243,231,0.12)",
                      color: "#FBF3E7",
                    }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* ================= INGREDIENTS & INSTRUCTIONS ================= */}
              <div
                className="p-4 sm:p-6 rounded-3xl"
                style={{
                  backgroundColor: "rgba(251,243,231,0.06)",
                  border: "1px solid rgba(251,243,231,0.1)",
                }}
              >
                <div className="mb-5">
                  <p
                    className="rf-display text-base sm:text-lg font-semibold"
                    style={{
                      color: "#FBF3E7",
                    }}
                  >
                    Recipe Preparation
                  </p>

                  <p
                    className="rf-font text-xs sm:text-sm mt-1"
                    style={{
                      color: "rgba(251,243,231,0.45)",
                    }}
                  >
                    Update the ingredients and cooking instructions.
                  </p>
                </div>

                {/* ================= INGREDIENTS ================= */}
                <div className="mb-4">
                  <label
                    className="rf-font block text-xs font-semibold mb-2"
                    style={{
                      color: "rgba(251,243,231,0.7)",
                    }}
                    htmlFor="ingredients"
                  >
                    Ingredients
                  </label>

                  <input
                    id="ingredients"
                    type="text"
                    name="ingredients"
                    placeholder="Ingredients (comma-separated)"
                    value={formData.ingredients}
                    onChange={handleChange}
                    className="rf-font rf-input w-full px-4 py-3 rounded-xl text-sm transition-all"
                    style={{
                      backgroundColor: "rgba(251,243,231,0.06)",
                      border: "1px solid rgba(251,243,231,0.12)",
                      color: "#FBF3E7",
                    }}
                    required
                    disabled={loading}
                  />

                  <p
                    className="rf-font text-xs mt-2"
                    style={{
                      color: "rgba(251,243,231,0.38)",
                    }}
                  >
                    Separate each ingredient with a comma.
                  </p>
                </div>

                {/* ================= INSTRUCTIONS ================= */}
                <div>
                  <label
                    className="rf-font block text-xs font-semibold mb-2"
                    style={{
                      color: "rgba(251,243,231,0.7)",
                    }}
                    htmlFor="instructions"
                  >
                    Instructions
                  </label>

                  <textarea
                    id="instructions"
                    name="instructions"
                    placeholder="Enter cooking instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    rows={5}
                    className="rf-font rf-input rf-scroll w-full px-4 py-3 rounded-xl text-sm transition-all resize-y"
                    style={{
                      backgroundColor: "rgba(251,243,231,0.06)",
                      border: "1px solid rgba(251,243,231,0.12)",
                      color: "#FBF3E7",
                    }}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* ================= MEDIA CARD ================= */}
              <div
                className="p-4 sm:p-6 rounded-3xl"
                style={{
                  backgroundColor: "rgba(251,243,231,0.06)",
                  border: "1px solid rgba(251,243,231,0.1)",
                }}
              >
                <div className="mb-5">
                  <p
                    className="rf-display text-base sm:text-lg font-semibold"
                    style={{
                      color: "#FBF3E7",
                    }}
                  >
                    Recipe Media
                  </p>

                  <p
                    className="rf-font text-xs sm:text-sm mt-1"
                    style={{
                      color: "rgba(251,243,231,0.45)",
                    }}
                  >
                    Upload new media only if you want to replace the existing
                    files.
                  </p>
                </div>

                {/* ================= IMAGE ================= */}
                <div className="mb-6">
                  <label
                    className="rf-font block text-xs font-semibold mb-2"
                    style={{
                      color: "rgba(251,243,231,0.7)",
                    }}
                    htmlFor="image"
                  >
                    Image
                    <span
                      className="font-normal ml-1"
                      style={{
                        color: "rgba(251,243,231,0.4)",
                      }}
                    >
                      (optional)
                    </span>
                  </label>

                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    name="image"
                    onChange={handleChange}
                    className="rf-font rf-file w-full text-xs sm:text-sm"
                    style={{
                      color: "rgba(251,243,231,0.55)",
                    }}
                    disabled={loading}
                  />

                  {/* New image preview */}
                  {formData.image && imagePreviewRef.current ? (
                    <div
                      className="mt-4 p-3 rounded-2xl"
                      style={{
                        backgroundColor: "rgba(251,243,231,0.05)",
                        border: "1px solid rgba(251,243,231,0.1)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="rf-font text-xs font-semibold"
                          style={{
                            color: "#FFB648",
                          }}
                        >
                          New Image Preview
                        </span>
                      </div>

                      <img
                        src={imagePreviewRef.current}
                        alt="Selected Preview"
                        className="w-full max-h-72 object-contain rounded-xl"
                      />
                    </div>
                  ) : existingImageUrl ? (
                    <div
                      className="mt-4 p-3 rounded-2xl"
                      style={{
                        backgroundColor: "rgba(251,243,231,0.05)",
                        border: "1px solid rgba(251,243,231,0.1)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="rf-font text-xs font-semibold"
                          style={{
                            color: "rgba(251,243,231,0.65)",
                          }}
                        >
                          Current Image
                        </span>
                      </div>

                      <img
                        src={existingImageUrl}
                        alt="Current Recipe"
                        className="w-full max-h-72 object-contain rounded-xl"
                      />
                    </div>
                  ) : null}
                </div>

                {/* ================= VIDEO ================= */}
                <div>
                  <label
                    className="rf-font block text-xs font-semibold mb-2"
                    style={{
                      color: "rgba(251,243,231,0.7)",
                    }}
                    htmlFor="video"
                  >
                    Video
                    <span
                      className="font-normal ml-1"
                      style={{
                        color: "rgba(251,243,231,0.4)",
                      }}
                    >
                      (optional)
                    </span>
                  </label>

                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    name="video"
                    onChange={handleChange}
                    className="rf-font rf-file w-full text-xs sm:text-sm"
                    style={{
                      color: "rgba(251,243,231,0.55)",
                    }}
                    disabled={loading}
                  />

                  {/* New video preview */}
                  {formData.video && videoPreviewRef.current ? (
                    <div
                      className="mt-4 p-3 rounded-2xl"
                      style={{
                        backgroundColor: "rgba(251,243,231,0.05)",
                        border: "1px solid rgba(251,243,231,0.1)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="rf-font text-xs font-semibold"
                          style={{
                            color: "#FFB648",
                          }}
                        >
                          New Video Preview
                        </span>
                      </div>

                      <video
                        src={videoPreviewRef.current}
                        controls
                        className="w-full max-h-72 rounded-xl object-contain"
                      />
                    </div>
                  ) : existingVideoUrl ? (
                    <div
                      className="mt-4 p-3 rounded-2xl"
                      style={{
                        backgroundColor: "rgba(251,243,231,0.05)",
                        border: "1px solid rgba(251,243,231,0.1)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="rf-font text-xs font-semibold"
                          style={{
                            color: "rgba(251,243,231,0.65)",
                          }}
                        >
                          Current Video
                        </span>
                      </div>

                      <video
                        src={existingVideoUrl}
                        controls
                        className="w-full max-h-72 rounded-xl object-contain"
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              {/* ================= UPDATE BUTTON ================= */}
              <button
                type="submit"
                disabled={loading}
                className="rf-font rf-update-btn w-full px-5 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200"
                style={{
                  backgroundColor: "#FFB648",
                  color: "#241b16",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className="w-4 h-4 border-2 rounded-full animate-spin"
                      style={{
                        borderColor: "rgba(36,27,22,0.25)",
                        borderTopColor: "#241b16",
                      }}
                    />
                    Updating...
                  </span>
                ) : (
                  "✏️ Update Recipe"
                )}
              </button>
            </form>
          )}

          {/* ================= NO RECIPE SELECTED ================= */}
          {!selectedId && !loading && (
            <div
              className="text-center py-14 px-5 rounded-3xl"
              style={{
                backgroundColor: "rgba(251,243,231,0.06)",
                border: "1px solid rgba(251,243,231,0.1)",
              }}
            >
              <div className="text-5xl mb-4">🍳</div>

              <h4
                className="rf-display text-lg"
                style={{
                  color: "#FBF3E7",
                }}
              >
                Select a recipe to edit
              </h4>

              <p
                className="rf-font text-sm mt-2"
                style={{
                  color: "rgba(251,243,231,0.55)",
                }}
              >
                Choose a recipe from the list above to view and update its
                details.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EditRecipe;
