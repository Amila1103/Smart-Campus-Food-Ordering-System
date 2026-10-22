import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiSend,
  FiMessageSquare,
} from "react-icons/fi";
import "./RegisterContactUs.css";
import Footer from "../../Footer/Footer";
import RegisterNavbar from "../../Navbar/RegisterNavbar/RegisterNavbar";

export default function RegisterContactUs() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerId: "",
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedCustomer = localStorage.getItem("customer");

    if (storedCustomer) {
      const customer = JSON.parse(storedCustomer);

      setFormData((prev) => ({
        ...prev,
        customerId: customer?._id || "",
        name: customer?.name || "",
        email: customer?.email || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/ContactUs", {
        customerId: formData.customerId || null,
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      });

      alert("Your message has been sent successfully!");

      const storedCustomer = localStorage.getItem("customer");
      let customerName = "";
      let customerEmail = "";
      let customerId = "";

      if (storedCustomer) {
        const customer = JSON.parse(storedCustomer);
        customerId = customer?._id || "";
        customerName = customer?.name || "";
        customerEmail = customer?.email || "";
      }

      setFormData({
        customerId,
        name: customerName,
        email: customerEmail,
        subject: "",
        message: "",
      });

      navigate("/RegisterHome");
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cu-page">
      <RegisterNavbar />

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

              <button
                type="submit"
                className="cu-submit-btn"
                disabled={loading}
              >
                <FiSend />
                <span>{loading ? "Sending..." : "Send Message"}</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}