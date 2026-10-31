import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiSearch,
  FiRefreshCw,
  FiPackage,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiEdit2,
  FiPlusCircle,
  FiX,
  FiTrendingUp,
  FiTrendingDown,
  FiArchive,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./VendorInventoryList.css";

const API_BASE = "http://localhost:5000";

export default function VendorInventoryList() {
  const navigate = useNavigate();

  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteLoadingId, setDeleteLoadingId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [updatingQtyId, setUpdatingQtyId] = useState("");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 2500);
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);

      // me endpoint eka oyage backend ekata anuwa change karanna
      const res = await axios.get(`${API_BASE}/inventory`);
      setInventoryItems(res.data?.inventory || res.data?.items || []);
    } catch (error) {
      console.log("Fetch inventory error:", error);
      showMessage("error", "Failed to fetch inventory data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch =
        item.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" ? true : item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ? true : item.stockStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [inventoryItems, searchTerm, categoryFilter, statusFilter]);

  const totalItems = inventoryItems.length;
  const availableItems = inventoryItems.filter(
    (item) => item.stockStatus === "Available"
  ).length;
  const lowStockItems = inventoryItems.filter(
    (item) => item.stockStatus === "Low Stock"
  ).length;
  const outOfStockItems = inventoryItems.filter(
    (item) => item.stockStatus === "Out of Stock"
  ).length;

  const handleAddRedirect = () => {
    navigate("/vendor/add-inventory");
  };

  

  const handleDeleteInventory = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoadingId(deleteTarget._id);

      await axios.delete(`${API_BASE}/inventory/${deleteTarget._id}`);

      setInventoryItems((prev) =>
        prev.filter((item) => item._id !== deleteTarget._id)
      );

      setDeleteTarget(null);
      showMessage("success", "Inventory item deleted successfully.");
    } catch (error) {
      console.log("Delete inventory error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to delete inventory item."
      );
    } finally {
      setDeleteLoadingId("");
    }
  };

  const handleQtyChange = async (item, amount) => {
    try {
      setUpdatingQtyId(item._id);

      const currentQty = Number(item.quantity || 0);
      const newQty = Math.max(0, currentQty + amount);

      await axios.put(`${API_BASE}/inventory/${item._id}`, {
        ...item,
        quantity: newQty,
      });

      setInventoryItems((prev) =>
        prev.map((inv) =>
          inv._id === item._id ? { ...inv, quantity: newQty } : inv
        )
      );

      showMessage("success", `${item.itemName} quantity updated.`);
    } catch (error) {
      console.log("Inventory qty update error:", error);
      showMessage("error", "Failed to update quantity.");
    } finally {
      setUpdatingQtyId("");
    }
  };

  return (
    <section className="vil-wrapper">
      <div className="vil-topbar">
        <div>
          <span className="vil-badge">Inventory List</span>
          <h2>Kitchen & Store Inventory</h2>
          <p>Manage ingredient stock, supplier details, and reorder levels.</p>
        </div>

        <div className="vil-topbar-actions">
          <button className="vil-refresh-btn" onClick={fetchInventory}>
            <FiRefreshCw />
            <span>Refresh</span>
          </button>

          <button className="vil-add-btn" onClick={handleAddRedirect}>
            <FiPlusCircle />
            <span>Add Inventory</span>
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`vil-toast ${message.type}`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="vil-stats">
        <div className="vil-stat-card">
          <div className="vil-stat-icon green">
            <FiPackage />
          </div>
          <div>
            <h3>{totalItems}</h3>
            <p>Total Items</p>
          </div>
        </div>

        <div className="vil-stat-card">
          <div className="vil-stat-icon orange">
            <FiCheckCircle />
          </div>
          <div>
            <h3>{availableItems}</h3>
            <p>Available</p>
          </div>
        </div>

        <div className="vil-stat-card">
          <div className="vil-stat-icon yellow">
            <FiAlertCircle />
          </div>
          <div>
            <h3>{lowStockItems}</h3>
            <p>Low Stock</p>
          </div>
        </div>

        <div className="vil-stat-card">
          <div className="vil-stat-icon red">
            <FiXCircle />
          </div>
          <div>
            <h3>{outOfStockItems}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
      </div>

      <div className="vil-toolbar">
        <div className="vil-searchbox">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by item name, description, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="vil-select"
        >
          <option value="All">All Categories</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Meat">Meat</option>
          <option value="Dairy">Dairy</option>
          <option value="Dry Goods">Dry Goods</option>
          <option value="Beverages">Beverages</option>
          <option value="Spices">Spices</option>
          <option value="Packaging">Packaging</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="vil-select"
        >
          <option value="All">All Status</option>
          <option value="Available">Available</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      {loading ? (
        <div className="vil-info-box">Loading inventory data...</div>
      ) : filteredInventory.length === 0 ? (
        <div className="vil-info-box">No inventory items found.</div>
      ) : (
        <div className="vil-grid">
          {filteredInventory.map((item) => (
            <div className="vil-card" key={item._id}>
              <div className="vil-card-top">
                <div className="vil-card-icon-wrap">
                  <FiArchive />
                </div>

                <span
                  className={`vil-status ${
                    item.stockStatus === "Available"
                      ? "available"
                      : item.stockStatus === "Low Stock"
                      ? "limited"
                      : "soldout"
                  }`}
                >
                  {item.stockStatus || "Available"}
                </span>
              </div>

              <div className="vil-card-body">
                <div className="vil-card-head">
                  <div>
                    <h3>{item.itemName}</h3>
                    <p>{item.category || "No category"}</p>
                  </div>

                  <div className="vil-unit-badge">
                    {item.unit || "pcs"}
                  </div>
                </div>

                <p className="vil-description">
                  {item.description || "No description available."}
                </p>

                <div className="vil-info-grid">
                  <div className="vil-info-item">
                    <span>Quantity</span>
                    <strong>{item.quantity ?? 0}</strong>
                  </div>

                  <div className="vil-info-item">
                    <span>Reorder Level</span>
                    <strong>{item.reorderLevel ?? 0}</strong>
                  </div>

                  <div className="vil-info-item">
                    <span>Supplier</span>
                    <strong>{item.supplierName || "N/A"}</strong>
                  </div>

                  <div className="vil-info-item">
                    <span>Expiry Date</span>
                    <strong>{item.expiryDate || "N/A"}</strong>
                  </div>
                </div>

                <div className="vil-stock-actions">
                  <button
                    className="vil-stock-btn minus"
                    onClick={() => handleQtyChange(item, -1)}
                    disabled={updatingQtyId === item._id}
                  >
                    <FiTrendingDown />
                    <span>Reduce</span>
                  </button>

                  <button
                    className="vil-stock-btn plus"
                    onClick={() => handleQtyChange(item, 1)}
                    disabled={updatingQtyId === item._id}
                  >
                    <FiTrendingUp />
                    <span>Restock</span>
                  </button>
                </div>

                <div className="vil-footer">
                  <div className="vil-footer-actions">
                    

                    <button
                      className="vil-delete-btn"
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

      <div className="vil-bottom-note">
        <strong>Available Items:</strong> {availableItems} / {totalItems}
      </div>

      {deleteTarget && (
        <div className="vil-modal-overlay">
          <div className="vil-modal-box">
            <div className="vil-modal-icon">
              <FiTrash2 />
            </div>
            <h3>Delete Inventory Item</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.itemName}</strong>?
            </p>

            <div className="vil-modal-actions">
              <button
                className="vil-modal-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                <FiX />
                <span>Cancel</span>
              </button>

              <button
                className="vil-modal-delete"
                onClick={handleDeleteInventory}
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