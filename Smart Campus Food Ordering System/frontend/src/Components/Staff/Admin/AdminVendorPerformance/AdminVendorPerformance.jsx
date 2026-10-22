import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaStore,
  FaStar,
  FaCheckCircle,
  FaMoneyBillWave,
  FaSyncAlt,
  FaSearch,
  FaChartLine,
  FaUserTie,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./AdminVendorPerformance.css";

const API_BASE = "http://localhost:5000";

export default function AdminVendorPerformance() {
  const [vendors, setVendors] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  const getToken = () => {
    return (
      localStorage.getItem("staffToken") ||
      JSON.parse(localStorage.getItem("activeStaff") || "null")?.token ||
      JSON.parse(localStorage.getItem("staff") || "null")?.token ||
      ""
    );
  };

  const safeNumber = (value) => {
    const num = Number(value || 0);
    return Number.isFinite(num) ? num : 0;
  };

  const normalizeText = (value) => String(value || "").trim().toLowerCase();

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Staff token not found. Please login again.");
        setLoading(false);
        return;
      }

      const authConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [staffRes, ratingRes, completedRes, complaintRes, paymentRes] =
        await Promise.all([
          axios.get(`${API_BASE}/staffs`, authConfig),
          axios.get(`${API_BASE}/order-ratings`),
          axios.get(`${API_BASE}/completed-orders`, authConfig),
          axios.get(`${API_BASE}/complaints`),
          axios.get(`${API_BASE}/payment`),
        ]);

      const allStaffs = Array.isArray(staffRes.data?.staffs)
        ? staffRes.data.staffs
        : [];

      const vendorStaffs = allStaffs.filter(
        (item) => normalizeText(item.role) === "vendor"
      );

      setVendors(vendorStaffs);
      setRatings(Array.isArray(ratingRes.data?.ratings) ? ratingRes.data.ratings : []);
      setCompletedOrders(
        Array.isArray(completedRes.data?.completedOrders)
          ? completedRes.data.completedOrders
          : []
      );
      setComplaints(
        Array.isArray(complaintRes.data?.complaints)
          ? complaintRes.data.complaints
          : []
      );
      setPayments(
        Array.isArray(paymentRes.data?.payments) ? paymentRes.data.payments : []
      );
    } catch (err) {
      console.log("fetchAllData error:", err);
      console.log("fetchAllData response:", err?.response?.data);
      setError(
        err?.response?.data?.message ||
          "Failed to load vendor performance data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const globalMetrics = useMemo(() => {
    const totalOrders = completedOrders.length;

    const finishedOrders = completedOrders.filter(
      (order) => normalizeText(order?.orderStatus) === "finished"
    );

    const totalFinished = finishedOrders.length;
    const totalRatings = ratings.length;
    const totalComplaints = complaints.length;
    const totalPayments = payments.length;

    const revenueFromFinishedOrders = finishedOrders.reduce(
      (sum, item) => sum + safeNumber(item?.grandTotal),
      0
    );

    const revenueFromPayments = payments.reduce(
      (sum, item) => sum + safeNumber(item?.grandTotal),
      0
    );

    const revenue =
      revenueFromPayments > 0 ? revenueFromPayments : revenueFromFinishedOrders;

    const avgRating =
      totalRatings > 0
        ? ratings.reduce((sum, item) => sum + safeNumber(item?.rating), 0) /
          totalRatings
        : 0;

    const successRate =
      totalOrders > 0 ? (totalFinished / totalOrders) * 100 : 0;

    const complaintRate =
      totalFinished > 0 ? (totalComplaints / totalFinished) * 100 : 0;

    const reliabilityScore = Math.max(0, 100 - complaintRate);

    const paymentScore =
      totalFinished > 0
        ? Math.min((totalPayments / totalFinished) * 10, 10)
        : 0;

    const finalScore = Math.round(
      (avgRating / 5) * 35 +
        (successRate / 100) * 35 +
        (reliabilityScore / 100) * 20 +
        paymentScore
    );

    let performanceLabel = "Needs Improvement";
    if (finalScore >= 85) performanceLabel = "Excellent";
    else if (finalScore >= 70) performanceLabel = "Good";
    else if (finalScore >= 55) performanceLabel = "Average";

    return {
      totalOrders,
      totalFinished,
      totalRatings,
      totalComplaints,
      totalPayments,
      revenue,
      avgRating,
      successRate,
      finalScore,
      performanceLabel,
    };
  }, [completedOrders, ratings, complaints, payments]);

  const vendorRows = useMemo(() => {
    const rows = vendors.map((vendor) => ({
      ...vendor,
      metrics: globalMetrics,
    }));

    const q = searchText.trim().toLowerCase();

    return rows.filter((item) => {
      if (!q) return true;

      return (
        String(item?.name || "").toLowerCase().includes(q) ||
        String(item?.email || "").toLowerCase().includes(q) ||
        String(item?.phone || "").toLowerCase().includes(q)
      );
    });
  }, [vendors, globalMetrics, searchText]);

  const summary = useMemo(() => {
    const totalVendors = vendorRows.length;

    return {
      totalVendors,
      totalRevenue: globalMetrics.revenue,
      avgScore: globalMetrics.finalScore,
      highPerformers: globalMetrics.finalScore >= 85 ? totalVendors : 0,
    };
  }, [vendorRows, globalMetrics]);

  const topVendor = useMemo(() => {
    return vendorRows.length > 0 ? vendorRows[0] : null;
  }, [vendorRows]);

  const getBadgeClass = (label) => {
    const safe = String(label || "").toLowerCase();

    if (safe.includes("excellent")) return "avp-badge excellent";
    if (safe.includes("good")) return "avp-badge good";
    if (safe.includes("average")) return "avp-badge average";
    return "avp-badge low";
  };

  if (loading) {
    return (
      <div className="avp-page">
        <div className="avp-loading-card">
          <FaSyncAlt className="avp-spin" />
          <h2>Loading vendor performance...</h2>
          <p>Please wait while data is being prepared.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="avp-page">
      <section className="avp-hero">
        <div className="avp-hero-left">
          <span className="avp-hero-tag">Admin Vendor Insights</span>
          <h1>Automated Vendor Performance Scoring</h1>
          <p>
            Review vendor ratings, finished orders, complaints, and payment
            contribution in one professional dashboard.
          </p>
        </div>

        <button className="avp-refresh-btn" onClick={fetchAllData} type="button">
          <FaSyncAlt />
          Refresh Data
        </button>
      </section>

      {error && (
        <div className="avp-error-box">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}

      <section className="avp-summary-grid">
        <div className="avp-summary-card">
          <div className="avp-summary-icon">
            <FaStore />
          </div>
          <div>
            <h3>{summary.totalVendors}</h3>
            <p>Total Vendors</p>
          </div>
        </div>

        <div className="avp-summary-card">
          <div className="avp-summary-icon orange">
            <FaChartLine />
          </div>
          <div>
            <h3>{safeNumber(summary.avgScore).toFixed(1)}</h3>
            <p>Average Score</p>
          </div>
        </div>

        <div className="avp-summary-card">
          <div className="avp-summary-icon">
            <FaCheckCircle />
          </div>
          <div>
            <h3>{summary.highPerformers}</h3>
            <p>High Performers</p>
          </div>
        </div>

        <div className="avp-summary-card">
          <div className="avp-summary-icon orange">
            <FaMoneyBillWave />
          </div>
          <div>
            <h3>Rs. {safeNumber(summary.totalRevenue).toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </section>

      <section className="avp-toolbar">
        <div className="avp-search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search vendor by name, email or phone"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </section>

      {topVendor && (
        <section className="avp-feature-card">
          <div className="avp-feature-left">
            <div className="avp-feature-avatar">
              {String(topVendor?.name || "V").charAt(0).toUpperCase()}
            </div>

            <div>
              <span className="avp-feature-badge">Vendor Performance Overview</span>
              <h3>{topVendor?.name || "Unknown Vendor"}</h3>
              <p>{topVendor?.email || "No email available"}</p>
            </div>
          </div>

          <div className="avp-feature-stats">
            <div className="avp-feature-stat">
              <span>Score</span>
              <strong>{safeNumber(topVendor?.metrics?.finalScore)}</strong>
            </div>

            <div className="avp-feature-stat">
              <span>Revenue</span>
              <strong>
                Rs. {safeNumber(topVendor?.metrics?.revenue).toLocaleString()}
              </strong>
            </div>

            <div className="avp-feature-stat">
              <span>Finish Rate</span>
              <strong>
                {safeNumber(topVendor?.metrics?.successRate).toFixed(1)}%
              </strong>
            </div>

            <div className="avp-feature-stat">
              <span>Rating</span>
              <strong>
                {safeNumber(topVendor?.metrics?.avgRating).toFixed(1)}
              </strong>
            </div>
          </div>
        </section>
      )}

      <section className="avp-table-wrap">
        <div className="avp-table-head">
          <h2>
            <FaUserTie /> Vendor Performance Table
          </h2>
          <p>
            Metrics are now calculated only from order status and system-wide
            records because the system has one vendor only.
          </p>
        </div>

        {vendorRows.length === 0 ? (
          <div className="avp-empty-state">
            <h3>No vendor data found</h3>
            <p>Check vendor records and related collections.</p>
          </div>
        ) : (
          <div className="avp-table-scroll">
            <table className="avp-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Email</th>
                  <th>Avg Rating</th>
                  <th>Total Orders</th>
                  <th>Finished</th>
                  <th>Complaints</th>
                  <th>Payments</th>
                  <th>Revenue</th>
                  <th>Finish %</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {vendorRows.map((vendor) => (
                  <tr key={vendor._id}>
                    <td>
                      <div className="avp-vendor-cell">
                        <div className="avp-vendor-avatar">
                          {String(vendor?.name || "V").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{vendor?.name || "Unknown Vendor"}</strong>
                          <small>{vendor?.phone || "No phone"}</small>
                        </div>
                      </div>
                    </td>
                    <td>{vendor?.email || "-"}</td>
                    <td>
                      <span className="avp-rating-inline">
                        <FaStar />
                        {safeNumber(vendor?.metrics?.avgRating).toFixed(1)}
                      </span>
                    </td>
                    <td>{safeNumber(vendor?.metrics?.totalOrders)}</td>
                    <td>{safeNumber(vendor?.metrics?.totalFinished)}</td>
                    <td>{safeNumber(vendor?.metrics?.totalComplaints)}</td>
                    <td>{safeNumber(vendor?.metrics?.totalPayments)}</td>
                    <td>
                      Rs. {safeNumber(vendor?.metrics?.revenue).toLocaleString()}
                    </td>
                    <td>
                      {safeNumber(vendor?.metrics?.successRate).toFixed(1)}%
                    </td>
                    <td>
                      <span className="avp-score-pill">
                        {safeNumber(vendor?.metrics?.finalScore)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={getBadgeClass(vendor?.metrics?.performanceLabel)}
                      >
                        {vendor?.metrics?.performanceLabel || "Needs Improvement"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}