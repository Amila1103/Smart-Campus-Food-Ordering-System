import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaChartLine,
  FaSyncAlt,
  FaClipboardList,
  FaCheckCircle,
  FaMoneyBillWave,
  FaMotorcycle,
  FaSearch,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import "./DeliveryAnalysis.css";

const API_BASE = "http://localhost:5000";

export default function DeliveryAnalysis() {
  const [takenOrders, setTakenOrders] = useState([]);
  const [finishedOrders, setFinishedOrders] = useState([]);
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

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        setTakenOrders([]);
        setFinishedOrders([]);
        return;
      }

      const [takenRes, finishedRes] = await Promise.all([
        axios.get(`${API_BASE}/taken-delivery-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/delivery-fenish/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTakenOrders(takenRes.data?.takenOrders || []);
      setFinishedOrders(finishedRes.data?.finishedOrders || []);
    } catch (error) {
      console.log("fetchAnalysisData error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to load delivery analysis"
      );
      setTakenOrders([]);
      setFinishedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const filteredTakenOrders = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    return takenOrders.filter((order) => {
      if (!value) return true;

      return (
        String(order.orderId || "").toLowerCase().includes(value) ||
        String(order.customerName || "").toLowerCase().includes(value) ||
        String(order.gmail || "").toLowerCase().includes(value) ||
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
  }, [takenOrders, searchText]);

  const filteredFinishedOrders = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    return finishedOrders.filter((order) => {
      if (!value) return true;

      return (
        String(order.orderId || "").toLowerCase().includes(value) ||
        String(order.customerName || "").toLowerCase().includes(value) ||
        String(order.gmail || "").toLowerCase().includes(value) ||
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
  }, [finishedOrders, searchText]);

  const totalTaken = filteredTakenOrders.length;
  const totalFinished = filteredFinishedOrders.length;

  const totalRevenue = filteredFinishedOrders.reduce(
    (sum, order) => sum + Number(order.grandTotal || 0),
    0
  );

  const totalItems = filteredFinishedOrders.reduce((sum, order) => {
    const count = Array.isArray(order.items)
      ? order.items.reduce((acc, item) => acc + Number(item.qty || 0), 0)
      : 0;

    return sum + count;
  }, 0);

  const averageOrderValue =
    totalFinished > 0 ? totalRevenue / totalFinished : 0;

  const deliveryTypeStats = useMemo(() => {
    const stats = { delivery: 0, takeaway: 0, other: 0 };

    filteredFinishedOrders.forEach((order) => {
      const type = String(order.orderType || "").toLowerCase().trim();

      if (type === "delivery") stats.delivery += 1;
      else if (type === "takeaway") stats.takeaway += 1;
      else stats.other += 1;
    });

    return stats;
  }, [filteredFinishedOrders]);

  const paymentStats = useMemo(() => {
    const stats = {};

    filteredFinishedOrders.forEach((order) => {
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
  }, [filteredFinishedOrders]);

  const totalPaymentOrders = paymentStats.reduce(
    (sum, item) => sum + Number(item.count || 0),
    0
  );

  const revenueByDay = useMemo(() => {
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;

      last7Days.push({
        fullDate: key,
        date: `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
          d.getDate()
        ).padStart(2, "0")}`,
        amount: 0,
      });
    }

    filteredFinishedOrders.forEach((order) => {
      const rawDate = order.finishedAt || order.deliveredAt || order.createdAt;
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return;

      const label = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const foundDay = last7Days.find((item) => item.fullDate === label);
      if (foundDay) {
        foundDay.amount += Number(order.grandTotal || 0);
      }
    });

    return last7Days;
  }, [filteredFinishedOrders]);

  const latestFinishedOrders = [...filteredFinishedOrders]
    .sort(
      (a, b) =>
        new Date(b.finishedAt || b.deliveredAt || b.createdAt || 0) -
        new Date(a.finishedAt || a.deliveredAt || a.createdAt || 0)
    )
    .slice(0, 5);

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

  const RevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="delanalysis-chart-tooltip">
          <p>{label}</p>
          <strong>{formatCurrency(payload[0].value)}</strong>
        </div>
      );
    }
    return null;
  };

  const PaymentTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="delanalysis-chart-tooltip">
          <p>{data.name}</p>
          <strong>{data.count} Orders</strong>
          <p>{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="delanalysis-wrapper">
      <div className="delanalysis-header">
        <div className="delanalysis-header-left">
          <div className="delanalysis-header-icon">
            <FaChartLine />
          </div>

          <div>
            <span className="delanalysis-badge">Delivery Analytics</span>
            <h2>My Delivery Analysis</h2>
            <p>
              View delivery performance, revenue trends, payment method
              breakdown, and recent finished orders.
            </p>
          </div>
        </div>

        <button className="delanalysis-refresh-btn" onClick={fetchAnalysisData}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      {message.text && (
        <div className={`delanalysis-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="delanalysis-toolbar">
        <div className="delanalysis-search-box">
          <FaSearch className="delanalysis-search-icon" />
          <input
            type="text"
            placeholder="Search by order ID, customer, email, payment or location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="delanalysis-state-card">
          <p>Loading delivery analysis...</p>
        </div>
      ) : (
        <>
          <div className="delanalysis-stats-grid">
            <div className="delanalysis-stat-card">
              <div className="delanalysis-stat-icon green">
                <FaClipboardList />
              </div>
              <div>
                <h3>{totalTaken}</h3>
                <p>Active Taken Orders</p>
              </div>
            </div>

            <div className="delanalysis-stat-card">
              <div className="delanalysis-stat-icon green">
                <FaCheckCircle />
              </div>
              <div>
                <h3>{totalFinished}</h3>
                <p>Finished Deliveries</p>
              </div>
            </div>

            <div className="delanalysis-stat-card">
              <div className="delanalysis-stat-icon orange">
                <FaMoneyBillWave />
              </div>
              <div>
                <h3>{formatCurrency(totalRevenue)}</h3>
                <p>Total Revenue</p>
              </div>
            </div>

            <div className="delanalysis-stat-card">
              <div className="delanalysis-stat-icon orange">
                <FaMotorcycle />
              </div>
              <div>
                <h3>{formatCurrency(averageOrderValue)}</h3>
                <p>Average Order Value</p>
              </div>
            </div>
          </div>

          <div className="delanalysis-main-grid">
            <div className="delanalysis-panel">
              <div className="delanalysis-panel-head">
                <h3>Order Type Breakdown</h3>
              </div>

              <div className="delanalysis-mini-stats">
                <div className="delanalysis-mini-card">
                  <span>Delivery</span>
                  <strong>{deliveryTypeStats.delivery}</strong>
                </div>
                <div className="delanalysis-mini-card">
                  <span>Takeaway</span>
                  <strong>{deliveryTypeStats.takeaway}</strong>
                </div>
                <div className="delanalysis-mini-card">
                  <span>Other</span>
                  <strong>{deliveryTypeStats.other}</strong>
                </div>
                <div className="delanalysis-mini-card">
                  <span>Total Items</span>
                  <strong>{totalItems}</strong>
                </div>
              </div>
            </div>

            <div className="delanalysis-panel">
              <div className="delanalysis-panel-head">
                <h3>Revenue Trend (Last 7 Days)</h3>
              </div>

              {revenueByDay.every((item) => item.amount === 0) ? (
                <p className="delanalysis-empty-text">
                  No revenue data available.
                </p>
              ) : (
                <div className="delanalysis-chart-box">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={revenueByDay}
                      margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `LKR ${value}`}
                      />
                      <Tooltip content={<RevenueTooltip />} />
                      <Bar
                        dataKey="amount"
                        radius={[10, 10, 0, 0]}
                        barSize={34}
                      >
                        {revenueByDay.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.amount > 0 ? "#2e7d32" : "#cfd8dc"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="delanalysis-main-grid">
            <div className="delanalysis-panel">
              <div className="delanalysis-panel-head">
                <h3>Payment Method Chart</h3>
              </div>

              {paymentStats.length === 0 ? (
                <p className="delanalysis-empty-text">No payment data available.</p>
              ) : (
                <div className="delanalysis-chart-box delanalysis-donut-box">
                  <div className="delanalysis-donut-chart-wrap">
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        {/* 3D shadow layer */}
                        <Pie
                          data={paymentStats}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="54%"
                          innerRadius={62}
                          outerRadius={102}
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

                        {/* Main layer */}
                        <Pie
                          data={paymentStats}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={62}
                          outerRadius={102}
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

                    <div className="delanalysis-donut-center">
                      <span>TOTAL</span>
                      <strong>{totalPaymentOrders}</strong>
                      <small>Payments</small>
                    </div>
                  </div>

                  <div className="delanalysis-payment-legend-grid">
                    {paymentStats.map((item, index) => (
                      <div
                        className="delanalysis-payment-legend-card"
                        key={`${item.name}-${index}`}
                      >
                        <div className="delanalysis-payment-legend-left">
                          <span
                            className="delanalysis-payment-dot"
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

            <div className="delanalysis-panel">
              <div className="delanalysis-panel-head">
                <h3>Performance Summary</h3>
              </div>

              <div className="delanalysis-summary-grid">
                <div className="delanalysis-summary-card">
                  <span>Finished Orders</span>
                  <strong>{totalFinished}</strong>
                </div>
                <div className="delanalysis-summary-card">
                  <span>Revenue</span>
                  <strong>{formatCurrency(totalRevenue)}</strong>
                </div>
                <div className="delanalysis-summary-card">
                  <span>Avg. Value</span>
                  <strong>{formatCurrency(averageOrderValue)}</strong>
                </div>
                <div className="delanalysis-summary-card">
                  <span>Total Items</span>
                  <strong>{totalItems}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="delanalysis-panel">
            <div className="delanalysis-panel-head">
              <h3>Recent Finished Deliveries</h3>
            </div>

            {latestFinishedOrders.length === 0 ? (
              <p className="delanalysis-empty-text">
                No finished deliveries found.
              </p>
            ) : (
              <div className="delanalysis-order-list">
                {latestFinishedOrders.map((order) => (
                  <div
                    className="delanalysis-order-card"
                    key={order._id || order.orderId}
                  >
                    <div className="delanalysis-order-top">
                      <div>
                        <h4>{order.orderId || "N/A"}</h4>
                        <span className="delanalysis-order-status">
                          {order.finalDeliveryStatus || "Finished"}
                        </span>
                      </div>

                      <div className="delanalysis-order-amount">
                        {formatCurrency(order.grandTotal)}
                      </div>
                    </div>

                    <div className="delanalysis-order-grid">
                      <div className="delanalysis-order-item">
                        <span>Customer</span>
                        <strong>{order.customerName || "N/A"}</strong>
                      </div>

                      <div className="delanalysis-order-item">
                        <span>Payment</span>
                        <strong>{order.paymentMethod || "N/A"}</strong>
                      </div>

                      <div className="delanalysis-order-item delanalysis-full">
                        <span>
                          <FaMapMarkerAlt /> Location
                        </span>
                        <strong>
                          {order.selectedDeliveryLocation ||
                            order.deliveryLocation ||
                            order.customLocation ||
                            order.address ||
                            "N/A"}
                        </strong>
                      </div>

                      <div className="delanalysis-order-item">
                        <span>
                          <FaClock /> Finished At
                        </span>
                        <strong>{formatDateTime(order.finishedAt)}</strong>
                      </div>

                      <div className="delanalysis-order-item">
                        <span>Order Type</span>
                        <strong>{order.orderType || "N/A"}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}