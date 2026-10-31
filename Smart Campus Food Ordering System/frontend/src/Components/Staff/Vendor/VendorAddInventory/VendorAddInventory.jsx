import React, { useMemo, useState } from "react";
import axios from "axios";
import {
  FiPlusCircle,
  FiBox,
  FiArchive,
  FiFileText,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./VendorAddInventory.css";

const API_BASE = "http://localhost:5000";

const initialFormData = {
  itemName: "",
  category: "Vegetables",
  quantity: 0,
  unit: "kg",
  reorderLevel: 5,
  supplierName: "",
  expiryDate: "",
  description: "",
  stockStatus: "Available",
  isActive: true,
};

const categoryOptions = [
  "Vegetables",
  "Meat",
  "Dairy",
  "Dry Goods",
  "Beverages",
  "Spices",
  "Packaging",
];

const unitOptions = ["kg", "g", "L", "ml", "pcs", "packs", "bottles"];
const stockStatusOptions = ["Available", "Low Stock", "Out of Stock"];

export default function VendorAddInventory({ onAdded }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const summaryText = useMemo(() => {
    return `${formData.quantity || 0} ${formData.unit}`;
  }, [formData.quantity, formData.unit]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "isActive") {
      setFormData((prev) => ({
        ...prev,
        isActive: checked,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      await axios.post(`${API_BASE}/inventory`, formData);

      setMessage("Inventory item added successfully.");
      setFormData(initialFormData);

      if (onAdded) {
        onAdded();
      } else {
        navigate("/vendor-dashboard");
      }
    } catch (error) {
      console.log("Add inventory error:", error);
      setMessage(
        error.response?.data?.message || "Failed to add inventory item."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="vai-wrapper">
      <div className="vai-topbar">
        <div className="vai-topbar-left">
          <span className="vai-badge">Add Inventory</span>
          <h2>Create New Inventory Item</h2>
          <p>Add a new kitchen or store stock item for vendor operations.</p>
        </div>

        <div className="vai-topbar-right">
          <div className="vai-mini-stat">
            <strong>{summaryText}</strong>
            <span>Current Qty</span>
          </div>
          <div className="vai-mini-stat">
            <strong>{formData.reorderLevel || 0}</strong>
            <span>Reorder Level</span>
          </div>
          <div className="vai-mini-stat">
            <strong>{formData.stockStatus}</strong>
            <span>Status</span>
          </div>
        </div>
      </div>

      {message && <div className="vai-message">{message}</div>}

      <form className="vai-form" onSubmit={handleSubmit}>
        <div className="vai-section-card">
          <div className="vai-section-head">
            <div className="vai-section-icon">
              <FiBox />
            </div>
            <div>
              <h3>Basic Information</h3>
              <p>Enter the main details of the inventory item.</p>
            </div>
          </div>

          <div className="vai-grid">
            <div className="vai-input-group">
              <label>Item Name</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                placeholder="Chicken Fillet"
                required
              />
            </div>

            <div className="vai-input-group">
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

            <div className="vai-input-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="vai-input-group">
              <label>Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
              >
                {unitOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="vai-input-group">
              <label>Reorder Level</label>
              <input
                type="number"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleInputChange}
                min="0"
                required
              />
            </div>

            <div className="vai-input-group">
              <label>Stock Status</label>
              <select
                name="stockStatus"
                value={formData.stockStatus}
                onChange={handleInputChange}
                required
              >
                {stockStatusOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="vai-section-card">
          <div className="vai-section-head">
            <div className="vai-section-icon orange">
              <FiArchive />
            </div>
            <div>
              <h3>Supplier & Storage Details</h3>
              <p>Add supplier and expiry information for better tracking.</p>
            </div>
          </div>

          <div className="vai-grid">
            <div className="vai-input-group">
              <label>Supplier Name</label>
              <input
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleInputChange}
                placeholder="ABC Suppliers"
              />
            </div>

            <div className="vai-input-group">
              <label>Expiry Date</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="vai-input-group vai-full-width">
              <label>Description</label>
              <div className="vai-input-shell vai-input-shell-full">
                <FiFileText className="vai-shell-icon" />
                <textarea
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Fresh boneless chicken for kitchen use..."
                />
              </div>
            </div>

            <div className="vai-input-group vai-full-width">
              <label>Status</label>
              <label className="vai-checkbox-card">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <span className="vai-checkbox-custom">
                  <FiCheckCircle />
                </span>
                <span className="vai-checkbox-text">
                  <strong>Active Inventory Item</strong>
                  <small>
                    This item will stay visible and usable in the inventory
                    system.
                  </small>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="vai-actions-bar">
          <div className="vai-actions-note">
            <FiAlertTriangle />
            <span>Review inventory details before saving.</span>
          </div>

          <div className="vai-actions">
            <button type="submit" className="vai-submit-btn" disabled={saving}>
              <FiPlusCircle />
              <span>{saving ? "Adding..." : "Add Inventory"}</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}