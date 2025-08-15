import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ProductForm({ product = null, onSuccess, onClose }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:8000/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err.response || err);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setPrice(product.price || 0);
      setStock(product.stock || 0);
      setCategoryId(product.category_id || "");
      setCategoryName(product.category_name || "");
      setIsActive(product.is_active ?? true);
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let finalCategoryId = categoryId;

      // If user typed a new category, create it
      if (!categoryId && categoryName.trim() !== "") {
        const res = await axios.post(
          "http://localhost:8000/categories",
          { name: categoryName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        finalCategoryId = res.data.id;
      }

      const payload = {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        category_id: finalCategoryId,
        is_active: isActive,
      };

      if (product) {
        await axios.put(
          `http://localhost:8000/products/${product.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:8000/products",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      onSuccess();
    } catch (err) {
      console.error("Failed to save product:", err.response || err);
      setError(err.response?.data?.detail || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Blur background */}
      <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
           style={{ backdropFilter: "blur(5px)", zIndex: 1040 }}></div>

      {/* Modal */}
      <div className="modal show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">{product ? "Edit Product" : "Add New Product"}</h5>
                <button type="button" className="btn-close" onClick={onClose} />
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                  />
                </div>

                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      className="form-control"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Category</label>
                    <input
                      list="categoryOptions"
                      className="form-control"
                      value={categoryName}
                      onChange={(e) => {
                        setCategoryName(e.target.value);
                        setCategoryId(""); // reset if typing new
                      }}
                    />
                    <datalist id="categoryOptions">
                      {categories.map((c) => (
                        <option key={c.id} value={c.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="form-check mt-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                    id="activeCheck"
                  />
                  <label className="form-check-label" htmlFor="activeCheck">
                    Active
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Saving..." : product ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
