import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaChartLine,
  FaSyncAlt,
  FaSearch,
  FaTruck,
  FaMoneyBillWave,
  FaBoxOpen,
  FaCreditCard,
  FaWallet,
  FaMapMarkerAlt,
  FaUser,
  FaChartPie,
  FaChartBar,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./DeliveryManagerAnalytics.css";

const API_BASE = "http://localhost:5000";

export default function DeliveryManagerAnalytics() {
  const [finishedOrders, setFinishedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchText, setSearchText] = useState("");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 2500);
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const staffData = JSON.parse(localStorage.getItem("staff") || "{}");
      const token = staffData?.token;

      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        setFinishedOrders([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE}/delivery-fenish`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFinishedOrders(res.data?.finishedOrders || []);
    } catch (error) {
      console.log("fetchAnalyticsData error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to load analytics data"
      );
      setFinishedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const filteredOrders = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    return finishedOrders.filter((order) => {
      if (!value) return true;

      return (
        String(order.orderId || "").toLowerCase().includes(value) ||
        String(order.customerName || "").toLowerCase().includes(value) ||
        String(order.gmail || "").toLowerCase().includes(value) ||
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
  }, [finishedOrders, searchText]);

  const totalFinishedOrders = filteredOrders.length;

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

  const codCount = filteredOrders.filter((order) =>
    String(order.paymentMethod || "").toLowerCase().includes("cash")
  ).length;

  const cardCount = filteredOrders.filter((order) => {
    const method = String(order.paymentMethod || "").toLowerCase();
    return (
      method.includes("card") ||
      method.includes("visa") ||
      method.includes("master")
    );
  }).length;

  const otherPaymentCount = filteredOrders.length - codCount - cardCount;

  const paymentChartData = useMemo(() => {
    const raw = [
      { name: "Cash", value: codCount, color: "#2e7d32" },
      { name: "Card", value: cardCount, color: "#ff9800" },
      { name: "Other", value: otherPaymentCount, color: "#66bb6a" },
    ].filter((item) => item.value > 0);

    const total = raw.reduce((sum, item) => sum + item.value, 0);

    return raw.map((item) => ({
      ...item,
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0",
    }));
  }, [codCount, cardCount, otherPaymentCount]);

  const totalPaymentOrders = paymentChartData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  const topDrivers = Object.values(
    filteredOrders.reduce((acc, order) => {
      const name = order.deliveredByStaffName || "Unknown Driver";

      if (!acc[name]) {
        acc[name] = {
          name,
          count: 0,
          revenue: 0,
        };
      }

      acc[name].count += 1;
      acc[name].revenue += Number(order.grandTotal || 0);

      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count);

  const driverRevenueChartData = topDrivers.slice(0, 6).map((driver) => ({
    name:
      driver.name.length > 12 ? `${driver.name.slice(0, 12)}...` : driver.name,
    fullName: driver.name,
    revenue: Number(driver.revenue || 0),
    orders: Number(driver.count || 0),
  }));

  const ordersByDayChartData = useMemo(() => {
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
        day: `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
          d.getDate()
        ).padStart(2, "0")}`,
        count: 0,
      });
    }

    filteredOrders.forEach((order) => {
      const rawDate = order.finishedAt || order.deliveredAt || order.createdAt;
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      const found = last7Days.find((item) => item.fullDate === key);
      if (found) {
        found.count += 1;
      }
    });

    return last7Days;
  }, [filteredOrders]);

  const latestOrders = [...filteredOrders]
    .sort((a, b) => new Date(b.finishedAt || 0) - new Date(a.finishedAt || 0))
    .slice(0, 8);

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
    };

    return shades[color] || "#666666";
  };

  const PaymentTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="dmanalytics-chart-tooltip">
          <p>{data.name}</p>
          <strong>{data.value} Orders</strong>
          <p>{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  const DriverRevenueTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[1]?.payload || payload[0]?.payload;

      return (
        <div className="dmanalytics-chart-tooltip">
          <p>{data?.fullName || label}</p>
          <strong>{formatCurrency(data?.revenue || 0)}</strong>
          <p>{data?.orders || 0} finished orders</p>
        </div>
      );
    }
    return null;
  };

  const OrdersByDayTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[1]?.payload || payload[0]?.payload;

      return (
        <div className="dmanalytics-chart-tooltip">
          <p>{label}</p>
          <strong>{data?.count || 0} Orders</strong>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="dmanalytics-wrapper">
      <div className="dmanalytics-header">
        <div className="dmanalytics-header-left">
          <div className="dmanalytics-header-icon">
            <FaChartLine />
          </div>

          <div>
            <span className="dmanalytics-badge">Delivery Analytics</span>
            <h2>Delivery Analytics Dashboard</h2>
            <p>
              Track finished delivery performance, revenue, payments, and top
              drivers.
            </p>
          </div>
        </div>

        <button
          className="dmanalytics-refresh-btn"
          onClick={fetchAnalyticsData}
        >
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      {message.text && (
        <div className={`dmanalytics-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="dmanalytics-stats-grid">
        <div className="dmanalytics-stat-card">
          <div className="dmanalytics-stat-icon green">
            <FaTruck />
          </div>
          <div>
            <h3>{totalFinishedOrders}</h3>
            <p>Total Finished Orders</p>
          </div>
        </div>

        <div className="dmanalytics-stat-card">
          <div className="dmanalytics-stat-icon orange">
            <FaMoneyBillWave />
          </div>
          <div>
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="dmanalytics-stat-card">
          <div className="dmanalytics-stat-icon green">
            <FaBoxOpen />
          </div>
          <div>
            <h3>{totalItems}</h3>
            <p>Total Delivered Items</p>
          </div>
        </div>
      </div>

      <div className="dmanalytics-search-row">
        <div className="dmanalytics-search-box">
          <FaSearch className="dmanalytics-search-icon" />
          <input
            type="text"
            placeholder="Search by order, customer, driver, payment, location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="dmanalytics-state-box">Loading analytics data...</div>
      ) : (
        <>
          <div className="dmanalytics-grid dmanalytics-chart-grid">
            <div className="dmanalytics-panel">
              <div className="dmanalytics-panel-head">
                <h3>
                  <FaChartPie className="dmanalytics-title-icon" />
                  Payment Breakdown
                </h3>
              </div>

              {paymentChartData.length === 0 ? (
                <p className="dmanalytics-empty">No payment data available.</p>
              ) : (
                <div className="dmanalytics-donut-box">
                  <div className="dmanalytics-donut-chart-wrap">
                    <ResponsiveContainer width="100%" height={290}>
                      <PieChart>
                        <Pie
                          data={paymentChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="54%"
                          innerRadius={66}
                          outerRadius={110}
                          paddingAngle={paymentChartData.length > 1 ? 2 : 0}
                          stroke="none"
                        >
                          {paymentChartData.map((entry, index) => (
                            <Cell
                              key={`shadow-${index}`}
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
                          innerRadius={66}
                          outerRadius={110}
                          paddingAngle={paymentChartData.length > 1 ? 2 : 0}
                          stroke="#ffffff"
                          strokeWidth={3}
                          labelLine={false}
                        >
                          {paymentChartData.map((entry, index) => (
                            <Cell
                              key={`main-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>

                        <Tooltip content={<PaymentTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="dmanalytics-donut-center">
                      <span>TOTAL</span>
                      <strong>{totalPaymentOrders}</strong>
                      <small>Payments</small>
                    </div>
                  </div>

                  <div className="dmanalytics-payment-legend-grid">
                    {paymentChartData.map((item, index) => (
                      <div
                        className="dmanalytics-payment-legend-card"
                        key={`${item.name}-${index}`}
                      >
                        <div className="dmanalytics-payment-legend-left">
                          <span
                            className="dmanalytics-payment-dot"
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

            <div className="dmanalytics-panel">
              <div className="dmanalytics-panel-head">
                <h3>
                  <FaChartBar className="dmanalytics-title-icon" />
                  Top Drivers Revenue
                </h3>
              </div>

              {driverRevenueChartData.length === 0 ? (
                <p className="dmanalytics-empty">No driver data available.</p>
              ) : (
                <div className="dmanalytics-chart-box">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={driverRevenueChartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `LKR ${value}`}
                      />
                      <Tooltip content={<DriverRevenueTooltip />} />

                      <Bar
                        dataKey="revenue"
                        barSize={34}
                        fill="#cc7a00"
                        radius={[10, 10, 0, 0]}
                      />

                      <Bar
                        dataKey="revenue"
                        barSize={28}
                        fill="#ff9800"
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="dmanalytics-panel dmanalytics-chart-panel-full">
            <div className="dmanalytics-panel-head">
              <h3>
                <FaChartBar className="dmanalytics-title-icon" />
                Finished Orders Trend (Last 7 Days)
              </h3>
            </div>

            {ordersByDayChartData.every((item) => item.count === 0) ? (
              <p className="dmanalytics-empty">No recent order trend data available.</p>
            ) : (
              <div className="dmanalytics-chart-box">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={ordersByDayChartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip content={<OrdersByDayTooltip />} />

                    <Bar
                      dataKey="count"
                      barSize={34}
                      fill="#1f5d24"
                      radius={[10, 10, 0, 0]}
                    />
                    <Bar
                      dataKey="count"
                      barSize={28}
                      fill="#2e7d32"
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="dmanalytics-panel dmanalytics-latest-panel">
            <div className="dmanalytics-panel-head">
              <h3>Latest Finished Deliveries</h3>
            </div>

            {latestOrders.length === 0 ? (
              <p className="dmanalytics-empty">No finished orders found.</p>
            ) : (
              <div className="dmanalytics-table-wrap">
                <table className="dmanalytics-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Driver</th>
                      <th>Location</th>
                      <th>Payment</th>
                      <th>Total</th>
                      <th>Finished At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestOrders.map((order) => (
                      <tr key={order._id || order.orderId}>
                        <td>{order.orderId || "N/A"}</td>
                        <td>
                          <div className="dmanalytics-cell-block">
                            <span className="dmanalytics-cell-main">
                              <FaUser className="dmanalytics-inline-icon" />
                              {order.customerName || "N/A"}
                            </span>
                            <span className="dmanalytics-cell-sub">
                              {order.gmail || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td>{order.deliveredByStaffName || "N/A"}</td>
                        <td>
                          <span className="dmanalytics-location-cell">
                            <FaMapMarkerAlt className="dmanalytics-inline-icon" />
                            {order.selectedDeliveryLocation ||
                              order.deliveryLocation ||
                              order.customLocation ||
                              order.address ||
                              "N/A"}
                          </span>
                        </td>
                        <td>{order.paymentMethod || "N/A"}</td>
                        <td>{formatCurrency(order.grandTotal)}</td>
                        <td>{formatDateTime(order.finishedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}