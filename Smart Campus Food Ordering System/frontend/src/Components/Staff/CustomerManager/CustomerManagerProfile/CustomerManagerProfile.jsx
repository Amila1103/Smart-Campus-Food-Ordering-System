import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaEnvelope,
  FaUserTag,
  FaToggleOn,
  FaToggleOff,
  FaLock,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";
import "./CustomerManagerProfile.css";

const API_BASE = "http://localhost:5000";

export default function CustomerManagerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionType, setActionType] = useState("");

  const token = localStorage.getItem("staffToken");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setFetchError("");

      const res = await axios.get(`${API_BASE}/staffs/me/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(res?.data?.staff || null);
    } catch (error) {
      console.log("Fetch profile error:", error);
      setFetchError(
        error?.response?.data?.message || "Failed to load profile."
      );
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePassword = () => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      return "All password fields are required.";
    }

    if (!strongPasswordRegex.test(formData.newPassword)) {
      return "New password must have at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return "New password and confirm password do not match.";
    }

    if (formData.currentPassword === formData.newPassword) {
      return "New password must be different from current password.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationMessage = validatePassword();

    if (validationMessage) {
      setActionMessage(validationMessage);
      setActionType("error");
      return;
    }

    try {
      setActionLoading(true);
      setActionMessage("");
      setActionType("");

      const res = await axios.put(
        `${API_BASE}/staffs/me/password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setActionMessage(res?.data?.message || "Password updated successfully.");
      setActionType("success");

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.log("Update password error:", error);
      setActionMessage(
        error?.response?.data?.message || "Failed to update password."
      );
      setActionType("error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="cmprofile-page">
      <div className="cmprofile-header">
        <div>
          <span className="cmprofile-badge">Profile Settings</span>
          <h2>Customer Manager Profile</h2>
          <p>
            View your profile information and securely update your account
            password from one protected panel.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="cmprofile-state-box">Loading profile...</div>
      ) : fetchError ? (
        <div className="cmprofile-state-box error">{fetchError}</div>
      ) : !profile ? (
        <div className="cmprofile-state-box">Profile not found.</div>
      ) : (
        <div className="cmprofile-grid">
          <div className="cmprofile-card">
            <div className="cmprofile-card-head">
              <h3>Profile Overview</h3>
              <span>Read only</span>
            </div>

            <div className="cmprofile-top">
              <div className="cmprofile-avatar">
                {profile?.name?.charAt(0)?.toUpperCase() || "C"}
              </div>

              <div className="cmprofile-top-text">
                <h3>{profile?.name || "Customer Manager"}</h3>
                <p>{profile?.email || "No email"}</p>
                <span className="cmprofile-role-tag">
                  <FaUserTag />
                  {profile?.role || "customer manager"}
                </span>
              </div>
            </div>

            <div className="cmprofile-info-list">
              <div className="cmprofile-info-item">
                <span className="cmprofile-label">
                  <FaUserCircle /> Name
                </span>
                <p>{profile?.name || "Not available"}</p>
              </div>

              <div className="cmprofile-info-item">
                <span className="cmprofile-label">
                  <FaEnvelope /> Email
                </span>
                <p>{profile?.email || "Not available"}</p>
              </div>

              <div className="cmprofile-info-item">
                <span className="cmprofile-label">
                  <FaUserTag /> Role
                </span>
                <p>{profile?.role || "Not available"}</p>
              </div>

              <div className="cmprofile-info-item">
                <span className="cmprofile-label">
                  {profile?.isOnline ? <FaToggleOn /> : <FaToggleOff />} Status
                </span>
                <p>{profile?.isOnline ? "Online" : "Offline"}</p>
              </div>
            </div>
          </div>

          <div className="cmprofile-card">
            <div className="cmprofile-card-head">
              <h3>Change Password</h3>
              <span>Secure update</span>
            </div>

            <div className="cmprofile-password-note">
              <FaShieldAlt />
              <p>
                Password must include at least 8 characters, one uppercase
                letter, one lowercase letter, one number, and one special
                character.
              </p>
            </div>

            <form className="cmprofile-form" onSubmit={handleSubmit}>
              <div className="cmprofile-form-group">
                <label>Current Password</label>
                <div className="cmprofile-input-wrap">
                  <FaLock className="cmprofile-input-icon" />
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    required
                  />
                </div>
              </div>

              <div className="cmprofile-form-group">
                <label>New Password</label>
                <div className="cmprofile-input-wrap">
                  <FaLock className="cmprofile-input-icon" />
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required
                  />
                </div>
              </div>

              <div className="cmprofile-form-group">
                <label>Confirm New Password</label>
                <div className="cmprofile-input-wrap">
                  <FaCheckCircle className="cmprofile-input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              {actionMessage && (
                <div
                  className={
                    actionType === "success"
                      ? "cmprofile-message success"
                      : "cmprofile-message error"
                  }
                >
                  {actionMessage}
                </div>
              )}

              <button
                type="submit"
                className="cmprofile-save-btn"
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}