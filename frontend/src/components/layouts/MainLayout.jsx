
import React from "react";
import Sidebar from "../Sidebar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4" style={{ backgroundColor: "#f8f9fa" }}>
        <Outlet />
      </div>
    </div>
  );
}
