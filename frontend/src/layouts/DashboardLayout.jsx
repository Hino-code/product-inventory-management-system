// frontend/src/layouts/DashboardLayout.jsx
import React from "react";
import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user")); // { role: "owner" }

  return (
    <div className="d-flex">
      <Sidebar role={user?.role} />
      <div className="flex-grow-1 p-4">{children}</div>
    </div>
  );
};

export default DashboardLayout;
