import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const registerUser = async (userData) => {
  return await axios.post(`${API_URL}/register`, userData);
};

export const loginUser = async (userData) => {
  return await axios.post(`${API_URL}/login`, userData);
};

export const getAllRecipes = async () => {
  return await axios.get(`${API_URL}/get-recipes`);
};

export const addRecipe = async (recipeData, token) => {
  return await axios.post(`${API_URL}/add-recipe`, recipeData, {
    headers: { Authorization: token },
  });
};

export const deleteRecipe = async (id, token) => {
  return await axios.delete(`${API_URL}/delete-recipe/${id}`, {
    headers: { Authorization: token },
  });
};
