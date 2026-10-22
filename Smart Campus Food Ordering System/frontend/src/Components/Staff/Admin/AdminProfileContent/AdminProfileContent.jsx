import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiShield,
  FiTruck,
  FiAward,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
} from "react-icons/fi";
import "./AdminProfileContent.css";

const ADMIN_PROFILE_API = "http://localhost:5000/staffs/me/profile";
const ADMIN_PASSWORD_API = "http://localhost:5000/staffs/me/password";

export default function AdminProfileContent() {
  const [adminProfile, setAdminProfile] = useState(null);
  const [adminProfileLoading, setAdminProfileLoading] = useState(true);
  const [adminProfileMessage, setAdminProfileMessage] = useState({
    type: "",
    text: "",
  });

  const [adminPasswordForm, setAdminPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [adminPasswordErrors, setAdminPasswordErrors] = useState({});
  const [adminPasswordSaving, setAdminPasswordSaving] = useState(false);

  const [adminShowPasswords, setAdminShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const showAdminProfileMessage = (type, text) => {
    setAdminProfileMessage({ type, text });
    setTimeout(() => {
      setAdminProfileMessage({ type: "", text: "" });
    }, 3000);
  };

  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("staffToken") ||
      JSON.parse(localStorage.getItem("activeStaff") || "null")?.token ||
      JSON.parse(localStorage.getItem("staff") || "null")?.token ||
      "";

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  const fetchAdminProfile = async () => {
    try {
      setAdminProfileLoading(true);

      const headers = getAuthHeaders();

      if (!headers.Authorization) {
        showAdminProfileMessage(
          "error",
          "No staff token found. Please login again."
        );
        setAdminProfile(null);
        return;
      }

      const res = await axios.get(ADMIN_PROFILE_API, {
        headers,
      });

      setAdminProfile(res.data?.staff || null);
    } catch (error) {
      console.log("Fetch admin profile error:", error);
      showAdminProfileMessage(
        "error",
        error.response?.data?.message || "Failed to load profile."
      );
    } finally {
      setAdminProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const handleAdminPasswordChange = (e) => {
    const { name, value } = e.target;

    setAdminPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setAdminPasswordErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const toggleAdminPasswordVisibility = (field) => {
    setAdminShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateAdminPasswordForm = () => {
    const errors = {};

    if (!adminPasswordForm.currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }

    if (!adminPasswordForm.newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
        adminPasswordForm.newPassword
      )
    ) {
      errors.newPassword =
        "Password must have 8+ characters, uppercase, lowercase, number, and special character";
    }

    if (!adminPasswordForm.confirmPassword.trim()) {
      errors.confirmPassword = "Confirm password is required";
    } else if (
      adminPasswordForm.newPassword !== adminPasswordForm.confirmPassword
    ) {
      errors.confirmPassword = "New password and confirm password do not match";
    }

    if (
      adminPasswordForm.currentPassword &&
      adminPasswordForm.newPassword &&
      adminPasswordForm.currentPassword === adminPasswordForm.newPassword
    ) {
      errors.newPassword =
        "New password must be different from current password";
    }

    setAdminPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdminPasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validateAdminPasswordForm()) {
      return;
    }

    try {
      setAdminPasswordSaving(true);

      const headers = getAuthHeaders();

      if (!headers.Authorization) {
        showAdminProfileMessage(
          "error",
          "No staff token found. Please login again."
        );
        return;
      }

      const res = await axios.put(ADMIN_PASSWORD_API, adminPasswordForm, {
        headers,
      });

      showAdminProfileMessage(
        "success",
        res.data?.message || "Password updated successfully"
      );

      setAdminPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setAdminPasswordErrors({});
    } catch (error) {
      console.log("Update password error:", error);
      showAdminProfileMessage(
        "error",
        error.response?.data?.message || "Failed to update password."
      );
    } finally {
      setAdminPasswordSaving(false);
    }
  };

  if (adminProfileLoading) {
    return (
      <section className="adprof-wrapper">
        <div className="adprof-info-box">Loading admin profile...</div>
      </section>
    );
  }

  return (
    <section className="adprof-wrapper">
      <div className="adprof-topbar">
        <div>
          <span className="adprof-badge">Admin Profile</span>
          <h2>My Profile & Security</h2>
          <p>View your profile details and update your password securely.</p>
        </div>
      </div>

      {adminProfileMessage.text && (
        <div className={`adprof-toast ${adminProfileMessage.type}`}>
          {adminProfileMessage.text}
        </div>
      )}

      <div className="adprof-grid">
        <div className="adprof-card">
          <div className="adprof-card-head">
            <h3>
              <FiUser />
              Profile Information
            </h3>
          </div>

          <div className="adprof-info-list">
            <div className="adprof-info-item">
              <span>
                <FiUser className="adprof-inline-icon" />
                Full Name
              </span>
              <strong>{adminProfile?.name || "-"}</strong>
            </div>

            <div className="adprof-info-item">
              <span>
                <FiMail className="adprof-inline-icon" />
                Email
              </span>
              <strong>{adminProfile?.email || "-"}</strong>
            </div>

            <div className="adprof-info-item">
              <span>
                <FiPhone className="adprof-inline-icon" />
                Phone
              </span>
              <strong>{adminProfile?.phone || "-"}</strong>
            </div>

            <div className="adprof-info-item">
              <span>
                <FiShield className="adprof-inline-icon" />
                Role
              </span>
              <strong>{adminProfile?.role || "-"}</strong>
            </div>

            <div className="adprof-info-item">
              <span>
                <FiTruck className="adprof-inline-icon" />
                Vehicle Type
              </span>
              <strong>{adminProfile?.vehicleType || "-"}</strong>
            </div>

            <div className="adprof-info-item">
              <span>
                <FiAward className="adprof-inline-icon" />
                Experience
              </span>
              <strong>{adminProfile?.experience || "-"}</strong>
            </div>

            <div className="adprof-info-item">
              <span>
                <FiCheckCircle className="adprof-inline-icon" />
                Status
              </span>
              <strong>{adminProfile?.isOnline ? "Online" : "Offline"}</strong>
            </div>
          </div>
        </div>

        <div className="adprof-card">
          <div className="adprof-card-head">
            <h3>
              <FiLock />
              Change Password
            </h3>
          </div>

          <form className="adprof-form" onSubmit={handleAdminPasswordSubmit}>
            <div className="adprof-input-group">
              <label>Current Password</label>
              <div className="adprof-password-wrap">
                <input
                  type={
                    adminShowPasswords.currentPassword ? "text" : "password"
                  }
                  name="currentPassword"
                  value={adminPasswordForm.currentPassword}
                  onChange={handleAdminPasswordChange}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="adprof-eye-btn"
                  onClick={() =>
                    toggleAdminPasswordVisibility("currentPassword")
                  }
                >
                  {adminShowPasswords.currentPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {adminPasswordErrors.currentPassword && (
                <small className="adprof-error-text">
                  {adminPasswordErrors.currentPassword}
                </small>
              )}
            </div>

            <div className="adprof-input-group">
              <label>New Password</label>
              <div className="adprof-password-wrap">
                <input
                  type={adminShowPasswords.newPassword ? "text" : "password"}
                  name="newPassword"
                  value={adminPasswordForm.newPassword}
                  onChange={handleAdminPasswordChange}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="adprof-eye-btn"
                  onClick={() => toggleAdminPasswordVisibility("newPassword")}
                >
                  {adminShowPasswords.newPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {adminPasswordErrors.newPassword && (
                <small className="adprof-error-text">
                  {adminPasswordErrors.newPassword}
                </small>
              )}
            </div>

            <div className="adprof-input-group">
              <label>Confirm New Password</label>
              <div className="adprof-password-wrap">
                <input
                  type={
                    adminShowPasswords.confirmPassword ? "text" : "password"
                  }
                  name="confirmPassword"
                  value={adminPasswordForm.confirmPassword}
                  onChange={handleAdminPasswordChange}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="adprof-eye-btn"
                  onClick={() =>
                    toggleAdminPasswordVisibility("confirmPassword")
                  }
                >
                  {adminShowPasswords.confirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {adminPasswordErrors.confirmPassword && (
                <small className="adprof-error-text">
                  {adminPasswordErrors.confirmPassword}
                </small>
              )}
            </div>

            <div className="adprof-note-box">
              Password must contain at least 8 characters, one uppercase letter,
              one lowercase letter, one number, and one special character.
            </div>

            <div className="adprof-actions">
              <button
                type="submit"
                className="adprof-submit-btn"
                disabled={adminPasswordSaving}
              >
                <FiLock />
                <span>
                  {adminPasswordSaving ? "Updating..." : "Update Password"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}