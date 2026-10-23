import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaChartLine,
  FaUsers,
  FaShoppingBag,
  FaCommentDots,
  FaSyncAlt,
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
import "./CustomerInsightsAnalytics.css";

const API_BASE = "http://localhost:5000";

export default function CustomerInsightsAnalytics() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError("");

      const [customersRes, ordersRes, complaintsRes] = await Promise.all([
        axios.get(`${API_BASE}/Customers`),
        axios.get(`${API_BASE}/completed-orders`),
        axios.get(`${API_BASE}/complaints`),
      ]);

      const customerList = Array.isArray(customersRes?.data?.Customers)
        ? customersRes.data.Customers
        : [];

      const orderList = Array.isArray(ordersRes?.data?.completedOrders)
        ? ordersRes.data.completedOrders
        : [];

      const complaintList = Array.isArray(complaintsRes?.data?.complaints)
        ? complaintsRes.data.complaints
        : [];

      setCustomers(customerList);
      setOrders(orderList);
      setComplaints(complaintList);
    } catch (err) {
      console.log("Analytics fetch error:", err);
      setError("Failed to load customer analytics.");
      setCustomers([]);
      setOrders([]);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const analytics = useMemo(() => {
    const totalCustomers = customers.length;
    const onlineCustomers = customers.filter((c) => c?.isOnline).length;
    const offlineCustomers = totalCustomers - onlineCustomers;

    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o?.orderStatus === "Completed"
    ).length;
    const finishedOrders = orders.filter(
      (o) => o?.orderStatus === "Finished"
    ).length;

    const deliveryOrders = orders.filter(
      (o) => (o?.orderType || "").toLowerCase() === "delivery"
    ).length;
    const pickupOrders = orders.filter(
      (o) => (o?.orderType || "").toLowerCase() === "pickup"
    ).length;

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order?.grandTotal || 0),
      0
    );

    const avgOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(
      (c) => c?.status === "Pending"
    ).length;
    const resolvedComplaints = complaints.filter(
      (c) => c?.status === "Resolved"
    ).length;
    const repliedComplaints = complaints.filter((c) =>
      c?.adminReply?.trim()
    ).length;

    const dietaryCustomers = customers.filter(
      (item) =>
        (Array.isArray(item?.dietaryPreferences) &&
          item.dietaryPreferences.length > 0) ||
        (Array.isArray(item?.allergies) && item.allergies.length > 0) ||
        item?.otherAllergy ||
        item?.calorieGoal ||
        item?.notes
    ).length;

    const complaintRate =
      totalCustomers > 0
        ? ((totalComplaints / totalCustomers) * 100).toFixed(1)
        : "0.0";

    const resolutionRate =
      totalComplaints > 0
        ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1)
        : "0.0";

    const replyRate =
      totalComplaints > 0
        ? ((repliedComplaints / totalComplaints) * 100).toFixed(1)
        : "0.0";

    const onlineRate =
      totalCustomers > 0
        ? ((onlineCustomers / totalCustomers) * 100).toFixed(1)
        : "0.0";

    const deliveryRate =
      totalOrders > 0
        ? ((deliveryOrders / totalOrders) * 100).toFixed(1)
        : "0.0";

    const pickupRate =
      totalOrders > 0
        ? ((pickupOrders / totalOrders) * 100).toFixed(1)
        : "0.0";

    const dietaryRate =
      totalCustomers > 0
        ? ((dietaryCustomers / totalCustomers) * 100).toFixed(1)
        : "0.0";

    const customerOrderMap = {};
    orders.forEach((order) => {
      const key =
        order?.customerName?.trim() ||
        order?.gmail?.trim() ||
        order?.customerId?.trim() ||
        "Unknown Customer";

      if (!customerOrderMap[key]) {
        customerOrderMap[key] = {
          name: order?.customerName || "Unknown Customer",
          email: order?.gmail || "No email",
          orderCount: 0,
          totalSpent: 0,
        };
      }

      customerOrderMap[key].orderCount += 1;
      customerOrderMap[key].totalSpent += Number(order?.grandTotal || 0);
    });

    const topCustomers = Object.values(customerOrderMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    const categoryMap = {};
    complaints.forEach((item) => {
      const key = item?.category?.trim() || "Other";
      categoryMap[key] = (categoryMap[key] || 0) + 1;
    });

    const complaintCategories = Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const customerStatusChart = [
      {
        name: "Online",
        value: onlineCustomers,
        percentage: Number(onlineRate),
        color: "#2E7D32",
      },
      {
        name: "Offline",
        value: offlineCustomers,
        percentage:
          totalCustomers > 0
            ? Number(((offlineCustomers / totalCustomers) * 100).toFixed(1))
            : 0,
        color: "#FF9800",
      },
      {
        name: "Dietary",
        value: dietaryCustomers,
        percentage: Number(dietaryRate),
        color: "#66BB6A",
      },
    ].filter((item) => item.value > 0);

    const orderTypeChart = [
      {
        name: "Delivery",
        value: deliveryOrders,
        percentage: Number(deliveryRate),
        color: "#FF9800",
      },
      {
        name: "Pickup",
        value: pickupOrders,
        percentage: Number(pickupRate),
        color: "#2E7D32",
      },
      {
        name: "Finished",
        value: finishedOrders,
        percentage:
          totalOrders > 0
            ? Number(((finishedOrders / totalOrders) * 100).toFixed(1))
            : 0,
        color: "#81C784",
      },
    ].filter((item) => item.value > 0);

    const complaintPerformanceChart = [
      { name: "Pending", value: pendingComplaints, color: "#FF9800" },
      { name: "Resolved", value: resolvedComplaints, color: "#2E7D32" },
      { name: "Replied", value: repliedComplaints, color: "#66BB6A" },
    ];

    const complaintCategoryChart = complaintCategories.map((item, index) => ({
      ...item,
      shortName:
        item.name.length > 14 ? `${item.name.slice(0, 14)}...` : item.name,
      color: index % 2 === 0 ? "#2E7D32" : "#FF9800",
      darkColor: index % 2 === 0 ? "#1F5A24" : "#D67F00",
    }));

    return {
      totalCustomers,
      onlineCustomers,
      offlineCustomers,
      totalOrders,
      completedOrders,
      finishedOrders,
      deliveryOrders,
      pickupOrders,
      totalRevenue,
      avgOrderValue,
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      repliedComplaints,
      dietaryCustomers,
      complaintRate,
      resolutionRate,
      replyRate,
      onlineRate,
      deliveryRate,
      pickupRate,
      dietaryRate,
      topCustomers,
      complaintCategories,
      customerStatusChart,
      orderTypeChart,
      complaintPerformanceChart,
      complaintCategoryChart,
    };
  }, [customers, orders, complaints]);

  const formatCurrency = (value) => {
    return `Rs. ${Number(value || 0).toLocaleString()}`;
  };

  const getDarkShade = (color) => {
    const shades = {
      "#2E7D32": "#1F5A24",
      "#FF9800": "#D67F00",
      "#66BB6A": "#4E9B52",
      "#81C784": "#5FA164",
    };
    return shades[color] || "#666666";
  };

  const DonutTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="cia-chart-tooltip">
          <p>{data.name}</p>
          <strong>{data.value}</strong>
          <p>{data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const BarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[payload.length - 1].payload;
      return (
        <div className="cia-chart-tooltip">
          <p>{data.name || label}</p>
          <strong>{data.value || data.count}</strong>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="cia-page">
      <div className="cia-hero">
        <div>
          <span className="cia-badge">Customer Analytics</span>
          <h2>Customer Insights & Analytics</h2>
          <p>
            Track customer activity, order performance, complaint trends, and
            engagement insights from one professional dashboard.
          </p>
        </div>

        <button className="cia-refresh-btn" onClick={fetchAnalyticsData}>
          <FaSyncAlt />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {loading ? (
        <div className="cia-state-box">Loading analytics...</div>
      ) : error ? (
        <div className="cia-state-box error">{error}</div>
      ) : (
        <>
          <div className="cia-overview-grid">
            <div className="cia-card highlight-green">
              <div className="cia-card-icon"><FaUsers /></div>
              <div>
                <p>Total Customers</p>
                <h3>{analytics.totalCustomers}</h3>
                <span>{analytics.onlineRate}% currently online</span>
              </div>
            </div>

            <div className="cia-card highlight-orange">
              <div className="cia-card-icon"><FaShoppingBag /></div>
              <div>
                <p>Total Orders</p>
                <h3>{analytics.totalOrders}</h3>
                <span>{analytics.finishedOrders} finished orders</span>
              </div>
            </div>

            <div className="cia-card highlight-green">
              <div className="cia-card-icon"><FaChartLine /></div>
              <div>
                <p>Total Revenue</p>
                <h3>{formatCurrency(analytics.totalRevenue)}</h3>
                <span>Avg order {formatCurrency(analytics.avgOrderValue)}</span>
              </div>
            </div>

            <div className="cia-card highlight-orange">
              <div className="cia-card-icon"><FaCommentDots /></div>
              <div>
                <p>Total Complaints</p>
                <h3>{analytics.totalComplaints}</h3>
                <span>{analytics.resolutionRate}% resolved</span>
              </div>
            </div>
          </div>

          <div className="cia-chart-grid">
            <div className="cia-panel">
              <div className="cia-panel-head">
                <h3><FaChartPie className="cia-title-icon" /> Customer Status</h3>
                <span>3D donut insight</span>
              </div>

              {analytics.customerStatusChart.length === 0 ? (
                <div className="cia-empty-box">No customer status data available.</div>
              ) : (
                <div className="cia-donut-box">
                  <div className="cia-donut-chart-wrap">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.customerStatusChart}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="54%"
                          innerRadius={68}
                          outerRadius={112}
                          paddingAngle={analytics.customerStatusChart.length > 1 ? 2 : 0}
                          stroke="none"
                        >
                          {analytics.customerStatusChart.map((entry, index) => (
                            <Cell
                              key={`status-shadow-${index}`}
                              fill={getDarkShade(entry.color)}
                            />
                          ))}
                        </Pie>

                        <Pie
                          data={analytics.customerStatusChart}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={68}
                          outerRadius={112}
                          paddingAngle={analytics.customerStatusChart.length > 1 ? 2 : 0}
                          stroke="#ffffff"
                          strokeWidth={3}
                          labelLine={false}
                        >
                          {analytics.customerStatusChart.map((entry, index) => (
                            <Cell
                              key={`status-main-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<DonutTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="cia-donut-center">
                      <span>TOTAL</span>
                      <strong>{analytics.totalCustomers}</strong>
                      <small>Customers</small>
                    </div>
                  </div>

                  <div className="cia-legend-grid">
                    {analytics.customerStatusChart.map((item, index) => (
                      <div className="cia-legend-card" key={`${item.name}-${index}`}>
                        <div className="cia-legend-left">
                          <span
                            className="cia-legend-dot"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          <div>
                            <h4>{item.name}</h4>
                            <p>{item.percentage}% share</p>
                          </div>
                        </div>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="cia-panel">
              <div className="cia-panel-head">
                <h3><FaChartPie className="cia-title-icon" /> Order Behavior</h3>
                <span>3D donut insight</span>
              </div>

              {analytics.orderTypeChart.length === 0 ? (
                <div className="cia-empty-box">No order behavior data available.</div>
              ) : (
                <div className="cia-donut-box">
                  <div className="cia-donut-chart-wrap">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.orderTypeChart}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="54%"
                          innerRadius={68}
                          outerRadius={112}
                          paddingAngle={analytics.orderTypeChart.length > 1 ? 2 : 0}
                          stroke="none"
                        >
                          {analytics.orderTypeChart.map((entry, index) => (
                            <Cell
                              key={`order-shadow-${index}`}
                              fill={getDarkShade(entry.color)}
                            />
                          ))}
                        </Pie>

                        <Pie
                          data={analytics.orderTypeChart}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={68}
                          outerRadius={112}
                          paddingAngle={analytics.orderTypeChart.length > 1 ? 2 : 0}
                          stroke="#ffffff"
                          strokeWidth={3}
                          labelLine={false}
                        >
                          {analytics.orderTypeChart.map((entry, index) => (
                            <Cell
                              key={`order-main-${index}`}
                              fill={entry.color}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<DonutTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="cia-donut-center">
                      <span>TOTAL</span>
                      <strong>{analytics.totalOrders}</strong>
                      <small>Orders</small>
                    </div>
                  </div>

                  <div className="cia-legend-grid">
                    {analytics.orderTypeChart.map((item, index) => (
                      <div className="cia-legend-card" key={`${item.name}-${index}`}>
                        <div className="cia-legend-left">
                          <span
                            className="cia-legend-dot"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          <div>
                            <h4>{item.name}</h4>
                            <p>{item.percentage}% share</p>
                          </div>
                        </div>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="cia-chart-grid">
            <div className="cia-panel">
              <div className="cia-panel-head">
                <h3><FaChartBar className="cia-title-icon" /> Complaint Performance</h3>
                <span>3D bar chart</span>
              </div>

              <div className="cia-chart-box">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={analytics.complaintPerformanceChart}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip content={<BarTooltip />} />
                    <Bar
                      dataKey="value"
                      barSize={34}
                      radius={[10, 10, 0, 0]}
                      fill="#CFCFCF"
                    >
                      {analytics.complaintPerformanceChart.map((entry, index) => (
                        <Cell
                          key={`perf-back-${index}`}
                          fill={getDarkShade(entry.color)}
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="value"
                      barSize={28}
                      radius={[10, 10, 0, 0]}
                    >
                      {analytics.complaintPerformanceChart.map((entry, index) => (
                        <Cell
                          key={`perf-front-${index}`}
                          fill={entry.color}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="cia-panel">
              <div className="cia-panel-head">
                <h3><FaChartBar className="cia-title-icon" /> Complaint Categories</h3>
                <span>3D bar chart</span>
              </div>

              {analytics.complaintCategoryChart.length === 0 ? (
                <div className="cia-empty-box">No complaint category data available.</div>
              ) : (
                <div className="cia-chart-box">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={analytics.complaintCategoryChart}
                      margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="shortName" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip content={<BarTooltip />} />
                      <Bar
                        dataKey="count"
                        barSize={34}
                        radius={[10, 10, 0, 0]}
                      >
                        {analytics.complaintCategoryChart.map((entry, index) => (
                          <Cell
                            key={`cat-back-${index}`}
                            fill={entry.darkColor}
                          />
                        ))}
                      </Bar>
                      <Bar
                        dataKey="count"
                        barSize={28}
                        radius={[10, 10, 0, 0]}
                      >
                        {analytics.complaintCategoryChart.map((entry, index) => (
                          <Cell
                            key={`cat-front-${index}`}
                            fill={entry.color}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div className="cia-section-grid bottom">
            <div className="cia-panel">
              <div className="cia-panel-head">
                <h3>Top Customers by Spend</h3>
                <span>Highest value customers</span>
              </div>

              {analytics.topCustomers.length === 0 ? (
                <div className="cia-empty-box">No customer spending data available.</div>
              ) : (
                <div className="cia-ranking-list">
                  {analytics.topCustomers.map((customer, index) => (
                    <div className="cia-ranking-item" key={`${customer.email}-${index}`}>
                      <div className="cia-rank-left">
                        <div className="cia-rank-badge">{index + 1}</div>
                        <div>
                          <h4>{customer.name}</h4>
                          <p>{customer.email}</p>
                        </div>
                      </div>

                      <div className="cia-rank-right">
                        <strong>{formatCurrency(customer.totalSpent)}</strong>
                        <span>{customer.orderCount} orders</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cia-panel">
              <div className="cia-panel-head">
                <h3>Quick Summary</h3>
                <span>Important ratios</span>
              </div>

              <div className="cia-summary-grid">
                <div className="cia-summary-card">
                  <span>Complaint Rate</span>
                  <strong>{analytics.complaintRate}%</strong>
                </div>
                <div className="cia-summary-card">
                  <span>Resolution Rate</span>
                  <strong>{analytics.resolutionRate}%</strong>
                </div>
                <div className="cia-summary-card">
                  <span>Reply Rate</span>
                  <strong>{analytics.replyRate}%</strong>
                </div>
                <div className="cia-summary-card">
                  <span>Average Order</span>
                  <strong>{formatCurrency(analytics.avgOrderValue)}</strong>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}