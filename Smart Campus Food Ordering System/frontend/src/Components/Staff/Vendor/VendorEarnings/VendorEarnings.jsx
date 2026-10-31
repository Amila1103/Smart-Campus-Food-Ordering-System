import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiDollarSign,
  FiShoppingBag,
  FiCreditCard,
  FiRefreshCw,
  FiSearch,
  FiTruck,
  FiPackage,
  FiBarChart2,
  FiCalendar,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./VendorEarnings.css";

const API_BASE = "http://localhost:5000";

export default function VendorEarnings() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("today");

  const PAYMENT_TOP_COLORS = ["#2E7D32", "#FF9800"];
  const PAYMENT_SIDE_COLORS = ["#1B5E20", "#E65100"];

  const ORDER_TOP_COLORS = ["#2563EB", "#7C3AED"];
  const ORDER_SIDE_COLORS = ["#1D4ED8", "#5B21B6"];

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 2500);
  };

  const fetchFinishedOrders = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_BASE}/completed-orders`);
      const completedOrders = res.data?.completedOrders || [];

      const finishedOrders = completedOrders.filter(
        (order) => String(order.orderStatus).toLowerCase() === "finished"
      );

      setOrders(finishedOrders);
    } catch (error) {
      console.log("Fetch earnings error:", error);
      showMessage("error", "Failed to fetch earnings data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinishedOrders();
  }, []);

  const isInSelectedRange = (dateValue, filter) => {
    if (!dateValue) return false;

    const orderDate = new Date(dateValue);
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfTomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1
    );

    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? 6 : currentDay - 1;

    const startOfThisWeek = new Date(startOfToday);
    startOfThisWeek.setDate(startOfToday.getDate() - mondayOffset);

    const startOfNextWeek = new Date(startOfThisWeek);
    startOfNextWeek.setDate(startOfThisWeek.getDate() + 7);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1
    );
    const startOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    switch (filter) {
      case "today":
        return orderDate >= startOfToday && orderDate < startOfTomorrow;
      case "thisWeek":
        return orderDate >= startOfThisWeek && orderDate < startOfNextWeek;
      case "lastWeek":
        return orderDate >= startOfLastWeek && orderDate < startOfThisWeek;
      case "thisMonth":
        return orderDate >= startOfThisMonth && orderDate < startOfNextMonth;
      case "lastMonth":
        return orderDate >= startOfLastMonth && orderDate < startOfThisMonth;
      default:
        return true;
    }
  };

  const rangeFilteredOrders = useMemo(() => {
    return orders.filter((order) =>
      isInSelectedRange(order.completedAt, dateFilter)
    );
  }, [orders, dateFilter]);

  const filteredOrders = useMemo(() => {
    const keyword = searchTerm.toLowerCase();

    return rangeFilteredOrders.filter((order) => {
      return (
        order.orderId?.toLowerCase().includes(keyword) ||
        order.customerName?.toLowerCase().includes(keyword) ||
        order.orderType?.toLowerCase().includes(keyword) ||
        order.paymentMethod?.toLowerCase().includes(keyword)
      );
    });
  }, [rangeFilteredOrders, searchTerm]);

  const totalEarnings = filteredOrders.reduce(
    (sum, order) => sum + Number(order.grandTotal || 0),
    0
  );

  const totalOrders = filteredOrders.length;

  const takeawayEarnings = filteredOrders
    .filter((order) => {
      const type = String(order.orderType || "").toLowerCase();
      return type === "takeaway" || type === "pickup";
    })
    .reduce((sum, order) => sum + Number(order.grandTotal || 0), 0);

  const deliveryEarnings = filteredOrders
    .filter(
      (order) => String(order.orderType || "").toLowerCase() === "delivery"
    )
    .reduce((sum, order) => sum + Number(order.grandTotal || 0), 0);

  const cashEarnings = filteredOrders
    .filter(
      (order) => String(order.paymentMethod || "").toLowerCase() === "cash"
    )
    .reduce((sum, order) => sum + Number(order.grandTotal || 0), 0);

  const cardEarnings = filteredOrders
    .filter((order) => {
      const method = String(order.paymentMethod || "").toLowerCase();
      return method && method !== "cash";
    })
    .reduce((sum, order) => sum + Number(order.grandTotal || 0), 0);

  const averageOrderValue =
    totalOrders > 0 ? (totalEarnings / totalOrders).toFixed(2) : "0.00";

  const chartData = useMemo(() => {
    const grouped = {};

    filteredOrders.forEach((order) => {
      if (!order.completedAt) return;

      const dateObj = new Date(order.completedAt);
      const dateKey = dateObj.toLocaleDateString("en-CA");

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          total: 0,
          orders: 0,
        };
      }

      grouped[dateKey].total += Number(order.grandTotal || 0);
      grouped[dateKey].orders += 1;
    });

    return Object.entries(grouped)
      .map(([date, values]) => ({
        date,
        shortDate: date.slice(5),
        total: Number(values.total.toFixed(2)),
        orders: values.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredOrders]);

  const paymentSplitData = [
    { name: "Cash", value: cashEarnings },
    { name: "Card / Online", value: cardEarnings },
  ];

  const orderTypeSplitData = [
    { name: "Delivery", value: deliveryEarnings },
    { name: "Takeaway / Pickup", value: takeawayEarnings },
  ];

  const filterLabelMap = {
    today: "Today",
    thisWeek: "This Week",
    lastWeek: "Last Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
  };

  const formatCurrency = (value) => `LKR ${Number(value || 0).toFixed(2)}`;

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0]?.payload;

    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid rgba(46, 125, 50, 0.12)",
          borderRadius: "14px",
          padding: "12px 14px",
          boxShadow: "0 10px 24px rgba(34,34,34,0.08)",
        }}
      >
        <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#222222" }}>
          {label}
        </p>
        <p style={{ margin: "0 0 4px", color: "#2e7d32", fontWeight: 700 }}>
          Earnings: {formatCurrency(data?.total)}
        </p>
        <p style={{ margin: 0, color: "#666666", fontWeight: 600 }}>
          Orders: {data?.orders || 0}
        </p>
      </div>
    );
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0]?.payload;

    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid rgba(46, 125, 50, 0.12)",
          borderRadius: "14px",
          padding: "12px 14px",
          boxShadow: "0 10px 24px rgba(34,34,34,0.08)",
        }}
      >
        <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#222222" }}>
          {data?.name}
        </p>
        <p style={{ margin: 0, color: "#2e7d32", fontWeight: 700 }}>
          {formatCurrency(data?.value)}
        </p>
      </div>
    );
  };

  const ThreeDBar = (props) => {
    const { x, y, width, height } = props;
    const depth = 8;

    if (height <= 0) return null;

    return (
      <g>
        {/* front */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={8}
          ry={8}
          fill="#2E7D32"
        />

        {/* top */}
        <path
          d={`
            M ${x} ${y}
            L ${x + depth} ${y - depth}
            L ${x + width + depth} ${y - depth}
            L ${x + width} ${y}
            Z
          `}
          fill="#4CAF50"
        />

        {/* right side */}
        <path
          d={`
            M ${x + width} ${y}
            L ${x + width + depth} ${y - depth}
            L ${x + width + depth} ${y + height - depth}
            L ${x + width} ${y + height}
            Z
          `}
          fill="#1B5E20"
        />
      </g>
    );
  };

  return (
    <section className="veh-wrapper">
      <div className="veh-topbar">
        <div>
          <span className="veh-badge">Vendor Earnings</span>
          <h2>Finished Order Earnings</h2>
          <p>Revenue summary based only on finished completed orders.</p>
        </div>

        <button className="veh-refresh-btn" onClick={fetchFinishedOrders}>
          <FiRefreshCw />
          <span>Refresh</span>
        </button>
      </div>

      {message.text && (
        <div className={`veh-toast ${message.type}`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="veh-filter-row">
        <div className="veh-filter-title">
          <FiCalendar />
          <span>Filter Range</span>
        </div>

        <div className="veh-filter-chips">
          <button
            className={`veh-filter-chip ${
              dateFilter === "today" ? "active" : ""
            }`}
            onClick={() => setDateFilter("today")}
          >
            Today
          </button>

          <button
            className={`veh-filter-chip ${
              dateFilter === "thisWeek" ? "active" : ""
            }`}
            onClick={() => setDateFilter("thisWeek")}
          >
            This Week
          </button>

          <button
            className={`veh-filter-chip ${
              dateFilter === "lastWeek" ? "active" : ""
            }`}
            onClick={() => setDateFilter("lastWeek")}
          >
            Last Week
          </button>

          <button
            className={`veh-filter-chip ${
              dateFilter === "thisMonth" ? "active" : ""
            }`}
            onClick={() => setDateFilter("thisMonth")}
          >
            This Month
          </button>

          <button
            className={`veh-filter-chip ${
              dateFilter === "lastMonth" ? "active" : ""
            }`}
            onClick={() => setDateFilter("lastMonth")}
          >
            Last Month
          </button>
        </div>
      </div>

      <div className="veh-stats">
        <div className="veh-stat-card">
          <div className="veh-stat-icon green">
            <FiDollarSign />
          </div>
          <div>
            <h3>{formatCurrency(totalEarnings)}</h3>
            <p>{filterLabelMap[dateFilter]} Earnings</p>
          </div>
        </div>

        <div className="veh-stat-card">
          <div className="veh-stat-icon orange">
            <FiShoppingBag />
          </div>
          <div>
            <h3>{totalOrders}</h3>
            <p>{filterLabelMap[dateFilter]} Orders</p>
          </div>
        </div>

        <div className="veh-stat-card">
          <div className="veh-stat-icon blue">
            <FiPackage />
          </div>
          <div>
            <h3>{formatCurrency(takeawayEarnings)}</h3>
            <p>Takeaway Earnings</p>
          </div>
        </div>

        <div className="veh-stat-card">
          <div className="veh-stat-icon purple">
            <FiTruck />
          </div>
          <div>
            <h3>{formatCurrency(deliveryEarnings)}</h3>
            <p>Delivery Earnings</p>
          </div>
        </div>
      </div>

      <div className="veh-summary-grid">
        <div className="veh-summary-card">
          <h4>Cash Payments</h4>
          <strong>{formatCurrency(cashEarnings)}</strong>
        </div>

        <div className="veh-summary-card">
          <h4>Card / Online Payments</h4>
          <strong>{formatCurrency(cardEarnings)}</strong>
        </div>

        <div className="veh-summary-card">
          <h4>Average Order Value</h4>
          <strong>{formatCurrency(averageOrderValue)}</strong>
        </div>
      </div>

      <div className="veh-chart-card">
        <div className="veh-chart-head">
          <div className="veh-chart-title">
            <FiBarChart2 />
            <h3>{filterLabelMap[dateFilter]} Earnings Graph</h3>
          </div>
          <span className="veh-chart-subtitle">
            Daily earnings comparison
          </span>
        </div>

        {chartData.length === 0 ? (
          <div className="veh-info-box">No chart data available.</div>
        ) : (
          <div style={{ width: "100%", height: 380 }}>
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                margin={{ top: 25, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  vertical={false}
                />
                <XAxis
                  dataKey="shortDate"
                  tick={{ fontSize: 12, fill: "#2e7d32" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar
                  dataKey="total"
                  shape={<ThreeDBar />}
                  maxBarSize={42}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "22px",
          marginBottom: "22px",
        }}
      >
        <div className="veh-chart-card" style={{ marginBottom: 0 }}>
          <div className="veh-chart-head">
            <div className="veh-chart-title">
              <FiCreditCard />
              <h3>Payment Method Split</h3>
            </div>
            <span className="veh-chart-subtitle">Cash vs online share</span>
          </div>

          {paymentSplitData.every((item) => item.value === 0) ? (
            <div className="veh-info-box">No payment split data available.</div>
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  {/* bottom / shadow layer */}
                  <Pie
                    data={paymentSplitData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="54%"
                    outerRadius={92}
                    innerRadius={50}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {paymentSplitData.map((entry, index) => (
                      <Cell
                        key={`payment-bottom-${index}`}
                        fill={
                          PAYMENT_SIDE_COLORS[
                            index % PAYMENT_SIDE_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>

                  {/* top layer */}
                  <Pie
                    data={paymentSplitData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    outerRadius={92}
                    innerRadius={50}
                    paddingAngle={4}
                  >
                    {paymentSplitData.map((entry, index) => (
                      <Cell
                        key={`payment-top-${index}`}
                        fill={PAYMENT_TOP_COLORS[index % PAYMENT_TOP_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="veh-chart-card" style={{ marginBottom: 0 }}>
          <div className="veh-chart-head">
            <div className="veh-chart-title">
              <FiTruck />
              <h3>Order Type Split</h3>
            </div>
            <span className="veh-chart-subtitle">
              Delivery vs takeaway share
            </span>
          </div>

          {orderTypeSplitData.every((item) => item.value === 0) ? (
            <div className="veh-info-box">No order type data available.</div>
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  {/* bottom / shadow layer */}
                  <Pie
                    data={orderTypeSplitData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="54%"
                    outerRadius={92}
                    innerRadius={50}
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {orderTypeSplitData.map((entry, index) => (
                      <Cell
                        key={`order-bottom-${index}`}
                        fill={ORDER_SIDE_COLORS[index % ORDER_SIDE_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  {/* top layer */}
                  <Pie
                    data={orderTypeSplitData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    outerRadius={92}
                    innerRadius={50}
                    paddingAngle={4}
                  >
                    {orderTypeSplitData.map((entry, index) => (
                      <Cell
                        key={`order-top-${index}`}
                        fill={ORDER_TOP_COLORS[index % ORDER_TOP_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="veh-toolbar">
        <div className="veh-searchbox">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by order id, customer, type or payment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="veh-info-box">Loading earnings data...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="veh-info-box">No finished orders found.</div>
      ) : (
        <div className="veh-table-wrap">
          <table className="veh-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Order Type</th>
                <th>Payment</th>
                <th>Payment Status</th>
                <th>Total</th>
                <th>Finished Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderId}</td>
                  <td>{order.customerName || "N/A"}</td>
                  <td>{order.orderType || "N/A"}</td>
                  <td>
                    <span className="veh-payment-badge">
                      <FiCreditCard />
                      {order.paymentMethod || "N/A"}
                    </span>
                  </td>
                  <td>{order.paymentStatus || "N/A"}</td>
                  <td className="veh-money-cell">
                    {formatCurrency(order.grandTotal || 0)}
                  </td>
                  <td>
                    {order.completedAt
                      ? new Date(order.completedAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}