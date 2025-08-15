// src/pages/employee/Products.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function EmployeeProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/products", {
        headers: { Authorization: `Bearer ${token}` },
        params: { active_only: true, limit: 100 },
      });
      let productsData = Array.isArray(res.data) ? res.data : [];

      // Fetch categories
      const categoriesRes = await axios.get("http://localhost:8000/categories");
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
      const categoryMap = {};
      categoriesData.forEach(c => { categoryMap[c.id] = c.name; });

      setCategories(categoriesData);

      // Map category_id → category_name
      productsData = productsData.map(p => ({
        ...p,
        category_name: categoryMap[p.category_id] || "N/A",
      }));

      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (err) {
      console.error("Error fetching products:", err.response || err);
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchProducts();
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter products whenever search or category changes
  useEffect(() => {
    let filtered = [...products];

    if (search.trim() !== "") {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [search, selectedCategory, products]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center mt-5 text-secondary fs-5">Loading products...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container-fluid py-4">
        <h2 className="mb-4 text-secondary">Products</h2>

        {/* Search & Filter */}
        <div className="row mb-3 g-2">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search by product name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card shadow-sm rounded-3 p-3">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Product</th>
                  <th scope="col">Category</th>
                  <th scope="col">Price</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p, index) => (
                    <tr key={p.id}>
                      <td>{index + 1}</td>
                      <td>{p.name}</td>
                      <td>{p.category_name}</td>
                      <td>${p.price.toFixed(2)}</td>
                      <td className={p.stock <= 5 ? "text-danger fw-bold" : ""}>{p.stock}</td>
                      <td className={p.is_active ? "text-success" : "text-secondary"}>
                        {p.is_active ? "Active" : "Inactive"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-3">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
