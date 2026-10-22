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
import "./AdminMenuList.css";

const ADMIN_MENU_LIST_API_BASE = "http://localhost:5000";

export default function AdminMenuList() {
  const navigate = useNavigate();

  const [adminMenus, setAdminMenus] = useState([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminMessage, setAdminMessage] = useState({ type: "", text: "" });
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  const [adminCategoryFilter, setAdminCategoryFilter] = useState("All");
  const [adminStatusFilter, setAdminStatusFilter] = useState("All");
  const [adminDeleteLoadingId, setAdminDeleteLoadingId] = useState("");
  const [adminDeleteTarget, setAdminDeleteTarget] = useState(null);

  const showAdminMessage = (type, text) => {
    setAdminMessage({ type, text });
    setTimeout(() => {
      setAdminMessage({ type: "", text: "" });
    }, 2500);
  };

  const fetchAdminMenus = async () => {
    try {
      setAdminLoading(true);
      const res = await axios.get(`${ADMIN_MENU_LIST_API_BASE}/menus`);
      const menuList = res.data?.menus || [];
      setAdminMenus(menuList);
    } catch (error) {
      console.log("Fetch admin menus error:", error);
      showAdminMessage("error", "Failed to fetch menu data.");
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminMenus();
  }, []);

  const filteredAdminMenus = useMemo(() => {
    return adminMenus.filter((item) => {
      const matchesSearch =
        item.name?.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(adminSearchTerm.toLowerCase());

      const matchesCategory =
        adminCategoryFilter === "All"
          ? true
          : item.category === adminCategoryFilter;

      const matchesStatus =
        adminStatusFilter === "All"
          ? true
          : item.availabilityStatus === adminStatusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [
    adminMenus,
    adminSearchTerm,
    adminCategoryFilter,
    adminStatusFilter,
  ]);

  const adminTotalMenus = adminMenus.length;
  const adminActiveMenus = adminMenus.filter((item) => item.isActive).length;
  const adminAvailableMenus = adminMenus.filter(
    (item) => item.availabilityStatus === "Available"
  ).length;
  const adminLimitedMenus = adminMenus.filter(
    (item) => item.availabilityStatus === "Limited"
  ).length;
  const adminSoldOutMenus = adminMenus.filter(
    (item) => item.availabilityStatus === "Sold Out"
  ).length;

  const getAdminImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${ADMIN_MENU_LIST_API_BASE}${imagePath}`;
  };

  const handleAdminDeleteMenu = async () => {
    if (!adminDeleteTarget) return;

    try {
      setAdminDeleteLoadingId(adminDeleteTarget._id);

      await axios.delete(
        `${ADMIN_MENU_LIST_API_BASE}/menus/${adminDeleteTarget._id}`
      );

      setAdminMenus((prev) =>
        prev.filter((item) => item._id !== adminDeleteTarget._id)
      );
      setAdminDeleteTarget(null);
      showAdminMessage("success", "Menu deleted successfully.");
    } catch (error) {
      console.log("Delete admin menu error:", error);
      showAdminMessage(
        "error",
        error.response?.data?.message || "Failed to delete menu."
      );
    } finally {
      setAdminDeleteLoadingId("");
    }
  };

  const handleAdminAddRedirect = () => {
    navigate("/admin/add-menu");
  };

  const handleAdminEditRedirect = (menu) => {
    navigate(`/admin/edit-menu/${menu._id}`, {
      state: { menu },
    });
  };

  return (
    <section className="adml-wrapper">
      <div className="adml-topbar">
        <div>
          <span className="adml-badge">Menu List</span>
          <h2>Campus Canteen Menu Items</h2>
          <p>View, edit, and delete menu items quickly.</p>
        </div>

        <div className="adml-topbar-actions">
          <button className="adml-refresh-btn" onClick={fetchAdminMenus}>
            <FiRefreshCw />
            <span>Refresh</span>
          </button>

          <button className="adml-add-btn" onClick={handleAdminAddRedirect}>
            <FiPlusCircle />
            <span>Add Menu</span>
          </button>
        </div>
      </div>

      {adminMessage.text && (
        <div className={`adml-toast ${adminMessage.type}`}>
          <span>{adminMessage.text}</span>
        </div>
      )}

      <div className="adml-stats">
        <div className="adml-stat-card">
          <div className="adml-stat-icon green">
            <FiPackage />
          </div>
          <div>
            <h3>{adminTotalMenus}</h3>
            <p>Total Menus</p>
          </div>
        </div>

        <div className="adml-stat-card">
          <div className="adml-stat-icon orange">
            <FiCheckCircle />
          </div>
          <div>
            <h3>{adminAvailableMenus}</h3>
            <p>Available</p>
          </div>
        </div>

        <div className="adml-stat-card">
          <div className="adml-stat-icon yellow">
            <FiAlertCircle />
          </div>
          <div>
            <h3>{adminLimitedMenus}</h3>
            <p>Limited Stock</p>
          </div>
        </div>

        <div className="adml-stat-card">
          <div className="adml-stat-icon red">
            <FiXCircle />
          </div>
          <div>
            <h3>{adminSoldOutMenus}</h3>
            <p>Sold Out</p>
          </div>
        </div>
      </div>

      <div className="adml-toolbar">
        <div className="adml-searchbox">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name or description..."
            value={adminSearchTerm}
            onChange={(e) => setAdminSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={adminCategoryFilter}
          onChange={(e) => setAdminCategoryFilter(e.target.value)}
          className="adml-select"
        >
          <option value="All">All Categories</option>
          <option value="Foods">Foods</option>
          <option value="Drinks">Drinks</option>
          <option value="Snacks">Snacks</option>
          <option value="Desserts">Desserts</option>
        </select>

        <select
          value={adminStatusFilter}
          onChange={(e) => setAdminStatusFilter(e.target.value)}
          className="adml-select"
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="Limited">Limited</option>
          <option value="Sold Out">Sold Out</option>
        </select>
      </div>

      {adminLoading ? (
        <div className="adml-info-box">Loading menu data...</div>
      ) : filteredAdminMenus.length === 0 ? (
        <div className="adml-info-box">No menu items found.</div>
      ) : (
        <div className="adml-grid">
          {filteredAdminMenus.map((item) => (
            <div className="adml-card" key={item._id}>
              <div className="adml-image-wrap">
                {item.image ? (
                  <img
                    src={getAdminImageUrl(item.image)}
                    alt={item.name}
                    className="adml-image"
                  />
                ) : (
                  <div className="adml-no-image">No Image</div>
                )}

                <span
                  className={`adml-status ${
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

              <div className="adml-card-body">
                <div className="adml-card-head">
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.category}</p>
                  </div>

                  <div className="adml-price">
                    LKR {Number(item.price).toFixed(2)}
                  </div>
                </div>

                <p className="adml-description">
                  {item.description || "No description available."}
                </p>

                <div className="adml-info-grid">
                  <div className="adml-info-item">
                    <span>Portion</span>
                    <strong>{item.portionSize || "Regular"}</strong>
                  </div>

                  <div className="adml-info-item">
                    <span>Calories</span>
                    <strong>{item.calories || 0}</strong>
                  </div>

                  <div className="adml-info-item">
                    <span>Stock</span>
                    <strong>{item.stockQty}</strong>
                  </div>

                  <div className="adml-info-item">
                    <span>Rating</span>
                    <strong>
                      <FiStar className="adml-inline-icon" />
                      {item.rating || 0} ({item.ratingCount || 0})
                    </strong>
                  </div>
                </div>

                <div className="adml-section">
                  <h4>Order Types</h4>
                  <div className="adml-chip-row">
                    {(item.availableOrderTypes || []).map((type, index) => (
                      <span className="adml-chip adml-green-chip" key={index}>
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="adml-section">
                  <h4>
                    <FiTag className="adml-section-icon" />
                    Labels
                  </h4>
                  <div className="adml-chip-row">
                    {item.labels?.length > 0 ? (
                      item.labels.map((label, index) => (
                        <span className="adml-chip adml-orange-chip" key={index}>
                          {label}
                        </span>
                      ))
                    ) : (
                      <span className="adml-muted">No labels</span>
                    )}
                  </div>
                </div>

                <div className="adml-section">
                  <h4>
                    <FiAlertCircle className="adml-section-icon" />
                    Allergens
                  </h4>
                  <div className="adml-chip-row">
                    {item.allergens?.length > 0 ? (
                      item.allergens.map((allergen, index) => (
                        <span className="adml-chip adml-red-chip" key={index}>
                          {allergen}
                        </span>
                      ))
                    ) : (
                      <span className="adml-muted">No allergens</span>
                    )}
                  </div>
                </div>

                <div className="adml-section">
                  <h4>
                    <FiDroplet className="adml-section-icon" />
                    Nutrients
                  </h4>
                  <div className="adml-chip-row">
                    {item.nutrients?.length > 0 ? (
                      item.nutrients.map((nutrient, index) => (
                        <span
                          className="adml-chip adml-neutral-chip"
                          key={index}
                        >
                          {nutrient}
                        </span>
                      ))
                    ) : (
                      <span className="adml-muted">No nutrients</span>
                    )}
                  </div>
                </div>

                <div className="adml-footer">
                  <span
                    className={
                      item.isActive ? "adml-active-text" : "adml-inactive-text"
                    }
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </span>

                  <div className="adml-footer-actions">
                    <button
                      className="adml-edit-btn"
                      onClick={() => handleAdminEditRedirect(item)}
                    >
                      <FiEdit2 />
                      <span>Edit</span>
                    </button>

                    <button
                      className="adml-delete-btn"
                      onClick={() => setAdminDeleteTarget(item)}
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

      <div className="adml-bottom-note">
        <strong>Active Menus:</strong> {adminActiveMenus} / {adminTotalMenus}
      </div>

      {adminDeleteTarget && (
        <div className="adml-modal-overlay">
          <div className="adml-modal-box">
            <div className="adml-modal-icon">
              <FiTrash2 />
            </div>
            <h3>Delete Menu Item</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{adminDeleteTarget.name}</strong>?
            </p>

            <div className="adml-modal-actions">
              <button
                className="adml-modal-cancel"
                onClick={() => setAdminDeleteTarget(null)}
              >
                <FiX />
                <span>Cancel</span>
              </button>

              <button
                className="adml-modal-delete"
                onClick={handleAdminDeleteMenu}
                disabled={adminDeleteLoadingId === adminDeleteTarget._id}
              >
                <FiTrash2 />
                <span>
                  {adminDeleteLoadingId === adminDeleteTarget._id
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