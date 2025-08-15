// src/components/Receipt.jsx
import React from "react";
import { Modal, Button, Table } from "react-bootstrap";

export default function Receipt({ show, onClose, order }) {
  if (!order) return null;

  const formatPeso = (amount) => {
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Receipt</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4" style={{ fontFamily: "Helvetica, Arial, sans-serif", background: "#f9f9f9" }}>
        <div className="mb-3 text-center">
          <h5 style={{ letterSpacing: "1px", fontWeight: "500" }}>My Company</h5>
          <small>Order ID: {order.id}</small>
        </div>

        <hr />

        <div className="mb-3">
          <h6>Customer Info</h6>
          <p className="mb-1">Name: {order.customer_name}</p>
          <p className="mb-1">Phone: {order.customer_phone}</p>
          <p className="mb-1">Email: {order.customer_email}</p>
          <p className="mb-1">Address: {order.customer_address}</p>
        </div>

        <hr />

        <div>
          <h6>Order Items</h6>
          <Table borderless size="sm">
            <thead>
              <tr>
                <th>Product</th>
                <th className="text-center">Qty</th>
                <th className="text-end">Price</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.product_id}>
                  <td>{item.product_name}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-end">{formatPeso(item.price)}</td>
                  <td className="text-end">{formatPeso(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <hr />

        <div className="text-end">
          <h5>Total: {formatPeso(order.total)}</h5>
        </div>

        <div className="text-center mt-4" style={{ fontSize: "0.8rem", color: "#666" }}>
          Thank you for your purchase!
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button variant="primary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
