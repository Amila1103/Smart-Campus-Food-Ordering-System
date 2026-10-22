import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiCreditCard,
  FiDollarSign,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiHash,
  FiCalendar,
  FiBarChart2,
} from "react-icons/fi";
import "./AdminPayments.css";

const ADMIN_PAYMENTS_API = "http://localhost:5000/payment";

export default function AdminPayments() {
  const [adminPayments, setAdminPayments] = useState([]);
  const [adminPaymentsLoading, setAdminPaymentsLoading] = useState(true);
  const [adminPaymentsMessage, setAdminPaymentsMessage] = useState({
    type: "",
    text: "",
  });
  const [adminPaymentsSearch, setAdminPaymentsSearch] = useState("");
  const [adminPaymentStatusFilter, setAdminPaymentStatusFilter] =
    useState("All");
  const [adminPaymentMethodFilter, setAdminPaymentMethodFilter] =
    useState("All");

  const pieColors = ["#2E7D32", "#66BB6A", "#FF9800", "#81C784", "#FFA726"];
  const pieDepthColors = ["#1B5E20", "#388E3C", "#E67E00", "#5DA567", "#F57C00"];

  const showAdminPaymentsMessage = (type, text) => {
    setAdminPaymentsMessage({ type, text });
    setTimeout(() => {
      setAdminPaymentsMessage({ type: "", text: "" });
    }, 2500);
  };

  const fetchAdminPayments = async () => {
    try {
      setAdminPaymentsLoading(true);
      const res = await axios.get(ADMIN_PAYMENTS_API);
      setAdminPayments(res.data?.payments || []);
    } catch (error) {
      console.log("Fetch payments error:", error);
      showAdminPaymentsMessage(
        "error",
        error.response?.data?.message || "Failed to fetch payments."
      );
    } finally {
      setAdminPaymentsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminPayments();
  }, []);

  const filteredAdminPayments = useMemo(() => {
    return adminPayments.filter((payment) => {
      const search = adminPaymentsSearch.toLowerCase();

      const matchesSearch =
        payment.paymentId?.toLowerCase().includes(search) ||
        payment.orderId?.toLowerCase().includes(search) ||
        payment.customerName?.toLowerCase().includes(search) ||
        payment.gmail?.toLowerCase().includes(search) ||
        payment.phoneNumber?.toLowerCase().includes(search);

      const matchesStatus =
        adminPaymentStatusFilter === "All"
          ? true
          : payment.paymentStatus === adminPaymentStatusFilter;

      const matchesMethod =
        adminPaymentMethodFilter === "All"
          ? true
          : payment.paymentMethod === adminPaymentMethodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [
    adminPayments,
    adminPaymentsSearch,
    adminPaymentStatusFilter,
    adminPaymentMethodFilter,
  ]);

  const adminTotalPayments = adminPayments.length;

  const adminPaidPayments = adminPayments.filter(
    (item) => item.paymentStatus?.toLowerCase() === "paid"
  ).length;

  const adminTotalRevenue = adminPayments.reduce(
    (sum, item) => sum + Number(item.grandTotal || 0),
    0
  );

  const adminMethodCounts = useMemo(() => {
    const counts = {};

    adminPayments.forEach((item) => {
      const method = item.paymentMethod || "Unknown";
      counts[method] = (counts[method] || 0) + 1;
    });

    return counts;
  }, [adminPayments]);

  const adminMethodGraphData = useMemo(() => {
    const total = Object.values(adminMethodCounts).reduce(
      (sum, value) => sum + value,
      0
    );

    return Object.entries(adminMethodCounts).map(([label, value], index) => ({
      label,
      value,
      percentage: total > 0 ? ((value / total) * 100).toFixed(1) : "0.0",
      color: pieColors[index % pieColors.length],
      depthColor: pieDepthColors[index % pieDepthColors.length],
    }));
  }, [adminMethodCounts]);

  const pieSegments = useMemo(() => {
    const total = adminMethodGraphData.reduce((sum, item) => sum + item.value, 0);
    if (!total) return [];

    let currentAngle = 0;

    return adminMethodGraphData.map((item) => {
      const sweep = (item.value / total) * 360;
      const segment = {
        ...item,
        startAngle: currentAngle,
        endAngle: currentAngle + sweep,
      };
      currentAngle += sweep;
      return segment;
    });
  }, [adminMethodGraphData]);

  return (
    <section className="adpay-wrapper">
      <div className="adpay-topbar">
        <div>
          <span className="adpay-badge">Payments</span>
          <h2>Payment Management</h2>
          <p>View all saved payments, totals, methods, and revenue details.</p>
        </div>

        <button className="adpay-refresh-btn" onClick={fetchAdminPayments}>
          <FiRefreshCw />
          <span>Refresh</span>
        </button>
      </div>

      {adminPaymentsMessage.text && (
        <div className={`adpay-toast ${adminPaymentsMessage.type}`}>
          {adminPaymentsMessage.text}
        </div>
      )}

      <div className="adpay-stats">
        <div className="adpay-stat-card">
          <div className="adpay-stat-icon green">
            <FiCreditCard />
          </div>
          <div>
            <h3>{adminTotalPayments}</h3>
            <p>Total Payments</p>
          </div>
        </div>

        <div className="adpay-stat-card">
          <div className="adpay-stat-icon orange">
            <FiCheckCircle />
          </div>
          <div>
            <h3>{adminPaidPayments}</h3>
            <p>Paid Payments</p>
          </div>
        </div>

        <div className="adpay-stat-card">
          <div className="adpay-stat-icon green-outline">
            <FiBarChart2 />
          </div>
          <div>
            <h3>{adminMethodGraphData.length}</h3>
            <p>Payment Methods</p>
          </div>
        </div>

        <div className="adpay-stat-card">
          <div className="adpay-stat-icon green">
            <FiDollarSign />
          </div>
          <div>
            <h3>LKR {adminTotalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="adpay-chart-layout">
        <div className="adpay-graph-card">
          <div className="adpay-graph-head">
            <div>
              <h3>Payment Method Overview</h3>
              <p>Distribution of saved payments by method</p>
            </div>

            <div className="adpay-graph-mini-badge">
              <FiBarChart2 />
              <span>3D Pie Chart</span>
            </div>
          </div>

          {adminMethodGraphData.length === 0 ? (
            <div className="adpay-info-box">No chart data available.</div>
          ) : (
            <div className="adpay-pie-layout">
              <div className="adpay-pie-wrap">
                <div className="adpay-pie-scene">
                  <div className="adpay-pie-shadow"></div>

                  {pieSegments.map((segment) => (
                    <div
                      key={`${segment.label}-depth`}
                      className="adpay-pie-segment adpay-pie-segment-depth"
                      style={{
                        background: `conic-gradient(
                          transparent 0deg ${segment.startAngle}deg,
                          ${segment.depthColor} ${segment.startAngle}deg ${segment.endAngle}deg,
                          transparent ${segment.endAngle}deg 360deg
                        )`,
                      }}
                    />
                  ))}

                  {pieSegments.map((segment) => (
                    <div
                      key={`${segment.label}-top`}
                      className="adpay-pie-segment adpay-pie-segment-top"
                      style={{
                        background: `conic-gradient(
                          transparent 0deg ${segment.startAngle}deg,
                          ${segment.color} ${segment.startAngle}deg ${segment.endAngle}deg,
                          transparent ${segment.endAngle}deg 360deg
                        )`,
                      }}
                    />
                  ))}

                  <div className="adpay-pie-gloss"></div>
                </div>

                <div className="adpay-pie-total-badge">
                  <strong>{adminTotalPayments}</strong>
                  <span>Total Payments</span>
                </div>
              </div>

              <div className="adpay-pie-legend">
                {adminMethodGraphData.map((item) => (
                  <div className="adpay-pie-legend-item" key={item.label}>
                    <div className="adpay-pie-legend-left">
                      <span
                        className="adpay-pie-legend-dot"
                        style={{ background: item.color }}
                      ></span>
                      <div>
                        <h4>{item.label}</h4>
                        <p>{item.percentage}% of total payments</p>
                      </div>
                    </div>

                    <div className="adpay-pie-legend-value">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="adpay-summary-card">
          <h3>Revenue Summary</h3>

          <div className="adpay-summary-item">
            <span>Total Payments</span>
            <strong>{adminTotalPayments}</strong>
          </div>

          <div className="adpay-summary-item">
            <span>Successful Payments</span>
            <strong>{adminPaidPayments}</strong>
          </div>

          <div className="adpay-summary-item">
            <span>Total Revenue</span>
            <strong>LKR {adminTotalRevenue.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      <div className="adpay-toolbar">
        <div className="adpay-searchbox">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by payment ID, order ID, customer, email..."
            value={adminPaymentsSearch}
            onChange={(e) => setAdminPaymentsSearch(e.target.value)}
          />
        </div>

        <select
          className="adpay-select"
          value={adminPaymentStatusFilter}
          onChange={(e) => setAdminPaymentStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Paid">Paid</option>
        </select>

        <select
          className="adpay-select"
          value={adminPaymentMethodFilter}
          onChange={(e) => setAdminPaymentMethodFilter(e.target.value)}
        >
          <option value="All">All Methods</option>
          <option value="Cash on Delivery">Cash on Delivery</option>
          <option value="Card">Card</option>
          <option value="Online Payment">Online Payment</option>
        </select>
      </div>

      {adminPaymentsLoading ? (
        <div className="adpay-info-box">Loading payment data...</div>
      ) : filteredAdminPayments.length === 0 ? (
        <div className="adpay-info-box">No payments found.</div>
      ) : (
        <div className="adpay-grid">
          {filteredAdminPayments.map((payment) => (
            <div className="adpay-card" key={payment._id || payment.paymentId}>
              <div className="adpay-card-top">
                <div>
                  <h3>{payment.paymentId}</h3>
                  <p>Order ID: {payment.orderId}</p>
                </div>

                <span className="adpay-status paid">
                  {payment.paymentStatus || "Paid"}
                </span>
              </div>

              <div className="adpay-info-grid">
                <div className="adpay-info-item">
                  <span>
                    <FiUser className="adpay-inline-icon" />
                    Customer
                  </span>
                  <strong>{payment.customerName || "-"}</strong>
                </div>

                <div className="adpay-info-item">
                  <span>
                    <FiMail className="adpay-inline-icon" />
                    Email
                  </span>
                  <strong>{payment.gmail || "-"}</strong>
                </div>

                <div className="adpay-info-item">
                  <span>
                    <FiPhone className="adpay-inline-icon" />
                    Phone
                  </span>
                  <strong>{payment.phoneNumber || "-"}</strong>
                </div>

                <div className="adpay-info-item">
                  <span>
                    <FiCreditCard className="adpay-inline-icon" />
                    Method
                  </span>
                  <strong>{payment.paymentMethod || "-"}</strong>
                </div>
              </div>

              <div className="adpay-amount-grid">
                <div className="adpay-amount-item">
                  <span>Total Amount</span>
                  <strong>LKR {Number(payment.totalAmount || 0).toFixed(2)}</strong>
                </div>

                <div className="adpay-amount-item">
                  <span>Delivery Fee</span>
                  <strong>LKR {Number(payment.deliveryFee || 0).toFixed(2)}</strong>
                </div>

                <div className="adpay-amount-item">
                  <span>Discount</span>
                  <strong>LKR {Number(payment.discount || 0).toFixed(2)}</strong>
                </div>

                <div className="adpay-amount-item adpay-grand-total">
                  <span>Grand Total</span>
                  <strong>LKR {Number(payment.grandTotal || 0).toFixed(2)}</strong>
                </div>
              </div>

              <div className="adpay-meta-row">
                <div className="adpay-meta-chip">
                  <FiHash className="adpay-inline-icon" />
                  Invoice: {payment.invoiceNo || "-"}
                </div>

                <div className="adpay-meta-chip">
                  <FiCalendar className="adpay-inline-icon" />
                  Date: {payment.invoiceDate || "-"}
                </div>

                <div className="adpay-meta-chip">
                  Order Status: {payment.orderStatus || "-"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}