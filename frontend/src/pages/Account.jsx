// src/pages/employee/Account.jsx
import React, { useState } from "react";
import { Container, Card, Button, Image, Form, Alert } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import axios from "axios";

export default function EmployeeAccount() {
  const { auth, setAuth } = useAuth();
  const [user, setUser] = useState(auth.user);

  console.log("Current user from auth store:", auth.user);

  const [alert, setAlert] = useState({ show: false, variant: "", message: "" });
  const [loading, setLoading] = useState(false);

  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(user?.profile_picture || "/profile.png");

  const token = localStorage.getItem("token");

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!profilePic) return;

    const formData = new FormData();

    // Append required fields for backend Form validation
    formData.append("full_name", user.full_name || "");
    formData.append("email", user.email || "");
    formData.append("contact_no", user.contact_no || "");
    formData.append("address", user.address || "");
    formData.append("dob", user.dob || "");

    formData.append("profile_picture", profilePic);

    try {
      setLoading(true);
      const res = await axios.put("http://localhost:8000/users/me", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setUser(res.data);
      setAuth({ user: res.data });
      setAlert({ show: true, variant: "success", message: "Profile picture updated!" });
      setProfilePic(null); // reset after update
    } catch (err) {
      setAlert({ show: true, variant: "danger", message: err.response?.data?.detail || "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      {alert.show && (
        <Alert variant={alert.variant} onClose={() => setAlert({ ...alert, show: false })} dismissible>
          {alert.message}
        </Alert>
      )}

      <div className="row g-4">
        {/* Profile Section */}
        <div className="col-md-12">
          <Card className="p-4 shadow-sm rounded-4 border-0 hover-shadow">
            <div className="d-flex align-items-center mb-3">
              <div className="position-relative me-3">
                <Image
                  src={preview}
                  roundedCircle
                  width={90}
                  height={90}
                  className="shadow-sm profile-img"
                  style={{ objectFit: "cover", cursor: "pointer" }}
                  onClick={() => document.getElementById("profileInput").click()}
                />
                <Form.Control
                  type="file"
                  accept="image/*"
                  id="profileInput"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>
              <div>
                <h5 className="mb-1">{user?.full_name || user?.username}</h5>
                <div className="text-muted-small mb-1">
                  Role: <span className="text-capitalize">{user?.role}</span> | Status: {user?.is_active ? "Active" : "Inactive"}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-3">
              <div className="text-uppercase text-muted-small mb-1">Phone Number</div>
              <span>{user?.contact_no || "N/A"}</span>
            </div>

            <div className="mt-3">
              <div className="text-uppercase text-muted-small mb-1">Email</div>
              <span>{user?.email || "N/A"}</span>
            </div>

            <div className="mt-3">
              <div className="text-uppercase text-muted-small mb-1">Address</div>
              <p>{user?.address || "N/A"}</p>
            </div>

            {profilePic && (
              <Button variant="primary" className="mt-3" onClick={handleProfileUpdate} disabled={loading}>
                {loading ? "Updating..." : "Save Profile Picture"}
              </Button>
            )}
          </Card>
        </div>
      </div>

      <style jsx>{`
        .hover-shadow:hover {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12) !important;
        }
        .profile-img:hover {
          opacity: 0.85;
          transform: scale(1.05);
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </Container>
  );
}
