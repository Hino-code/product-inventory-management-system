// src/services/orderService.js
import axios from "axios";

const API_URL = "http://localhost:8000/orders";

export const orderService = {
  createOrder: async (orderData) => {
    try {
      const token = localStorage.getItem("token"); // make sure your login saves JWT in localStorage
      const res = await axios.post(API_URL, orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data;
    } catch (err) {
      console.error("Error creating order", err);
      throw err;
    }
  },

  getAllOrders: async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("Error fetching orders", err);
      throw err;
    }
  },
};
