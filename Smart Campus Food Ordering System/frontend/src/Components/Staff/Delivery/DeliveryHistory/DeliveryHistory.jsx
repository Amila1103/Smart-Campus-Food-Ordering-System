import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaHistory,
  FaSearch,
  FaSyncAlt,
  FaCheckCircle,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaTruck,
  FaClipboardList,
  FaCalendarAlt,
  FaBoxOpen,
  FaChartPie,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import "./DeliveryHistory.css";

const API_BASE = "http://localhost:5000";

export default function DeliveryHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
  };

  const getStaffData = () => {
    try {
      return JSON.parse(localStorage.getItem("staff") || "{}");
    } catch {
      return {};
    }
  };

  const getToken = () => {
    return localStorage.getItem("staffToken") || getStaffData()?.token || "";
  };

  const fetchMyFinishedOrders = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        setOrders([]);
        return;
      }

      const res = await axios.get(`${API_BASE}/delivery-fenish/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data?.finishedOrders || []);
    } catch (error) {
      console.log("fetchMyFinishedOrders error:", error);
      console.log("fetchMyFinishedOrders response:", error.response);

      if (error.response?.status === 401) {
        showMessage("error", "Unauthorized. Please login again.");
      } else if (error.response?.status === 403) {
        showMessage("error", "Access denied.");
      } else {
        showMessage(
          "error",
          error.response?.data?.message || "Failed to load delivery history"
        );
      }

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFinishedOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    return orders.filter((order) => {
      if (!value) return true;

      return (
        String(order.orderId || "").toLowerCase().includes(value) ||
        String(order.customerName || "").toLowerCase().includes(value) ||
        String(order.gmail || "").toLowerCase().includes(value) ||
        String(order.phoneNumber || "").toLowerCase().includes(value) ||
        String(order.paymentMethod || "").toLowerCase().includes(value) ||
        String(order.finalDeliveryStatus || "").toLowerCase().includes(value) ||
        String(
          order.selectedDeliveryLocation ||
            order.deliveryLocation ||
            order.customLocation ||
            order.address ||
            ""
        )
          .toLowerCase()
          .includes(value)
      );
    });
  }, [orders, searchText]);

  const totalOrders = filteredOrders.length;

  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + Number(order.grandTotal || 0),
    0
  );

  const totalItems = filteredOrders.reduce((sum, order) => {
    const itemCount = Array.isArray(order.items)
      ? order.items.reduce((acc, item) => acc + Number(item.qty || 0), 0)
      : 0;
    return sum + itemCount;
  }, 0);

  const completedCount = filteredOrders.filter(
    (order) =>
      String(order.finalDeliveryStatus || "").toLowerCase() === "finished"
  ).length;

  const paymentStats = useMemo(() => {
    const stats = {};

    filteredOrders.forEach((order) => {
      const key = String(order.paymentMethod || "Unknown").trim() || "Unknown";
      stats[key] = (stats[key] || 0) + 1;
    });

    const total = Object.values(stats).reduce(
      (sum, count) => sum + Number(count),
      0
    );

    const colors = [
      "#2e7d32",
      "#ff9800",
      "#66bb6a",
      "#ffa726",
      "#1b5e20",
      "#ffb74d",
      "#43a047",
      "#fb8c00",
    ];

    return Object.entries(stats).map(([name, count], index) => ({
      name,
      count,
      value: count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : "0.0",
      color: colors[index % colors.length],
    }));
  }, [filteredOrders]);

  const totalPaymentOrders = paymentStats.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0
  );

  const formatCurrency = (value) => `LKR ${Number(value || 0).toFixed(2)}`;

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString();
  };

  const getDarkShade = (color) => {
    const shades = {
      "#2e7d32": "#1f5d24",
      "#ff9800": "#cc7a00",
      "#66bb6a": "#4d8f50",
      "#ffa726": "#cc851e",
      "#1b5e20": "#124116",
      "#ffb74d": "#d9983d",
      "#43a047": "#2e7032",
      "#fb8c00": "#c96f00",
    };

    return shades[color] || "#666666";
  };

  const PaymentTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="delhistory-chart-tooltip">
          <p>{data.name}</p>
          <strong>{data.count} Orders</strong>
          <p>{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="delhistory-wrapper">
      <div className="delhistory-header">
        <div className="delhistory-header-left">
          <div className="delhistory-header-icon">
            <FaHistory />
          </div>

          <div>
            <span className="delhistory-badge">Delivery History</span>
            <h2>My Finished Deliveries</h2>
            <p>
              View your completed delivery records, customer details, payment
              info, and delivery locations.
            </p>
          </div>
        </div>

        <button className="delhistory-refresh-btn" onClick={fetchMyFinishedOrders}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      {message.text && (
        <div className={`delhistory-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="delhistory-stats-grid">
        <div className="delhistory-stat-card">
          <div className="delhistory-stat-icon green">
            <FaClipboardList />
          </div>
          <div>
            <h3>{totalOrders}</h3>
            <p>Total Finished Orders</p>
          </div>
        </div>

        <div className="delhistory-stat-card">
          <div className="delhistory-stat-icon orange">
            <FaMoneyBillWave />
          </div>
          <div>
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Delivery Revenue</p>
          </div>
        </div>

        <div className="delhistory-stat-card">
          <div className="delhistory-stat-icon green">
            <FaBoxOpen />
          </div>
          <div>
            <h3>{totalItems}</h3>
            <p>Total Delivered Items</p>
          </div>
        </div>

        <div className="delhistory-stat-card">
          <div className="delhistory-stat-icon orange">
            <FaCheckCircle />
          </div>
          <div>
            <h3>{completedCount}</h3>
            <p>Successfully Finished</p>
          </div>
        </div>
      </div>

      <div className="delhistory-toolbar">
        <div className="delhistory-search-box">
          <FaSearch className="delhistory-search-icon" />
          <input
            type="text"
            placeholder="Search by order ID, customer, email, phone or location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {!loading && filteredOrders.length > 0 && (
        <div className="delhistory-chart-panel">
          <div className="delhistory-chart-head">
            <h3>
              <FaChartPie /> Payment Method Chart
            </h3>
          </div>

          {paymentStats.length === 0 ? (
            <p className="delhistory-empty-chart-text">No payment data available.</p>
          ) : (
            <div className="delhistory-donut-box">
              <div className="delhistory-donut-chart-wrap">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={paymentStats}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="54%"
                      innerRadius={68}
                      outerRadius={112}
                      paddingAngle={paymentStats.length > 1 ? 2 : 0}
                      stroke="none"
                      isAnimationActive={true}
                    >
                      {paymentStats.map((entry, index) => (
                        <Cell
                          key={`shadow-cell-${index}`}
                          fill={getDarkShade(entry.color)}
                        />
                      ))}
                    </Pie>

                    <Pie
                      data={paymentStats}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={112}
                      paddingAngle={paymentStats.length > 1 ? 2 : 0}
                      stroke="#ffffff"
                      strokeWidth={3}
                      labelLine={false}
                      isAnimationActive={true}
                    >
                      {paymentStats.map((entry, index) => (
                        <Cell
                          key={`main-cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>

                    <Tooltip content={<PaymentTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="delhistory-donut-center">
                  <span>TOTAL</span>
                  <strong>{totalPaymentOrders}</strong>
                  <small>Payments</small>
                </div>
              </div>

              <div className="delhistory-payment-legend-grid">
                {paymentStats.map((item, index) => (
                  <div
                    className="delhistory-payment-legend-card"
                    key={`${item.name}-${index}`}
                  >
                    <div className="delhistory-payment-legend-left">
                      <span
                        className="delhistory-payment-dot"
                        style={{ backgroundColor: item.color }}
                      ></span>

                      <div>
                        <h4>{item.name}</h4>
                        <p>{item.percentage}% of total</p>
                      </div>
                    </div>

                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="delhistory-state-card">
          <p>Loading your delivery history...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="delhistory-state-card">
          <p>No finished delivery history found.</p>
        </div>
      ) : (
        <div className="delhistory-orders-grid">
          {filteredOrders.map((order) => (
            <div className="delhistory-order-card" key={order._id || order.orderId}>
              <div className="delhistory-card-top">
                <div>
                  <h3>{order.orderId || "N/A"}</h3>
                  <span className="delhistory-status-pill">
                    {order.finalDeliveryStatus || "Finished"}
                  </span>
                </div>

                <div className="delhistory-date-box">
                  <FaCalendarAlt />
                  <span>{formatDateTime(order.finishedAt || order.deliveredAt)}</span>
                </div>
              </div>

              <div className="delhistory-info-grid">
                <div className="delhistory-info-item">
                  <span className="delhistory-label">Customer</span>
                  <strong>{order.customerName || "N/A"}</strong>
                </div>

                <div className="delhistory-info-item">
                  <span className="delhistory-label">
                    <FaEnvelope /> Email
                  </span>
                  <strong>{order.gmail || "N/A"}</strong>
                </div>

                <div className="delhistory-info-item">
                  <span className="delhistory-label">
                    <FaPhoneAlt /> Phone
                  </span>
                  <strong>{order.phoneNumber || "N/A"}</strong>
                </div>

                <div className="delhistory-info-item">
                  <span className="delhistory-label">Payment</span>
                  <strong>{order.paymentMethod || "N/A"}</strong>
                </div>

                <div className="delhistory-info-item delhistory-full">
                  <span className="delhistory-label">
                    <FaMapMarkerAlt /> Delivery Location
                  </span>
                  <strong>
                    {order.selectedDeliveryLocation ||
                      order.deliveryLocation ||
                      order.customLocation ||
                      order.address ||
                      "N/A"}
                  </strong>
                </div>

                <div className="delhistory-info-item">
                  <span className="delhistory-label">
                    <FaTruck /> Order Type
                  </span>
                  <strong>{order.orderType || "N/A"}</strong>
                </div>

                <div className="delhistory-info-item">
                  <span className="delhistory-label">Grand Total</span>
                  <strong>{formatCurrency(order.grandTotal)}</strong>
                </div>
              </div>

              <div className="delhistory-items-section">
                <h4>Delivered Items</h4>

                <div className="delhistory-items-box">
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div className="delhistory-item-row" key={index}>
                        <div className="delhistory-item-left">
                          <strong>{item.name || "Item"}</strong>
                          <span>
                            {item.portionSize ? `(${item.portionSize})` : "Standard"}
                          </span>
                        </div>

                        <div className="delhistory-item-right">
                          <span>Qty: {item.qty || 0}</span>
                          <span>{formatCurrency(item.subtotal || item.price || 0)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="delhistory-empty-items">No items available.</p>
                  )}
                </div>
              </div>

              <div className="delhistory-total-box">
                <div className="delhistory-total-row">
                  <span>Total Amount</span>
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </div>

                <div className="delhistory-total-row">
                  <span>Delivery Fee</span>
                  <strong>{formatCurrency(order.deliveryFee)}</strong>
                </div>

                <div className="delhistory-total-row">
                  <span>Discount</span>
                  <strong>{formatCurrency(order.discount)}</strong>
                </div>

                <div className="delhistory-total-row grand">
                  <span>Grand Total</span>
                  <strong>{formatCurrency(order.grandTotal)}</strong>
                </div>
              </div>

              {order.deliveryNotes || order.notes ? (
                <div className="delhistory-notes-box">
                  <h4>Notes</h4>
                  <p>{order.deliveryNotes || order.notes}</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}