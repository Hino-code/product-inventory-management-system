import { useState, useEffect } from 'react';
import AuthContext from '../contexts/AuthContext';
import axios from 'axios';

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: null,
    user: null,
    isAuthenticated: false,
    initialized: false
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setAuth(prev => ({ ...prev, initialized: true }));
        return;
      }

      try {
        // Verify token with backend
        const { data: userData } = await axios.get('http://localhost:8000/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Update both context and localStorage
        localStorage.setItem('user', JSON.stringify(userData));

        setAuth({
          token,
          user: userData,
          isAuthenticated: true,
          initialized: true
        });
      } catch (err) {
        console.error('Token validation failed:', err);
        // Clear invalid auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuth({
          token: null,
          user: null,
          isAuthenticated: false,
          initialized: true
        });
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}