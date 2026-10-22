import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaIdCard,
  FaBirthdayCake,
  FaFileUpload,
} from "react-icons/fa";
import "./RegisterHomeDeliveryStaffRegisterFrom.css";
import Footer from "../../Footer/Footer";
import RegisterNavbar from "../../Navbar/RegisterNavbar/RegisterNavbar";

const API_BASE = "http://localhost:5000";

export default function RegisterHomeDeliveryStaffRegisterFrom() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "+94",
    address: "",
    nic: "",
    dob: "",
    gender: "",
    vehicleType: "",
    experience: "",
    availability: "",
    reason: "",
    cv: null,
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const storedCustomer =
        JSON.parse(localStorage.getItem("customer")) ||
        JSON.parse(localStorage.getItem("user")) ||
        JSON.parse(localStorage.getItem("loggedCustomer")) ||
        JSON.parse(localStorage.getItem("loggedUser")) ||
        {};

      const customerName = storedCustomer.name || storedCustomer.fullName || "";
      const customerEmail = storedCustomer.email || storedCustomer.gmail || "";
      const customerPhoneRaw =
        storedCustomer.phoneNumber ||
        storedCustomer.telNumber ||
        storedCustomer.phone ||
        "";
      const customerAddress = storedCustomer.address || "";
      const customerGender = storedCustomer.gender || "";

      let normalizedPhone = "+94";

      if (customerPhoneRaw) {
        let digitsOnly = String(customerPhoneRaw).replace(/\D/g, "");

        if (digitsOnly.startsWith("94")) {
          digitsOnly = digitsOnly.slice(2);
        } else if (digitsOnly.startsWith("0")) {
          digitsOnly = digitsOnly.slice(1);
        }

        digitsOnly = digitsOnly.slice(0, 9);
        normalizedPhone = `+94${digitsOnly}`;
      }

      setFormData((prev) => ({
        ...prev,
        fullName: customerName,
        email: customerEmail,
        phone: normalizedPhone,
        address: customerAddress,
        gender: customerGender,
      }));
    } catch (error) {
      console.log("Auto fill customer data error:", error);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "cv") {
      setFormData((prev) => ({
        ...prev,
        cv: files[0] || null,
      }));
      return;
    }

    if (name === "phone") {
      let digitsOnly = value.replace(/\D/g, "");

      if (digitsOnly.startsWith("94")) {
        digitsOnly = digitsOnly.slice(2);
      }

      digitsOnly = digitsOnly.slice(0, 9);

      setFormData((prev) => ({
        ...prev,
        phone: `+94${digitsOnly}`,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneKeyDown = (e) => {
    if (
      formData.phone.length <= 3 &&
      (e.key === "Backspace" || e.key === "Delete")
    ) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.email ||
      formData.phone.length !== 12 ||
      !formData.address ||
      !formData.nic ||
      !formData.dob ||
      !formData.gender ||
      !formData.vehicleType ||
      !formData.experience ||
      !formData.availability ||
      !formData.reason
    ) {
      setMessage({
        type: "error",
        text: "Please fill all required fields correctly.",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      payload.append("address", formData.address);
      payload.append("nic", formData.nic);
      payload.append("dob", formData.dob);
      payload.append("gender", formData.gender);
      payload.append("vehicleType", formData.vehicleType);
      payload.append("experience", formData.experience);
      payload.append("availability", formData.availability);
      payload.append("reason", formData.reason);
      payload.append("applicationSource", "register-home");

      if (formData.cv) {
        payload.append("cv", formData.cv);
      }

      await axios.post(`${API_BASE}/delivery-job-applications`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({
        type: "success",
        text: "Application submitted successfully.",
      });

      setTimeout(() => {
        navigate("/registereddeliverystafffrom");
      }, 1000);
    } catch (error) {
      console.log("Submit application error:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.message || "Failed to submit application.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <RegisterNavbar />

      <section className="jobapp-wrapper">
        <div className="jobapp-card">
          <div className="jobapp-header">
            <h1>Delivery Job Application Form</h1>
            <p>Fill out the form below to apply for the delivery staff position.</p>
          </div>

          {message.text && (
            <div className={`jobapp-alert ${message.type}`}>{message.text}</div>
          )}

          <form className="jobapp-form" onSubmit={handleSubmit}>
            <div className="jobapp-grid">
              <div className="jobapp-group">
                <label>Full Name</label>
                <div className="jobapp-input-wrap">
                  <FaUser className="jobapp-icon" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="jobapp-group">
                <label>Email Address</label>
                <div className="jobapp-input-wrap">
                  <FaEnvelope className="jobapp-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className="jobapp-group">
                <label>Phone Number</label>
                <div className="jobapp-input-wrap">
                  <FaPhone className="jobapp-icon" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onKeyDown={handlePhoneKeyDown}
                    placeholder="+947XXXXXXXX"
                  />
                </div>
              </div>

              <div className="jobapp-group">
                <label>NIC Number</label>
                <div className="jobapp-input-wrap">
                  <FaIdCard className="jobapp-icon" />
                  <input
                    type="text"
                    name="nic"
                    value={formData.nic}
                    onChange={handleChange}
                    placeholder="Enter NIC number"
                  />
                </div>
              </div>

              <div className="jobapp-group">
                <label>Date of Birth</label>
                <div className="jobapp-input-wrap">
                  <FaBirthdayCake className="jobapp-icon" />
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="jobapp-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="jobapp-group">
                <label>Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                >
                  <option value="">Select vehicle type</option>
                  <option value="Bike">Bike</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Three Wheel">Three Wheel</option>
                  <option value="Van">Van</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="jobapp-group">
                <label>Experience</label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                >
                  <option value="">Select experience</option>
                  <option value="No Experience">No Experience</option>
                  <option value="Less than 1 year">Less than 1 year</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="2-5 years">2-5 years</option>
                  <option value="More than 5 years">More than 5 years</option>
                </select>
              </div>

              <div className="jobapp-group">
                <label>Availability</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                >
                  <option value="">Select availability</option>
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                  <option value="Weekends Only">Weekends Only</option>
                  <option value="Morning Shift">Morning Shift</option>
                  <option value="Evening Shift">Evening Shift</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>
            </div>

            <div className="jobapp-group jobapp-full">
              <label>Address</label>
              <div className="jobapp-input-wrap">
                <FaMapMarkerAlt className="jobapp-icon" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
              </div>
            </div>

            <div className="jobapp-group jobapp-full">
              <label>Why do you want this job?</label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Write a short application message"
                rows="5"
              />
            </div>

            <div className="jobapp-group jobapp-full">
              <label>Upload CV / Supporting Document</label>
              <div className="jobapp-file-wrap">
                <FaFileUpload className="jobapp-icon" />
                <input
                  type="file"
                  name="cv"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="jobapp-submit-btn" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}