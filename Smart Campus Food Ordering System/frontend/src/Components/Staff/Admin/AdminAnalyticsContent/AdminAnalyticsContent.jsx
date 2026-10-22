import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiBarChart2,
  FiDollarSign,
  FiShoppingBag,
  FiTruck,
  FiCreditCard,
  FiRefreshCw,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
} from "react-icons/fi";
import "./AdminAnalyticsContent.css";

const PAYMENT_API = "http://localhost:5000/payment";
const COMPLETED_ORDERS_API = "http://localhost:5000/completed-orders";
const FINISHED_DELIVERY_API = "http://localhost:5000/delivery-fenish";

export default function AdminAnalyticsContent() {
  const [anaPayments, setAnaPayments] = useState([]);
  const [anaCompletedOrders, setAnaCompletedOrders] = useState([]);
  const [anaFinishedDeliveries, setAnaFinishedDeliveries] = useState([]);
  const [anaLoading, setAnaLoading] = useState(true);
  const [anaMessage, setAnaMessage] = useState({ type: "", text: "" });

  const showAnaMessage = (type, text) => {
    setAnaMessage({ type, text });
    setTimeout(() => {
      setAnaMessage({ type: "", text: "" });
    }, 3000);
  };

  const fetchAnalyticsData = async () => {
    try {
      setAnaLoading(true);

      const staffToken = localStorage.getItem("staffToken");

      const paymentRequest = axios.get(PAYMENT_API);
      const completedOrdersRequest = axios.get(COMPLETED_ORDERS_API);

      const finishedDeliveryRequest = axios.get(FINISHED_DELIVERY_API, {
        headers: staffToken
          ? {
              Authorization: `Bearer ${staffToken}`,
            }
          : {},
      });

      const [paymentRes, completedRes, finishedRes] = await Promise.allSettled([
        paymentRequest,
        completedOrdersRequest,
        finishedDeliveryRequest,
      ]);

      if (paymentRes.status === "fulfilled") {
        setAnaPayments(paymentRes.value.data?.payments || []);
      } else {
        setAnaPayments([]);
      }

      if (completedRes.status === "fulfilled") {
        setAnaCompletedOrders(
          completedRes.value.data?.completedOrders ||
            completedRes.value.data?.orders ||
            []
        );
      } else {
        setAnaCompletedOrders([]);
      }

      if (finishedRes.status === "fulfilled") {
        setAnaFinishedDeliveries(finishedRes.value.data?.finishedOrders || []);
      } else {
        setAnaFinishedDeliveries([]);
        showAnaMessage(
          "warning",
          "Finished delivery analytics could not be loaded. Check staff token/authorization."
        );
      }
    } catch (error) {
      console.log("Analytics fetch error:", error);
      showAnaMessage("error", "Failed to load analytics data.");
    } finally {
      setAnaLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const totalRevenue = useMemo(
    () =>
      anaPayments.reduce(
        (sum, item) => sum + Number(item.grandTotal || 0),
        0
      ),
    [anaPayments]
  );

  const totalCompletedRevenue = useMemo(
    () =>
      anaCompletedOrders.reduce(
        (sum, item) => sum + Number(item.grandTotal || 0),
        0
      ),
    [anaCompletedOrders]
  );

  const totalFinishedDeliveryRevenue = useMemo(
    () =>
      anaFinishedDeliveries.reduce(
        (sum, item) => sum + Number(item.grandTotal || 0),
        0
      ),
    [anaFinishedDeliveries]
  );

  const paidPayments = useMemo(
    () =>
      anaPayments.filter(
        (item) => item.paymentStatus?.toLowerCase() === "paid"
      ).length,
    [anaPayments]
  );

  const pendingPayments = useMemo(
    () =>
      anaPayments.filter(
        (item) => item.paymentStatus?.toLowerCase() === "pending"
      ).length,
    [anaPayments]
  );

  const paymentMethodData = useMemo(() => {
    const grouped = {};
    anaPayments.forEach((item) => {
      const key = item.paymentMethod || "Unknown";
      grouped[key] = (grouped[key] || 0) + 1;
    });

    const rows = Object.entries(grouped).map(([label, value]) => ({
      label,
      value,
    }));

    const max = Math.max(...rows.map((r) => r.value), 1);

    return rows.map((row) => ({
      ...row,
      width: (row.value / max) * 100,
    }));
  }, [anaPayments]);

  const paymentStatusData = useMemo(() => {
    const grouped = {};
    anaPayments.forEach((item) => {
      const key = item.paymentStatus || "Unknown";
      grouped[key] = (grouped[key] || 0) + 1;
    });

    const rows = Object.entries(grouped).map(([label, value]) => ({
      label,
      value,
    }));

    const max = Math.max(...rows.map((r) => r.value), 1);

    return rows.map((row) => ({
      ...row,
      width: (row.value / max) * 100,
    }));
  }, [anaPayments]);

  const orderTypeData = useMemo(() => {
    const grouped = {};
    anaCompletedOrders.forEach((item) => {
      const key = item.orderType || "Unknown";
      grouped[key] = (grouped[key] || 0) + 1;
    });

    const rows = Object.entries(grouped).map(([label, value]) => ({
      label,
      value,
    }));

    const max = Math.max(...rows.map((r) => r.value), 1);

    return rows.map((row) => ({
      ...row,
      width: (row.value / max) * 100,
    }));
  }, [anaCompletedOrders]);

  const topCustomers = useMemo(() => {
    const grouped = {};
    anaPayments.forEach((item) => {
      const key = item.customerName || "Unknown Customer";
      grouped[key] = (grouped[key] || 0) + Number(item.grandTotal || 0);
    });

    return Object.entries(grouped)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [anaPayments]);

  const deliveryStaffData = useMemo(() => {
    const grouped = {};
    anaFinishedDeliveries.forEach((item) => {
      const key = item.deliveredByStaffName || "Unknown Staff";
      grouped[key] = (grouped[key] || 0) + 1;
    });

    const rows = Object.entries(grouped).map(([label, value]) => ({
      label,
      value,
    }));

    const max = Math.max(...rows.map((r) => r.value), 1);

    return rows.map((row) => ({
      ...row,
      width: (row.value / max) * 100,
    }));
  }, [anaFinishedDeliveries]);

  const analyticsOverview = useMemo(() => {
    const values = [
      { label: "Paid", value: paidPayments },
      { label: "Pending", value: pendingPayments },
      { label: "Completed Orders", value: anaCompletedOrders.length },
      { label: "Finished Deliveries", value: anaFinishedDeliveries.length },
    ];

    const total = values.reduce((sum, item) => sum + item.value, 0);

    if (!total) {
      return {
        values: [],
        topGradient: "conic-gradient(#f5f5f5 0deg 360deg)",
        depthGradient: "conic-gradient(#e7e7e7 0deg 360deg)",
      };
    }

    const topColors = ["#2E7D32", "#FF9800", "#66BB6A", "#FFB74D"];
    const depthColors = ["#1B5E20", "#E67E00", "#388E3C", "#F57C00"];

    let start = 0;

    const mapped = values.map((item, index) => {
      const angle = (item.value / total) * 360;
      const end = start + angle;
      const topColor = topColors[index];
      const depthColor = depthColors[index];
      const mappedItem = {
        ...item,
        topColor,
        depthColor,
        topSegment: `${topColor} ${start}deg ${end}deg`,
        depthSegment: `${depthColor} ${start}deg ${end}deg`,
      };
      start = end;
      return mappedItem;
    });

    return {
      values: mapped,
      topGradient: `conic-gradient(${mapped
        .map((item) => item.topSegment)
        .join(", ")})`,
      depthGradient: `conic-gradient(${mapped
        .map((item) => item.depthSegment)
        .join(", ")})`,
    };
  }, [
    paidPayments,
    pendingPayments,
    anaCompletedOrders.length,
    anaFinishedDeliveries.length,
  ]);

  return (
    <section className="adanalytics-wrapper">
      <div className="adanalytics-topbar">
        <div>
          <span className="adanalytics-badge">Analytics</span>
          <h2>Business Analytics Dashboard</h2>
          <p>
            Revenue, payment, completed orders, and delivery performance in one
            view.
          </p>
        </div>

        <button className="adanalytics-refresh-btn" onClick={fetchAnalyticsData}>
          <FiRefreshCw />
          <span>Refresh</span>
        </button>
      </div>

      {anaMessage.text && (
        <div className={`adanalytics-toast ${anaMessage.type}`}>
          {anaMessage.text}
        </div>
      )}

      {anaLoading ? (
        <div className="adanalytics-info-box">Loading analytics...</div>
      ) : (
        <>
          <div className="adanalytics-stats-grid">
            <div className="adanalytics-stat-card">
              <div className="adanalytics-stat-icon green">
                <FiDollarSign />
              </div>
              <div>
                <p>Total Payment Revenue</p>
                <h3>LKR {totalRevenue.toFixed(2)}</h3>
              </div>
            </div>

            <div className="adanalytics-stat-card">
              <div className="adanalytics-stat-icon orange">
                <FiShoppingBag />
              </div>
              <div>
                <p>Completed Orders</p>
                <h3>{anaCompletedOrders.length}</h3>
              </div>
            </div>

            <div className="adanalytics-stat-card">
              <div className="adanalytics-stat-icon green">
                <FiTruck />
              </div>
              <div>
                <p>Finished Deliveries</p>
                <h3>{anaFinishedDeliveries.length}</h3>
              </div>
            </div>

            <div className="adanalytics-stat-card">
              <div className="adanalytics-stat-icon orange">
                <FiCreditCard />
              </div>
              <div>
                <p>Paid Payments</p>
                <h3>{paidPayments}</h3>
              </div>
            </div>

            <div className="adanalytics-stat-card">
              <div className="adanalytics-stat-icon yellow">
                <FiClock />
              </div>
              <div>
                <p>Pending Payments</p>
                <h3>{pendingPayments}</h3>
              </div>
            </div>

            <div className="adanalytics-stat-card">
              <div className="adanalytics-stat-icon green">
                <FiTrendingUp />
              </div>
              <div>
                <p>Completed Revenue</p>
                <h3>LKR {totalCompletedRevenue.toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className="adanalytics-chart-hero">
            <div className="adanalytics-donut-card">
              <div className="adanalytics-panel-head">
                <h3>
                  <FiBarChart2 />
                  Overall Activity Split
                </h3>
                <span>Quick visual breakdown</span>
              </div>

              <div className="adanalytics-donut-layout">
                <div className="adanalytics-donut-3d-wrap">
                  <div className="adanalytics-donut-3d-shadow"></div>

                  <div
                    className="adanalytics-donut-chart adanalytics-donut-depth"
                    style={{ background: analyticsOverview.depthGradient }}
                  ></div>

                  <div
                    className="adanalytics-donut-chart adanalytics-donut-top"
                    style={{ background: analyticsOverview.topGradient }}
                  >
                    <div className="adanalytics-donut-center">
                      <strong>
                        {paidPayments +
                          pendingPayments +
                          anaCompletedOrders.length +
                          anaFinishedDeliveries.length}
                      </strong>
                      <span>Total Records</span>
                    </div>
                  </div>

                  <div className="adanalytics-donut-gloss"></div>
                </div>

                <div className="adanalytics-donut-legend">
                  {analyticsOverview.values.map((item, index) => (
                    <div className="adanalytics-legend-item" key={item.label}>
                      <span
                        className="adanalytics-legend-dot"
                        style={{ background: item.topColor }}
                      ></span>
                      <div className="adanalytics-legend-text">
                        <strong>{item.label}</strong>
                        <span>{item.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="adanalytics-summary-card">
              <div className="adanalytics-panel-head">
                <h3>
                  <FiDollarSign />
                  Revenue Summary
                </h3>
              </div>

              <div className="adanalytics-summary-list">
                <div className="adanalytics-summary-item">
                  <span>Total Payment Revenue</span>
                  <strong>LKR {totalRevenue.toFixed(2)}</strong>
                </div>
                <div className="adanalytics-summary-item">
                  <span>Completed Orders Revenue</span>
                  <strong>LKR {totalCompletedRevenue.toFixed(2)}</strong>
                </div>
                <div className="adanalytics-summary-item">
                  <span>Finished Delivery Revenue</span>
                  <strong>LKR {totalFinishedDeliveryRevenue.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="adanalytics-panel-grid">
            <div className="adanalytics-panel-card">
              <div className="adanalytics-panel-head">
                <h3>
                  <FiCreditCard />
                  Payment Methods
                </h3>
                <span>{anaPayments.length} payments</span>
              </div>

              <div className="adanalytics-bar-list">
                {paymentMethodData.length > 0 ? (
                  paymentMethodData.map((item, index) => (
                    <div className="adanalytics-bar-row" key={item.label}>
                      <div className="adanalytics-bar-label-wrap">
                        <span
                          className={`adanalytics-legend-dot adanalytics-dot-${
                            (index % 4) + 1
                          }`}
                        ></span>
                        <div className="adanalytics-bar-label">{item.label}</div>
                      </div>
                      <div className="adanalytics-bar-track">
                        <div
                          className="adanalytics-bar-fill green-fill"
                          style={{ width: `${item.width}%` }}
                        ></div>
                      </div>
                      <div className="adanalytics-bar-value">{item.value}</div>
                    </div>
                  ))
                ) : (
                  <p className="adanalytics-empty-text">No payment data available.</p>
                )}
              </div>
            </div>

            <div className="adanalytics-panel-card">
              <div className="adanalytics-panel-head">
                <h3>
                  <FiCheckCircle />
                  Payment Status
                </h3>
                <span>Current breakdown</span>
              </div>

              <div className="adanalytics-bar-list">
                {paymentStatusData.length > 0 ? (
                  paymentStatusData.map((item) => (
                    <div className="adanalytics-bar-row" key={item.label}>
                      <div className="adanalytics-bar-label">{item.label}</div>
                      <div className="adanalytics-bar-track">
                        <div
                          className="adanalytics-bar-fill orange-fill"
                          style={{ width: `${item.width}%` }}
                        ></div>
                      </div>
                      <div className="adanalytics-bar-value">{item.value}</div>
                    </div>
                  ))
                ) : (
                  <p className="adanalytics-empty-text">No status data available.</p>
                )}
              </div>
            </div>

            <div className="adanalytics-panel-card">
              <div className="adanalytics-panel-head">
                <h3>
                  <FiShoppingBag />
                  Completed Order Types
                </h3>
                <span>Order type distribution</span>
              </div>

              <div className="adanalytics-bar-list">
                {orderTypeData.length > 0 ? (
                  orderTypeData.map((item) => (
                    <div className="adanalytics-bar-row" key={item.label}>
                      <div className="adanalytics-bar-label">{item.label}</div>
                      <div className="adanalytics-bar-track">
                        <div
                          className="adanalytics-bar-fill green-fill"
                          style={{ width: `${item.width}%` }}
                        ></div>
                      </div>
                      <div className="adanalytics-bar-value">{item.value}</div>
                    </div>
                  ))
                ) : (
                  <p className="adanalytics-empty-text">No completed order data available.</p>
                )}
              </div>
            </div>

            <div className="adanalytics-panel-card">
              <div className="adanalytics-panel-head">
                <h3>
                  <FiTruck />
                  Delivery Staff Performance
                </h3>
                <span>Finished delivery count</span>
              </div>

              <div className="adanalytics-bar-list">
                {deliveryStaffData.length > 0 ? (
                  deliveryStaffData.map((item) => (
                    <div className="adanalytics-bar-row" key={item.label}>
                      <div className="adanalytics-bar-label">{item.label}</div>
                      <div className="adanalytics-bar-track">
                        <div
                          className="adanalytics-bar-fill orange-fill"
                          style={{ width: `${item.width}%` }}
                        ></div>
                      </div>
                      <div className="adanalytics-bar-value">{item.value}</div>
                    </div>
                  ))
                ) : (
                  <p className="adanalytics-empty-text">
                    No finished delivery data available.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="adanalytics-bottom-grid">
            <div className="adanalytics-summary-card">
              <div className="adanalytics-panel-head">
                <h3>
                  <FiBarChart2 />
                  Top Customers
                </h3>
              </div>

              <div className="adanalytics-summary-list">
                {topCustomers.length > 0 ? (
                  topCustomers.map((customer, index) => (
                    <div className="adanalytics-summary-item" key={index}>
                      <span>{customer.name}</span>
                      <strong>LKR {customer.amount.toFixed(2)}</strong>
                    </div>
                  ))
                ) : (
                  <p className="adanalytics-empty-text">No customer revenue data available.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}