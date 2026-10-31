import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaEnvelope,
  FaUserTag,
  FaCircle,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSave,
} from "react-icons/fa";
import "./VendorProfile.css";

const API_BASE = "http://localhost:5000";

export default function VendorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const staffData = JSON.parse(localStorage.getItem("staff") || "{}");
  const token = staffData?.token;

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/staffs/me/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(res.data?.staff || null);
    } catch (error) {
      console.log("Fetch profile error:", error);
      showMessage("error", error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
      showMessage("error", "Login required");
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const togglePassword = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      showMessage("error", "Please fill all password fields");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showMessage("error", "New password and confirm password do not match");
      return;
    }

    try {
      setSaving(true);

      const res = await axios.put(
        `${API_BASE}/staffs/me/password`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMessage("success", res.data?.message || "Password updated successfully");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.log("Update password error:", error);
      showMessage("error", error.response?.data?.message || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="vendorprofile-wrapper">
      <div className="vendorprofile-header-card">
        <div className="vendorprofile-avatar-wrap">
          <div className="vendorprofile-avatar">
            <FaUserCircle />
          </div>

          <div className="vendorprofile-title-wrap">
            <span className="vendorprofile-badge">Vendor Profile</span>
            <h2>My Account Profile</h2>
            <p>View your vendor account details and change only your password.</p>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`vendorprofile-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="vendorprofile-loading-box">Loading profile...</div>
      ) : (
        <>
          <div className="vendorprofile-grid">
            <div className="vendorprofile-info-card">
              <div className="vendorprofile-card-head">
                <h3>Profile Information</h3>
              </div>

              <div className="vendorprofile-info-list">
                <div className="vendorprofile-info-item">
                  <div className="vendorprofile-info-icon green">
                    <FaUserCircle />
                  </div>
                  <div>
                    <span>Name</span>
                    <strong>{profile?.name || "Not Available"}</strong>
                  </div>
                </div>

                <div className="vendorprofile-info-item">
                  <div className="vendorprofile-info-icon orange">
                    <FaEnvelope />
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{profile?.email || "Not Available"}</strong>
                  </div>
                </div>

                <div className="vendorprofile-info-item">
                  <div className="vendorprofile-info-icon green">
                    <FaUserTag />
                  </div>
                  <div>
                    <span>Role</span>
                    <strong>{profile?.role || "vendor"}</strong>
                  </div>
                </div>

                <div className="vendorprofile-info-item">
                  <div className="vendorprofile-info-icon orange">
                    <FaCircle />
                  </div>
                  <div>
                    <span>Status</span>
                    <strong>{profile?.isOnline ? "Online" : "Offline"}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="vendorprofile-password-card">
              <div className="vendorprofile-card-head">
                <h3>Change Password</h3>
                <p>Password witharak edit karanna puluwan.</p>
              </div>

              <form className="vendorprofile-form" onSubmit={handlePasswordUpdate}>
                <div className="vendorprofile-input-group">
                  <label>Current Password</label>
                  <div className="vendorprofile-input-wrap">
                    <FaLock className="vendorprofile-input-icon" />
                    <input
                      type={showPasswords.currentPassword ? "text" : "password"}
                      name="currentPassword"
                      placeholder="Enter current password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="vendorprofile-toggle-btn"
                      onClick={() => togglePassword("currentPassword")}
                    >
                      {showPasswords.currentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="vendorprofile-input-group">
                  <label>New Password</label>
                  <div className="vendorprofile-input-wrap">
                    <FaLock className="vendorprofile-input-icon" />
                    <input
                      type={showPasswords.newPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="vendorprofile-toggle-btn"
                      onClick={() => togglePassword("newPassword")}
                    >
                      {showPasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="vendorprofile-input-group">
                  <label>Confirm New Password</label>
                  <div className="vendorprofile-input-wrap">
                    <FaLock className="vendorprofile-input-icon" />
                    <input
                      type={showPasswords.confirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="vendorprofile-toggle-btn"
                      onClick={() => togglePassword("confirmPassword")}
                    >
                      {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="vendorprofile-save-btn"
                  disabled={saving}
                >
                  <FaSave />
                  <span>{saving ? "Updating..." : "Update Password"}</span>
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </section>
  );
}