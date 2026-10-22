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
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./AdminAddMenu.css";

const ADMIN_MENU_API_BASE = "http://localhost:5000";

const adminInitialFormData = {
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

const adminOrderTypeOptions = ["Takeaway", "Delivery", "Dine-In"];

const adminLabelOptions = [
  "Vegan",
  "Vegetarian",
  "Low Sugar",
  "Low Calorie",
  "High Protein",
  "No Dairy",
  "No Nuts",
  "Spicy",
];

const adminAllergenOptions = [
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

const adminNutrientOptions = [
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

const adminPortionOptions = ["Half", "Full", "Regular", "Large"];
const adminCategoryOptions = ["Foods", "Drinks", "Snacks", "Desserts"];

export default function AdminAddMenu({ onAdded }) {
  const navigate = useNavigate();

  const [adminFormData, setAdminFormData] = useState(adminInitialFormData);
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");

  const adminSelectedImageName = useMemo(() => {
    return adminFormData.image ? adminFormData.image.name : "No file selected";
  }, [adminFormData.image]);

  const handleAdminInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox" && name === "isActive") {
      setAdminFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    if (name === "image") {
      setAdminFormData((prev) => ({
        ...prev,
        image: files?.[0] || null,
      }));
      return;
    }

    setAdminFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdminMultiSelectChange = (field, value) => {
    setAdminFormData((prev) => {
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

  const buildAdminFormData = () => {
    const data = new FormData();

    data.append("name", adminFormData.name);
    data.append("category", adminFormData.category);
    data.append("portionSize", adminFormData.portionSize);
    data.append("price", adminFormData.price);
    data.append("description", adminFormData.description);
    data.append("stockQty", adminFormData.stockQty);
    data.append("limitedThreshold", adminFormData.limitedThreshold);
    data.append("calories", adminFormData.calories);
    data.append("rating", adminFormData.rating);
    data.append("ratingCount", adminFormData.ratingCount);
    data.append("isActive", adminFormData.isActive);

    adminFormData.availableOrderTypes.forEach((item) =>
      data.append("availableOrderTypes", item)
    );
    adminFormData.labels.forEach((item) => data.append("labels", item));
    adminFormData.allergens.forEach((item) => data.append("allergens", item));
    adminFormData.nutrients.forEach((item) => data.append("nutrients", item));

    if (adminFormData.image) {
      data.append("image", adminFormData.image);
    }

    return data;
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();

    try {
      setAdminSaving(true);
      setAdminMessage("");

      const data = buildAdminFormData();

      await axios.post(`${ADMIN_MENU_API_BASE}/menus/upload`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAdminMessage("Menu added successfully.");
      setAdminFormData(adminInitialFormData);

      if (onAdded) {
        onAdded();
      } else {
        navigate("/admin-dashboard");
      }
    } catch (error) {
      console.log("Admin add menu error:", error);
      setAdminMessage(error.response?.data?.message || "Failed to add menu.");
    } finally {
      setAdminSaving(false);
    }
  };

  return (
    <section className="admam-wrapper">
      <div className="admam-nav-row"></div>

      <div className="admam-topbar">
        <div className="admam-topbar-left">
          <span className="admam-badge">Add Menu</span>
          <h2>Create New Menu Item</h2>
          <p>Add a fresh menu item to the campus canteen system.</p>
        </div>

        <div className="admam-topbar-right">
          <div className="admam-mini-stat">
            <strong>{adminFormData.availableOrderTypes.length}</strong>
            <span>Order Types</span>
          </div>
          <div className="admam-mini-stat">
            <strong>{adminFormData.labels.length}</strong>
            <span>Labels</span>
          </div>
          <div className="admam-mini-stat">
            <strong>{adminFormData.allergens.length}</strong>
            <span>Allergens</span>
          </div>
        </div>
      </div>

      {adminMessage && <div className="admam-message">{adminMessage}</div>}

      <form className="admam-form" onSubmit={handleAdminSubmit}>
        <div className="admam-section-card">
          <div className="admam-section-head">
            <div className="admam-section-icon">
              <FiBox />
            </div>
            <div>
              <h3>Basic Information</h3>
              <p>Enter the main menu details and pricing information.</p>
            </div>
          </div>

          <div className="admam-grid">
            <div className="admam-input-group">
              <label>Menu Name</label>
              <input
                type="text"
                name="name"
                value={adminFormData.name}
                onChange={handleAdminInputChange}
                placeholder="Chicken Kottu"
                required
              />
            </div>

            <div className="admam-input-group">
              <label>Category</label>
              <select
                name="category"
                value={adminFormData.category}
                onChange={handleAdminInputChange}
                required
              >
                {adminCategoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="admam-input-group">
              <label>Portion Size</label>
              <select
                name="portionSize"
                value={adminFormData.portionSize}
                onChange={handleAdminInputChange}
              >
                {adminPortionOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="admam-input-group">
              <label>Price</label>
              <div className="admam-input-shell">
                <span className="admam-input-prefix">LKR</span>
                <input
                  type="number"
                  name="price"
                  value={adminFormData.price}
                  onChange={handleAdminInputChange}
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="admam-input-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stockQty"
                value={adminFormData.stockQty}
                onChange={handleAdminInputChange}
                min="0"
              />
            </div>

            <div className="admam-input-group">
              <label>Limited Threshold</label>
              <input
                type="number"
                name="limitedThreshold"
                value={adminFormData.limitedThreshold}
                onChange={handleAdminInputChange}
                min="0"
              />
            </div>

            <div className="admam-input-group">
              <label>Calories</label>
              <input
                type="number"
                name="calories"
                value={adminFormData.calories}
                onChange={handleAdminInputChange}
                min="0"
              />
            </div>

            <div className="admam-input-group">
              <label>Rating</label>
              <input
                type="number"
                step="0.1"
                name="rating"
                value={adminFormData.rating}
                onChange={handleAdminInputChange}
                min="0"
                max="5"
              />
            </div>

            <div className="admam-input-group">
              <label>Rating Count</label>
              <input
                type="number"
                name="ratingCount"
                value={adminFormData.ratingCount}
                onChange={handleAdminInputChange}
                min="0"
              />
            </div>

            <div className="admam-input-group">
              <label>Menu Status</label>
              <label className="admam-checkbox-card">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={adminFormData.isActive}
                  onChange={handleAdminInputChange}
                />
                <span className="admam-checkbox-custom">
                  <FiCheckCircle />
                </span>
                <span className="admam-checkbox-text">
                  <strong>Active Menu</strong>
                  <small>This item will be visible and usable in the system.</small>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="admam-section-card">
          <div className="admam-section-head">
            <div className="admam-section-icon orange">
              <FiImage />
            </div>
            <div>
              <h3>Media & Description</h3>
              <p>Add an image and short description for the menu item.</p>
            </div>
          </div>

          <div className="admam-grid">
            <div className="admam-input-group admam-full-width">
              <label>Description</label>
              <textarea
                name="description"
                rows="4"
                value={adminFormData.description}
                onChange={handleAdminInputChange}
                placeholder="Write a short description about the food item..."
              />
            </div>

            <div className="admam-input-group admam-full-width">
              <label>Upload Image</label>
              <label className="admam-file-wrap">
                <input
                  type="file"
                  name="image"
                  onChange={handleAdminInputChange}
                  accept="image/*"
                />
                <div className="admam-file-inner">
                  <div className="admam-file-icon">
                    <FiImage />
                  </div>
                  <div className="admam-file-text">
                    <strong>Choose menu image</strong>
                    <span>{adminSelectedImageName}</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="admam-section-card">
          <div className="admam-section-head">
            <div className="admam-section-icon green">
              <FiDollarSign />
            </div>
            <div>
              <h3>Service Options</h3>
              <p>Select order methods available for this menu item.</p>
            </div>
          </div>

          <div className="admam-input-group admam-full-width">
            <label>Order Types</label>
            <div className="admam-option-grid">
              {adminOrderTypeOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`admam-option-btn ${
                    adminFormData.availableOrderTypes.includes(item)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleAdminMultiSelectChange("availableOrderTypes", item)
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="admam-section-card">
          <div className="admam-section-head">
            <div className="admam-section-icon">
              <FiTag />
            </div>
            <div>
              <h3>Food Details</h3>
              <p>Add labels, allergens, and nutrients for better clarity.</p>
            </div>
          </div>

          <div className="admam-input-group admam-full-width">
            <label>Labels</label>
            <div className="admam-option-grid">
              {adminLabelOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`admam-option-btn ${
                    adminFormData.labels.includes(item) ? "selected" : ""
                  }`}
                  onClick={() => handleAdminMultiSelectChange("labels", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="admam-input-group admam-full-width">
            <label>Allergens</label>
            <div className="admam-option-grid">
              {adminAllergenOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`admam-option-btn admam-red-select ${
                    adminFormData.allergens.includes(item) ? "selected" : ""
                  }`}
                  onClick={() => handleAdminMultiSelectChange("allergens", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="admam-input-group admam-full-width">
            <label>Nutrients</label>
            <div className="admam-option-grid">
              {adminNutrientOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`admam-option-btn admam-nutrient-btn ${
                    adminFormData.nutrients.includes(item) ? "selected" : ""
                  }`}
                  onClick={() => handleAdminMultiSelectChange("nutrients", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="admam-actions-bar">
          <div className="admam-actions-note">
            <FiAlertTriangle />
            <span>Review menu details before saving.</span>
          </div>

          <div className="admam-actions">
            <button
              type="submit"
              className="admam-submit-btn"
              disabled={adminSaving}
            >
              <FiPlusCircle />
              <span>{adminSaving ? "Adding..." : "Add Menu"}</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}