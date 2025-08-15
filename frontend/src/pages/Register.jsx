// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { BiUser, BiLock, BiEnvelope } from "react-icons/bi";
import axios from "axios";
import "../styles/login.css";

export default function Register() {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    role: "employee", // default role
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setTimeout(() => setLoaded(true), 50);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Prepare payload with only valid fields
      const payload = {
        username: formData.username,
        password: formData.password,
        role: formData.role, // required by backend
        full_name: formData.full_name || undefined,
        email: formData.email || undefined,
      };

      await axios.post("http://localhost:8000/auth/signup", payload);

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center vh-100">
      <div className={`login-card-wrapper row w-100 shadow-lg ${loaded ? "loaded" : ""}`}>
        {/* Left image side */}
        <div
          className="col-md-6 login-image d-none d-md-block"
          style={{
            backgroundImage: `url("/INC.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "10% 40%",
            borderTopLeftRadius: "0.75rem",
            borderBottomLeftRadius: "0.75rem",
          }}
        ></div>

        {/* Right form side */}
        <div className="col-md-6 p-5 d-flex flex-column justify-content-center bg-white">
          <h3 className="mb-3 fw-bold text-dark">Create Account</h3>
          <p className="text-secondary mb-4">Fill in the details to register</p>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-dark"><BiUser /> Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-dark"><BiEnvelope /> Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-dark"><BiUser /> Full Name</Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={handleChange}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-dark"><BiLock /> Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-dark">Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="owner">Owner</option>
                <option value="employee">Employee</option>
              </Form.Select>
            </Form.Group>

            <div className="d-grid mb-3">
              <Button variant="dark" type="submit" disabled={loading}>
                {loading ? <Spinner as="span" size="sm" animation="border" /> : "Register"}
              </Button>
            </div>

            <div className="text-center mt-2">
              <p className="mb-0 text-dark">
                Already have an account?{" "}
                <Button variant="link" className="p-0" onClick={() => navigate("/login")}>
                  Login
                </Button>
              </p>
            </div>
          </Form>

          <footer className="login-footer mt-4 text-dark small text-center">
            © {new Date().getFullYear()} INC – Inventory Navigate Control. Designed by Jino Butaslac.
          </footer>
        </div>
      </div>
    </div>
  );
}
