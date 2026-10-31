import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiArrowLeft,
  FiSearch,
  FiCheckCircle,
  FiShoppingBag,
  FiClock,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./VendorCompletedOrders.css";

const API_BASE = "http://localhost:5000";

export default function VendorCompletedOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  useEffect(() => {
    let updated = orders.filter(
      (order) => (order.orderStatus || "").toLowerCase() !== "finished"
    );

    if (typeFilter !== "All") {
      updated = updated.filter(
        (order) =>
          (order.orderType || "").toLowerCase() === typeFilter.toLowerCase()
      );
    }

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
  }, [orders, searchText, typeFilter]);

  const fetchCompletedOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/completed-orders`);
      const completedOrders = (res.data?.completedOrders || []).filter(
        (order) => (order.orderStatus || "").toLowerCase() !== "finished"
      );

      setOrders(completedOrders);
      setFilteredOrders(completedOrders);
    } catch (error) {
      console.log("Fetch completed orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const visibleOrders = orders.filter(
      (order) => (order.orderStatus || "").toLowerCase() !== "finished"
    );

    const total = visibleOrders.length;
    const takeaway = visibleOrders.filter(
      (order) => (order.orderType || "").toLowerCase() === "takeaway"
    ).length;
    const delivery = visibleOrders.filter(
      (order) => (order.orderType || "").toLowerCase() === "delivery"
    ).length;

    const revenue = visibleOrders.reduce(
      (sum, order) => sum + Number(order.grandTotal || 0),
      0
    );

    return { total, takeaway, delivery, revenue };
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
    <div className="vendorcompleted-page">
      <div className="vendorcompleted-topbar">
        <button
          className="vendorcompleted-back-btn"
          onClick={() => navigate("/vendor-dashboard")}
        >
          <FiArrowLeft />
          <span>Back to Dashboard</span>
        </button>

        <div className="vendorcompleted-topbar-text">
          <h1>Completed Orders</h1>
          <p>Review finished takeaway and delivery orders in one place.</p>
        </div>
      </div>

      <section className="vendorcompleted-stats-grid">
        <div className="vendorcompleted-stat-card">
          <div className="vendorcompleted-stat-icon">
            <FiCheckCircle />
          </div>
          <div>
            <h3>Total Completed</h3>
            <h2>{stats.total}</h2>
          </div>
        </div>

        <div className="vendorcompleted-stat-card">
          <div className="vendorcompleted-stat-icon">
            <FiShoppingBag />
          </div>
          <div>
            <h3>Takeaway</h3>
            <h2>{stats.takeaway}</h2>
          </div>
        </div>

        <div className="vendorcompleted-stat-card">
          <div className="vendorcompleted-stat-icon">
            <FiClock />
          </div>
          <div>
            <h3>Delivery</h3>
            <h2>{stats.delivery}</h2>
          </div>
        </div>

        <div className="vendorcompleted-stat-card">
          <div className="vendorcompleted-stat-icon">
            <FiCheckCircle />
          </div>
          <div>
            <h3>Total Revenue</h3>
            <h2>{formatCurrency(stats.revenue)}</h2>
          </div>
        </div>
      </section>

      <section className="vendorcompleted-toolbar">
        <div className="vendorcompleted-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by Order ID, customer, item..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <select
          className="vendorcompleted-filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          <option value="Takeaway">Takeaway</option>
          <option value="Delivery">Delivery</option>
        </select>
      </section>

      <section className="vendorcompleted-list-wrap">
        {loading ? (
          <div className="vendorcompleted-empty">Loading completed orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="vendorcompleted-empty">No completed orders found.</div>
        ) : (
          <div className="vendorcompleted-list">
            {filteredOrders.map((order) => (
              <div
                className="vendorcompleted-card"
                key={order._id || order.orderId}
              >
                <div className="vendorcompleted-card-top">
                  <div>
                    <h3>{order.orderId}</h3>
                    <p>
                      {order.customerName || "Customer"} •{" "}
                      {order.orderType || "N/A"}
                    </p>
                  </div>

                  <span className="vendorcompleted-status">
                    {order.orderType?.toLowerCase() === "takeaway"
                      ? "Picked Up"
                      : "Completed"}
                  </span>
                </div>

                <div className="vendorcompleted-info-grid">
                  <div className="vendorcompleted-info-box">
                    <span>Email</span>
                    <strong>{order.gmail || "N/A"}</strong>
                  </div>

                  <div className="vendorcompleted-info-box">
                    <span>Phone</span>
                    <strong>{order.phoneNumber || "N/A"}</strong>
                  </div>

                  <div className="vendorcompleted-info-box">
                    <span>Payment</span>
                    <strong>{order.paymentMethod || "N/A"}</strong>
                  </div>

                  <div className="vendorcompleted-info-box">
                    <span>Grand Total</span>
                    <strong>{formatCurrency(order.grandTotal)}</strong>
                  </div>
                </div>

                <div className="vendorcompleted-items">
                  <h4>Ordered Items</h4>

                  <div className="vendorcompleted-item-list">
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div className="vendorcompleted-item" key={index}>
                          <div className="vendorcompleted-item-left">
                            <div className="vendorcompleted-item-image-wrap">
                              {item.image ? (
                                <>
                                  <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name || "Order item"}
                                    className="vendorcompleted-item-image"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      const fallback =
                                        e.currentTarget.parentElement.querySelector(
                                          ".vendorcompleted-item-noimage"
                                        );
                                      if (fallback) {
                                        fallback.style.display = "flex";
                                      }
                                    }}
                                  />
                                  <div
                                    className="vendorcompleted-item-noimage"
                                    style={{ display: "none" }}
                                  >
                                    No Image
                                  </div>
                                </>
                              ) : (
                                <div className="vendorcompleted-item-noimage">
                                  No Image
                                </div>
                              )}
                            </div>

                            <div className="vendorcompleted-item-details">
                              <strong>{item.name}</strong>
                              <p>
                                Qty: {item.qty}{" "}
                                {item.portionSize
                                  ? `• ${item.portionSize}`
                                  : ""}
                              </p>
                              {item.category && (
                                <p className="vendorcompleted-item-meta">
                                  Category: {item.category}
                                </p>
                              )}
                            </div>
                          </div>

                          <span>
                            {formatCurrency(item.subtotal || item.price)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="vendorcompleted-no-items">
                        No items available
                      </p>
                    )}
                  </div>
                </div>

                <div className="vendorcompleted-card-bottom">
                  <div>
                    <span>Completed Status:</span>
                    <strong>
                      {order.orderType?.toLowerCase() === "takeaway"
                        ? "Customer Picked Up"
                        : "Order Completed"}
                    </strong>
                  </div>

                  <div>
                    <span>Completed At:</span>
                    <strong>
                      {order.completedAt
                        ? new Date(order.completedAt).toLocaleString()
                        : "N/A"}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}