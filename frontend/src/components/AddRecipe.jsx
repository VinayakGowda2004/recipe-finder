import React, { useState } from "react";
import axios from "axios";

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, description, ingredients, instructions, category } = formData;

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

    const formattedIngredients = ingredients
      .split(",")
      .map((ing) => ing.trim().toLowerCase())
      .filter(Boolean);

    if (formattedIngredients.length === 0) {
      alert("❗ Please provide at least one valid ingredient.");
      return;
    }

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
      const response = await axios.post(
        "http://localhost:5000/add-recipe",
        recipeData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // ✅ FIXED: Prefix with Bearer
          },
        },
      );

      alert(response.data.message);

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
    <div>
      <h3>Add a New Recipe</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Recipe Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Short Description"
          value={formData.description}
          onChange={handleChange}
          required
        ></textarea>
        <textarea
          name="ingredients"
          placeholder="Ingredients (comma separated)"
          value={formData.ingredients}
          onChange={handleChange}
          required
        ></textarea>
        <textarea
          name="instructions"
          placeholder="Instructions"
          value={formData.instructions}
          onChange={handleChange}
          required
        ></textarea>

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select Category</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Non-Vegetarian">Non-Vegetarian</option>
          <option value="Dessert">Dessert</option>
          <option value="Quick Meals">Quick Meals</option>
          <option value="Coffees">Coffees</option>
          <option value="Soups">Soups</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />
        {image && (
          <div style={{ marginTop: "10px" }}>
            <img src={URL.createObjectURL(image)} alt="Preview" width="200" />
          </div>
        )}

        <input type="file" accept="video/*" onChange={handleVideoChange} />
        {video && (
          <div style={{ marginTop: "10px" }}>
            <video width="200" controls>
              <source src={URL.createObjectURL(video)} type={video.type} />
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Recipe"}
        </button>
      </form>
    </div>
  );
};

export default AddRecipe;
