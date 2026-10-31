import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiRefreshCw,
  FiTrendingUp,
  FiShoppingBag,
  FiCreditCard,
  FiDollarSign,
  FiBarChart2,
  FiPackage,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import "./VendorAnalytics.css";

const API_BASE = "http://localhost:5000";

export default function VendorAnalytics() {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [rangeFilter, setRangeFilter] = useState("all");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 2500);
  };

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const [ordersRes, paymentsRes] = await Promise.all([
        axios.get(`${API_BASE}/completed-orders`),
        axios.get(`${API_BASE}/payment`),
      ]);

      console.log("Completed Orders Response:", ordersRes.data);
      console.log("Payments Response:", paymentsRes.data);

      const completed = Array.isArray(ordersRes.data?.completedOrders)
        ? ordersRes.data.completedOrders
        : [];

      const paymentsData = Array.isArray(paymentsRes.data?.payments)
        ? paymentsRes.data.payments
        : [];

      const usableOrders = completed.filter((order) => {
        const status = String(order.orderStatus || "").toLowerCase();
        return status === "finished" || status === "completed";
      });

      setCompletedOrders(usableOrders);
      setPayments(paymentsData);
    } catch (error) {
      console.log("Fetch analytics error:", error);
      console.log("Error response:", error.response?.data);
      showMessage("error", "Failed to fetch analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const isInRange = (dateValue, filter) => {
    if (filter === "all") return true;
    if (!dateValue) return false;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return false;

    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    switch (filter) {
      case "today":
        return date >= startOfToday && date < startOfTomorrow;
      case "thisWeek":
        return date >= startOfThisWeek && date < startOfNextWeek;
      case "lastWeek":
        return date >= startOfLastWeek && date < startOfThisWeek;
      case "thisMonth":
        return date >= startOfThisMonth && date < startOfNextMonth;
      case "lastMonth":
        return date >= startOfLastMonth && date < startOfThisMonth;
      default:
        return true;
    }
  };

  const filteredOrders = useMemo(() => {
    return completedOrders.filter((order) =>
      isInRange(order.completedAt || order.createdAt, rangeFilter)
    );
  }, [completedOrders, rangeFilter]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) =>
      isInRange(payment.paidAt || payment.createdAt, rangeFilter)
    );
  }, [payments, rangeFilter]);

  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + Number(order.grandTotal || 0),
    0
  );

  const totalOrders = filteredOrders.length;

  const avgOrderValue =
    totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00";

  const takeawayOrders = filteredOrders.filter(
    (order) => String(order.orderType || "").toLowerCase() === "takeaway"
  );

  const deliveryOrders = filteredOrders.filter(
    (order) => String(order.orderType || "").toLowerCase() === "delivery"
  );

  const takeawayRevenue = takeawayOrders.reduce(
    (sum, order) => sum + Number(order.grandTotal || 0),
    0
  );

  const deliveryRevenue = deliveryOrders.reduce(
    (sum, order) => sum + Number(order.grandTotal || 0),
    0
  );

  const paidPayments = filteredPayments.filter(
    (payment) => String(payment.paymentStatus || "").toLowerCase() === "paid"
  );

  const pendingPayments = filteredPayments.filter(
    (payment) => String(payment.paymentStatus || "").toLowerCase() === "pending"
  );

  const paymentMethodStats = useMemo(() => {
    const grouped = {};

    filteredPayments.forEach((payment) => {
      const method = payment.paymentMethod || "Unknown";

      if (!grouped[method]) {
        grouped[method] = {
          method,
          count: 0,
          total: 0,
        };
      }

      grouped[method].count += 1;
      grouped[method].total += Number(payment.grandTotal || 0);
    });

    return Object.values(grouped).sort((a, b) => b.total - a.total);
  }, [filteredPayments]);

  const topItems = useMemo(() => {
    const grouped = {};

    filteredOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = item.name || "Unknown Item";

        if (!grouped[name]) {
          grouped[name] = {
            name,
            qty: 0,
            revenue: 0,
          };
        }

        grouped[name].qty += Number(item.qty || 0);
        grouped[name].revenue += Number(item.subtotal || item.price || 0);
      });
    });

    return Object.values(grouped)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredOrders]);

  const dailyChartData = useMemo(() => {
    const grouped = {};

    filteredOrders.forEach((order) => {
      const dateKey = order.completedAt
        ? new Date(order.completedAt).toLocaleDateString("en-CA")
        : order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-CA")
        : "Unknown";

      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          orders: 0,
          revenue: 0,
        };
      }

      grouped[dateKey].orders += 1;
      grouped[dateKey].revenue += Number(order.grandTotal || 0);
    });

    return Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7)
      .map((item) => ({
        ...item,
        shortDate: item.date === "Unknown" ? "N/A" : item.date.slice(5),
      }));
  }, [filteredOrders]);

  const maxRevenue = Math.max(...dailyChartData.map((item) => item.revenue), 1);

  const rangeLabelMap = {
    all: "All Time",
    today: "Today",
    thisWeek: "This Week",
    lastWeek: "Last Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
  };

  const ThreeDBar = ({ revenue, maxRevenue }) => {
    const percent = Math.max((revenue / maxRevenue) * 100, 8);
    const shellHeight = 220;
    const barHeight = (shellHeight * percent) / 100;
    const topDepth = 8;

    return (
      <div className="van-chart-bar-shell">
        <div
          className="van-chart-bar-3d"
          style={{ height: `${barHeight}px` }}
        >
          <div className="van-chart-bar-front" />
          <div
            className="van-chart-bar-top"
            style={{ height: `${topDepth}px` }}
          />
          <div className="van-chart-bar-side" />
        </div>
      </div>
    );
  };

  return (
    <section className="van-wrapper">
      <div className="van-topbar">
        <div>
          <span className="van-badge">Vendor Analytics</span>
          <h2>Sales & Performance Analytics</h2>
          <p>Orders, payments, top items, and revenue insights.</p>
        </div>

        <button className="van-refresh-btn" onClick={fetchAnalyticsData}>
          <FiRefreshCw />
          <span>Refresh</span>
        </button>
      </div>

      {message.text && (
        <div className={`van-toast ${message.type}`}>
          <span>{message.text}</span>
        </div>
      )}

      <div className="van-filter-row">
        <button
          className={`van-filter-chip ${rangeFilter === "all" ? "active" : ""}`}
          onClick={() => setRangeFilter("all")}
        >
          All
        </button>

        <button
          className={`van-filter-chip ${rangeFilter === "today" ? "active" : ""}`}
          onClick={() => setRangeFilter("today")}
        >
          Today
        </button>

        <button
          className={`van-filter-chip ${rangeFilter === "thisWeek" ? "active" : ""}`}
          onClick={() => setRangeFilter("thisWeek")}
        >
          This Week
        </button>

        <button
          className={`van-filter-chip ${rangeFilter === "lastWeek" ? "active" : ""}`}
          onClick={() => setRangeFilter("lastWeek")}
        >
          Last Week
        </button>

        <button
          className={`van-filter-chip ${rangeFilter === "thisMonth" ? "active" : ""}`}
          onClick={() => setRangeFilter("thisMonth")}
        >
          This Month
        </button>

        <button
          className={`van-filter-chip ${rangeFilter === "lastMonth" ? "active" : ""}`}
          onClick={() => setRangeFilter("lastMonth")}
        >
          Last Month
        </button>
      </div>

      <div className="van-stats-grid">
        <div className="van-stat-card">
          <div className="van-stat-icon green">
            <FiDollarSign />
          </div>
          <div>
            <h3>LKR {totalRevenue.toFixed(2)}</h3>
            <p>{rangeLabelMap[rangeFilter]} Revenue</p>
          </div>
        </div>

        <div className="van-stat-card">
          <div className="van-stat-icon orange">
            <FiShoppingBag />
          </div>
          <div>
            <h3>{totalOrders}</h3>
            <p>Completed / Finished Orders</p>
          </div>
        </div>

        <div className="van-stat-card">
          <div className="van-stat-icon blue">
            <FiTrendingUp />
          </div>
          <div>
            <h3>LKR {avgOrderValue}</h3>
            <p>Avg Order Value</p>
          </div>
        </div>

        <div className="van-stat-card">
          <div className="van-stat-icon purple">
            <FiCreditCard />
          </div>
          <div>
            <h3>{filteredPayments.length}</h3>
            <p>Payment Records</p>
          </div>
        </div>
      </div>

      <div className="van-insight-grid">
        <div className="van-insight-card">
          <h4>Order Type Breakdown</h4>
          <div className="van-breakdown-row">
            <span>Takeaway Orders</span>
            <strong>{takeawayOrders.length}</strong>
          </div>
          <div className="van-breakdown-row">
            <span>Takeaway Revenue</span>
            <strong>LKR {takeawayRevenue.toFixed(2)}</strong>
          </div>
          <div className="van-breakdown-row">
            <span>Delivery Orders</span>
            <strong>{deliveryOrders.length}</strong>
          </div>
          <div className="van-breakdown-row">
            <span>Delivery Revenue</span>
            <strong>LKR {deliveryRevenue.toFixed(2)}</strong>
          </div>
        </div>

        <div className="van-insight-card">
          <h4>Payment Status</h4>
          <div className="van-breakdown-row">
            <span>Paid Payments</span>
            <strong>{paidPayments.length}</strong>
          </div>
          <div className="van-breakdown-row">
            <span>Pending Payments</span>
            <strong>{pendingPayments.length}</strong>
          </div>
          <div className="van-breakdown-row">
            <span>Total Payment Records</span>
            <strong>{filteredPayments.length}</strong>
          </div>
        </div>

        <div className="van-insight-card">
          <h4>Top Payment Methods</h4>
          {paymentMethodStats.length === 0 ? (
            <p className="van-empty-text">No payment data.</p>
          ) : (
            paymentMethodStats.slice(0, 3).map((method) => (
              <div className="van-breakdown-row" key={method.method}>
                <span>{method.method}</span>
                <strong>LKR {method.total.toFixed(2)}</strong>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="van-chart-card">
        <div className="van-chart-head">
          <div className="van-chart-title">
            <FiBarChart2 />
            <h3>{rangeLabelMap[rangeFilter]} Revenue Trend</h3>
          </div>
          <span className="van-chart-subtitle">
            Daily revenue from completed and finished orders
          </span>
        </div>

        {dailyChartData.length === 0 ? (
          <div className="van-info-box">No chart data available.</div>
        ) : (
          <div className="van-chart-wrap">
            {dailyChartData.map((item) => (
              <div className="van-chart-col" key={item.date}>
                <div className="van-chart-top">
                  <span className="van-chart-value">
                    LKR {item.revenue.toFixed(0)}
                  </span>
                  <span className="van-chart-orders">
                    {item.orders} order{item.orders > 1 ? "s" : ""}
                  </span>
                </div>

                <ThreeDBar revenue={item.revenue} maxRevenue={maxRevenue} />

                <span className="van-chart-label">{item.shortDate}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="van-bottom-grid">
        <div className="van-panel-card">
          <div className="van-panel-head">
            <FiPackage />
            <h3>Top Selling Items</h3>
          </div>

          {topItems.length === 0 ? (
            <p className="van-empty-text">No item data available.</p>
          ) : (
            <div className="van-list-wrap">
              {topItems.map((item, index) => (
                <div className="van-list-row" key={item.name}>
                  <div>
                    <strong>
                      {index + 1}. {item.name}
                    </strong>
                    <span>{item.qty} items sold</span>
                  </div>
                  <b>LKR {item.revenue.toFixed(2)}</b>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="van-panel-card">
          <div className="van-panel-head">
            <FiCheckCircle />
            <h3>Payment Method Breakdown</h3>
          </div>

          {paymentMethodStats.length === 0 ? (
            <p className="van-empty-text">No payment method data.</p>
          ) : (
            <div className="van-list-wrap">
              {paymentMethodStats.map((item) => (
                <div className="van-list-row" key={item.method}>
                  <div>
                    <strong>{item.method}</strong>
                    <span>{item.count} payments</span>
                  </div>
                  <b>LKR {item.total.toFixed(2)}</b>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="van-panel-card">
          <div className="van-panel-head">
            <FiClock />
            <h3>Quick Summary</h3>
          </div>

          <div className="van-list-wrap">
            <div className="van-list-row">
              <div>
                <strong>Completed / Finished Orders</strong>
                <span>Current selected range</span>
              </div>
              <b>{totalOrders}</b>
            </div>

            <div className="van-list-row">
              <div>
                <strong>Total Revenue</strong>
                <span>Completed and finished orders</span>
              </div>
              <b>LKR {totalRevenue.toFixed(2)}</b>
            </div>

            <div className="van-list-row">
              <div>
                <strong>Paid Payments</strong>
                <span>From payment records</span>
              </div>
              <b>{paidPayments.length}</b>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="van-info-box">Loading analytics data...</div>}
    </section>
  );
}