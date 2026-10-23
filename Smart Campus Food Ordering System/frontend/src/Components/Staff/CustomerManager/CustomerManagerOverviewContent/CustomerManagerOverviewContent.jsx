import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  FaUsers,
  FaSearch,
  FaUserCheck,
  FaUserTimes,
  FaShoppingBag,
  FaCheckCircle,
  FaClock,
  FaCommentDots,
  FaReply,
  FaSyncAlt,
  FaFilePdf,
  FaChartLine,
  FaUtensils,
  FaExclamationTriangle,
} from "react-icons/fa";
import logo from "../../../Website/image/logo.png";
import "./CustomerManagerOverviewContent.css";

const API_BASE = "http://localhost:5000";

const customerManagerSummary = [
  {
    title: "Customer Directory",
    text: "View all registered customers, check online status, and manage profile details with dietary information.",
  },
  {
    title: "Customer Orders",
    text: "Review completed orders, inspect items, payment details, and mark completed orders as finished.",
  },
  {
    title: "Complaint Handling",
    text: "Track complaint records, update complaint status, and send replies to customers.",
  },
  {
    title: "Notifications",
    text: "Manage customer-facing alerts and important service update communication.",
  },
  {
    title: "Analytics",
    text: "View customer growth, order trends, complaint performance, and top customer spending insights.",
  },
];

