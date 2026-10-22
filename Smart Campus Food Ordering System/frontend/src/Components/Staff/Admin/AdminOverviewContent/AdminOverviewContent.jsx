import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import {
  FaUsers,
  FaSearch,
  FaUserShield,
  FaUserCheck,
  FaUserTimes,
  FaEnvelope,
  FaPhoneAlt,
  FaCarSide,
  FaBriefcase,
  FaCalendarAlt,
  FaSyncAlt,
  FaCheckDouble,
  FaDollarSign,
  FaChartLine,
  FaExclamationCircle,
  FaFilePdf,
} from "react-icons/fa";
import logo from "../../../Website/image/logo.png";
import "./AdminOverviewContent.css";

const API_BASE = "http://localhost:5000";

const dashboardSummary = [
  {
    title: "Staff Management",
    text: "Add, edit, search, and manage staff records with role, phone, vehicle, experience, and status details.",
  },
  {
    title: "Completed Orders",
    text: "Track completed orders, check order details, and update finished order status.",
  },
  {
    title: "Payments",
    text: "Monitor payment records, methods, paid counts, and total revenue in one place.",
  },
  {
    title: "Analytics",
    text: "See revenue summary, payment distribution, order type activity, and delivery performance insights.",
  },
  {
    title: "Complaints",
    text: "Access complaint handling from the dashboard navigation for issue monitoring and review.",
  },
];

