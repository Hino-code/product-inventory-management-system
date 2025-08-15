import React, { createContext, useState } from "react";

// Create the context
const AuthContext = createContext(null);

// AuthProvider component
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    user: null,
  });

  const login = (userData) => {
    setAuth({ isAuthenticated: true, user: userData });
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
