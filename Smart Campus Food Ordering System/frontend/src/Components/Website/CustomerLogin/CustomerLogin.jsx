import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiMail, FiLock, FiLogIn, FiX } from "react-icons/fi";
import "./CustomerLogin.css";
import loginFoodImage from "../../Website/image/hero1.avif";

export default function CustomerLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    gmail: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const customer = localStorage.getItem("customer");
    if (customer) {
      navigate("/registerHome");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleClose = () => {
    navigate("/ClodeIconLoginHome");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/CustomerLogin", {
        gmail: formData.gmail,
        password: formData.password,
      });

      const customerData = {
        _id: res.data?._id || "",
        id: res.data?._id || "",
        name: res.data?.name || "",
        gmail: res.data?.gmail || formData.gmail || "",
        email: res.data?.gmail || formData.gmail || "",
        address: res.data?.address || "",
        phoneNumber: res.data?.phoneNumber || "",
        gender: res.data?.gender || "",
        dietaryPreferences: res.data?.dietaryPreferences || [],
        allergies: res.data?.allergies || [],
        otherAllergy: res.data?.otherAllergy || "",
        calorieGoal: res.data?.calorieGoal || "",
        notes: res.data?.notes || "",
        isOnline: res.data?.isOnline || false,
      };

      localStorage.setItem("customer", JSON.stringify(customerData));

      setMessage("Login successful");

      setTimeout(() => {
        navigate("/registerHome");
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clog-page">
      <div className="clog-shell">
        <div
          className="clog-left"
          style={{ backgroundImage: `url(${loginFoodImage})` }}
        >
          <div className="clog-left-overlay"></div>

          <div className="clog-left-content">
            <span className="clog-badge">Campus Canteen</span>

            <h1>Welcome Back</h1>
            <p>
              Login to explore meals, manage your account, and enjoy a smarter
              campus food ordering experience.
            </p>

            <div className="clog-points">
              <div className="clog-point-card">
                <h3>Fresh Meals</h3>
                <p>Prepared daily for students.</p>
              </div>

              <div className="clog-point-card">
                <h3>Fast Access</h3>
                <p>Quick login and simple ordering.</p>
              </div>

              <div className="clog-point-card">
                <h3>Student Friendly</h3>
                <p>Easy to use and clean interface.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="clog-right">
          <button
            type="button"
            className="clog-close-btn"
            onClick={handleClose}
            aria-label="Close login form"
          >
            <FiX />
          </button>

          <form className="clog-form" onSubmit={handleSubmit}>
            <div className="clog-form-top">
              <h2>Customer Login</h2>
              <p>Enter your details to continue.</p>
            </div>

            <div className="clog-input-group">
              <label>Gmail</label>
              <div className="clog-input-wrap">
                <FiMail className="clog-input-icon" />
                <input
                  type="email"
                  name="gmail"
                  placeholder="Enter your gmail"
                  value={formData.gmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="clog-input-group">
              <label>Password</label>
              <div className="clog-input-wrap">
                <FiLock className="clog-input-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {message && <div className="clog-message">{message}</div>}

            <button
              type="submit"
              className="clog-submit-btn"
              disabled={loading}
            >
              <FiLogIn />
              <span>{loading ? "Logging in..." : "Login"}</span>
            </button>

            <p className="clog-bottom-text">
              Don’t have an account?{" "}
              <Link to="/customer-register">Register</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}