export default function AdminOverviewContent() {
  const [adminOverviewStaffs, setAdminOverviewStaffs] = useState([]);
  const [adminPayments, setAdminPayments] = useState([]);
  const [adminComplaints, setAdminComplaints] = useState([]);
  const [adminCompletedOrders, setAdminCompletedOrders] = useState([]);
  const [adminFinishedDeliveries, setAdminFinishedDeliveries] = useState([]);

  const [adminOverviewLoading, setAdminOverviewLoading] = useState(true);
  const [adminOverviewSearch, setAdminOverviewSearch] = useState("");
  const [adminOverviewMessage, setAdminOverviewMessage] = useState({
    type: "",
    text: "",
  });

  const getAdminOverviewToken = () => {
    try {
      const staffData = JSON.parse(localStorage.getItem("staff") || "{}");
      return staffData?.token || localStorage.getItem("staffToken");
    } catch {
      return localStorage.getItem("staffToken");
    }
  };

  const showAdminOverviewMessage = (type, text) => {
    setAdminOverviewMessage({ type, text });
    setTimeout(() => {
      setAdminOverviewMessage({ type: "", text: "" });
    }, 3000);
  };

  const fetchAllOverviewData = async () => {
    try {
      setAdminOverviewLoading(true);

      const token = getAdminOverviewToken();

      if (!token) {
        showAdminOverviewMessage(
          "error",
          "Staff token not found. Please login again."
        );
        setAdminOverviewStaffs([]);
        setAdminPayments([]);
        setAdminComplaints([]);
        setAdminCompletedOrders([]);
        setAdminFinishedDeliveries([]);
        return;
      }

      const staffReq = axios.get(`${API_BASE}/staffs`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const paymentReq = axios.get(`${API_BASE}/payment`);
      const complaintReq = axios.get(`${API_BASE}/complaints`);
      const completedReq = axios.get(`${API_BASE}/completed-orders`);
      const finishedReq = axios.get(`${API_BASE}/delivery-fenish`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const [staffRes, paymentRes, complaintRes, completedRes, finishedRes] =
        await Promise.allSettled([
          staffReq,
          paymentReq,
          complaintReq,
          completedReq,
          finishedReq,
        ]);

      setAdminOverviewStaffs(
        staffRes.status === "fulfilled" ? staffRes.value.data?.staffs || [] : []
      );
      setAdminPayments(
        paymentRes.status === "fulfilled"
          ? paymentRes.value.data?.payments || []
          : []
      );
      setAdminComplaints(
        complaintRes.status === "fulfilled"
          ? complaintRes.value.data?.complaints || []
          : []
      );
      setAdminCompletedOrders(
        completedRes.status === "fulfilled"
          ? completedRes.value.data?.completedOrders ||
              completedRes.value.data?.orders ||
              []
          : []
      );
      setAdminFinishedDeliveries(
        finishedRes.status === "fulfilled"
          ? finishedRes.value.data?.finishedOrders || []
          : []
      );
    } catch (error) {
      console.log("fetchAllOverviewData error:", error);
      showAdminOverviewMessage("error", "Failed to load overview data.");
    } finally {
      setAdminOverviewLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOverviewData();
  }, []);

  const adminOverviewFilteredStaffs = useMemo(() => {
    const value = adminOverviewSearch.trim().toLowerCase();

    if (!value) return [];

    return adminOverviewStaffs.filter((staff) => {
      const name = String(staff.name || "").toLowerCase();
      const email = String(staff.email || "").toLowerCase();
      return name.includes(value) || email.includes(value);
    });
  }, [adminOverviewSearch, adminOverviewStaffs]);

  const adminOverviewTotalStaff = adminOverviewStaffs.length;
  const adminOverviewOnlineStaff = adminOverviewStaffs.filter(
    (s) => s.isOnline
  ).length;
  const adminOverviewOfflineStaff = adminOverviewStaffs.filter(
    (s) => !s.isOnline
  ).length;
  const adminOverviewAdminCount = adminOverviewStaffs.filter(
    (s) => String(s.role || "").toLowerCase().trim() === "admin"
  ).length;

  const adminTotalPayments = adminPayments.length;
  const adminPaidPayments = adminPayments.filter(
    (item) => String(item.paymentStatus || "").toLowerCase() === "paid"
  ).length;
  const adminPendingPayments = adminPayments.filter(
    (item) => String(item.paymentStatus || "").toLowerCase() === "pending"
  ).length;
  const adminTotalRevenue = adminPayments.reduce(
    (sum, item) => sum + Number(item.grandTotal || 0),
    0
  );

  const adminTotalComplaints = adminComplaints.length;
  const adminPendingComplaints = adminComplaints.filter(
    (item) => String(item.status || "Pending") === "Pending"
  ).length;
  const adminResolvedComplaints = adminComplaints.filter(
    (item) => String(item.status || "") === "Resolved"
  ).length;

  const adminTotalCompletedOrders = adminCompletedOrders.length;
  const adminFinishedCount = adminCompletedOrders.filter(
    (item) => String(item.orderStatus || "") === "Finished"
  ).length;

  const analyticsCompletedRevenue = adminCompletedOrders.reduce(
    (sum, item) => sum + Number(item.grandTotal || 0),
    0
  );

  const analyticsFinishedDeliveryRevenue = adminFinishedDeliveries.reduce(
    (sum, item) => sum + Number(item.grandTotal || 0),
    0
  );

  const getAdminOverviewRoleClass = (role) => {
    const normalizedRole = String(role || "").toLowerCase().trim();

    if (normalizedRole === "admin") return "adover-role-pill admin";
    if (normalizedRole === "vendor") return "adover-role-pill vendor";
    if (normalizedRole === "delivery") return "adover-role-pill delivery";
    if (normalizedRole === "customer manager")
      return "adover-role-pill customer-manager";
    if (normalizedRole === "delivery manager")
      return "adover-role-pill delivery-manager";

    return "adover-role-pill default";
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
        doc.text("ADMIN DASHBOARD SUMMARY REPORT", pageWidth / 2, 40, {
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
        `Total Staff: ${adminOverviewTotalStaff}`,
        `Online Staff: ${adminOverviewOnlineStaff}`,
        `Offline Staff: ${adminOverviewOfflineStaff}`,
        `Admin Accounts: ${adminOverviewAdminCount}`,
      ]);

      drawSectionTitle("Dashboard Module Summary");
      dashboardSummary.forEach((item, index) => {
        drawSimpleCard(
          `${index + 1}. ${item.title}`,
          [255, 152, 0],
          [item.text],
          [250, 250, 250]
        );
      });

      drawSectionTitle("Payments Summary");
      drawBulletList([
        `Total Payments: ${adminTotalPayments}`,
        `Paid Payments: ${adminPaidPayments}`,
        `Pending Payments: ${adminPendingPayments}`,
        `Total Revenue: LKR ${adminTotalRevenue.toFixed(2)}`,
      ]);

      adminPayments.slice(0, 15).forEach((payment, index) => {
        drawSimpleCard(
          `${index + 1}. ${payment.paymentId || "Payment"} - ${
            payment.customerName || "Unknown Customer"
          }`,
          [46, 125, 50],
          [
            `Order ID: ${payment.orderId || "-"}`,
            `Method: ${payment.paymentMethod || "-"}`,
            `Status: ${payment.paymentStatus || "-"}`,
            `Grand Total: LKR ${Number(payment.grandTotal || 0).toFixed(2)}`,
          ]
        );
      });

      drawSectionTitle("Complaints Summary");
      drawBulletList([
        `Total Complaints: ${adminTotalComplaints}`,
        `Pending Complaints: ${adminPendingComplaints}`,
        `Resolved Complaints: ${adminResolvedComplaints}`,
      ]);

      adminComplaints.slice(0, 12).forEach((item, index) => {
        drawSimpleCard(
          `${index + 1}. ${item.subject || "Complaint"} - ${
            item.fullName || "Unknown User"
          }`,
          [255, 152, 0],
          [
            `Category: ${item.category || "-"}`,
            `Order ID: ${item.orderId || "-"}`,
            `Status: ${item.status || "Pending"}`,
            `Complaint: ${item.complaint || "-"}`,
          ]
        );
      });

      drawSectionTitle("Completed Orders Summary");
      drawBulletList([
        `Total Completed Orders: ${adminTotalCompletedOrders}`,
        `Finished Orders: ${adminFinishedCount}`,
        `Completed Revenue: LKR ${analyticsCompletedRevenue.toFixed(2)}`,
      ]);

      adminCompletedOrders.slice(0, 12).forEach((order, index) => {
        drawSimpleCard(
          `${index + 1}. ${order.orderId || "Order"} - ${
            order.customerName || "Unknown Customer"
          }`,
          [46, 125, 50],
          [
            `Order Type: ${order.orderType || "-"}`,
            `Status: ${order.orderStatus || "-"}`,
            `Grand Total: LKR ${Number(order.grandTotal || 0).toFixed(2)}`,
            `Payment: ${order.paymentMethod || "-"}`,
          ]
        );
      });

      drawSectionTitle("Analytics Summary");
      drawBulletList([
        `Total Payment Revenue: LKR ${adminTotalRevenue.toFixed(2)}`,
        `Completed Orders Revenue: LKR ${analyticsCompletedRevenue.toFixed(2)}`,
        `Finished Delivery Revenue: LKR ${analyticsFinishedDeliveryRevenue.toFixed(2)}`,
        `Finished Deliveries Count: ${adminFinishedDeliveries.length}`,
        `Paid Payments: ${adminPaidPayments}`,
        `Pending Payments: ${adminPendingPayments}`,
      ]);

      if (adminOverviewSearch.trim()) {
        drawSectionTitle(`Search Results for "${adminOverviewSearch}"`);

        if (adminOverviewFilteredStaffs.length === 0) {
          drawSimpleCard(
            "No Matching Staff Member",
            [255, 152, 0],
            ["No matching staff member found."]
          );
        } else {
          adminOverviewFilteredStaffs.forEach((staff, index) => {
            drawSimpleCard(
              `${index + 1}. ${staff.name || "N/A"}`,
              [255, 152, 0],
              [
                `Email: ${staff.email || "N/A"}`,
                `Phone: ${staff.phone || "N/A"}`,
                `Role: ${staff.role || "N/A"}`,
                `Vehicle: ${staff.vehicleType || "-"}`,
                `Experience: ${staff.experience || "-"}`,
                `Status: ${staff.isOnline ? "Online" : "Offline"}`,
              ]
            );
          });
        }
      }

      drawFooterOnAllPages();

      doc.save("Admin_Dashboard_Full_Report.pdf");
      showAdminOverviewMessage("success", "PDF downloaded successfully.");
    } catch (error) {
      console.log("PDF generation error:", error);
      showAdminOverviewMessage("error", "Failed to generate PDF.");
    }
  };

  return (
    <section className="adover-wrapper">
      <div className="adover-topbar">
        <div>
          <span className="adover-badge">Overview</span>
          <h2>Admin Overview Dashboard</h2>
          <p>
            View quick staff insights, system summary details, and search any
            staff member by name or email to see full information.
          </p>
        </div>

        <button className="adover-refresh-btn" onClick={fetchAllOverviewData}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      {adminOverviewMessage.text && (
        <div className={`adover-alert ${adminOverviewMessage.type}`}>
          {adminOverviewMessage.text}
        </div>
      )}

      <div className="adover-stats-grid">
        <div className="adover-stat-card">
          <div className="adover-stat-icon green">
            <FaUsers />
          </div>
          <div>
            <h3>{adminOverviewTotalStaff}</h3>
            <p>Total Staff</p>
          </div>
        </div>

        <div className="adover-stat-card">
          <div className="adover-stat-icon green">
            <FaUserCheck />
          </div>
          <div>
            <h3>{adminOverviewOnlineStaff}</h3>
            <p>Online Staff</p>
          </div>
        </div>

        <div className="adover-stat-card">
          <div className="adover-stat-icon orange">
            <FaUserTimes />
          </div>
          <div>
            <h3>{adminOverviewOfflineStaff}</h3>
            <p>Offline Staff</p>
          </div>
        </div>

        <div className="adover-stat-card">
          <div className="adover-stat-icon dark">
            <FaUserShield />
          </div>
          <div>
            <h3>{adminOverviewAdminCount}</h3>
            <p>Admin Accounts</p>
          </div>
        </div>
      </div>

      <div className="adover-summary-card">
        <div className="adover-summary-head">
          <div>
            <span className="adover-summary-badge">System Summary</span>
            <h3>Admin Dashboard Module Summary</h3>
            <p>
              Overview, payments, complaints, completed orders, and analytics
              combined into one downloadable report.
            </p>
          </div>

          <button
            className="adover-pdf-btn"
            type="button"
            onClick={handleDownloadPDF}
          >
            <FaFilePdf />
            <span>Download PDF</span>
          </button>
        </div>

        <div className="adover-summary-grid">
          {dashboardSummary.map((item, index) => (
            <div className="adover-summary-item-card" key={index}>
              <div className="adover-summary-icon">
                {index === 0 && <FaUsers />}
                {index === 1 && <FaCheckDouble />}
                {index === 2 && <FaDollarSign />}
                {index === 3 && <FaChartLine />}
                {index === 4 && <FaExclamationCircle />}
              </div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="adover-search-card">
        <div className="adover-search-head">
          <h3>Search Staff Member</h3>
          <p>Type staff member name or email to view all details.</p>
        </div>

        <div className="adover-search-box">
          <FaSearch className="adover-search-icon" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={adminOverviewSearch}
            onChange={(e) => setAdminOverviewSearch(e.target.value)}
          />
        </div>
      </div>

      {adminOverviewLoading ? (
        <div className="adover-state-box">Loading overview data...</div>
      ) : adminOverviewSearch.trim() === "" ? (
        <div className="adover-state-box">
          Start typing a staff member's name or email to see full details.
        </div>
      ) : adminOverviewFilteredStaffs.length === 0 ? (
        <div className="adover-state-box">No matching staff member found.</div>
      ) : (
        <div className="adover-details-grid">
          {adminOverviewFilteredStaffs.map((staff) => (
            <div className="adover-detail-card" key={staff._id}>
              <div className="adover-detail-top">
                <div>
                  <h3>{staff.name || "N/A"}</h3>
                  <p>{staff.email || "N/A"}</p>
                </div>

                <span className={getAdminOverviewRoleClass(staff.role)}>
                  {staff.role || "N/A"}
                </span>
              </div>

              <div className="adover-info-grid">
                <div className="adover-info-item">
                  <span>
                    <FaEnvelope className="adover-inline-icon" />
                    Email
                  </span>
                  <strong>{staff.email || "N/A"}</strong>
                </div>

                <div className="adover-info-item">
                  <span>
                    <FaPhoneAlt className="adover-inline-icon" />
                    Phone
                  </span>
                  <strong>{staff.phone || "N/A"}</strong>
                </div>

                <div className="adover-info-item">
                  <span>
                    <FaUserShield className="adover-inline-icon" />
                    Role
                  </span>
                  <strong>{staff.role || "N/A"}</strong>
                </div>

                <div className="adover-info-item">
                  <span>
                    <FaCarSide className="adover-inline-icon" />
                    Vehicle Type
                  </span>
                  <strong>{staff.vehicleType || "N/A"}</strong>
                </div>

                <div className="adover-info-item">
                  <span>
                    <FaBriefcase className="adover-inline-icon" />
                    Experience
                  </span>
                  <strong>{staff.experience || "N/A"}</strong>
                </div>

                <div className="adover-info-item">
                  <span>
                    <FaCalendarAlt className="adover-inline-icon" />
                    Created At
                  </span>
                  <strong>
                    {staff.createdAt
                      ? new Date(staff.createdAt).toLocaleString()
                      : "N/A"}
                  </strong>
                </div>

                <div className="adover-info-item adover-full-width">
                  <span>Status</span>
                  <strong
                    className={staff.isOnline ? "adover-online" : "adover-offline"}
                  >
                    {staff.isOnline ? "Online" : "Offline"}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}