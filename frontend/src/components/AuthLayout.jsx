import React from "react";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div style={{ height: "100vh", display: "flex" }}>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
