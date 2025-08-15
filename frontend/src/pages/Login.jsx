import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { BiLock, BiUser } from "react-icons/bi";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();

  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 50);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);

      const { data } = await axios.post(
        "http://localhost:8000/auth/login",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const userResponse = await axios.get("http://localhost:8000/auth/me", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(userResponse.data));

      setAuth({
        token: data.access_token,
        user: userResponse.data,
        isAuthenticated: true,
        initialized: true,
      });

      navigate(location.state?.from?.pathname || "/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page d-flex align-items-center justify-content-center vh-100">
      <div className={`login-card-wrapper row w-100 shadow-lg ${loaded ? "loaded" : ""}`}>
        <div
          className="col-md-6 login-image d-none d-md-block"
        ></div>

        <div className="col-md-6 p-5 d-flex flex-column justify-content-center bg-white">
          <h3 className="mb-3 fw-bold text-dark">Welcome Back!</h3>
          <p className="text-secondary mb-4">Sign in to continue to your dashboard</p>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-dark"><BiUser /> Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                required
                autoFocus
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-dark"><BiLock /> Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                required
                disabled={loading}
              />
            </Form.Group>

            <div className="d-grid mb-3">
              <Button variant="dark" type="submit" disabled={loading}>
                {loading ? <Spinner as="span" size="sm" animation="border" /> : "Sign In"}
              </Button>
            </div>

            <div className="text-center mt-2">
              <p className="mb-0 text-dark">
                Don't have an account?{" "}
                <Button variant="link" className="p-0" onClick={() => navigate("/register")}>
                  Register
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
