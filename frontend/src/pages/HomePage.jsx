import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Alert, Spinner } from 'react-bootstrap';
import useAuth from '../hooks/useAuth';
import '../styles/login.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    try {
      setLoading(true);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuth({
        token: null,
        user: null,
        isAuthenticated: false,
        initialized: true,
      });
      navigate('/');
    } catch {
      setError('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card shadow">
        <Card.Body className="text-center">
          <h2>Welcome to Inventory Manager</h2>
          <p className="text-muted">Manage your products efficiently</p>

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="d-grid gap-2 mt-4">
            <Button
              variant="primary"
              onClick={handleGoToLogin}
              disabled={loading}
            >
              {loading ? (
                <Spinner as="span" size="sm" animation="border" />
              ) : (
                'Sign In'
              )}
            </Button>

            <Button
              variant="outline-secondary"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? (
                <Spinner as="span" size="sm" animation="border" />
              ) : (
                'Logout'
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
