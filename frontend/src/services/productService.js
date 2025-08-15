// src/services/productService.js
import axios from "axios";

const API_URL = "http://localhost:8000/products"; // adjust if needed

export const productService = {
  getAll: async () => {
    try {
      const res = await axios.get(API_URL);
      return res.data;
    } catch (err) {
      console.error("Error fetching products", err);
      throw err;
    }
  },

  create: async (productData) => {
    try {
      const res = await axios.post(API_URL, productData);
      return res.data;
    } catch (err) {
      console.error("Error creating product", err);
      throw err;
    }
  },

  update: async (id, productData) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, productData);
      return res.data;
    } catch (err) {
      console.error("Error updating product", err);
      throw err;
    }
  },

  delete: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (err) {
      console.error("Error deleting product", err);
      throw err;
    }
  },
};
