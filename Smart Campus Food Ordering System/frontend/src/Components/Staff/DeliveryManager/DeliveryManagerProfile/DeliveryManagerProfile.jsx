import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUserCircle,
  FaEnvelope,
  FaIdBadge,
  FaCircle,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSyncAlt,
  FaCheckCircle,
} from "react-icons/fa";
import "./DeliveryManagerProfile.css";

const API_BASE = "http://localhost:5000";

export default function DeliveryManagerProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
  };

  const getToken = () => {
    const staffData = JSON.parse(localStorage.getItem("staff") || "{}");
    return staffData?.token;
  };

  const fetchMyProfile = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE}/staffs/me/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(res.data?.staff || null);
    } catch (error) {
      console.log("fetchMyProfile error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      showMessage("error", "Please fill all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage("error", "New password and confirm password do not match");
      return;
    }

    try {
      setUpdatingPassword(true);

      const token = getToken();

      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        return;
      }

      const res = await axios.put(
        `${API_BASE}/staffs/me/password`,
        passwordForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMessage(
        "success",
        res.data?.message || "Password updated successfully"
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.log("handleUpdatePassword error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to update password"
      );
    } finally {
      setUpdatingPassword(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not Available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not Available";
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <section className="dmprofile-wrapper">
        <div className="dmprofile-loading-box">Loading profile...</div>
      </section>
    );
  }

  return (
    <section className="dmprofile-wrapper">
      <div className="dmprofile-header">
        <div className="dmprofile-header-left">
          <div className="dmprofile-avatar">
            <FaUserCircle />
          </div>

          <div>
            <span className="dmprofile-badge">Manager Profile</span>
            <h2>{profile?.name || "Delivery Manager"}</h2>
            <p>Manage your account details and update your password securely.</p>
          </div>
        </div>

        <button className="dmprofile-refresh-btn" onClick={fetchMyProfile}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      {message.text && (
        <div className={`dmprofile-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="dmprofile-main-grid">
        <div className="dmprofile-card">
          <div className="dmprofile-card-head">
            <FaCheckCircle className="dmprofile-card-icon" />
            <h3>Profile Information</h3>
          </div>

          <div className="dmprofile-info-list">
            <div className="dmprofile-info-item">
              <span className="dmprofile-label">
                <FaUserCircle /> Full Name
              </span>
              <strong>{profile?.name || "Not Available"}</strong>
            </div>

            <div className="dmprofile-info-item">
              <span className="dmprofile-label">
                <FaEnvelope /> Email Address
              </span>
              <strong>{profile?.email || "Not Available"}</strong>
            </div>

            <div className="dmprofile-info-item">
              <span className="dmprofile-label">
                <FaIdBadge /> Role
              </span>
              <strong className="dmprofile-role-pill">
                {profile?.role || "Not Available"}
              </strong>
            </div>

            <div className="dmprofile-info-item">
              <span className="dmprofile-label">
                <FaCircle /> Online Status
              </span>
              <strong
                className={
                  profile?.isOnline
                    ? "dmprofile-status online"
                    : "dmprofile-status offline"
                }
              >
                {profile?.isOnline ? "Online" : "Offline"}
              </strong>
            </div>

            <div className="dmprofile-info-item">
              <span className="dmprofile-label">Created At</span>
              <strong>{formatDate(profile?.createdAt)}</strong>
            </div>

            <div className="dmprofile-info-item">
              <span className="dmprofile-label">Last Updated</span>
              <strong>{formatDate(profile?.updatedAt)}</strong>
            </div>
          </div>
        </div>

        <div className="dmprofile-card">
          <div className="dmprofile-card-head">
            <FaLock className="dmprofile-card-icon" />
            <h3>Change Password</h3>
          </div>

          <form className="dmprofile-form" onSubmit={handleUpdatePassword}>
            <div className="dmprofile-form-group">
              <label>Current Password</label>
              <div className="dmprofile-password-wrap">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  className="dmprofile-eye-btn"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      current: !prev.current,
                    }))
                  }
                >
                  {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="dmprofile-form-group">
              <label>New Password</label>
              <div className="dmprofile-password-wrap">
                <input
                  type={showPasswords.next ? "text" : "password"}
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  className="dmprofile-eye-btn"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      next: !prev.next,
                    }))
                  }
                >
                  {showPasswords.next ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="dmprofile-form-group">
              <label>Confirm New Password</label>
              <div className="dmprofile-password-wrap">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  className="dmprofile-eye-btn"
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      confirm: !prev.confirm,
                    }))
                  }
                >
                  {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="dmprofile-submit-btn"
              disabled={updatingPassword}
            >
              {updatingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}