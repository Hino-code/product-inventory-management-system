// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const role = user?.role || "employee";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Menu items
  const ownerMenu = [
    { path: "/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { path: "/products", label: "Products", icon: "bi-box-seam" },
    { path: "/users", label: "Users", icon: "bi-people" }
  ];

  const employeeMenu = [
    { path: "/employee/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { path: "/employee/products", label: "Products", icon: "bi-box-seam" },
    { path: "/employee/orders", label: "Orders", icon: "bi-receipt" }
  ];

  const menuItems = role === "owner" ? ownerMenu : employeeMenu;

  return (
    <div className="sidebar d-flex flex-column">
      {/* Logo */}
     <div className="sidebar-logo p-3 border-bottom d-flex align-items-center gap-1">
  <img
    src="/logo.png"
    alt="Company Logo"
    width="200"
    height="50"
    style={{ objectFit: "cover", borderRadius: "6px" }} // crop/zoom logo
  />

</div>

      {/* Profile Section */}
      <div
        className="profile-section p-3 text-center border-bottom"
        style={{ cursor: "pointer" }}
        onClick={() => {
          navigate(role === "owner" ? "/account" : "/employee/account");
        }}
      >
        <img
          src={user?.profile_picture || "/profile.png"}
          alt="User Avatar"
          width="60"
          height="60"
          className="rounded-circle mb-2"
        />
        <h6 className="mb-0">{user?.full_name || user?.username || "Guest User"}</h6>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow-1 mt-3 px-2">
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item mb-1">
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center ${
                  location.pathname.startsWith(item.path) ? "active" : ""
                }`}
              >
                <i className={`bi ${item.icon} me-2`}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-3 border-top">
        <button
          className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2"></i> Logout
        </button>
      </div>
    </div>
  );
}
