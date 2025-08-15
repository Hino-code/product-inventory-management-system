// src/pages/employee/Dashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function EmployeeDashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:8000/products", {
        headers: { Authorization: `Bearer ${token}` },
        params: { active_only: true, limit: 100 },
      });
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching products:", err.response || err);
      setProducts([]);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:8000/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(Array.isArray(res.data) ? res.data.slice(0, 5) : []);
    } catch (err) {
      console.error("Error fetching orders:", err.response || err);
      setOrders([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProducts(), fetchOrders()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center mt-5 text-secondary fs-5">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  const lowStockCount = products.filter((p) => p.stock <= 5).length;
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

  return (
    <DashboardLayout>
      <div className="container-fluid py-4">
        <h2 className="mb-4 text-secondary">Dashboard</h2>

        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm rounded-3 p-3 text-center">
              <small className="text-muted">Total Products</small>
              <h3 className="mt-2">{products.length}</h3>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm rounded-3 p-3 text-center">
              <small className="text-muted">Low Stock</small>
              <h3 className="mt-2 text-danger">{lowStockCount}</h3>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm rounded-3 p-3 text-center">
              <small className="text-muted">Recent Orders</small>
              <h3 className="mt-2">{orders.length}</h3>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm rounded-3 p-3 text-center">
              <small className="text-muted">Total Sales</small>
              <h3 className="mt-2">{formatCurrency(totalSales)}</h3>
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="card shadow-sm rounded-3 p-3">
          <h5 className="mb-3 text-secondary">Latest Orders</h5>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Total</th>
                  <th scope="col">Status</th>
                  <th scope="col">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((o, index) => (
                    <tr key={o.id}>
                      <td>{index + 1}</td>
                      <td>{o.customer_name}</td>
                      <td>{formatCurrency(o.total)}</td>
                      <td className={`fw-semibold ${
                        o.status === "completed" ? "text-success" :
                        o.status === "pending" ? "text-warning" :
                        "text-danger"
                      }`}>
                        {o.status}
                      </td>
                      <td>{new Date(o.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-3">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
