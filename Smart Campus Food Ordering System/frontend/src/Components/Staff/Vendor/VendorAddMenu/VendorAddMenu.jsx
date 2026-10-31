import React, { useMemo, useState } from "react";
import axios from "axios";
import {
  FiImage,
  FiPlusCircle,
  FiBox,
  FiDollarSign,
  FiTag,
  FiAlertTriangle,
  FiCheckCircle,
  FiArrowLeft,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./VendorAddMenu.css";

const API_BASE = "http://localhost:5000";

const initialFormData = {
  name: "",
  category: "Foods",
  portionSize: "Regular",
  price: "",
  description: "",
  stockQty: 0,
  limitedThreshold: 5,
  availableOrderTypes: ["Takeaway"],
  labels: [],
  allergens: [],
  calories: 0,
  nutrients: [],
  rating: 0,
  ratingCount: 0,
  isActive: true,
  image: null,
};

const orderTypeOptions = ["Takeaway", "Delivery", "Dine-In"];

const labelOptions = [
  "Vegan",
  "Vegetarian",
  "Low Sugar",
  "Low Calorie",
  "High Protein",
  "No Dairy",
  "No Nuts",
  "Spicy",
];

const allergenOptions = [
  "Milk",
  "Egg",
  "Fish",
  "Shellfish",
  "Peanuts",
  "Tree Nuts",
  "Soy",
  "Wheat",
  "Gluten",
];

const nutrientOptions = [
  "Protein",
  "Fiber",
  "Vitamin C",
  "Vitamin A",
  "Calcium",
  "Iron",
  "Potassium",
  "Carbohydrates",
  "Healthy Fats",
];

const portionOptions = ["Half", "Full", "Regular", "Large"];
const categoryOptions = ["Foods", "Drinks", "Snacks", "Desserts"];

export default function VendorAddMenu({ onAdded }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedImageName = useMemo(() => {
    return formData.image ? formData.image.name : "No file selected";
  }, [formData.image]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox" && name === "isActive") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    if (name === "image") {
      setFormData((prev) => ({
        ...prev,
        image: files?.[0] || null,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMultiSelectChange = (field, value) => {
    setFormData((prev) => {
      const existing = prev[field] || [];
      const updated = existing.includes(value)
        ? existing.filter((item) => item !== value)
        : [...existing, value];

      return {
        ...prev,
        [field]: updated,
      };
    });
  };

  const buildFormData = () => {
    const data = new FormData();

    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("portionSize", formData.portionSize);
    data.append("price", formData.price);
    data.append("description", formData.description);
    data.append("stockQty", formData.stockQty);
    data.append("limitedThreshold", formData.limitedThreshold);
    data.append("calories", formData.calories);
    data.append("rating", formData.rating);
    data.append("ratingCount", formData.ratingCount);
    data.append("isActive", formData.isActive);

    formData.availableOrderTypes.forEach((item) =>
      data.append("availableOrderTypes", item)
    );
    formData.labels.forEach((item) => data.append("labels", item));
    formData.allergens.forEach((item) => data.append("allergens", item));
    formData.nutrients.forEach((item) => data.append("nutrients", item));

    if (formData.image) {
      data.append("image", formData.image);
    }

    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const data = buildFormData();

      await axios.post(`${API_BASE}/menus/upload`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Menu added successfully.");
      setFormData(initialFormData);

      if (onAdded) {
        onAdded();
      } else {
        navigate("/vendor-dashboard");
      }
    } catch (error) {
      console.log("Add menu error:", error);
      setMessage(error.response?.data?.message || "Failed to add menu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="vam-wrapper">
      <div className="vam-nav-row">
        <button
          type="button"
          className="vam-back-btn"
          onClick={() => navigate("/vendor-dashboard")}
        >
          <FiArrowLeft />
          <span>Back</span>
        </button>
      </div>

      <div className="vam-topbar">
        <div className="vam-topbar-left">
          <span className="vam-badge">Add Menu</span>
          <h2>Create New Menu Item</h2>
          <p>Add a fresh menu item to the campus canteen system.</p>
        </div>

        <div className="vam-topbar-right">
          <div className="vam-mini-stat">
            <strong>{formData.availableOrderTypes.length}</strong>
            <span>Order Types</span>
          </div>
          <div className="vam-mini-stat">
            <strong>{formData.labels.length}</strong>
            <span>Labels</span>
          </div>
          <div className="vam-mini-stat">
            <strong>{formData.allergens.length}</strong>
            <span>Allergens</span>
          </div>
        </div>
      </div>

      {message && <div className="vam-message">{message}</div>}

      <form className="vam-form" onSubmit={handleSubmit}>
        <div className="vam-section-card">
          <div className="vam-section-head">
            <div className="vam-section-icon">
              <FiBox />
            </div>
            <div>
              <h3>Basic Information</h3>
              <p>Enter the main menu details and pricing information.</p>
            </div>
          </div>

          <div className="vam-grid">
            <div className="vam-input-group">
              <label>Menu Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Chicken Kottu"
                required
              />
            </div>

            <div className="vam-input-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                {categoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="vam-input-group">
              <label>Portion Size</label>
              <select
                name="portionSize"
                value={formData.portionSize}
                onChange={handleInputChange}
              >
                {portionOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="vam-input-group">
              <label>Price</label>
              <div className="vam-input-shell">
                <span className="vam-input-prefix">LKR</span>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="vam-input-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stockQty"
                value={formData.stockQty}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="vam-input-group">
              <label>Limited Threshold</label>
              <input
                type="number"
                name="limitedThreshold"
                value={formData.limitedThreshold}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="vam-input-group">
              <label>Calories</label>
              <input
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="vam-input-group">
              <label>Rating</label>
              <input
                type="number"
                step="0.1"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                min="0"
                max="5"
              />
            </div>

            <div className="vam-input-group">
              <label>Rating Count</label>
              <input
                type="number"
                name="ratingCount"
                value={formData.ratingCount}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="vam-input-group">
              <label>Menu Status</label>
              <label className="vam-checkbox-card">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <span className="vam-checkbox-custom">
                  <FiCheckCircle />
                </span>
                <span className="vam-checkbox-text">
                  <strong>Active Menu</strong>
                  <small>This item will be visible and usable in the system.</small>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="vam-section-card">
          <div className="vam-section-head">
            <div className="vam-section-icon orange">
              <FiImage />
            </div>
            <div>
              <h3>Media & Description</h3>
              <p>Add an image and short description for the menu item.</p>
            </div>
          </div>

          <div className="vam-grid">
            <div className="vam-input-group vam-full-width">
              <label>Description</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Write a short description about the food item..."
              />
            </div>

            <div className="vam-input-group vam-full-width">
              <label>Upload Image</label>
              <label className="vam-file-wrap">
                <input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                />
                <div className="vam-file-inner">
                  <div className="vam-file-icon">
                    <FiImage />
                  </div>
                  <div className="vam-file-text">
                    <strong>Choose menu image</strong>
                    <span>{selectedImageName}</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="vam-section-card">
          <div className="vam-section-head">
            <div className="vam-section-icon green">
              <FiDollarSign />
            </div>
            <div>
              <h3>Service Options</h3>
              <p>Select order methods available for this menu item.</p>
            </div>
          </div>

          <div className="vam-input-group vam-full-width">
            <label>Order Types</label>
            <div className="vam-option-grid">
              {orderTypeOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`vam-option-btn ${
                    formData.availableOrderTypes.includes(item) ? "selected" : ""
                  }`}
                  onClick={() =>
                    handleMultiSelectChange("availableOrderTypes", item)
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="vam-section-card">
          <div className="vam-section-head">
            <div className="vam-section-icon">
              <FiTag />
            </div>
            <div>
              <h3>Food Details</h3>
              <p>Add labels, allergens, and nutrients for better clarity.</p>
            </div>
          </div>

          <div className="vam-input-group vam-full-width">
            <label>Labels</label>
            <div className="vam-option-grid">
              {labelOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`vam-option-btn ${
                    formData.labels.includes(item) ? "selected" : ""
                  }`}
                  onClick={() => handleMultiSelectChange("labels", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="vam-input-group vam-full-width">
            <label>Allergens</label>
            <div className="vam-option-grid">
              {allergenOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`vam-option-btn vam-red-select ${
                    formData.allergens.includes(item) ? "selected" : ""
                  }`}
                  onClick={() => handleMultiSelectChange("allergens", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="vam-input-group vam-full-width">
            <label>Nutrients</label>
            <div className="vam-option-grid">
              {nutrientOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`vam-option-btn vam-nutrient-btn ${
                    formData.nutrients.includes(item) ? "selected" : ""
                  }`}
                  onClick={() => handleMultiSelectChange("nutrients", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="vam-actions-bar">
          <div className="vam-actions-note">
            <FiAlertTriangle />
            <span>Review menu details before saving.</span>
          </div>

          <div className="vam-actions">
            <button type="submit" className="vam-submit-btn" disabled={saving}>
              <FiPlusCircle />
              <span>{saving ? "Adding..." : "Add Menu"}</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}