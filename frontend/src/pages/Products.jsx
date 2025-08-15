// src/pages/owner/Products.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import { Button, Modal, Form, Table, Alert, Spinner } from "react-bootstrap";

export default function OwnerProducts() {
  const token = localStorage.getItem("token");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [alert, setAlert] = useState({ show: false, variant: "", message: "" });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  const pesoFormatter = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/products", {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 },
      });
      let productsData = Array.isArray(res.data) ? res.data : [];

      const categoriesRes = await axios.get("http://localhost:8000/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
      const categoryMap = {};
      categoriesData.forEach((c) => (categoryMap[c.id] = c.name));
      setCategories(categoriesData);

      productsData = productsData.map((p) => ({
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

  useEffect(() => {
    let filtered = [...products];
    if (search.trim() !== "") {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }
    setFilteredProducts(filtered);
  }, [search, selectedCategory, products]);

  const openModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      setName(product.name);
      setDescription(product.description);
      setPrice(product.price);
      setStock(product.stock);
      setCategoryId(product.category_id);
      setNewCategory("");
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setStock("");
      setCategoryId("");
      setNewCategory("");
    }
    setShowModal(true);
    document.body.classList.add("modal-open-blur");
  };

  const closeModal = () => {
    setShowModal(false);
    document.body.classList.remove("modal-open-blur");
  };

  const handleSaveProduct = async () => {
    try {
      let catId = categoryId;

      if (newCategory.trim() !== "") {
        const existingCat = categories.find(
          (c) => c.name.toLowerCase() === newCategory.trim().toLowerCase()
        );

        if (existingCat) {
          catId = existingCat.id;
        } else {
          const res = await axios.post(
            "http://localhost:8000/categories",
            { name: newCategory.trim() },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          catId = res.data.id;
          await fetchProducts();
        }
      }

      const payload = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category_id: catId,
      };

      if (editingProduct) {
        await axios.put(
          `http://localhost:8000/products/${editingProduct.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAlert({ show: true, variant: "success", message: "Product updated successfully!" });
      } else {
        await axios.post("http://localhost:8000/products", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAlert({ show: true, variant: "success", message: "Product added successfully!" });
      }

      closeModal();
      fetchProducts();
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        variant: "danger",
        message: err.response?.data?.detail || "Failed to save product",
      });
    }
  };

  const confirmDeleteProduct = (productId) => {
    setDeletingProductId(productId);
    setShowDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    try {
      await axios.delete(`http://localhost:8000/products/${deletingProductId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ show: true, variant: "success", message: "Product deleted successfully!" });
      setShowDeleteModal(false);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        variant: "danger",
        message: err.response?.data?.detail || "Failed to delete product",
      });
    }
  };

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
        {alert.show && (
          <Alert
            variant={alert.variant}
            onClose={() => setAlert({ ...alert, show: false })}
            dismissible
          >
            {alert.message}
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="text-secondary">Products</h2>
          <Button onClick={() => openModal()} variant="primary">
            Add Product
          </Button>
        </div>

        {/* Search & Filter */}
        <div className="row mb-3 g-2">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="card shadow-sm rounded-3 p-3">
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p, idx) => (
                    <tr key={p.id}>
                      <td>{idx + 1}</td>
                      <td>{p.name}</td>
                      <td>{p.category_name}</td>
                      <td>{pesoFormatter.format(p.price)}</td>
                      <td className={p.stock <= 5 ? "text-danger fw-bold" : ""}>{p.stock}</td>
                      <td className={p.is_active ? "text-success" : "text-secondary"}>
                        {p.is_active ? "Active" : "Inactive"}
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => openModal(p)}
                          className="me-2"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => confirmDeleteProduct(p.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-3">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Add/Edit Product Modal */}
        <Modal
          show={showModal}
          onHide={closeModal}
          backdrop="static"
          keyboard={false}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>{editingProduct ? "Edit Product" : "Add Product"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Name</Form.Label>
                <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Price</Form.Label>
                <Form.Control
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Stock</Form.Label>
                <Form.Control
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Category</Form.Label>
                <Form.Control
                  list="category-list"
                  placeholder="Select or type a category"
                  value={categoryId ? categories.find(c => c.id === categoryId)?.name : newCategory}
                  onChange={(e) => {
                    const selected = categories.find(c => c.name.toLowerCase() === e.target.value.toLowerCase());
                    if (selected) {
                      setCategoryId(selected.id);
                      setNewCategory("");
                    } else {
                      setCategoryId("");
                      setNewCategory(e.target.value);
                    }
                  }}
                />
                <datalist id="category-list">
                  {categories.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
                <Form.Text className="text-muted">
                  Type a new category or select from the list
                </Form.Text>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveProduct}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteModal}
          onHide={() => setShowDeleteModal(false)}
          backdrop="static"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Delete Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this product?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteProduct}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
