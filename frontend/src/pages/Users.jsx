// src/pages/Users.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Spinner,
  Toast,
  ToastContainer,
  Modal,
  Form,
} from "react-bootstrap";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newUser, setNewUser] = useState({ username: "", role: "employee", password: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", variant: "" });

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to fetch users");
      setUsers(await res.json());
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Activate/Deactivate user
  const handleActivateToggle = async (user) => {
    try {
      const res = await fetch(
        `http://localhost:8000/users/${user.id}/activate?is_active=${!user.is_active}`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to update status");
      setToast({ show: true, message: `User ${!user.is_active ? "activated" : "deactivated"}!`, variant: "success" });
      fetchUsers();
    } catch (err) {
      setToast({ show: true, message: err.message, variant: "danger" });
    }
  };

  // Edit Role Modal
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowEdit(true);
  };

  const handleSaveRole = async () => {
    try {
      setSaving(true);
      const res = await fetch(`http://localhost:8000/users/${selectedUser.id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to update role");
      setShowEdit(false);
      setToast({ show: true, message: "Role updated successfully!", variant: "success" });
      fetchUsers();
    } catch (err) {
      setToast({ show: true, message: err.message, variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  // Add new user
  const handleAddUser = async () => {
    try {
      setSaving(true);
      const res = await fetch("http://localhost:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Failed to add user");
      setShowAdd(false);
      setToast({ show: true, message: "User added successfully!", variant: "success" });
      setNewUser({ username: "", role: "employee", password: "" });
      fetchUsers();
    } catch (err) {
      setToast({ show: true, message: err.message, variant: "danger" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-secondary">Users</h2>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" />
              <div className="mt-2">Loading users...</div>
            </div>
          ) : error ? (
            <div className="text-danger text-center">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center text-muted">No users found.</div>
          ) : (
            <Table striped hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id}>
                    <td>{idx + 1}</td>
                    <td>{u.username}</td>
                    <td>{u.full_name || "-"}</td>
                    <td>{u.email || "-"}</td>
                    <td>
                      <span className={`badge bg-${u.role === "owner" ? "primary" : "secondary"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${u.is_active ? "success" : "danger"}`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditClick(u)}
                      >
                        Edit Role
                      </Button>
                      <Button
                        variant={u.is_active ? "outline-warning" : "outline-success"}
                        size="sm"
                        onClick={() => handleActivateToggle(u)}
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Edit Role Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            <option value="owner">Owner</option>
            <option value="employee">Employee</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveRole} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add User Modal */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Username</Form.Label>
              <Form.Control
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="owner">Owner</option>
                <option value="employee">Employee</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAddUser} disabled={saving}>
            {saving ? "Saving..." : "Add User"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Alerts */}
      <ToastContainer className="p-3" position="top-end">
        <Toast
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          bg={toast.variant}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Add User Button */}
      <div className="d-flex justify-content-end mt-3">
        <Button variant="success" onClick={() => setShowAdd(true)}>
          Add User
        </Button>
      </div>
    </div>
  );
}
