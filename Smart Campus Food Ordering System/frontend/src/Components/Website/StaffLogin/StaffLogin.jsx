import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiMail,
  FiLock,
  FiLogIn,
  FiShield,
  FiUserCheck,
  FiTruck,
  FiX,
  FiCheckCircle,
} from "react-icons/fi";
import "./StaffLogin.css";
import loginImage from "../../Website/image/hero1.avif";

export default function StaffLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");
  const [welcomeRole, setWelcomeRole] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClose = () => {
    navigate("/UnHome");
  };

  const redirectByRole = (role) => {
    const normalizedRole = String(role || "").toLowerCase();

    if (normalizedRole === "admin") {
      navigate("/admin-dashboard");
    } else if (normalizedRole === "vendor") {
      navigate("/vendor-dashboard");
    } else if (normalizedRole === "delivery") {
      navigate("/delivery-dashboard");
    } else if (normalizedRole === "customer manager") {
      navigate("/customer-manager-dashboard");
    } else if (normalizedRole === "delivery manager") {
      navigate("/delivery-manager-dashboard");
    } else {
      navigate("/");
    }
  };

  const formatRoleLabel = (role) => {
    const normalizedRole = String(role || "").toLowerCase();

    if (normalizedRole === "admin") return "Admin";
    if (normalizedRole === "vendor") return "Vendor";
    if (normalizedRole === "delivery") return "Delivery";
    if (normalizedRole === "customer manager") return "Customer Manager";
    if (normalizedRole === "delivery manager") return "Delivery Manager";
    return "Staff";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.email || !formData.password) {
      setMessage("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/StaffLogin", {
        email: formData.email,
        password: formData.password,
      });

      const staffData = {
        id: res?.data?.id,
        name: res?.data?.name,
        email: res?.data?.email,
        role: res?.data?.role,
        token: res?.data?.token,
      };

      localStorage.setItem("staffToken", res?.data?.token || "");
      localStorage.setItem("staff", JSON.stringify(staffData));
      localStorage.setItem("activeStaff", JSON.stringify(staffData));

      setWelcomeName(res?.data?.name || "Staff");
      setWelcomeRole(formatRoleLabel(res?.data?.role));
      setShowWelcome(true);
      setMessage("Login successful.");

      setTimeout(() => {
        redirectByRole(res?.data?.role);
      }, 1800);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  if (showWelcome) {
    return (
      <div className="stafflogin-page">
        <div className="stafflogin-shell">
          <div
            className="stafflogin-left"
            style={{ backgroundImage: `url(${loginImage})` }}
          >
            <div className="stafflogin-left-overlay"></div>

            <div className="stafflogin-left-content">
              <span className="stafflogin-badge">Campus Canteen Staff Portal</span>

              <h1>Welcome Back</h1>
              <p>
                Your account has been verified successfully. Preparing your
                workspace now.
              </p>

              <div className="stafflogin-feature-grid">
                <div className="stafflogin-feature-card">
                  <FiShield className="stafflogin-feature-icon" />
                  <div>
                    <h3>Secure Access</h3>
                    <p>Protected login for authorized staff members.</p>
                  </div>
                </div>

                <div className="stafflogin-feature-card">
                  <FiUserCheck className="stafflogin-feature-icon" />
                  <div>
                    <h3>Verified Identity</h3>
                    <p>Your credentials have been accepted successfully.</p>
                  </div>
                </div>

                <div className="stafflogin-feature-card">
                  <FiTruck className="stafflogin-feature-icon" />
                  <div>
                    <h3>Fast Redirect</h3>
                    <p>You will be taken to your dashboard in a moment.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="stafflogin-right">
            <div className="stafflogin-form stafflogin-welcome-box">
              <div className="stafflogin-welcome-icon">
                <FiCheckCircle />
              </div>

              <div className="stafflogin-form-top">
                <span className="stafflogin-mini-title">Login Successful</span>
                <h2>Welcome, {welcomeName}</h2>
                <p>Redirecting to your {welcomeRole} dashboard...</p>
              </div>

              <div className="stafflogin-welcome-loader">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stafflogin-page">
      <div className="stafflogin-shell">
        <div
          className="stafflogin-left"
          style={{ backgroundImage: `url(${loginImage})` }}
        >
          <div className="stafflogin-left-overlay"></div>

          <div className="stafflogin-left-content">
            <span className="stafflogin-badge">Campus Canteen Staff Portal</span>

            <h1>Welcome Back</h1>
            <p>
              Securely log in to manage operations, monitor orders, and support
              the campus food service efficiently.
            </p>

            <div className="stafflogin-feature-grid">
              <div className="stafflogin-feature-card">
                <FiShield className="stafflogin-feature-icon" />
                <div>
                  <h3>Secure Access</h3>
                  <p>Protected login for authorized staff members.</p>
                </div>
              </div>

              <div className="stafflogin-feature-card">
                <FiUserCheck className="stafflogin-feature-icon" />
                <div>
                  <h3>Role Based</h3>
                  <p>Admin, vendor, and manager access in one place.</p>
                </div>
              </div>

              <div className="stafflogin-feature-card">
                <FiTruck className="stafflogin-feature-icon" />
                <div>
                  <h3>Operational Control</h3>
                  <p>Handle deliveries, menus, and staff tasks smoothly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="stafflogin-right">
          <button
            type="button"
            className="stafflogin-close-btn"
            onClick={handleClose}
            aria-label="Close login form"
          >
            <FiX />
          </button>

          <form className="stafflogin-form" onSubmit={handleSubmit}>
            <div className="stafflogin-form-top">
              <span className="stafflogin-mini-title">Staff Sign In</span>
              <h2>Login to Your Account</h2>
              <p>Enter your staff credentials to continue.</p>
            </div>

            <div className="stafflogin-input-group">
              <label>Email</label>
              <div className="stafflogin-input-wrap">
                <FiMail className="stafflogin-input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your staff email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="stafflogin-input-group">
              <label>Password</label>
              <div className="stafflogin-input-wrap">
                <FiLock className="stafflogin-input-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {message && <div className="stafflogin-message">{message}</div>}

            <button
              type="submit"
              className="stafflogin-submit-btn"
              disabled={loading}
            >
              <FiLogIn />
              <span>{loading ? "Logging in..." : "Login"}</span>
            </button>

            <p className="stafflogin-bottom-text">
              Need to go back? <Link to="/UnHome">Return Home</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}