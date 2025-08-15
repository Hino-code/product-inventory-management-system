// src/services/categoryService.js
import axios from "axios";

const API_URL = "http://localhost:8000/categories"; // adjust to your backend route

export const categoryService = {
  getAll: async () => {
    try {
      const res = await axios.get(API_URL);
      return res.data;
    } catch (err) {
      console.error("Error fetching categories", err);
      throw err;
    }
  },

  create: async (categoryData) => {
    try {
      const res = await axios.post(API_URL, categoryData);
      return res.data;
    } catch (err) {
      console.error("Error creating category", err);
      throw err;
    }
  },
};
