import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiImage,
  FiEdit2,
  FiBox,
  FiDollarSign,
  FiTag,
  FiCheckCircle,
} from "react-icons/fi";
import "./VendorEditMenu.css";

const API_BASE = "http://localhost:5000";

const emptyFormData = {
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

export default function VendorEditMenu({ selectedMenu, onUpdated }) {
  const [formData, setFormData] = useState(emptyFormData);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedImageName = useMemo(() => {
    return formData.image ? formData.image.name : "No new file selected";
  }, [formData.image]);

  useEffect(() => {
    if (selectedMenu) {
      setFormData({
        name: selectedMenu.name || "",
        category: selectedMenu.category || "Foods",
        portionSize: selectedMenu.portionSize || "Regular",
        price: selectedMenu.price ?? "",
        description: selectedMenu.description || "",
        stockQty: selectedMenu.stockQty ?? 0,
        limitedThreshold: selectedMenu.limitedThreshold ?? 5,
        availableOrderTypes: selectedMenu.availableOrderTypes || ["Takeaway"],
        labels: selectedMenu.labels || [],
        allergens: selectedMenu.allergens || [],
        calories: selectedMenu.calories ?? 0,
        nutrients: selectedMenu.nutrients || [],
        rating: selectedMenu.rating ?? 0,
        ratingCount: selectedMenu.ratingCount ?? 0,
        isActive: selectedMenu.isActive ?? true,
        image: null,
      });
      setMessage("");
    } else {
      setFormData(emptyFormData);
    }
  }, [selectedMenu]);

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
      [name]:
        type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : value,
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

    if (!selectedMenu?._id) {
      setMessage("Please select a menu item to edit.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const data = buildFormData();

      await axios.put(`${API_BASE}/menus/${selectedMenu._id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Menu updated successfully.");

      if (onUpdated) {
        onUpdated();
      }
    } catch (error) {
      console.log("Update menu error:", error);
      setMessage(error.response?.data?.message || "Failed to update menu.");
    } finally {
      setSaving(false);
    }
  };

  if (!selectedMenu) {
    return (
      <section className="vem-wrapper">
        <div className="vem-empty-box">
          Select a menu item from the list to edit.
        </div>
      </section>
    );
  }

  return (
    <section className="vem-wrapper">
      <div className="vem-top">
        <span className="vem-badge">Edit Menu</span>
        <h2>Update Menu Item</h2>
        <p>Edit the selected canteen menu item details.</p>
      </div>

      {message && <div className="vem-message">{message}</div>}

      <form className="vem-form" onSubmit={handleSubmit}>
        <div className="vem-section-card">
          <div className="vem-section-head">
            <div className="vem-section-icon">
              <FiBox />
            </div>
            <div>
              <h3>Basic Information</h3>
              <p>Update the main menu details and pricing information.</p>
            </div>
          </div>

          <div className="vem-grid">
            <div className="vem-input-group">
              <label>Menu Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="vem-input-group">
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

            <div className="vem-input-group">
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

            <div className="vem-input-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="vem-input-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stockQty"
                value={formData.stockQty}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="vem-input-group">
              <label>Limited Threshold</label>
              <input
                type="number"
                name="limitedThreshold"
                value={formData.limitedThreshold}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="vem-input-group">
              <label>Calories</label>
              <input
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="vem-input-group">
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

            <div className="vem-input-group">
              <label>Rating Count</label>
              <input
                type="number"
                name="ratingCount"
                value={formData.ratingCount}
                onChange={handleInputChange}
                min="0"
              />
            </div>

            <div className="vem-input-group">
              <label>Menu Status</label>
              <label className="vem-checkbox-card">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <span className="vem-checkbox-custom">
                  <FiCheckCircle />
                </span>
                <span className="vem-checkbox-text">
                  <strong>Active Menu</strong>
                  <small>This item will remain visible and usable in the system.</small>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="vem-section-card">
          <div className="vem-section-head">
            <div className="vem-section-icon orange">
              <FiImage />
            </div>
            <div>
              <h3>Media & Description</h3>
              <p>Update the image and description of the selected menu item.</p>
            </div>
          </div>

          <div className="vem-grid">
            <div className="vem-input-group vem-full-width">
              <label>Description</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="vem-input-group vem-full-width">
              <label>Replace Image</label>
              <label className="vem-file-label">
                <input
                  type="file"
                  name="image"
                  onChange={handleInputChange}
                  accept="image/*"
                />
                <div className="vem-file-wrap">
                  <div className="vem-file-icon">
                    <FiImage />
                  </div>
                  <div className="vem-file-content">
                    <strong>Choose new menu image</strong>
                    <span>{selectedImageName}</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="vem-section-card">
          <div className="vem-section-head">
            <div className="vem-section-icon green">
              <FiDollarSign />
            </div>
            <div>
              <h3>Service Options</h3>
              <p>Select the available order methods for this menu item.</p>
            </div>
          </div>

          <div className="vem-input-group vem-full-width">
            <label>Order Types</label>
            <div className="vem-option-grid">
              {orderTypeOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`vem-option-btn ${
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

        <div className="vem-section-card">
          <div className="vem-section-head">
            <div className="vem-section-icon">
              <FiTag />
            </div>
            <div>
              <h3>Food Details</h3>
              <p>Update labels, allergens, and nutrients for better clarity.</p>
            </div>
          </div>

          <div className="vem-input-group vem-full-width">
            <label>Labels</label>
            <div className="vem-option-grid">
              {labelOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`vem-option-btn ${
                    formData.labels.includes(item) ? "selected" : ""
                  }`}
                  onClick={() => handleMultiSelectChange("labels", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="vem-input-group vem-full-width">
            <label>Allergens</label>
            <div className="vem-option-grid">
              {allergenOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`vem-option-btn vem-red-select ${
                    formData.allergens.includes(item) ? "selected" : ""
                  }`}
                  onClick={() => handleMultiSelectChange("allergens", item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="vem-input-group vem-full-width">
            <label>Nutrients</label>
            <div className="vem-option-grid">
              {nutrientOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`vem-option-btn vem-nutrient-btn ${
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

        <div className="vem-actions">
          <button type="submit" className="vem-submit-btn" disabled={saving}>
            <FiEdit2 />
            <span>{saving ? "Updating..." : "Update Menu"}</span>
          </button>
        </div>
      </form>
    </section>
  );
}