import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function OwnerLayout() {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "bi-speedometer2" },
    { name: "Products", path: "/products", icon: "bi-box-seam" },
    { name: "Users", path: "/users", icon: "bi-people" },
    { name: "Account", path: "/account", icon: "bi-person" },
    { name: "Logout", path: "/logout", icon: "bi-box-arrow-right" }
  ];

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div className="bg-dark text-white p-3 vh-100" style={{ width: "250px" }}>
        <h3 className="text-center mb-4">[LOGO HERE]</h3>
        <ul className="nav flex-column">
          {menuItems.map((item) => (
            <li key={item.name} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link text-white d-flex align-items-center ${
                  location.pathname === item.path ? "active fw-bold" : ""
                }`}
              >
                <i className={`bi ${item.icon} me-2`}></i>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4" style={{ background: "#f8f9fa" }}>
        <Outlet />
      </div>
    </div>
  );
}
