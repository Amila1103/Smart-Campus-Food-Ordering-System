import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./DeliveryManagerTakenOrders.css";
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
  FaUserTie,
  FaClock,
} from "react-icons/fa";

const API_BASE = "http://localhost:5000";

export default function DeliveryManagerTakenOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 2500);
  };

  const fetchTakenOrders = async () => {
    try {
      setLoading(true);

      const staffData = JSON.parse(localStorage.getItem("staff") || "{}");
      const token = staffData?.token;

      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        setOrders([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE}/taken-delivery-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data?.takenOrders || []);
    } catch (error) {
      console.log("fetchTakenOrders error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to load taken delivery orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTakenOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesSearch =
        !search ||
        String(order.orderId || "").toLowerCase().includes(search) ||
        String(order.customerName || "").toLowerCase().includes(search) ||
        String(order.gmail || "").toLowerCase().includes(search) ||
        String(order.phoneNumber || "").toLowerCase().includes(search) ||
        String(order.takenByStaffName || "").toLowerCase().includes(search) ||
        String(order.takenByStaffEmail || "").toLowerCase().includes(search) ||
        String(order.deliveryStatus || "").toLowerCase().includes(search) ||
        String(order.selectedDeliveryLocation || "")
          .toLowerCase()
          .includes(search) ||
        String(order.deliveryLocation || "").toLowerCase().includes(search) ||
        String(order.customLocation || "").toLowerCase().includes(search) ||
        String(order.address || "").toLowerCase().includes(search);

      return matchesSearch;
    });
  }, [orders, searchTerm]);

  const totalOrders = filteredOrders.length;

  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + Number(order.grandTotal || 0),
    0
  );

  const totalItems = filteredOrders.reduce((sum, order) => {
    const count = Array.isArray(order.items)
      ? order.items.reduce((itemSum, item) => itemSum + Number(item.qty || 0), 0)
      : 0;
    return sum + count;
  }, 0);

  const formatCurrency = (value) => `LKR ${Number(value || 0).toFixed(2)}`;

  const formatDateTime = (value) => {
    if (!value) return "Not Available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not Available";
    return date.toLocaleString();
  };

  const getStatusClass = (status) => {
    const value = String(status || "").toLowerCase().trim();

    if (value === "taken") return "taken";
    if (value === "picked up") return "picked";
    if (value === "out for delivery") return "out";
    if (value === "delivered") return "delivered";
    if (value === "cancelled") return "cancelled";
    return "";
  };

  return (
    <section className="dmtaken-wrapper">
      <div className="dmtaken-header">
        <div className="dmtaken-header-left">
          <div className="dmtaken-header-icon">
            <FaTruck />
          </div>

          <div>
            <span className="dmtaken-badge">Taken Orders</span>
            <h2>Taken Delivery Orders</h2>
            <p>View all delivery orders currently taken by delivery staff.</p>
          </div>
        </div>

        <button className="dmtaken-refresh-btn" onClick={fetchTakenOrders}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      {message.text && (
        <div className={`dmtaken-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="dmtaken-stats-grid">
        <div className="dmtaken-stat-card">
          <div className="dmtaken-stat-icon green">
            <FaTruck />
          </div>
          <div>
            <h3>{totalOrders}</h3>
            <p>Taken Orders</p>
          </div>
        </div>

        <div className="dmtaken-stat-card">
          <div className="dmtaken-stat-icon orange">
            <FaMoneyBillWave />
          </div>
          <div>
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="dmtaken-stat-card">
          <div className="dmtaken-stat-icon green">
            <FaBoxOpen />
          </div>
          <div>
            <h3>{totalItems}</h3>
            <p>Total Items</p>
          </div>
        </div>
      </div>

      <div className="dmtaken-toolbar">
        <div className="dmtaken-search-box">
          <FaSearch className="dmtaken-search-icon" />
          <input
            type="text"
            placeholder="Search by order, customer, staff, status, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="dmtaken-state-card">
          <div className="dmtaken-loader"></div>
          <p>Loading taken delivery orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="dmtaken-state-card">
          <p>No taken delivery orders found.</p>
        </div>
      ) : (
        <div className="dmtaken-orders-grid">
          {filteredOrders.map((order) => (
            <div className="dmtaken-order-card" key={order._id || order.orderId}>
              <div className="dmtaken-card-top">
                <div>
                  <h2>Order #{order.orderId}</h2>
                  <div className="dmtaken-badge-row">
                    <span className="dmtaken-type-pill">Delivery</span>
                    <span
                      className={`dmtaken-status-pill ${getStatusClass(
                        order.deliveryStatus
                      )}`}
                    >
                      {order.deliveryStatus || "Taken"}
                    </span>
                  </div>
                </div>

                <div className="dmtaken-date">
                  <strong>Taken At</strong>
                  <span>{formatDateTime(order.takenAt)}</span>
                </div>
              </div>

              <div className="dmtaken-info-grid">
                <div className="dmtaken-info-item">
                  <span className="dmtaken-label">Customer Name</span>
                  <span className="dmtaken-value">
                    {order.customerName || "N/A"}
                  </span>
                </div>

                <div className="dmtaken-info-item">
                  <span className="dmtaken-label">
                    <FaEnvelope /> Email
                  </span>
                  <span className="dmtaken-value">{order.gmail || "N/A"}</span>
                </div>

                <div className="dmtaken-info-item">
                  <span className="dmtaken-label">
                    <FaPhoneAlt /> Phone
                  </span>
                  <span className="dmtaken-value">
                    {order.phoneNumber || "N/A"}
                  </span>
                </div>

                <div className="dmtaken-info-item dmtaken-info-full">
                  <span className="dmtaken-label">
                    <FaMapMarkerAlt /> Delivery Address
                  </span>
                  <span className="dmtaken-value">
                    {order.customLocation ||
                      order.selectedDeliveryLocation ||
                      order.deliveryLocation ||
                      order.address ||
                      "N/A"}
                  </span>
                </div>
              </div>

              <div className="dmtaken-staff-grid">
                <div className="dmtaken-staff-card">
                  <FaUserTie className="dmtaken-staff-icon" />
                  <div>
                    <h4>Taken By</h4>
                    <p>{order.takenByStaffName || "Not Available"}</p>
                    <span>{order.takenByStaffEmail || "Not Available"}</span>
                  </div>
                </div>

                <div className="dmtaken-staff-card">
                  <FaClock className="dmtaken-staff-icon" />
                  <div>
                    <h4>Progress Timeline</h4>
                    <p>Picked Up: {formatDateTime(order.pickedUpAt)}</p>
                    <span>
                      Out for Delivery: {formatDateTime(order.outForDeliveryAt)}
                    </span>
                  </div>
                </div>

                <div className="dmtaken-staff-card">
                  <FaClipboardCheck className="dmtaken-staff-icon" />
                  <div>
                    <h4>Payment</h4>
                    <p>{order.paymentMethod || "Not Available"}</p>
                    <span>{order.paymentStatus || "Not Available"}</span>
                  </div>
                </div>
              </div>

              <div className="dmtaken-items-section">
                <h3>Ordered Items</h3>

                {Array.isArray(order.items) && order.items.length > 0 ? (
                  <div className="dmtaken-table-wrap">
                    <table className="dmtaken-items-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              {item.name || "Unknown Item"}{" "}
                              {item.portionSize ? `(${item.portionSize})` : ""}
                            </td>
                            <td>{item.qty || 0}</td>
                            <td>{formatCurrency(item.unitPrice || item.price || 0)}</td>
                            <td>{formatCurrency(item.subtotal || item.price || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="dmtaken-empty-items">No items found.</p>
                )}
              </div>

              <div className="dmtaken-total-section">
                <div className="dmtaken-total-row">
                  <span>Total Amount</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="dmtaken-total-row">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(order.deliveryFee)}</span>
                </div>
                <div className="dmtaken-total-row">
                  <span>Discount</span>
                  <span>{formatCurrency(order.discount)}</span>
                </div>
                <div className="dmtaken-total-row dmtaken-grand-total">
                  <span>Grand Total</span>
                  <span>{formatCurrency(order.grandTotal)}</span>
                </div>
              </div>

              {order.deliveryNotes && (
                <div className="dmtaken-notes-box">
                  <h4>Delivery Notes</h4>
                  <p>{order.deliveryNotes}</p>
                </div>
              )}

              {order.notes && (
                <div className="dmtaken-notes-box dmtaken-customer-notes">
                  <h4>Customer Notes</h4>
                  <p>{order.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}