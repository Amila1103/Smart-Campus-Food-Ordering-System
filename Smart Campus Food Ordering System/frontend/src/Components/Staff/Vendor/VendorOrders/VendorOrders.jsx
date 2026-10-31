import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiArrowLeft,
  FiSearch,
  FiClipboard,
  FiShoppingBag,
  FiTruck,
  FiClock,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./VendorOrders.css";

const API_BASE = "http://localhost:5000";

export default function VendorOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let updatedOrders = [...orders];

    if (statusFilter !== "All") {
      updatedOrders = updatedOrders.filter(
        (order) =>
          (order.orderStatus || "").toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    if (searchText.trim()) {
      const keyword = searchText.toLowerCase();

      updatedOrders = updatedOrders.filter((order) => {
        const itemNames = Array.isArray(order.items)
          ? order.items.map((item) => item.name).join(" ")
          : "";

        return (
          order.orderId?.toLowerCase().includes(keyword) ||
          order.customerName?.toLowerCase().includes(keyword) ||
          order.gmail?.toLowerCase().includes(keyword) ||
          itemNames.toLowerCase().includes(keyword)
        );
      });
    }

    setFilteredOrders(updatedOrders);
  }, [orders, searchText, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/orders`);
      const allOrders = res.data?.orders || [];

      // Completed orders hide from Vendor Orders page
      const activeOrders = allOrders.filter(
        (order) => (order.orderStatus || "").toLowerCase() !== "completed"
      );

      setOrders(activeOrders);
      setFilteredOrders(activeOrders);
    } catch (error) {
      console.log("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(
      (order) => (order.orderStatus || "").toLowerCase() === "pending"
    ).length;
    const preparing = orders.filter(
      (order) => (order.orderStatus || "").toLowerCase() === "preparing"
    ).length;
    const outForDelivery = orders.filter(
      (order) => (order.orderStatus || "").toLowerCase() === "out for delivery"
    ).length;

    return { total, pending, preparing, outForDelivery };
  }, [orders]);

  const getStatusClass = (status) => {
    const value = (status || "").toLowerCase();

    if (value === "preparing") return "pending";
    if (value === "out for delivery") return "progress";
    if (value === "pending") return "waiting";
    return "default";
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE}${imagePath}`;
  };

  return (
    <div className="vendororders-page">
      <div className="vendororders-top">
        <button
          className="vendororders-back-btn"
          onClick={() => navigate("/vendor-dashboard")}
        >
          <FiArrowLeft />
          <span>Back to Dashboard</span>
        </button>

        <div className="vendororders-title-wrap">
          <h1>Vendor Orders</h1>
          <p>View and manage all current active customer orders from one place.</p>
        </div>
      </div>

      <section className="vendororders-stats-grid">
        <div className="vendororders-stat-card">
          <div className="vendororders-stat-icon">
            <FiClipboard />
          </div>
          <div>
            <h3>Total Active Orders</h3>
            <h2>{stats.total}</h2>
          </div>
        </div>

        <div className="vendororders-stat-card">
          <div className="vendororders-stat-icon">
            <FiClock />
          </div>
          <div>
            <h3>Pending</h3>
            <h2>{stats.pending}</h2>
          </div>
        </div>

        <div className="vendororders-stat-card">
          <div className="vendororders-stat-icon">
            <FiTruck />
          </div>
          <div>
            <h3>Preparing</h3>
            <h2>{stats.preparing}</h2>
          </div>
        </div>

        <div className="vendororders-stat-card">
          <div className="vendororders-stat-icon">
            <FiTruck />
          </div>
          <div>
            <h3>Out for Delivery</h3>
            <h2>{stats.outForDelivery}</h2>
          </div>
        </div>
      </section>

      <section className="vendororders-toolbar">
        <div className="vendororders-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by Order ID, customer, item..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <select
          className="vendororders-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Preparing">Preparing</option>
          <option value="Out for Delivery">Out for Delivery</option>
        </select>
      </section>

      <section className="vendororders-list-wrap">
        {loading ? (
          <div className="vendororders-empty">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="vendororders-empty">No active orders found.</div>
        ) : (
          <div className="vendororders-list">
            {filteredOrders.map((order) => (
              <div
                className="vendororders-card"
                key={order._id || order.orderId}
              >
                <div className="vendororders-card-top">
                  <div>
                    <h3>{order.orderId}</h3>
                    <p>
                      {order.customerName || "Customer"} •{" "}
                      {order.orderType || "Delivery"}
                    </p>
                  </div>

                  <span
                    className={`vendororders-status ${getStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus || "Pending"}
                  </span>
                </div>

                <div className="vendororders-info-grid">
                  <div className="vendororders-info-box">
                    <span>Customer Email</span>
                    <strong>{order.gmail || "N/A"}</strong>
                  </div>

                  <div className="vendororders-info-box">
                    <span>Phone Number</span>
                    <strong>{order.phoneNumber || "N/A"}</strong>
                  </div>

                  <div className="vendororders-info-box">
                    <span>Payment</span>
                    <strong>{order.paymentMethod || "N/A"}</strong>
                  </div>

                  <div className="vendororders-info-box">
                    <span>Grand Total</span>
                    <strong>{formatCurrency(order.grandTotal)}</strong>
                  </div>
                </div>

                <div className="vendororders-items">
                  <h4>
                    <FiShoppingBag />
                    <span>Ordered Items</span>
                  </h4>

                  <div className="vendororders-item-list">
                    {Array.isArray(order.items) && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div className="vendororders-item" key={index}>
                          <div className="vendororders-item-left">
                            <div className="vendororders-item-image-wrap">
                              {item.image ? (
                                <>
                                  <img
                                    src={getImageUrl(item.image)}
                                    alt={item.name || "Order item"}
                                    className="vendororders-item-image"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      const fallback =
                                        e.currentTarget.parentElement.querySelector(
                                          ".vendororders-item-noimage"
                                        );
                                      if (fallback) {
                                        fallback.style.display = "flex";
                                      }
                                    }}
                                  />
                                  <div
                                    className="vendororders-item-noimage"
                                    style={{ display: "none" }}
                                  >
                                    No Image
                                  </div>
                                </>
                              ) : (
                                <div className="vendororders-item-noimage">
                                  No Image
                                </div>
                              )}
                            </div>

                            <div className="vendororders-item-details">
                              <strong>{item.name}</strong>
                              <p>
                                Qty: {item.qty}{" "}
                                {item.portionSize
                                  ? `• ${item.portionSize}`
                                  : ""}
                              </p>
                              {item.category && (
                                <p className="vendororders-item-meta">
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
                      <p className="vendororders-no-items">
                        No items available
                      </p>
                    )}
                  </div>
                </div>

                <div className="vendororders-card-bottom">
                  <div>
                    <span>Payment Status:</span>
                    <strong>{order.paymentStatus || "Pending"}</strong>
                  </div>

                  <div>
                    <span>Created:</span>
                    <strong>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "N/A"}
                    </strong>
                  </div>
                </div>

                <div className="vendororders-card-actions">
                  <button
                    className="vendororders-process-btn"
                    onClick={() => navigate(`/vendor-order/${order.orderId}`)}
                  >
                    {(order.orderStatus || "").toLowerCase() === "pending"
                      ? "Start Processing"
                      : (order.orderStatus || "").toLowerCase() === "preparing"
                      ? "Continue Processing"
                      : "View Processing"}
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