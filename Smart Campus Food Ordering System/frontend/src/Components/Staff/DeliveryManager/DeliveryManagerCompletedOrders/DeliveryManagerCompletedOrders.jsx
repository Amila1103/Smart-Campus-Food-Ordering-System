import React, { useEffect, useMemo, useState } from "react";
import "./DeliveryManagerCompletedOrders.css";
import {
  FaTruck,
  FaSearch,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaBoxOpen,
  FaSyncAlt,
} from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";

export default function DeliveryManagerCompletedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCompletedOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/completed-orders");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch completed orders");
      }

      setOrders(data.completedOrders || []);
    } catch (err) {
      console.error("Fetch completed orders error:", err);
      setError(err.message || "Something went wrong while loading orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const deliveryCompletedOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderType = (order.orderType || "").toLowerCase().trim();
      const orderStatus = (order.orderStatus || "").toLowerCase().trim();

      const isDelivery =
        orderType === "delivery" ||
        orderType === "deliver" ||
        orderType.includes("delivery");

      const isCompleted = orderStatus === "completed";

      const search = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !search ||
        (order.orderId || "").toLowerCase().includes(search) ||
        (order.customerName || "").toLowerCase().includes(search) ||
        (order.gmail || "").toLowerCase().includes(search) ||
        (order.phoneNumber || "").toLowerCase().includes(search) ||
        (order.selectedDeliveryLocation || "").toLowerCase().includes(search) ||
        (order.customLocation || "").toLowerCase().includes(search) ||
        (order.address || "").toLowerCase().includes(search);

      return isDelivery && isCompleted && matchesSearch;
    });
  }, [orders, searchTerm]);

  const totalOrders = deliveryCompletedOrders.length;

  const totalRevenue = deliveryCompletedOrders.reduce(
    (sum, order) => sum + (Number(order.grandTotal) || 0),
    0
  );

  const totalItems = deliveryCompletedOrders.reduce((sum, order) => {
    const count = Array.isArray(order.items)
      ? order.items.reduce((itemSum, item) => itemSum + (Number(item.qty) || 0), 0)
      : 0;
    return sum + count;
  }, 0);

  const buildQRValue = (order) => {
    return JSON.stringify({
      orderId: order.orderId || "N/A",
      customerName: order.customerName || "N/A",
      phoneNumber: order.phoneNumber || "N/A",
      email: order.gmail || "N/A",
      address:
        order.customLocation ||
        order.selectedDeliveryLocation ||
        order.deliveryLocation ||
        order.address ||
        "N/A",
      paymentMethod: order.paymentMethod || "N/A",
      paymentStatus: order.paymentStatus || "N/A",
      grandTotal: Number(order.grandTotal || 0).toFixed(2),
      completedAt: order.completedAt || "N/A",
    });
  };

  return (
    <div className="dmco-page">
      <div className="dmco-header">
        <div>
          <h1>Delivery Orders</h1>
          <p>Delivery manager dashboard for completed delivery orders</p>
        </div>

        <button className="dmco-refresh-btn" onClick={fetchCompletedOrders}>
          <FaSyncAlt />
          Refresh
        </button>
      </div>

      <div className="dmco-stats-grid">
        <div className="dmco-stat-card">
          <div className="dmco-stat-icon">
            <FaTruck />
          </div>
          <div>
            <h3>{totalOrders}</h3>
            <p>Completed Deliveries</p>
          </div>
        </div>

        <div className="dmco-stat-card">
          <div className="dmco-stat-icon">
            <FaMoneyBillWave />
          </div>
          <div>
            <h3>Rs. {totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="dmco-stat-card">
          <div className="dmco-stat-icon">
            <FaBoxOpen />
          </div>
          <div>
            <h3>{totalItems}</h3>
            <p>Total Items Delivered</p>
          </div>
        </div>
      </div>

      <div className="dmco-toolbar">
        <div className="dmco-search-box">
          <FaSearch className="dmco-search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID, customer, email, phone, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="dmco-state-card">
          <div className="dmco-loader"></div>
          <p>Loading completed delivery orders...</p>
        </div>
      ) : error ? (
        <div className="dmco-state-card dmco-error-card">
          <p>{error}</p>
        </div>
      ) : deliveryCompletedOrders.length === 0 ? (
        <div className="dmco-state-card">
          <p>No completed delivery orders found.</p>
        </div>
      ) : (
        <div className="dmco-orders-grid">
          {deliveryCompletedOrders.map((order) => (
            <div className="dmco-order-card" key={order._id || order.orderId}>
              <div className="dmco-card-top">
                <div>
                  <h2>{order.orderId}</h2>
                  <span className="dmco-badge">Completed</span>
                </div>
                <div className="dmco-date">
                  {order.completedAt
                    ? new Date(order.completedAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>

              <div className="dmco-qr-section">
                <h3>Order QR</h3>
                <div className="dmco-qr-box">
                  <QRCodeCanvas
                    value={buildQRValue(order)}
                    size={130}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="dmco-qr-text">
                  Scan this QR to view basic delivery order details
                </p>
              </div>

              <div className="dmco-info-grid">
                <div className="dmco-info-item">
                  <span className="dmco-label">Customer Name</span>
                  <span className="dmco-value">{order.customerName || "N/A"}</span>
                </div>

                <div className="dmco-info-item">
                  <span className="dmco-label">Order Type</span>
                  <span className="dmco-value">{order.orderType || "N/A"}</span>
                </div>

                <div className="dmco-info-item">
                  <span className="dmco-label">
                    <FaEnvelope /> Email
                  </span>
                  <span className="dmco-value">{order.gmail || "N/A"}</span>
                </div>

                <div className="dmco-info-item">
                  <span className="dmco-label">
                    <FaPhoneAlt /> Phone
                  </span>
                  <span className="dmco-value">{order.phoneNumber || "N/A"}</span>
                </div>

                <div className="dmco-info-item dmco-info-full">
                  <span className="dmco-label">
                    <FaMapMarkerAlt /> Delivery Address
                  </span>
                  <span className="dmco-value">
                    {order.customLocation ||
                      order.selectedDeliveryLocation ||
                      order.deliveryLocation ||
                      order.address ||
                      "N/A"}
                  </span>
                </div>

                <div className="dmco-info-item">
                  <span className="dmco-label">Payment Method</span>
                  <span className="dmco-value">{order.paymentMethod || "N/A"}</span>
                </div>

                <div className="dmco-info-item">
                  <span className="dmco-label">Payment Status</span>
                  <span className="dmco-value">
                    {order.paymentStatus || "N/A"}
                  </span>
                </div>
              </div>

              <div className="dmco-items-section">
                <h3>
                  <FaClipboardCheck /> Ordered Items
                </h3>

                <div className="dmco-items-list">
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div className="dmco-item-row" key={index}>
                        <div className="dmco-item-left">
                          <strong>{item.name}</strong>
                          <span>
                            {item.portionSize ? `(${item.portionSize})` : ""}
                          </span>
                        </div>
                        <div className="dmco-item-right">
                          <span>Qty: {item.qty || 0}</span>
                          <span>Rs. {(item.subtotal || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="dmco-empty-items">No items found.</p>
                  )}
                </div>
              </div>

              <div className="dmco-total-section">
                <div className="dmco-total-row">
                  <span>Total Amount</span>
                  <span>Rs. {(order.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="dmco-total-row">
                  <span>Delivery Fee</span>
                  <span>Rs. {(order.deliveryFee || 0).toFixed(2)}</span>
                </div>
                <div className="dmco-total-row">
                  <span>Discount</span>
                  <span>Rs. {(order.discount || 0).toFixed(2)}</span>
                </div>
                <div className="dmco-total-row dmco-grand-total">
                  <span>Grand Total</span>
                  <span>Rs. {(order.grandTotal || 0).toFixed(2)}</span>
                </div>
              </div>

              {order.notes && (
                <div className="dmco-notes-box">
                  <h4>Notes</h4>
                  <p>{order.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}