import { useState, useEffect } from "react";
import axios from "axios";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/products`, { withCredentials: true });
      setProducts(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }

  async function createProduct(productData) {
    const res = await axios.post(`${API_BASE}/products`, productData, { withCredentials: true });
    await fetchProducts();
    return res.data;
  }

  async function updateProduct(id, productData) {
    const res = await axios.put(`${API_BASE}/products/${id}`, productData, { withCredentials: true });
    await fetchProducts();
    return res.data;
  }

  async function toggleProductActive(id, isActive) {
    const res = await axios.patch(`${API_BASE}/products/${id}/active?is_active=${isActive}`, {}, { withCredentials: true });
    await fetchProducts();
    return res.data;
  }

  async function deleteProduct(id) {
    await axios.delete(`${API_BASE}/products/${id}`, { withCredentials: true });
    await fetchProducts();
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    toggleProductActive,
    deleteProduct
  };
}
