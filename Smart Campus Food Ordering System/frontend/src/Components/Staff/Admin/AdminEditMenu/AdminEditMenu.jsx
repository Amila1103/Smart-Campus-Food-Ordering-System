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
import "./AdminEditMenu.css";

const ADMIN_EDIT_MENU_API_BASE = "http://localhost:5000";

const adminEditEmptyFormData = {
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

const adminEditOrderTypeOptions = ["Takeaway", "Delivery", "Dine-In"];

const adminEditLabelOptions = [
  "Vegan",
  "Vegetarian",
  "Low Sugar",
  "Low Calorie",
  "High Protein",
  "No Dairy",
  "No Nuts",
  "Spicy",
];

const adminEditAllergenOptions = [
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

const adminEditNutrientOptions = [
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

const adminEditPortionOptions = ["Half", "Full", "Regular", "Large"];
const adminEditCategoryOptions = ["Foods", "Drinks", "Snacks", "Desserts"];

export default function AdminEditMenu({ selectedMenu, onUpdated }) {
  const [adminEditFormData, setAdminEditFormData] = useState(
    adminEditEmptyFormData
  );
  const [adminEditSaving, setAdminEditSaving] = useState(false);
  const [adminEditMessage, setAdminEditMessage] = useState("");

  const adminEditSelectedImageName = useMemo(() => {
    return adminEditFormData.image
      ? adminEditFormData.image.name
      : "No new file selected";
  }, [adminEditFormData.image]);

  useEffect(() => {
    if (selectedMenu) {
      setAdminEditFormData({
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
      setAdminEditMessage("");
    } else {
      setAdminEditFormData(adminEditEmptyFormData);
    }
  }, [selectedMenu]);

  const handleAdminEditInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox" && name === "isActive") {
      setAdminEditFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    if (name === "image") {
      setAdminEditFormData((prev) => ({
        ...prev,
        image: files?.[0] || null,
      }));
      return;
    }

    setAdminEditFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const handleAdminEditMultiSelectChange = (field, value) => {
    setAdminEditFormData((prev) => {
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

  const buildAdminEditFormData = () => {
    const data = new FormData();

    data.append("name", adminEditFormData.name);
    data.append("category", adminEditFormData.category);
    data.append("portionSize", adminEditFormData.portionSize);
    data.append("price", adminEditFormData.price);
    data.append("description", adminEditFormData.description);
    data.append("stockQty", adminEditFormData.stockQty);
    data.append("limitedThreshold", adminEditFormData.limitedThreshold);
    data.append("calories", adminEditFormData.calories);
    data.append("rating", adminEditFormData.rating);
    data.append("ratingCount", adminEditFormData.ratingCount);
    data.append("isActive", adminEditFormData.isActive);

    adminEditFormData.availableOrderTypes.forEach((item) =>
      data.append("availableOrderTypes", item)
    );
    adminEditFormData.labels.forEach((item) => data.append("labels", item));
    adminEditFormData.allergens.forEach((item) =>
      data.append("allergens", item)
    );
    adminEditFormData.nutrients.forEach((item) =>
      data.append("nutrients", item)
    );

    if (adminEditFormData.image) {
      data.append("image", adminEditFormData.image);
    }

    return data;
  };

  const handleAdminEditSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMenu?._id) {
      setAdminEditMessage("Please select a menu item to edit.");
      return;
    }

    try {
      setAdminEditSaving(true);
      setAdminEditMessage("");

      const data = buildAdminEditFormData();

      await axios.put(
        `${ADMIN_EDIT_MENU_API_BASE}/menus/${selectedMenu._id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setAdminEditMessage("Menu updated successfully.");

      if (onUpdated) {
        onUpdated();
      }
    } catch (error) {
      console.log("Admin update menu error:", error);
      setAdminEditMessage(
        error.response?.data?.message || "Failed to update menu."
      );
    } finally {
      setAdminEditSaving(false);
    }
  };

  if (!selectedMenu) {
    return (
      <section className="admem-wrapper">
        <div className="admem-empty-box">
          Select a menu item from the list to edit.
        </div>
      </section>
    );
  }

  return (
    <section className="admem-wrapper">
      <div className="admem-top">
        <span className="admem-badge">Edit Menu</span>
        <h2>Update Menu Item</h2>
        <p>Edit the selected canteen menu item details.</p>
      </div>

      {adminEditMessage && (
        <div className="admem-message">{adminEditMessage}</div>
      )}

      <form className="admem-form" onSubmit={handleAdminEditSubmit}>
        <div className="admem-section-card">
          <div className="admem-section-head">
            <div className="admem-section-icon">
              <FiBox />
            </div>
            <div>
              <h3>Basic Information</h3>
              <p>Update the main menu details and pricing information.</p>
            </div>
          </div>

          <div className="admem-grid">
            <div className="admem-input-group">
              <label>Menu Name</label>
              <input
                type="text"
                name="name"
                value={adminEditFormData.name}
                onChange={handleAdminEditInputChange}
                required
              />
            </div>

            <div className="admem-input-group">
              <label>Category</label>
              <select
                name="category"
                value={adminEditFormData.category}
                onChange={handleAdminEditInputChange}
                required
              >
                {adminEditCategoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="admem-input-group">
              <label>Portion Size</label>
              <select
                name="portionSize"
                value={adminEditFormData.portionSize}
                onChange={handleAdminEditInputChange}
              >
                {adminEditPortionOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="admem-input-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={adminEditFormData.price}
                onChange={handleAdminEditInputChange}
                min="0"
                required
              />
            </div>

            <div className="admem-input-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stockQty"
                value={adminEditFormData.stockQty}
                onChange={handleAdminEditInputChange}
                min="0"
              />
            </div>

            <div className="admem-input-group">
              <label>Limited Threshold</label>
              <input
                type="number"
                name="limitedThreshold"
                value={adminEditFormData.limitedThreshold}
                onChange={handleAdminEditInputChange}
                min="0"
              />
            </div>

            <div className="admem-input-group">
              <label>Calories</label>
              <input
                type="number"
                name="calories"
                value={adminEditFormData.calories}
                onChange={handleAdminEditInputChange}
                min="0"
              />
            </div>

            <div className="admem-input-group">
              <label>Rating</label>
              <input
                type="number"
                step="0.1"
                name="rating"
                value={adminEditFormData.rating}
                onChange={handleAdminEditInputChange}
                min="0"
                max="5"
              />
            </div>

            <div className="admem-input-group">
              <label>Rating Count</label>
              <input
                type="number"
                name="ratingCount"
                value={adminEditFormData.ratingCount}
                onChange={handleAdminEditInputChange}
                min="0"
              />
            </div>

            <div className="admem-input-group">
              <label>Menu Status</label>
              <label className="admem-checkbox-card">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={adminEditFormData.isActive}
                  onChange={handleAdminEditInputChange}
                />
                <span className="admem-checkbox-custom">
                  <FiCheckCircle />
                </span>
                <span className="admem-checkbox-text">
                  <strong>Active Menu</strong>
                  <small>This item will remain visible and usable in the system.</small>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="admem-section-card">
          <div className="admem-section-head">
            <div className="admem-section-icon orange">
              <FiImage />
            </div>
            <div>
              <h3>Media & Description</h3>
              <p>Update the image and description of the selected menu item.</p>
            </div>
          </div>

          <div className="admem-grid">
            <div className="admem-input-group admem-full-width">
              <label>Description</label>
              <textarea
                name="description"
                rows="4"
                value={adminEditFormData.description}
                onChange={handleAdminEditInputChange}
              />
            </div>

            <div className="admem-input-group admem-full-width">
              <label>Replace Image</label>
              <label className="admem-file-label">
                <input
                  type="file"
                  name="image"
                  onChange={handleAdminEditInputChange}
                  accept="image/*"
                />
                <div className="admem-file-wrap">
                  <div className="admem-file-icon">
                    <FiImage />
                  </div>
                  <div className="admem-file-content">
                    <strong>Choose new menu image</strong>
                    <span>{adminEditSelectedImageName}</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="admem-section-card">
          <div className="admem-section-head">
            <div className="admem-section-icon green">
              <FiDollarSign />
            </div>
            <div>
              <h3>Service Options</h3>
              <p>Select the available order methods for this menu item.</p>
            </div>
          </div>

          <div className="admem-input-group admem-full-width">
            <label>Order Types</label>
            <div className="admem-option-grid">
              {adminEditOrderTypeOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`admem-option-btn ${
                    adminEditFormData.availableOrderTypes.includes(item)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleAdminEditMultiSelectChange(
                      "availableOrderTypes",
                      item
                    )
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="admem-section-card">
          <div className="admem-section-head">
            <div className="admem-section-icon">
              <FiTag />
            </div>
            <div>
              <h3>Food Details</h3>
              <p>Update labels, allergens, and nutrients for better clarity.</p>
            </div>
          </div>

          <div className="admem-input-group admem-full-width">
            <label>Labels</label>
            <div className="admem-option-grid">
              {adminEditLabelOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`admem-option-btn ${
                    adminEditFormData.labels.includes(item) ? "selected" : ""
                  }`}
                  onClick={() =>
                    handleAdminEditMultiSelectChange("labels", item)
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="admem-input-group admem-full-width">
            <label>Allergens</label>
            <div className="admem-option-grid">
              {adminEditAllergenOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`admem-option-btn admem-red-select ${
                    adminEditFormData.allergens.includes(item)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleAdminEditMultiSelectChange("allergens", item)
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="admem-input-group admem-full-width">
            <label>Nutrients</label>
            <div className="admem-option-grid">
              {adminEditNutrientOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`admem-option-btn admem-nutrient-btn ${
                    adminEditFormData.nutrients.includes(item)
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    handleAdminEditMultiSelectChange("nutrients", item)
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="admem-actions">
          <button
            type="submit"
            className="admem-submit-btn"
            disabled={adminEditSaving}
          >
            <FiEdit2 />
            <span>{adminEditSaving ? "Updating..." : "Update Menu"}</span>
          </button>
        </div>
      </form>
    </section>
  );
}