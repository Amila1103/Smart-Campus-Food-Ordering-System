import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiMail,
  FiLock,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";
import "./CustomerRegister.css";
import registerFoodImage from "../../Website/image/hero1.avif";

const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "High Protein",
  "Low Sugar",
  "Low Calorie",
  "Halal",
];

const ALLERGY_OPTIONS = [
  "Nuts",
  "Dairy",
  "Eggs",
  "Seafood",
  "Gluten",
  "Soy",
];

const CALORIE_GOALS = [
  "Low Calorie",
  "Balanced",
  "High Calorie",
  "Weight Loss",
  "Maintain Weight",
  "Weight Gain",
];

export default function CustomerRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "+94",
    address: "",
    gender: "",
    gmail: "",
    password: "",
    dietaryPreferences: [],
    allergies: [],
    otherAllergy: "",
    calorieGoal: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPreferencePopup, setShowPreferencePopup] = useState(false);
  const [showExtraFields, setShowExtraFields] = useState(false);

  const handleClose = () => {
    navigate("/RegisterfromCloseicon");
  };

  const isValidPhoneNumber = (phone) => {
    return /^\+94\d{9}$/.test(phone);
  };

  const isValidPassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(
      password
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      let cleaned = value.replace(/[^\d+]/g, "");

      if (!cleaned.startsWith("+94")) {
        const digitsOnly = cleaned.replace(/\D/g, "");
        const after94 = digitsOnly.startsWith("94")
          ? digitsOnly.slice(2)
          : digitsOnly;
        cleaned = `+94${after94}`;
      }

      const afterPrefix = cleaned.slice(3).replace(/\D/g, "").slice(0, 9);
      cleaned = `+94${afterPrefix}`;

      setFormData((prev) => ({
        ...prev,
        phoneNumber: cleaned,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => {
      const alreadySelected = prev[field].includes(value);

      return {
        ...prev,
        [field]: alreadySelected
          ? prev[field].filter((item) => item !== value)
          : [...prev[field], value],
      };
    });
  };

  const submitRegistration = async (includeExtraFields) => {
    try {
      setLoading(true);
      setMessage("");

      await axios.post("http://localhost:5000/CustomerRegister", {
        name: formData.name.trim(),
        phoneNumber: formData.phoneNumber.replace("+", ""),
        address: formData.address.trim(),
        gender: formData.gender,
        gmail: formData.gmail.trim(),
        password: formData.password,
        dietaryPreferences: includeExtraFields ? formData.dietaryPreferences : [],
        allergies: includeExtraFields ? formData.allergies : [],
        otherAllergy: includeExtraFields ? formData.otherAllergy.trim() : "",
        calorieGoal: includeExtraFields ? formData.calorieGoal : "",
        notes: includeExtraFields ? formData.notes.trim() : "",
      });

      setMessage("Registration successful.");

      setTimeout(() => {
        navigate("/customer-loginpage");
      }, 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const validateBasicFields = () => {
    if (
      !formData.name.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.address.trim() ||
      !formData.gender ||
      !formData.gmail.trim() ||
      !formData.password
    ) {
      setMessage("Please fill all required fields.");
      return false;
    }

    if (!isValidPhoneNumber(formData.phoneNumber)) {
      setMessage("Phone number must be in +94 format with 9 digits after it.");
      return false;
    }

    if (!isValidPassword(formData.password)) {
      setMessage(
        "Password must include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
      );
      return false;
    }

    return true;
  };

  const handleInitialRegister = (e) => {
    e.preventDefault();
    setMessage("");

    if (!validateBasicFields()) return;

    if (showExtraFields) {
      submitRegistration(true);
    } else {
      setShowPreferencePopup(true);
    }
  };

  const handleYesPreferences = () => {
    if (!validateBasicFields()) return;
    setShowPreferencePopup(false);
    setShowExtraFields(true);
    setMessage("Now fill your allergy and dietary preference details.");
  };

  const handleNoPreferences = () => {
    setShowPreferencePopup(false);
    submitRegistration(false);
  };

  const handleBackToBasic = () => {
    setShowExtraFields(false);
    setMessage("");
  };

  return (
    <div className="creg-page">
      <div className="creg-shell">
        <div
          className="creg-left"
          style={{ backgroundImage: `url(${registerFoodImage})` }}
        >
          <div className="creg-left-overlay"></div>

          <div className="creg-left-content">
            <span className="creg-badge">Campus Canteen</span>

            <h1>
              {showExtraFields ? "Food Preference Details" : "Create Your Account"}
            </h1>
            <p>
              <strong>
                {showExtraFields
                  ? "Add your allergy and dietary details to get safer and smarter food recommendations."
                  : "Register to order meals faster and save your food preference details in one place."}
              </strong>
            </p>

            <div className="creg-benefits">
              <div className="creg-benefit-card">
                <h3>{showExtraFields ? "Better Matching" : "Quick Registration"}</h3>
                <p>
                  {showExtraFields
                    ? "Standardized choices help the system match foods more accurately."
                    : "Simple form with student-friendly flow."}
                </p>
              </div>

              <div className="creg-benefit-card">
                <h3>{showExtraFields ? "Safer Food Picks" : "Preference Saving"}</h3>
                <p>
                  {showExtraFields
                    ? "Avoid foods that contain allergens you selected."
                    : "Store dietary and allergy related details."}
                </p>
              </div>

              <div className="creg-benefit-card">
                <h3>{showExtraFields ? "Smart Recommendation" : "Smart Experience"}</h3>
                <p>
                  {showExtraFields
                    ? "Makes recommendation results cleaner and more reliable."
                    : "Better menu browsing and account access."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="creg-right">
          <button
            type="button"
            className="creg-close-btn"
            onClick={handleClose}
            aria-label="Close register form"
          >
            <FiX />
          </button>

          <form className="creg-form" onSubmit={handleInitialRegister}>
            <div className="creg-form-top">
              <h2>{showExtraFields ? "Step 2: Preferences" : "Step 1: Customer Register"}</h2>
              <p>
                {showExtraFields
                  ? "Choose the options below for better recommendations."
                  : "Fill the basic details below."}
              </p>
            </div>

            {!showExtraFields ? (
              <div className="creg-grid">
                <div className="creg-input-group">
                  <label>Name</label>
                  <div className="creg-input-wrap">
                    <FiUser className="creg-input-icon" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="creg-input-group">
                  <label>Phone Number</label>
                  <div className="creg-input-wrap">
                    <FiPhone className="creg-input-icon" />
                    <input
                      type="text"
                      name="phoneNumber"
                      placeholder="+94771234567"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      maxLength={12}
                    />
                  </div>
                  <small className="creg-helper-text">
                    Format: +94 and 9 digits only
                  </small>
                </div>

                <div className="creg-input-group creg-full">
                  <label>Address</label>
                  <div className="creg-input-wrap">
                    <FiMapPin className="creg-input-icon" />
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="creg-input-group">
                  <label>Gender</label>
                  <div className="creg-input-wrap creg-select-wrap">
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
                </div>

                <div className="creg-input-group">
                  <label>Gmail</label>
                  <div className="creg-input-wrap">
                    <FiMail className="creg-input-icon" />
                    <input
                      type="email"
                      name="gmail"
                      placeholder="Enter gmail"
                      value={formData.gmail}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="creg-input-group creg-full">
                  <label>Password</label>
                  <div className="creg-input-wrap">
                    <FiLock className="creg-input-icon" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <small className="creg-helper-text">
                    Must include uppercase, lowercase, number, and special character
                  </small>
                </div>
              </div>
            ) : (
              <div className="creg-grid">
                <div className="creg-input-group creg-full">
                  <label>Dietary Preferences</label>
                  <div className="creg-choice-grid">
                    {DIETARY_OPTIONS.map((item) => (
                      <label key={item} className="creg-check-card">
                        <input
                          type="checkbox"
                          checked={formData.dietaryPreferences.includes(item)}
                          onChange={() =>
                            handleCheckboxChange("dietaryPreferences", item)
                          }
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="creg-input-group creg-full">
                  <label>Allergies</label>
                  <div className="creg-choice-grid">
                    {ALLERGY_OPTIONS.map((item) => (
                      <label key={item} className="creg-check-card creg-allergy-card">
                        <input
                          type="checkbox"
                          checked={formData.allergies.includes(item)}
                          onChange={() => handleCheckboxChange("allergies", item)}
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="creg-input-group creg-full">
                  <label>Other Allergy</label>
                  <div className="creg-input-wrap">
                    <input
                      type="text"
                      name="otherAllergy"
                      placeholder="Other allergy"
                      value={formData.otherAllergy}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="creg-input-group creg-full">
                  <label>Calorie Goal</label>
                  <div className="creg-input-wrap creg-select-wrap">
                    <select
                      name="calorieGoal"
                      value={formData.calorieGoal}
                      onChange={handleChange}
                    >
                      <option value="">Select calorie goal</option>
                      {CALORIE_GOALS.map((goal) => (
                        <option key={goal} value={goal}>
                          {goal}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="creg-input-group creg-full">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Extra notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                  />
                </div>
              </div>
            )}

            {message && <div className="creg-message">{message}</div>}

            <div className="creg-action-row">
              {showExtraFields && (
                <button
                  type="button"
                  className="creg-back-btn"
                  onClick={handleBackToBasic}
                >
                  Back
                </button>
              )}

              <button
                type="submit"
                className="creg-submit-btn"
                disabled={loading}
              >
                {loading
                  ? "Registering..."
                  : showExtraFields
                  ? "Complete Register"
                  : "Continue"}
              </button>
            </div>

            <p className="creg-bottom-text">
              Already have an account? <Link to="/Registertcustomer-login">Login</Link>
            </p>
          </form>
        </div>
      </div>

      {showPreferencePopup && (
        <div className="creg-popup-backdrop">
          <div className="creg-popup-box">
            <div className="creg-popup-icon">
              <FiAlertCircle />
            </div>
            <h3>Extra Details</h3>
            <p>Do you want to add allergy or dietary preference details?</p>

            <div className="creg-popup-actions">
              <button
                type="button"
                className="creg-popup-btn creg-popup-yes"
                onClick={handleYesPreferences}
              >
                Yes
              </button>

              <button
                type="button"
                className="creg-popup-btn creg-popup-no"
                onClick={handleNoPreferences}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}