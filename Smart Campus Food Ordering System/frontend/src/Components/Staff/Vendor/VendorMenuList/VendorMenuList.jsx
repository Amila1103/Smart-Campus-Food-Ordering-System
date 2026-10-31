import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiSearch,
  FiRefreshCw,
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiTag,
  FiDroplet,
  FiStar,
  FiTrash2,
  FiEdit2,
  FiPlusCircle,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./VendorMenuList.css";

const API_BASE = "http://localhost:5000";

export default function VendorMenuList() {
  const navigate = useNavigate();

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteLoadingId, setDeleteLoadingId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 2500);
  };

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/menus`);
      const menuList = res.data?.menus || [];
      setMenus(menuList);
    } catch (error) {
      console.log("Fetch menus error:", error);
      showMessage("error", "Failed to fetch menu data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const filteredMenus = useMemo(() => {
    return menus.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" ? true : item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All"
          ? true
          : item.availabilityStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [menus, searchTerm, categoryFilter, statusFilter]);

  const totalMenus = menus.length;
  const activeMenus = menus.filter((item) => item.isActive).length;
  const availableMenus = menus.filter(
    (item) => item.availabilityStatus === "Available"
  ).length;
  const limitedMenus = menus.filter(
    (item) => item.availabilityStatus === "Limited"
  ).length;
  const soldOutMenus = menus.filter(
    (item) => item.availabilityStatus === "Sold Out"
  ).length;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE}${imagePath}`;
  };

  const handleDeleteMenu = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoadingId(deleteTarget._id);

      await axios.delete(`${API_BASE}/menus/${deleteTarget._id}`);

      setMenus((prev) => prev.filter((item) => item._id !== deleteTarget._id));
      setDeleteTarget(null);
      showMessage("success", "Menu deleted successfully.");
    } catch (error) {
      console.log("Delete menu error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to delete menu."
      );
    } finally {
      setDeleteLoadingId("");
    }
  };

  const handleAddRedirect = () => {
    navigate("/vendor/add-menu");
  };

  const handleEditRedirect = (menu) => {
    navigate(`/vendor/edit-menu/${menu._id}`, {
      state: { menu },
    });
  };

  return (
    <section className="vml-wrapper">
      <div className="vml-topbar">
        <div>
          <span className="vml-badge">Menu List</span>
          <h2>Campus Canteen Menu Items</h2>
          <p>View, edit, and delete menu items quickly.</p>
        </div>

        <div className="vml-topbar-actions">
          <button className="vml-refresh-btn" onClick={fetchMenus}>
            <FiRefreshCw />
            <span>Refresh</span>
          </button>

          <button className="vml-add-btn" onClick={handleAddRedirect}>
            <FiPlusCircle />
            <span>Add Menu</span>
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`vml-toast ${message.type}`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="vml-stats">
        <div className="vml-stat-card">
          <div className="vml-stat-icon green">
            <FiPackage />
          </div>
          <div>
            <h3>{totalMenus}</h3>
            <p>Total Menus</p>
          </div>
        </div>

        <div className="vml-stat-card">
          <div className="vml-stat-icon orange">
            <FiCheckCircle />
          </div>
          <div>
            <h3>{availableMenus}</h3>
            <p>Available</p>
          </div>
        </div>

        <div className="vml-stat-card">
          <div className="vml-stat-icon yellow">
            <FiAlertCircle />
          </div>
          <div>
            <h3>{limitedMenus}</h3>
            <p>Limited Stock</p>
          </div>
        </div>

        <div className="vml-stat-card">
          <div className="vml-stat-icon red">
            <FiXCircle />
          </div>
          <div>
            <h3>{soldOutMenus}</h3>
            <p>Sold Out</p>
          </div>
        </div>
      </div>

      <div className="vml-toolbar">
        <div className="vml-searchbox">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="vml-select"
        >
          <option value="All">All Categories</option>
          <option value="Foods">Foods</option>
          <option value="Drinks">Drinks</option>
          <option value="Snacks">Snacks</option>
          <option value="Desserts">Desserts</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="vml-select"
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="Limited">Limited</option>
          <option value="Sold Out">Sold Out</option>
        </select>
      </div>

      {loading ? (
        <div className="vml-info-box">Loading menu data...</div>
      ) : filteredMenus.length === 0 ? (
        <div className="vml-info-box">No menu items found.</div>
      ) : (
        <div className="vml-grid">
          {filteredMenus.map((item) => (
            <div className="vml-card" key={item._id}>
              <div className="vml-image-wrap">
                {item.image ? (
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="vml-image"
                  />
                ) : (
                  <div className="vml-no-image">No Image</div>
                )}

                <span
                  className={`vml-status ${
                    item.availabilityStatus === "Available"
                      ? "available"
                      : item.availabilityStatus === "Limited"
                      ? "limited"
                      : "soldout"
                  }`}
                >
                  {item.availabilityStatus}
                </span>
              </div>

              <div className="vml-card-body">
                <div className="vml-card-head">
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.category}</p>
                  </div>

                  <div className="vml-price">
                    LKR {Number(item.price).toFixed(2)}
                  </div>
                </div>

                <p className="vml-description">
                  {item.description || "No description available."}
                </p>

                <div className="vml-info-grid">
                  <div className="vml-info-item">
                    <span>Portion</span>
                    <strong>{item.portionSize || "Regular"}</strong>
                  </div>

                  <div className="vml-info-item">
                    <span>Calories</span>
                    <strong>{item.calories || 0}</strong>
                  </div>

                  <div className="vml-info-item">
                    <span>Stock</span>
                    <strong>{item.stockQty}</strong>
                  </div>

                  <div className="vml-info-item">
                    <span>Rating</span>
                    <strong>
                      <FiStar className="vml-inline-icon" />
                      {item.rating || 0} ({item.ratingCount || 0})
                    </strong>
                  </div>
                </div>

                <div className="vml-section">
                  <h4>Order Types</h4>
                  <div className="vml-chip-row">
                    {(item.availableOrderTypes || []).map((type, index) => (
                      <span className="vml-chip vml-green-chip" key={index}>
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="vml-section">
                  <h4>
                    <FiTag className="vml-section-icon" />
                    Labels
                  </h4>
                  <div className="vml-chip-row">
                    {item.labels?.length > 0 ? (
                      item.labels.map((label, index) => (
                        <span className="vml-chip vml-orange-chip" key={index}>
                          {label}
                        </span>
                      ))
                    ) : (
                      <span className="vml-muted">No labels</span>
                    )}
                  </div>
                </div>

                <div className="vml-section">
                  <h4>
                    <FiAlertCircle className="vml-section-icon" />
                    Allergens
                  </h4>
                  <div className="vml-chip-row">
                    {item.allergens?.length > 0 ? (
                      item.allergens.map((allergen, index) => (
                        <span className="vml-chip vml-red-chip" key={index}>
                          {allergen}
                        </span>
                      ))
                    ) : (
                      <span className="vml-muted">No allergens</span>
                    )}
                  </div>
                </div>

                <div className="vml-section">
                  <h4>
                    <FiDroplet className="vml-section-icon" />
                    Nutrients
                  </h4>
                  <div className="vml-chip-row">
                    {item.nutrients?.length > 0 ? (
                      item.nutrients.map((nutrient, index) => (
                        <span className="vml-chip vml-neutral-chip" key={index}>
                          {nutrient}
                        </span>
                      ))
                    ) : (
                      <span className="vml-muted">No nutrients</span>
                    )}
                  </div>
                </div>

                <div className="vml-footer">
                  <span
                    className={
                      item.isActive ? "vml-active-text" : "vml-inactive-text"
                    }
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </span>

                  <div className="vml-footer-actions">
                    <button
                      className="vml-edit-btn"
                      onClick={() => handleEditRedirect(item)}
                    >
                      <FiEdit2 />
                      <span>Edit</span>
                    </button>

                    <button
                      className="vml-delete-btn"
                      onClick={() => setDeleteTarget(item)}
                    >
                      <FiTrash2 />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="vml-bottom-note">
        <strong>Active Menus:</strong> {activeMenus} / {totalMenus}
      </div>

      {deleteTarget && (
        <div className="vml-modal-overlay">
          <div className="vml-modal-box">
            <div className="vml-modal-icon">
              <FiTrash2 />
            </div>
            <h3>Delete Menu Item</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            </p>

            <div className="vml-modal-actions">
              <button
                className="vml-modal-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                <FiX />
                <span>Cancel</span>
              </button>

              <button
                className="vml-modal-delete"
                onClick={handleDeleteMenu}
                disabled={deleteLoadingId === deleteTarget._id}
              >
                <FiTrash2 />
                <span>
                  {deleteLoadingId === deleteTarget._id
                    ? "Deleting..."
                    : "Delete"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}