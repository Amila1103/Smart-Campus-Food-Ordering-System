import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiArrowLeft,
  FiSearch,
  FiShoppingBag,
  FiCheckCircle,
  FiPackage,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./CompletedOrdersTakeaway.css";

const API_BASE = "http://localhost:5000";

export default function CompletedOrdersTakeaway() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    fetchTakeawayCompletedOrders();
  }, []);

  useEffect(() => {
    let updated = orders.filter(
      (order) =>
        (order.orderType || "").toLowerCase() === "takeaway" &&
        (order.orderStatus || "").toLowerCase() !== "finished"
    );

    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();

      updated = updated.filter((order) => {
        const itemNames = Array.isArray(order.items)
          ? order.items.map((item) => item.name).join(" ")
          : "";

        return (
          (order.orderId || "").toLowerCase().includes(keyword) ||
          (order.customerName || "").toLowerCase().includes(keyword) ||
          (order.gmail || "").toLowerCase().includes(keyword) ||
          itemNames.toLowerCase().includes(keyword)
        );
      });
    }

    setFilteredOrders(updated);
  }, [orders, searchText]);

  const fetchTakeawayCompletedOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/completed-orders`);
      const allCompletedOrders = res.data?.completedOrders || [];

      const takeawayOrders = allCompletedOrders.filter(
        (order) =>
          (order.orderType || "").toLowerCase() === "takeaway" &&
          (order.orderStatus || "").toLowerCase() !== "finished"
      );

      setOrders(takeawayOrders);
      setFilteredOrders(takeawayOrders);
    } catch (error) {
      console.log("Fetch takeaway completed orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickupComplete = async (orderId) => {
    try {
      setUpdatingId(orderId);

      await axios.put(`${API_BASE}/completed-orders/${orderId}/finish`);

      setOrders((prev) => prev.filter((order) => order.orderId !== orderId));
    } catch (error) {
      console.log("Pickup complete update error:", error);
      alert("Failed to update pickup status");
    } finally {
      setUpdatingId("");
    }
  };

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.grandTotal || 0),
      0
    );

    const totalItems = orders.reduce((sum, order) => {
      const itemCount = Array.isArray(order.items)
        ? order.items.reduce((acc, item) => acc + Number(item.qty || 0), 0)
        : 0;

      return sum + itemCount;
    }, 0);

    return {
      totalOrders,
      totalRevenue,
      totalItems,
    };
  }, [orders]);

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE}${imagePath}`;
  };

  return (
    <div className="cot-page">
      <div className="cot-topbar">
        <button
          className="cot-back-btn"
          onClick={() => navigate("/vendor-dashboard")}
        >
          <FiArrowLeft />
          <span>Back to Dashboard</span>
        </button>

        <div className="cot-topbar-text">
          <h1>Completed Takeaway Orders</h1>
          <p>Only picked-up takeaway orders are shown here.</p>
        </div>
      </div>

      <section className="cot-stats-grid">
        <div className="cot-stat-card">
          <div className="cot-stat-icon">
            <FiCheckCircle />
          </div>
          <div>
            <h3>Total Orders</h3>
            <h2>{stats.totalOrders}</h2>
          </div>
        </div>

        <div className="cot-stat-card">
          <div className="cot-stat-icon">
            <FiShoppingBag />
          </div>
          <div>
            <h3>Total Items</h3>
            <h2>{stats.totalItems}</h2>
          </div>
        </div>

        <div className="cot-stat-card">
          <div className="cot-stat-icon">
            <FiPackage />
          </div>
          <div>
            <h3>Total Revenue</h3>
            <h2>{formatCurrency(stats.totalRevenue)}</h2>
          </div>
        </div>
      </section>

      <section className="cot-toolbar">
        <div className="cot-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by order ID, customer or item..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </section>

      <section className="cot-list-wrap">
        {loading ? (
          <div className="cot-empty">Loading completed takeaway orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="cot-empty">No completed takeaway orders found.</div>
        ) : (
          <div className="cot-list">
            {filteredOrders.map((order) => (
              <div className="cot-card" key={order._id || order.orderId}>
                <div className="cot-card-top">
                  <div>
                    <h3>{order.orderId}</h3>
                    <p>{order.customerName || "Customer"} • Takeaway</p>
                  </div>

                  <span className="cot-status">Picked Up</span>
                </div>

                <div className="cot-info-grid">
                  <div className="cot-info-box">
                    <span>Email</span>
                    <strong>{order.gmail || "N/A"}</strong>
                  </div>

                  <div className="cot-info-box">
                    <span>Phone</span>
                    <strong>{order.phoneNumber || "N/A"}</strong>
                  </div>

                  <div className="cot-info-box">
                    <span>Payment</span>
                    <strong>{order.paymentMethod || "N/A"}</strong>
                  </div>

                  <div className="cot-info-box">
                    <span>Grand Total</span>
                    <strong>{formatCurrency(order.grandTotal)}</strong>
                  </div>
                </div>

                <div className="cot-items">
                  <h4>Ordered Items</h4>

                  <div className="cot-item-list">
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div className="cot-item" key={index}>
                          <div className="cot-item-left">
                            <div className="cot-item-image-wrap">
                              {item.image ? (
                                <>
                                  <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name || "Order item"}
                                    className="cot-item-image"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      const fallback =
                                        e.currentTarget.parentElement.querySelector(
                                          ".cot-item-noimage"
                                        );
                                      if (fallback) {
                                        fallback.style.display = "flex";
                                      }
                                    }}
                                  />
                                  <div
                                    className="cot-item-noimage"
                                    style={{ display: "none" }}
                                  >
                                    No Image
                                  </div>
                                </>
                              ) : (
                                <div className="cot-item-noimage">No Image</div>
                              )}
                            </div>

                            <div className="cot-item-details">
                              <strong>{item.name}</strong>
                              <p>
                                Qty: {item.qty}
                                {item.portionSize
                                  ? ` • ${item.portionSize}`
                                  : ""}
                              </p>
                              {item.category && (
                                <p className="cot-item-meta">
                                  Category: {item.category}
                                </p>
                              )}
                            </div>
                          </div>

                          <span className="cot-item-price">
                            {formatCurrency(item.subtotal || item.price)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="cot-no-items">No items available</p>
                    )}
                  </div>
                </div>

                <div className="cot-card-bottom">
                  <div>
                    <span>Status:</span>
                    <strong>{order.orderStatus || "Completed"}</strong>
                  </div>

                  <button
                    className="cot-complete-btn"
                    type="button"
                    disabled={updatingId === order.orderId}
                    onClick={() => handlePickupComplete(order.orderId)}
                  >
                    {updatingId === order.orderId
                      ? "Updating..."
                      : "Pick Up Complete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}