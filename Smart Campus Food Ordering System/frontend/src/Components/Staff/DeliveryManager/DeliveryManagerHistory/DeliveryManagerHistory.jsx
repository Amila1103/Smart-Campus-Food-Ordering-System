import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaHistory,
  FaSyncAlt,
  FaSearch,
  FaTruck,
  FaMoneyBillWave,
  FaBoxOpen,
  FaUser,
  FaMapMarkerAlt,
  FaClipboardCheck,
  FaCalendarAlt,
  FaCheckCircle,
  FaChartPie,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import "./DeliveryManagerHistory.css";

const API_BASE = "http://localhost:5000";

export default function DeliveryManagerHistory() {
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchText, setSearchText] = useState("");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 2500);
  };

  const fetchHistoryOrders = async () => {
    try {
      setLoading(true);

      const staffData = JSON.parse(localStorage.getItem("staff") || "{}");
      const token = staffData?.token;

      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        setHistoryOrders([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE}/delivery-fenish`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setHistoryOrders(res.data?.finishedOrders || []);
    } catch (error) {
      console.log("fetchHistoryOrders error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to load delivery history"
      );
      setHistoryOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    return historyOrders.filter((order) => {
      if (!value) return true;

      return (
        String(order.orderId || "").toLowerCase().includes(value) ||
        String(order.customerName || "").toLowerCase().includes(value) ||
        String(order.gmail || "").toLowerCase().includes(value) ||
        String(order.phoneNumber || "").toLowerCase().includes(value) ||
        String(order.takenByStaffName || "").toLowerCase().includes(value) ||
        String(order.deliveredByStaffName || "").toLowerCase().includes(value) ||
        String(order.paymentMethod || "").toLowerCase().includes(value) ||
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
  }, [historyOrders, searchText]);

  const totalOrders = filteredOrders.length;

  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + Number(order.grandTotal || 0),
    0
  );

  const totalItems = filteredOrders.reduce((sum, order) => {
    return (
      sum +
      (order.items || []).reduce(
        (itemSum, item) => itemSum + Number(item.qty || 0),
        0
      )
    );
  }, 0);

  const paymentChartData = useMemo(() => {
    const stats = {};

    filteredOrders.forEach((order) => {
      const method = String(order.paymentMethod || "Unknown").trim() || "Unknown";
      stats[method] = (stats[method] || 0) + 1;
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

    return Object.entries(stats).map(([name, value], index) => ({
      name,
      value,
      count: value,
      percentage: total > 0 ? ((value / total) * 100).toFixed(1) : "0.0",
      color: colors[index % colors.length],
    }));
  }, [filteredOrders]);

  const totalPaymentOrders = paymentChartData.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  const formatCurrency = (value) => `LKR ${Number(value || 0).toFixed(2)}`;

  const formatDateTime = (value) => {
    if (!value) return "Not Available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not Available";
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
        <div className="dmhistory-chart-tooltip">
          <p>{data.name}</p>
          <strong>{data.value} Orders</strong>
          <p>{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="dmhistory-wrapper">
      <div className="dmhistory-header">
        <div className="dmhistory-header-left">
          <div className="dmhistory-header-icon">
            <FaHistory />
          </div>

          <div>
            <span className="dmhistory-badge">Delivery History</span>
            <h2>Delivery History</h2>
            <p>
              Review all completed delivery records, staff activity, and order
              details.
            </p>
          </div>
        </div>

        <button className="dmhistory-refresh-btn" onClick={fetchHistoryOrders}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      {message.text && (
        <div className={`dmhistory-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="dmhistory-stats-grid">
        <div className="dmhistory-stat-card">
          <div className="dmhistory-stat-icon green">
            <FaCheckCircle />
          </div>
          <div>
            <h3>{totalOrders}</h3>
            <p>Total History Orders</p>
          </div>
        </div>

        <div className="dmhistory-stat-card">
          <div className="dmhistory-stat-icon orange">
            <FaMoneyBillWave />
          </div>
          <div>
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="dmhistory-stat-card">
          <div className="dmhistory-stat-icon green">
            <FaBoxOpen />
          </div>
          <div>
            <h3>{totalItems}</h3>
            <p>Total Delivered Items</p>
          </div>
        </div>
      </div>

      <div className="dmhistory-search-row">
        <div className="dmhistory-search-box">
          <FaSearch className="dmhistory-search-icon" />
          <input
            type="text"
            placeholder="Search by order, customer, staff, payment, location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {!loading && filteredOrders.length > 0 && (
        <div className="dmhistory-chart-panel">
          <div className="dmhistory-chart-head">
            <h3>
              <FaChartPie /> Payment Method Breakdown
            </h3>
          </div>

          {paymentChartData.length === 0 ? (
            <p className="dmhistory-empty-chart-text">No payment data available.</p>
          ) : (
            <div className="dmhistory-donut-box">
              <div className="dmhistory-donut-chart-wrap">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={paymentChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="54%"
                      innerRadius={68}
                      outerRadius={112}
                      paddingAngle={paymentChartData.length > 1 ? 2 : 0}
                      stroke="none"
                      isAnimationActive={true}
                    >
                      {paymentChartData.map((entry, index) => (
                        <Cell
                          key={`shadow-cell-${index}`}
                          fill={getDarkShade(entry.color)}
                        />
                      ))}
                    </Pie>

                    <Pie
                      data={paymentChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={112}
                      paddingAngle={paymentChartData.length > 1 ? 2 : 0}
                      stroke="#ffffff"
                      strokeWidth={3}
                      labelLine={false}
                      isAnimationActive={true}
                    >
                      {paymentChartData.map((entry, index) => (
                        <Cell
                          key={`main-cell-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>

                    <Tooltip content={<PaymentTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="dmhistory-donut-center">
                  <span>TOTAL</span>
                  <strong>{totalPaymentOrders}</strong>
                  <small>Payments</small>
                </div>
              </div>

              <div className="dmhistory-payment-legend-grid">
                {paymentChartData.map((item, index) => (
                  <div
                    className="dmhistory-payment-legend-card"
                    key={`${item.name}-${index}`}
                  >
                    <div className="dmhistory-payment-legend-left">
                      <span
                        className="dmhistory-payment-dot"
                        style={{ backgroundColor: item.color }}
                      ></span>

                      <div>
                        <h4>{item.name}</h4>
                        <p>{item.percentage}% of total</p>
                      </div>
                    </div>

                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="dmhistory-state-box">Loading delivery history...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="dmhistory-state-box">No delivery history found.</div>
      ) : (
        <div className="dmhistory-card-list">
          {filteredOrders.map((order) => (
            <div className="dmhistory-order-card" key={order._id || order.orderId}>
              <div className="dmhistory-order-top">
                <div>
                  <h3>Order #{order.orderId}</h3>
                  <p>
                    <FaCalendarAlt className="dmhistory-inline-icon" />
                    Finished At: {formatDateTime(order.finishedAt)}
                  </p>
                </div>

                <div className="dmhistory-status-wrap">
                  <span className="dmhistory-type-badge">
                    {order.orderType || "Delivery"}
                  </span>
                  <span className="dmhistory-status-badge">
                    {order.finalDeliveryStatus || "Finished"}
                  </span>
                </div>
              </div>

              <div className="dmhistory-grid">
                <div className="dmhistory-block">
                  <h4>Customer Details</h4>
                  <p>
                    <FaUser className="dmhistory-inline-icon" />
                    {order.customerName || "Not Available"}
                  </p>
                  <p>{order.gmail || "Not Available"}</p>
                  <p>{order.phoneNumber || "Not Available"}</p>
                </div>

                <div className="dmhistory-block">
                  <h4>Delivery Details</h4>
                  <p>
                    <FaMapMarkerAlt className="dmhistory-inline-icon" />
                    {order.selectedDeliveryLocation ||
                      order.deliveryLocation ||
                      order.customLocation ||
                      order.address ||
                      "Not Available"}
                  </p>
                  <p>
                    <strong>Landmark:</strong> {order.landmark || "Not Available"}
                  </p>
                  <p>
                    <strong>Payment:</strong> {order.paymentMethod || "Not Available"}
                  </p>
                </div>

                <div className="dmhistory-block">
                  <h4>Amount Details</h4>
                  <p>
                    <strong>Total Amount:</strong> {formatCurrency(order.totalAmount)}
                  </p>
                  <p>
                    <strong>Delivery Fee:</strong> {formatCurrency(order.deliveryFee)}
                  </p>
                  <p>
                    <strong>Discount:</strong> {formatCurrency(order.discount)}
                  </p>
                  <p className="dmhistory-grand-total">
                    <strong>Grand Total:</strong> {formatCurrency(order.grandTotal)}
                  </p>
                </div>
              </div>

              <div className="dmhistory-meta-grid">
                <div className="dmhistory-meta-card">
                  <h5>Taken By</h5>
                  <p>{order.takenByStaffName || "Not Available"}</p>
                  <span>{order.takenByStaffEmail || "Not Available"}</span>
                </div>

                <div className="dmhistory-meta-card">
                  <h5>Delivered By</h5>
                  <p>{order.deliveredByStaffName || "Not Available"}</p>
                  <span>{order.deliveredByStaffEmail || "Not Available"}</span>
                </div>

                <div className="dmhistory-meta-card">
                  <h5>Timeline</h5>
                  <p>Taken: {formatDateTime(order.takenAt)}</p>
                  <span>Delivered: {formatDateTime(order.deliveredAt)}</span>
                </div>
              </div>

              <div className="dmhistory-items-section">
                <h4>
                  <FaClipboardCheck className="dmhistory-inline-icon" />
                  Ordered Items
                </h4>

                {(order.items || []).length === 0 ? (
                  <p className="dmhistory-empty-items">No items available.</p>
                ) : (
                  <div className="dmhistory-table-wrap">
                    <table className="dmhistory-items-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order.items || []).map((item, index) => (
                          <tr key={`${order.orderId}-${index}`}>
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
                )}
              </div>

              {order.deliveryNotes && (
                <div className="dmhistory-notes-box">
                  <h4>Delivery Notes</h4>
                  <p>{order.deliveryNotes}</p>
                </div>
              )}

              {order.notes && (
                <div className="dmhistory-notes-box dmhistory-customer-notes">
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