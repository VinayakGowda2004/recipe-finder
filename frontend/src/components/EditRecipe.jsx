import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

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

  // Store existing media URLs from backend (to show current media preview)
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [existingVideoUrl, setExistingVideoUrl] = useState("");

  useEffect(() => {
    // Fetch all recipes on mount
    const fetchRecipes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/get-recipes");
        setRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setError("Failed to load recipes.");
      }
    };
    fetchRecipes();
  }, []);

  // When user selects a recipe to edit
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
      const response = await axios.get(
        `http://localhost:5000/get-recipe/${id}`,
      );
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

  // Clear form & previews
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

  // Handle form input changes including file inputs
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
      setFormData((prev) => ({ ...prev, image: files[0] }));
      // When user picks a new image, clear old preview from backend
      setExistingImageUrl("");
    } else if (name === "video" && files.length > 0) {
      if (videoPreviewRef.current) {
        URL.revokeObjectURL(videoPreviewRef.current);
      }
      const newUrl = URL.createObjectURL(files[0]);
      videoPreviewRef.current = newUrl;
      setFormData((prev) => ({ ...prev, video: files[0] }));
      // Clear old backend video preview
      setExistingVideoUrl("");
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit updated recipe to backend
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
      await axios.put(
        `http://localhost:5000/update-recipe/${selectedId}`,
        updatedData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setMessage("✅ Recipe updated successfully!");
      // Refresh recipes list to reflect any changes (optional)
      const response = await axios.get("http://localhost:5000/get-recipes");
      setRecipes(response.data);
      // Clear selected ID and form if you want:
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

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewRef.current) URL.revokeObjectURL(imagePreviewRef.current);
      if (videoPreviewRef.current) URL.revokeObjectURL(videoPreviewRef.current);
    };
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Edit Recipe</h2>

      <label htmlFor="recipe-select" className="block mb-1 font-semibold">
        Select Recipe
      </label>
      <select
        id="recipe-select"
        className="w-full p-2 border mb-4"
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

      {error && (
        <p className="text-red-600 font-semibold mb-4 text-center">{error}</p>
      )}
      {message && (
        <p className="text-green-600 font-semibold mb-4 text-center">
          {message}
        </p>
      )}

      {selectedId && (
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <label className="block mb-1 font-semibold" htmlFor="name">
            Recipe Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="Recipe Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border mb-2"
            required
            disabled={loading}
          />
          <label className="block mb-1 font-semibold" htmlFor="description">
            Description
          </label>
          <input
            id="description"
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border mb-2"
            required
            disabled={loading}
          />
          <label className="block mb-1 font-semibold" htmlFor="ingredients">
            Ingredients (comma-separated)
          </label>
          <input
            id="ingredients"
            type="text"
            name="ingredients"
            placeholder="Ingredients (comma-separated)"
            value={formData.ingredients}
            onChange={handleChange}
            className="w-full p-2 border mb-2"
            required
            disabled={loading}
          />
          <label
            className="block mb-1 font ChatGPT said: -semibold"
            htmlFor="instructions"
          >
            Instructions
          </label>
          <input
            id="instructions"
            type="text"
            name="instructions"
            placeholder="Instructions"
            value={formData.instructions}
            onChange={handleChange}
            className="w-full p-2 border mb-2"
            required
            disabled={loading}
          />
          php-template Copy Edit
          <label className="block mb-1 font-semibold" htmlFor="category">
            Category
          </label>
          <input
            id="category"
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border mb-4"
            required
            disabled={loading}
          />
          <label className="block mb-1 font-semibold" htmlFor="image">
            Image (optional)
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            name="image"
            onChange={handleChange}
            className="w-full mb-2"
            disabled={loading}
          />
          {/* Preview new image or existing */}
          {formData.image && imagePreviewRef.current ? (
            <img
              src={imagePreviewRef.current}
              alt="Selected Preview"
              className="mb-4 max-h-48 object-contain"
            />
          ) : existingImageUrl ? (
            <img
              src={existingImageUrl}
              alt="Current Recipe"
              className="mb-4 max-h-48 object-contain"
            />
          ) : null}
          <label className="block mb-1 font-semibold" htmlFor="video">
            Video (optional)
          </label>
          <input
            id="video"
            type="file"
            accept="video/*"
            name="video"
            onChange={handleChange}
            className="w-full mb-2"
            disabled={loading}
          />
          {/* Preview new video or existing */}
          {formData.video && videoPreviewRef.current ? (
            <video
              src={videoPreviewRef.current}
              controls
              className="mb-4 max-h-48 w-full object-contain"
            />
          ) : existingVideoUrl ? (
            <video
              src={existingVideoUrl}
              controls
              className="mb-4 max-h-48 w-full object-contain"
            />
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? "Updating..." : "Update Recipe"}
          </button>
        </form>
      )}
    </div>
  );
}

export default EditRecipe;
