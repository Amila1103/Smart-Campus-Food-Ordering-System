import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserComplainPage.css";
import Footer from "../Footer/Footer";
import RegisterNavbar from "../Navbar/RegisterNavbar/RegisterNavbar";

const API_BASE = "http://localhost:5000";

export default function UserComplainPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    orderId: "",
    category: "",
    subject: "",
    complaint: "",
    image: null,
  });

  const [submitted, setSubmitted] = useState(false);
  const [fileName, setFileName] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCustomerData = async () => {
      try {
        setLoadingUser(true);

        const savedCustomer =
          JSON.parse(localStorage.getItem("customer")) ||
          JSON.parse(localStorage.getItem("activeCustomer")) ||
          JSON.parse(localStorage.getItem("user"));

        const customerId = savedCustomer?._id || savedCustomer?.id;

        if (customerId) {
          try {
            const res = await axios.get(`${API_BASE}/Customers/${customerId}`);
            const customer = res.data?.Customers;

            if (customer) {
              setFormData((prev) => ({
                ...prev,
                fullName: customer.name || savedCustomer?.name || "",
                email:
                  customer.gmail ||
                  customer.email ||
                  savedCustomer?.email ||
                  savedCustomer?.gmail ||
                  "",
              }));
              return;
            }
          } catch (fetchError) {
            console.log(
              "Customer fetch failed, using localStorage data:",
              fetchError
            );
          }
        }

        if (savedCustomer) {
          setFormData((prev) => ({
            ...prev,
            fullName: savedCustomer.name || "",
            email: savedCustomer.email || savedCustomer.gmail || "",
          }));
        }
      } catch (error) {
        console.log("Auto fill error:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    loadCustomerData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const selectedFile = files && files[0] ? files[0] : null;

      setFormData((prev) => ({
        ...prev,
        image: selectedFile,
      }));

      setFileName(selectedFile ? selectedFile.name : "");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const savedCustomer =
        JSON.parse(localStorage.getItem("customer")) ||
        JSON.parse(localStorage.getItem("activeCustomer")) ||
        JSON.parse(localStorage.getItem("user"));

      const submitData = new FormData();
      submitData.append(
        "customerId",
        savedCustomer?._id || savedCustomer?.id || ""
      );
      submitData.append("fullName", formData.fullName);
      submitData.append("email", formData.email);
      submitData.append("orderId", formData.orderId);
      submitData.append("category", formData.category);
      submitData.append("subject", formData.subject);
      submitData.append("complaint", formData.complaint);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      await axios.post(`${API_BASE}/complaints`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitted(true);

      setFormData((prev) => ({
        ...prev,
        orderId: "",
        category: "",
        subject: "",
        complaint: "",
        image: null,
      }));

      setFileName("");

      alert("Complaint submitted successfully");

      navigate("/registeredhomecomplain");
    } catch (error) {
      console.log("Complaint submit error:", error);
      alert(error?.response?.data?.message || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <RegisterNavbar />

      <div className="ucp-page-shell">
        <div className="ucp-hero-strip">
          <div className="ucp-hero-content">
            <p className="ucp-mini-badge">Support Center</p>
            <h1 className="ucp-main-title">Submit Your Complaint</h1>
            <p className="ucp-main-subtitle">
              Please fill out the form below and let us know about your issue.
              Our team will review your complaint as soon as possible.
            </p>
          </div>
        </div>

        <div className="ucp-layout-wrap">
          <div className="ucp-info-panel">
            <div className="ucp-info-card">
              <h2>Need Assistance?</h2>
              <p>
                Give clear details about your issue so we can help you faster.
              </p>

              <div className="ucp-info-points">
                <div className="ucp-info-item">
                  <span className="ucp-info-dot"></span>
                  <p>Your name and email will be filled automatically</p>
                </div>

                <div className="ucp-info-item">
                  <span className="ucp-info-dot"></span>
                  <p>Add order ID if your complaint is related to an order</p>
                </div>

                <div className="ucp-info-item">
                  <span className="ucp-info-dot"></span>
                  <p>Write the complaint clearly and briefly</p>
                </div>

                <div className="ucp-info-item">
                  <span className="ucp-info-dot"></span>
                  <p>Upload an image if you want, but it is optional</p>
                </div>
              </div>
            </div>

            <div className="ucp-highlight-box">
              <h3>Response Time</h3>
              <p>
                Most complaints are reviewed within <strong>24 - 48 hours</strong>.
              </p>
            </div>
          </div>

          <div className="ucp-form-panel">
            <form className="ucp-complaint-form" onSubmit={handleSubmit}>
              <div className="ucp-form-header">
                <h2>Complaint Form</h2>
                <p>Please complete the required fields and submit your complaint.</p>
              </div>

              {submitted && (
                <div className="ucp-success-message">
                  Your complaint has been submitted successfully.
                </div>
              )}

              <div className="ucp-form-grid">
                <div className="ucp-input-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder={
                      loadingUser ? "Loading user name..." : "Enter your full name"
                    }
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="ucp-input-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder={
                      loadingUser ? "Loading email..." : "Enter your email address"
                    }
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="ucp-input-group">
                  <label>Order ID</label>
                  <input
                    type="text"
                    name="orderId"
                    placeholder="Enter order ID (optional)"
                    value={formData.orderId}
                    onChange={handleChange}
                  />
                </div>

                <div className="ucp-input-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Late Delivery">Late Delivery</option>
                    <option value="Wrong Item">Wrong Item</option>
                    <option value="Damaged Item">Damaged Item</option>
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="Staff Behavior">Staff Behavior</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="ucp-input-group ucp-full-width">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    placeholder="Enter complaint subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="ucp-input-group ucp-full-width">
                  <label>Complaint Details</label>
                  <textarea
                    name="complaint"
                    rows="6"
                    placeholder="Describe your complaint"
                    value={formData.complaint}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="ucp-input-group ucp-full-width">
                  <label>Upload Image (Optional)</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  {fileName && (
                    <span className="ucp-file-name">
                      Selected file: {fileName}
                    </span>
                  )}
                </div>
              </div>

              <div className="ucp-action-row">
                <button
                  type="submit"
                  className="ucp-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Complaint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}