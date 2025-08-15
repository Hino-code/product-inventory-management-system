import React from "react";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import "../styles/layout.css";

export default function Layout() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/login"; // Hide on login page

  return (
    <div className="d-flex">
      {!hideSidebar && <Sidebar />}
      <main className="main-content flex-grow-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