export default function CustomerManagerOverviewContent() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [complaints, setComplaints] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
  };

  const fetchOverviewData = async () => {
    try {
      setLoading(true);

      const [customersRes, ordersRes, complaintsRes] = await Promise.all([
        axios.get(`${API_BASE}/Customers`),
        axios.get(`${API_BASE}/completed-orders`),
        axios.get(`${API_BASE}/complaints`),
      ]);

      setCustomers(
        Array.isArray(customersRes?.data?.Customers)
          ? customersRes.data.Customers
          : []
      );

      setOrders(
        Array.isArray(ordersRes?.data?.completedOrders)
          ? ordersRes.data.completedOrders
          : []
      );

      setComplaints(
        Array.isArray(complaintsRes?.data?.complaints)
          ? complaintsRes.data.complaints
          : []
      );
    } catch (error) {
      console.log("Customer manager overview fetch error:", error);
      setCustomers([]);
      setOrders([]);
      setComplaints([]);
      showMessage("error", "Failed to load overview data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const filteredCustomers = useMemo(() => {
    const value = searchText.trim().toLowerCase();
    if (!value) return [];

    return customers.filter((customer) => {
      return (
        String(customer?.name || "").toLowerCase().includes(value) ||
        String(customer?.gmail || "").toLowerCase().includes(value) ||
        String(customer?.phoneNumber || "").toLowerCase().includes(value)
      );
    });
  }, [customers, searchText]);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const onlineCustomers = customers.filter((item) => item?.isOnline).length;
    const offlineCustomers = totalCustomers - onlineCustomers;

    const dietaryCustomers = customers.filter(
      (item) =>
        (Array.isArray(item?.dietaryPreferences) &&
          item.dietaryPreferences.length > 0) ||
        (Array.isArray(item?.allergies) && item.allergies.length > 0) ||
        item?.otherAllergy ||
        item?.calorieGoal ||
        item?.notes
    ).length;

    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (item) => item?.orderStatus === "Completed"
    ).length;
    const finishedOrders = orders.filter(
      (item) => item?.orderStatus === "Finished"
    ).length;

    const totalRevenue = orders.reduce(
      (sum, item) => sum + Number(item?.grandTotal || 0),
      0
    );

    const totalComplaints = complaints.length;
    const pendingComplaints = complaints.filter(
      (item) => String(item?.status || "Pending") === "Pending"
    ).length;
    const resolvedComplaints = complaints.filter(
      (item) => String(item?.status || "") === "Resolved"
    ).length;
    const repliedComplaints = complaints.filter((item) =>
      String(item?.adminReply || "").trim()
    ).length;

    return {
      totalCustomers,
      onlineCustomers,
      offlineCustomers,
      dietaryCustomers,
      totalOrders,
      completedOrders,
      finishedOrders,
      totalRevenue,
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      repliedComplaints,
    };
  }, [customers, orders, complaints]);

  const formatCurrency = (value) =>
    `Rs. ${Number(value || 0).toLocaleString()}`;

  const formatTextList = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return "Not specified";
    return arr.join(", ");
  };

  const loadImageAsBase64 = (src, opacity = 1) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, 0, 0);

        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = src;
    });

  const addWrappedText = (doc, text, x, y, maxWidth, lineHeight = 5.2) => {
    const lines = doc.splitTextToSize(String(text || ""), maxWidth);
    doc.text(lines, x, y);
    return {
      lines,
      nextY: y + lines.length * lineHeight,
      height: lines.length * lineHeight,
    };
  };

  const handleDownloadPDF = async () => {
    try {
      const logoBase64 = await loadImageAsBase64(logo, 1);
      const watermarkBase64 = await loadImageAsBase64(logo, 0.08);

      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      const footerY = pageHeight - 15;
      let y = 20;

      const drawHeader = () => {
        doc.setDrawColor(185, 185, 185);
        doc.setLineWidth(0.5);
        doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

        doc.addImage(logoBase64, "PNG", 14, 10, 22, 22);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(19);
        doc.setTextColor(34, 34, 34);
        doc.text("Campus Canteen", pageWidth / 2, 18, { align: "center" });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("SLIIT Kandy Uni, Balagolla, Kandy", pageWidth / 2, 24, {
          align: "center",
        });
        doc.text("Tel: 081 2345658", pageWidth / 2, 29, {
          align: "center",
        });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("CUSTOMER MANAGER SUMMARY REPORT", pageWidth / 2, 40, {
          align: "center",
        });

        doc.line(margin, 44, pageWidth - margin, 44);
      };

      const drawWatermark = () => {
        const wmWidth = 48;
        const wmHeight = 48;
        const wmX = pageWidth / 2 - wmWidth / 2;
        const wmY = pageHeight / 2 - wmHeight / 2 - 8;

        doc.addImage(
          watermarkBase64,
          "PNG",
          wmX,
          wmY,
          wmWidth,
          wmHeight,
          undefined,
          "FAST"
        );

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(245, 245, 245);
        doc.text("Campus Canteen", pageWidth / 2, wmY + wmHeight + 12, {
          align: "center",
        });
      };

      const drawFooterOnAllPages = () => {
        const pageCount = doc.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, footerY, pageWidth - margin, footerY);

          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(90, 90, 90);
          doc.text(
            `Generated on: ${new Date().toLocaleString()}`,
            margin,
            pageHeight - 9
          );
          doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 9, {
            align: "right",
          });
        }
      };

      const resetPage = () => {
        drawHeader();
        drawWatermark();
        y = 54;
      };

      const addNewPageIfNeeded = (neededHeight = 12) => {
        if (y + neededHeight > footerY - 6) {
          doc.addPage();
          resetPage();
        }
      };

      const drawSectionTitle = (title) => {
        addNewPageIfNeeded(14);
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(margin, y - 4, contentWidth, 10, 2, 2, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12.5);
        doc.setTextColor(46, 125, 50);
        doc.text(title, margin + 3, y + 2);
        y += 14;
      };

      const drawBulletList = (items) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(34, 34, 34);

        items.forEach((line) => {
          addNewPageIfNeeded(8);
          doc.text(`• ${line}`, margin + 2, y);
          y += 7.5;
        });

        y += 4;
      };

      const drawSimpleCard = (title, titleColor, lines, fillColor = null) => {
        const topPadding = 6;
        const bottomPadding = 6;
        const lineGap = 5;
        const cardWidth = contentWidth;

        let estimatedHeight = topPadding + bottomPadding + 6;
        lines.forEach((line) => {
          const wrapped = doc.splitTextToSize(String(line || ""), cardWidth - 8);
          estimatedHeight += wrapped.length * lineGap;
        });

        addNewPageIfNeeded(estimatedHeight + 4);

        doc.setDrawColor(215, 215, 215);
        if (fillColor) {
          doc.setFillColor(...fillColor);
          doc.roundedRect(margin, y - 4, cardWidth, estimatedHeight, 2, 2, "FD");
        } else {
          doc.roundedRect(margin, y - 4, cardWidth, estimatedHeight, 2, 2);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(...titleColor);
        doc.text(title, margin + 4, y + 1);

        let innerY = y + 7;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.4);
        doc.setTextColor(34, 34, 34);

        lines.forEach((line) => {
          const result = addWrappedText(doc, line, margin + 4, innerY, cardWidth - 8, 4.8);
          innerY = result.nextY;
        });

        y = y + estimatedHeight + 6;
      };

      resetPage();

      drawSectionTitle("Overview Statistics");
      drawBulletList([
        `Total Customers: ${stats.totalCustomers}`,
        `Online Customers: ${stats.onlineCustomers}`,
        `Offline Customers: ${stats.offlineCustomers}`,
        `Dietary Records: ${stats.dietaryCustomers}`,
      ]);

      drawSectionTitle("Customer Manager Module Summary");
      customerManagerSummary.forEach((item, index) => {
        drawSimpleCard(
          `${index + 1}. ${item.title}`,
          [255, 152, 0],
          [item.text],
          [250, 250, 250]
        );
      });

      drawSectionTitle("Orders Summary");
      drawBulletList([
        `Total Orders: ${stats.totalOrders}`,
        `Completed Orders: ${stats.completedOrders}`,
        `Finished Orders: ${stats.finishedOrders}`,
        `Total Revenue: ${formatCurrency(stats.totalRevenue)}`,
      ]);

      orders.slice(0, 12).forEach((order, index) => {
        drawSimpleCard(
          `${index + 1}. ${order.orderId || "Order"} - ${order.customerName || "Unknown Customer"}`,
          [46, 125, 50],
          [
            `Order Type: ${order.orderType || "-"}`,
            `Status: ${order.orderStatus || "-"}`,
            `Payment Method: ${order.paymentMethod || "-"}`,
            `Grand Total: ${formatCurrency(order.grandTotal)}`,
          ]
        );
      });

      drawSectionTitle("Complaints Summary");
      drawBulletList([
        `Total Complaints: ${stats.totalComplaints}`,
        `Pending Complaints: ${stats.pendingComplaints}`,
        `Resolved Complaints: ${stats.resolvedComplaints}`,
        `Replied Complaints: ${stats.repliedComplaints}`,
      ]);

      complaints.slice(0, 12).forEach((item, index) => {
        drawSimpleCard(
          `${index + 1}. ${item.subject || "Complaint"} - ${item.fullName || "Unknown Customer"}`,
          [255, 152, 0],
          [
            `Category: ${item.category || "-"}`,
            `Order ID: ${item.orderId || "-"}`,
            `Status: ${item.status || "-"}`,
            `Complaint: ${item.complaint || "-"}`,
          ]
        );
      });

      drawSectionTitle("Analytics Summary");
      drawBulletList([
        `Customer Complaint Rate: ${
          stats.totalCustomers > 0
            ? ((stats.totalComplaints / stats.totalCustomers) * 100).toFixed(1)
            : "0.0"
        }%`,
        `Complaint Resolution Rate: ${
          stats.totalComplaints > 0
            ? ((stats.resolvedComplaints / stats.totalComplaints) * 100).toFixed(1)
            : "0.0"
        }%`,
        `Average Order Value: ${
          stats.totalOrders > 0
            ? formatCurrency(Math.round(stats.totalRevenue / stats.totalOrders))
            : formatCurrency(0)
        }`,
      ]);

      if (searchText.trim()) {
        drawSectionTitle(`Search Results for "${searchText}"`);

        if (filteredCustomers.length === 0) {
          drawSimpleCard(
            "No Matching Customer",
            [255, 152, 0],
            ["No matching customer found."]
          );
        } else {
          filteredCustomers.forEach((customer, index) => {
            drawSimpleCard(
              `${index + 1}. ${customer.name || "N/A"}`,
              [46, 125, 50],
              [
                `Email: ${customer.gmail || "N/A"}`,
                `Phone: ${customer.phoneNumber || "N/A"}`,
                `Gender: ${customer.gender || "N/A"}`,
                `Address: ${customer.address || "N/A"}`,
                `Dietary Preferences: ${formatTextList(customer.dietaryPreferences)}`,
                `Allergies: ${formatTextList(customer.allergies)}`,
                `Status: ${customer.isOnline ? "Online" : "Offline"}`,
              ]
            );
          });
        }
      }

      drawFooterOnAllPages();

      doc.save("Customer_Manager_Full_Report.pdf");
      showMessage("success", "PDF downloaded successfully.");
    } catch (error) {
      console.log("Customer manager PDF generation error:", error);
      showMessage("error", "Failed to generate PDF.");
    }
  };

  return (
    <section className="cmoverview-wrapper">
      <div className="cmoverview-topbar">
        <div>
          <span className="cmoverview-badge">Overview</span>
          <h2>Customer Manager Overview Dashboard</h2>
          <p>
            View customer summary details, order insights, complaint records,
            and search customers by name, gmail, or phone to see full details.
          </p>
        </div>

        <button className="cmoverview-refresh-btn" onClick={fetchOverviewData}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      {message.text && (
        <div className={`cmoverview-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="cmoverview-stats-grid">
        <div className="cmoverview-stat-card">
          <div className="cmoverview-stat-icon green">
            <FaUsers />
          </div>
          <div>
            <h3>{stats.totalCustomers}</h3>
            <p>Total Customers</p>
          </div>
        </div>

        <div className="cmoverview-stat-card">
          <div className="cmoverview-stat-icon green">
            <FaUserCheck />
          </div>
          <div>
            <h3>{stats.onlineCustomers}</h3>
            <p>Online Customers</p>
          </div>
        </div>

        <div className="cmoverview-stat-card">
          <div className="cmoverview-stat-icon orange">
            <FaUserTimes />
          </div>
          <div>
            <h3>{stats.offlineCustomers}</h3>
            <p>Offline Customers</p>
          </div>
        </div>

        <div className="cmoverview-stat-card">
          <div className="cmoverview-stat-icon dark">
            <FaUtensils />
          </div>
          <div>
            <h3>{stats.dietaryCustomers}</h3>
            <p>Dietary Records</p>
          </div>
        </div>
      </div>

      <div className="cmoverview-summary-card">
        <div className="cmoverview-summary-head">
          <div>
            <span className="cmoverview-summary-badge">System Summary</span>
            <h3>Customer Manager Module Summary</h3>
            <p>
              Customers, orders, complaints, and analytics combined into one
              downloadable report.
            </p>
          </div>

          <button
            className="cmoverview-pdf-btn"
            type="button"
            onClick={handleDownloadPDF}
          >
            <FaFilePdf />
            <span>Download PDF</span>
          </button>
        </div>

        <div className="cmoverview-summary-grid">
          {customerManagerSummary.map((item, index) => (
            <div className="cmoverview-summary-item-card" key={index}>
              <div className="cmoverview-summary-icon">
                {index === 0 && <FaUsers />}
                {index === 1 && <FaShoppingBag />}
                {index === 2 && <FaCommentDots />}
                {index === 3 && <FaReply />}
                {index === 4 && <FaChartLine />}
              </div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="cmoverview-search-card">
        <div className="cmoverview-search-head">
          <h3>Search Customer</h3>
          <p>Type customer name, gmail, or phone number to view details.</p>
        </div>

        <div className="cmoverview-search-box">
          <FaSearch className="cmoverview-search-icon" />
          <input
            type="text"
            placeholder="Search by name, gmail, or phone..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="cmoverview-state-box">Loading overview data...</div>
      ) : searchText.trim() === "" ? (
        <div className="cmoverview-state-box">
          Start typing a customer's name, gmail, or phone number to see full details.
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="cmoverview-state-box">No matching customer found.</div>
      ) : (
        <div className="cmoverview-details-grid">
          {filteredCustomers.map((customer) => (
            <div className="cmoverview-detail-card" key={customer._id}>
              <div className="cmoverview-detail-top">
                <div>
                  <h3>{customer.name || "N/A"}</h3>
                  <p>{customer.gmail || "N/A"}</p>
                </div>

                <span
                  className={
                    customer.isOnline
                      ? "cmoverview-status-pill online"
                      : "cmoverview-status-pill offline"
                  }
                >
                  {customer.isOnline ? "Online" : "Offline"}
                </span>
              </div>

              <div className="cmoverview-info-grid">
                <div className="cmoverview-info-item">
                  <span>Email</span>
                  <strong>{customer.gmail || "N/A"}</strong>
                </div>

                <div className="cmoverview-info-item">
                  <span>Phone</span>
                  <strong>{customer.phoneNumber || "N/A"}</strong>
                </div>

                <div className="cmoverview-info-item">
                  <span>Gender</span>
                  <strong>{customer.gender || "N/A"}</strong>
                </div>

                <div className="cmoverview-info-item">
                  <span>Address</span>
                  <strong>{customer.address || "N/A"}</strong>
                </div>

                <div className="cmoverview-info-item cmoverview-full-width">
                  <span>Dietary Preferences</span>
                  <strong>{formatTextList(customer.dietaryPreferences)}</strong>
                </div>

                <div className="cmoverview-info-item cmoverview-full-width">
                  <span>Allergies</span>
                  <strong>{formatTextList(customer.allergies)}</strong>
                </div>

                <div className="cmoverview-info-item">
                  <span>Other Allergy</span>
                  <strong>{customer.otherAllergy || "N/A"}</strong>
                </div>

                <div className="cmoverview-info-item">
                  <span>Calorie Goal</span>
                  <strong>{customer.calorieGoal || "N/A"}</strong>
                </div>

                <div className="cmoverview-info-item cmoverview-full-width">
                  <span>Notes</span>
                  <strong>{customer.notes || "No notes available"}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}