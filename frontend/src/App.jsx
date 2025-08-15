// src/App.jsx
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Users from "./pages/Users";
import Account from "./pages/Account";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Logout from "./pages/Logout";
import LoadingSpinner from "./components/LoadingSpinner";
import useAuth from "./hooks/useAuth";
import "./styles/layout.css";
import "antd/dist/reset.css";

// Employee pages
import EmployeeDashboard from "./pages/employee/Dashboard";
import EmployeeProducts from "./pages/employee/Products";
import EmployeeOrders from "./pages/employee/Orders";
import EmployeeAccount from "./pages/employee/Account";

// Layout wrapper for pages with a sidebar
function LayoutWithSidebar({ children }) {
  const { auth } = useAuth();
  return (
    <div className="app-container">
      {auth.isAuthenticated && <Sidebar user={auth.user} />}
      <div className={`main-content with-sidebar`}>{children}</div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const { auth } = useAuth();

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!auth.initialized) return <LoadingSpinner fullPage />;
    if (!auth.isAuthenticated)
      return <Navigate to="/login" state={{ from: location }} replace />;
    if (allowedRoles && !allowedRoles.includes(auth.user?.role))
      return <Navigate to="/dashboard" replace />;
    return children;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Owner & Employee shared routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["owner", "employee"]}>
            <LayoutWithSidebar>
              <Dashboard />
            </LayoutWithSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute allowedRoles={["owner", "employee"]}>
            <LayoutWithSidebar>
              <Products />
            </LayoutWithSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute allowedRoles={["owner", "employee"]}>
            <LayoutWithSidebar>
              <Account />
            </LayoutWithSidebar>
          </ProtectedRoute>
        }
      />

      {/* Owner-only */}
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["owner"]}>
            <LayoutWithSidebar>
              <Users />
            </LayoutWithSidebar>
          </ProtectedRoute>
        }
      />

      {/* Employee-only */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <LayoutWithSidebar>
              <EmployeeDashboard />
            </LayoutWithSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/products"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <LayoutWithSidebar>
              <EmployeeProducts />
            </LayoutWithSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/orders"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <LayoutWithSidebar>
              <EmployeeOrders />
            </LayoutWithSidebar>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/account"
        element={
          <ProtectedRoute allowedRoles={["employee"]}>
            <LayoutWithSidebar>
              <EmployeeAccount />
            </LayoutWithSidebar>
          </ProtectedRoute>
        }
      />

      {/* Logout */}
      <Route path="/logout" element={<Logout />} />

      {/* Redirect root */}
      <Route
        path="/"
        element={
          <Navigate
            to={auth.isAuthenticated ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
