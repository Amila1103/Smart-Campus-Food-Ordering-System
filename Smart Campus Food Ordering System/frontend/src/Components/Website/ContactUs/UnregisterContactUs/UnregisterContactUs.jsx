import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiMessageSquare,
} from "react-icons/fi";
import "./UnregisterContactUs.css";
import Footer from "../../Footer/Footer";
import UnregisterNavbar from "../../Navbar/UnregisterNavbar/UnregisterNavbar";

export default function UnregisterContactUs() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();


    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });

    navigate("/customer-login");
  };

  return (
    <div className="cu-page">
      <UnregisterNavbar />

      <section className="cu-hero">
        <div className="cu-hero-overlay"></div>
        <div className="cu-hero-content">
          <span className="cu-badge">Campus Canteen Support</span>
          <h1>Contact Us</h1>
          <p>
            Have a question, suggestion, or issue? Our team is here to help you
            with your campus food ordering experience.
          </p>
        </div>
      </section>

      <section className="cu-main">
        <div className="cu-container">
          <div className="cu-left">
            <div className="cu-section-title">
              <span>Get In Touch</span>
              <h2>We Would Love to Hear From You</h2>
              <p>
                Reach out to us for support, feedback, or general inquiries
                about the system and canteen services.
              </p>
            </div>

            <div className="cu-info-grid">
              <div className="cu-info-card">
                <div className="cu-icon-wrap">
                  <FiMapPin />
                </div>
                <div>
                  <h3>Address</h3>
                  <p>Campus Canteen, Main University Road, Sri Lanka</p>
                </div>
              </div>

              <div className="cu-info-card">
                <div className="cu-icon-wrap">
                  <FiPhone />
                </div>
                <div>
                  <h3>Phone</h3>
                  <p>+94 77 123 4567</p>
                </div>
              </div>

              <div className="cu-info-card">
                <div className="cu-icon-wrap">
                  <FiMail />
                </div>
                <div>
                  <h3>Email</h3>
                  <p>campuscanteen@gmail.com</p>
                </div>
              </div>

              <div className="cu-info-card">
                <div className="cu-icon-wrap">
                  <FiClock />
                </div>
                <div>
                  <h3>Working Hours</h3>
                  <p>Monday - Friday : 8.00 AM - 6.00 PM</p>
                </div>
              </div>
            </div>

            <div className="cu-highlight-box">
              <FiMessageSquare className="cu-highlight-icon" />
              <div>
                <h3>Quick Support</h3>
                <p>
                  Our team is ready to answer your questions and help solve
                  issues quickly and smoothly.
                </p>
              </div>
            </div>
          </div>

          <div className="cu-right">
            <form className="cu-form" onSubmit={handleSubmit}>
              <div className="cu-form-top">
                <h2>Send a Message</h2>
                <p>Fill in the details below and contact us directly.</p>
              </div>

              <div className="cu-input-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="cu-input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="cu-input-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Enter subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="cu-input-group">
                <label>Message</label>
                <textarea
                  name="message"
                  placeholder="Write your message"
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="cu-submit-btn">
                <FiSend />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}