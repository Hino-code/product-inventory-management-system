// src/pages/Orders.jsx
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, InputGroup } from "react-bootstrap";
import { productService } from "../../services/productService";
import { orderService } from "../../services/orderService";
import ModalAlert from "../../components/ModalAlert";
import ReceiptModal from "../../components/ReceiptModal";

export default function Orders() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [alert, setAlert] = useState({ show: false, title: "", message: "" });

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await productService.getAll();
      setProducts(res);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:8000/categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Open order modal
  const handleAddOrder = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerAddress("");
    setShowOrderModal(true);
  };

  // Validation
  const isOrderValid = () => {
    if (!selectedProduct) return false;
    if (quantity < 1 || quantity > selectedProduct.stock) return false;
    if (!customerName.trim()) return false;
    if (customerEmail && !/\S+@\S+\.\S+/.test(customerEmail)) return false;
    return true;
  };

  // Place order
  const handlePlaceOrder = async () => {
    if (!isOrderValid()) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please fill all required fields correctly.",
      });
      return;
    }

    const orderPayload = {
      customer_name: customerName || "Walk-in Customer",
      customer_phone: customerPhone,
      customer_email: customerEmail,
      customer_address: customerAddress,
      items: [{ product_id: selectedProduct.id, quantity }],
    };

    try {
      const res = await orderService.createOrder(orderPayload);
      setReceipt(res);
      setShowOrderModal(false);
      setAlert({
        show: true,
        title: "Order Placed",
        message: "Your order has been successfully placed!",
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      setAlert({
        show: true,
        title: "Error",
        message: err.response?.data?.detail || "Failed to place order",
      });
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Place Orders</h2>

      {/* Filters */}
      <Row className="mb-3">
        <Col md={6}>
          <InputGroup>
            <Form.Control
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={4}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Product Grid */}
      <Row xs={1} md={3} className="g-4">
        {filteredProducts.map((product) => (
          <Col key={product.id}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>{product.name}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {categories.find((c) => c.id === product.category_id)?.name || "Uncategorized"}
                </Card.Subtitle>
                <Card.Text>Price: ₱{product.price.toLocaleString()}</Card.Text>
                <Card.Text>Stock: {product.stock}</Card.Text>
                <Button
                  variant="primary"
                  disabled={product.stock <= 0}
                  onClick={() => handleAddOrder(product)}
                >
                  Add Order
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Order Form Modal */}
      {selectedProduct && (
        <div
          className={`modal fade ${showOrderModal ? "show d-block" : ""}`}
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 p-3">
              <div className="modal-header border-0">
                <h5 className="modal-title">Order: {selectedProduct.name}</h5>
                <Button variant="close" onClick={() => setShowOrderModal(false)} />
              </div>
              <div className="modal-body">
                <p>Price: ₱{selectedProduct.price.toLocaleString()}</p>
                <p>Stock: {selectedProduct.stock}</p>

                <Form>
                  {/* Customer Info */}
                  <Form.Group className="mb-2">
                    <Form.Label>Customer Name *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      isInvalid={!customerName.trim()}
                    />
                    <Form.Control.Feedback type="invalid">
                      Name is required.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      isInvalid={customerEmail && !/\S+@\S+\.\S+/.test(customerEmail)}
                    />
                    <Form.Control.Feedback type="invalid">
                      Invalid email format.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter address"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                    />
                  </Form.Group>

                  {/* Quantity */}
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity *</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      max={selectedProduct.stock}
                      value={quantity}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val > selectedProduct.stock) val = selectedProduct.stock;
                        if (val < 1) val = 1;
                        setQuantity(val);
                      }}
                    />
                  </Form.Group>

                  {/* Subtotal */}
                  <p>Subtotal: ₱{(selectedProduct.price * quantity).toLocaleString()}</p>
                </Form>
              </div>
              <div className="modal-footer border-0">
                <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant="success"
                  onClick={handlePlaceOrder}
                  disabled={!isOrderValid()}
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        show={!!receipt}
        onClose={() => setReceipt(null)}
        receipt={receipt}
      />

      {/* Alert */}
      <ModalAlert
        show={alert.show}
        onClose={() => setAlert({ ...alert, show: false })}
        title={alert.title}
        message={alert.message}
      />
    </Container>
  );
}
