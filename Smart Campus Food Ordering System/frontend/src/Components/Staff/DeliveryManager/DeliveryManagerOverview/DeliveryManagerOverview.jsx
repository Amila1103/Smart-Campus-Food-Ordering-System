import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import {
  FaTachometerAlt,
  FaSyncAlt,
  FaSearch,
  FaTruck,
  FaClipboardList,
  FaCheckCircle,
  FaUsers,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaUser,
  FaClock,
  FaArrowUp,
  FaEnvelope,
  FaPhoneAlt,
  FaIdBadge,
  FaMotorcycle,
  FaBoxOpen,
  FaFilePdf,
} from "react-icons/fa";
import logo from "../../../Website/image/logo.png";
import "./DeliveryManagerOverview.css";

const API_BASE = "http://localhost:5000";

const deliveryManagerSummary = [
  {
    title: "Taken Orders",
    text: "View all delivery orders currently taken by delivery staff and monitor their delivery progress.",
  },
  {
    title: "Completed Deliveries",
    text: "Review all completed delivery orders, customer details, item counts, payment method, and finished times.",
  },
  {
    title: "Driver Management",
    text: "Manage delivery staff, view online and offline drivers, and track delivery team availability.",
  },
  {
    title: "Delivery Analytics",
    text: "Track finished order revenue, top drivers, payment breakdown, and delivery performance insights.",
  },
  {
    title: "Applications",
    text: "Review submitted delivery job applications and update applicant status from one place.",
  },
  {
    title: "Late Delivery Complaints",
    text: "Handle late delivery complaints, update status, and send replies to affected customers.",
  },
];

export default function DeliveryManagerOverview() {
  const [takenOrders, setTakenOrders] = useState([]);
  const [finishedOrders, setFinishedOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 2500);
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

  const fetchOverviewData = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        setTakenOrders([]);
        setFinishedOrders([]);
        setDrivers([]);
        return;
      }

      const [takenRes, finishedRes, staffRes] = await Promise.all([
        axios.get(`${API_BASE}/taken-delivery-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/delivery-fenish`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/staffs/delivery-team/all`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTakenOrders(takenRes.data?.takenOrders || []);
      setFinishedOrders(finishedRes.data?.finishedOrders || []);
      setDrivers(staffRes.data?.staffs || []);
    } catch (error) {
      console.log("fetchOverviewData error:", error);

      if (error.response?.status === 403) {
        showMessage(
          "error",
          "Access denied. Login with a delivery manager account."
        );
      } else if (error.response?.status === 401) {
        showMessage("error", "Unauthorized. Please login again.");
      } else {
        showMessage(
          "error",
          error.response?.data?.message || "Failed to load overview data"
        );
      }

      setTakenOrders([]);
      setFinishedOrders([]);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const filteredTakenOrders = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    return takenOrders.filter((order) => {
      if (!value) return true;

      return (
        String(order.orderId || "").toLowerCase().includes(value) ||
        String(order.customerName || "").toLowerCase().includes(value) ||
        String(order.gmail || "").toLowerCase().includes(value) ||
        String(order.takenByStaffName || "").toLowerCase().includes(value) ||
        String(order.deliveryStatus || "").toLowerCase().includes(value) ||
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
    const value = searchText.trim().toLowerCase().includes
      ? searchText.trim().toLowerCase()
      : String(searchText || "").trim().toLowerCase();

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

  const matchedDrivers = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    if (!value) return [];

    return drivers.filter((driver) => {
      return (
        String(driver.name || "").toLowerCase().includes(value) ||
        String(driver.email || "").toLowerCase().includes(value)
      );
    });
  }, [drivers, searchText]);

  const selectedDriver = matchedDrivers.length > 0 ? matchedDrivers[0] : null;

  const selectedDriverCompletedOrders = useMemo(() => {
    if (!selectedDriver) return [];

    return finishedOrders
      .filter((order) => {
        const deliveredByName = String(order.deliveredByStaffName || "")
          .toLowerCase()
          .trim();
        const deliveredByEmail = String(order.deliveredByStaffEmail || "")
          .toLowerCase()
          .trim();
        const driverName = String(selectedDriver.name || "")
          .toLowerCase()
          .trim();
        const driverEmail = String(selectedDriver.email || "")
          .toLowerCase()
          .trim();

        return deliveredByName === driverName || deliveredByEmail === driverEmail;
      })
      .sort((a, b) => new Date(b.finishedAt || 0) - new Date(a.finishedAt || 0));
  }, [finishedOrders, selectedDriver]);

  const selectedDriverTakenOrders = useMemo(() => {
    if (!selectedDriver) return [];

    return takenOrders
      .filter((order) => {
        const takenByName = String(order.takenByStaffName || "")
          .toLowerCase()
          .trim();
        const takenByEmail = String(order.takenByStaffEmail || "")
          .toLowerCase()
          .trim();
        const driverName = String(selectedDriver.name || "")
          .toLowerCase()
          .trim();
        const driverEmail = String(selectedDriver.email || "")
          .toLowerCase()
          .trim();

        return takenByName === driverName || takenByEmail === driverEmail;
      })
      .sort((a, b) => new Date(b.takenAt || 0) - new Date(a.takenAt || 0));
  }, [takenOrders, selectedDriver]);

  const selectedDriverCompletedCount = selectedDriverCompletedOrders.length;
  const selectedDriverTakenCount = selectedDriverTakenOrders.length;

  const selectedDriverTotalRevenue = selectedDriverCompletedOrders.reduce(
    (sum, order) => sum + Number(order.grandTotal || 0),
    0
  );

  const totalTakenOrders = filteredTakenOrders.length;
  const totalCompletedOrders = filteredFinishedOrders.length;
  const totalDrivers = drivers.length;
  const onlineDrivers = drivers.filter((driver) => driver.isOnline).length;
  const offlineDrivers = drivers.filter((driver) => !driver.isOnline).length;

  const todayCompletedOrders = filteredFinishedOrders.filter((order) => {
    if (!order.finishedAt) return false;
    const finishedDate = new Date(order.finishedAt);
    const now = new Date();

    return (
      finishedDate.getDate() === now.getDate() &&
      finishedDate.getMonth() === now.getMonth() &&
      finishedDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const totalRevenue = filteredFinishedOrders.reduce(
    (sum, order) => sum + Number(order.grandTotal || 0),
    0
  );

  const latestActivities = [
    ...filteredTakenOrders.map((order) => ({
      id: `taken-${order._id || order.orderId}`,
      type: "Taken Order",
      title: `Order #${order.orderId} taken`,
      person: order.takenByStaffName || "Delivery Staff",
      time: order.takenAt,
      location:
        order.selectedDeliveryLocation ||
        order.deliveryLocation ||
        order.customLocation ||
        order.address ||
        "Not Available",
    })),
    ...filteredFinishedOrders.map((order) => ({
      id: `finished-${order._id || order.orderId}`,
      type: "Completed Order",
      title: `Order #${order.orderId} completed`,
      person: order.deliveredByStaffName || "Delivery Staff",
      time: order.finishedAt,
      location:
        order.selectedDeliveryLocation ||
        order.deliveryLocation ||
        order.customLocation ||
        order.address ||
        "Not Available",
    })),
  ]
    .sort((a, b) => new Date(b.time || 0) - new Date(a.time || 0))
    .slice(0, 6);

  const topDrivers = Object.values(
    filteredFinishedOrders.reduce((acc, order) => {
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
  )
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const formatCurrency = (value) => `LKR ${Number(value || 0).toFixed(2)}`;

  const formatDateTime = (value) => {
    if (!value) return "Not Available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not Available";
    return date.toLocaleString();
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
    return { nextY: y + lines.length * lineHeight };
  };

  const handleDownloadDeliveryManagerPDF = async () => {
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
        doc.text("DELIVERY MANAGER SUMMARY REPORT", pageWidth / 2, 40, {
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
        const cardWidth = contentWidth;
        let estimatedHeight = 18;

        lines.forEach((line) => {
          const wrapped = doc.splitTextToSize(String(line || ""), cardWidth - 8);
          estimatedHeight += wrapped.length * 5;
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

        y += estimatedHeight + 6;
      };

      resetPage();

      drawSectionTitle("Overview Statistics");
      drawBulletList([
        `Active Taken Orders: ${totalTakenOrders}`,
        `Total Completed Orders: ${totalCompletedOrders}`,
        `Total Revenue: ${formatCurrency(totalRevenue)}`,
        `Total Drivers: ${totalDrivers}`,
        `Online Drivers: ${onlineDrivers}`,
        `Offline Drivers: ${offlineDrivers}`,
        `Completed Today: ${todayCompletedOrders}`,
      ]);

      drawSectionTitle("Delivery Manager Module Summary");
      deliveryManagerSummary.forEach((item, index) => {
        drawSimpleCard(
          `${index + 1}. ${item.title}`,
          [255, 152, 0],
          [item.text],
          [250, 250, 250]
        );
      });

      drawSectionTitle("Driver Performance");
      if (topDrivers.length === 0) {
        drawSimpleCard("No Driver Performance Data", [255, 152, 0], [
          "No completed delivery performance data available.",
        ]);
      } else {
        topDrivers.forEach((driver, index) => {
          drawSimpleCard(
            `${index + 1}. ${driver.name}`,
            [46, 125, 50],
            [
              `Completed Deliveries: ${driver.count}`,
              `Revenue: ${formatCurrency(driver.revenue)}`,
            ]
          );
        });
      }

      drawSectionTitle("Recent Activity");
      if (latestActivities.length === 0) {
        drawSimpleCard("No Recent Activity", [255, 152, 0], [
          "No recent taken or completed delivery activities found.",
        ]);
      } else {
        latestActivities.forEach((activity, index) => {
          drawSimpleCard(
            `${index + 1}. ${activity.title}`,
            [255, 152, 0],
            [
              `Type: ${activity.type}`,
              `Staff: ${activity.person}`,
              `Location: ${activity.location}`,
              `Time: ${formatDateTime(activity.time)}`,
            ]
          );
        });
      }

      drawSectionTitle("Latest Completed Deliveries");
      if (filteredFinishedOrders.length === 0) {
        drawSimpleCard("No Completed Deliveries", [255, 152, 0], [
          "No completed delivery records found.",
        ]);
      } else {
        filteredFinishedOrders.slice(0, 12).forEach((order, index) => {
          drawSimpleCard(
            `${index + 1}. ${order.orderId || "Order"} - ${
              order.customerName || "Unknown Customer"
            }`,
            [46, 125, 50],
            [
              `Driver: ${order.deliveredByStaffName || "N/A"}`,
              `Location: ${
                order.selectedDeliveryLocation ||
                order.deliveryLocation ||
                order.customLocation ||
                order.address ||
                "N/A"
              }`,
              `Payment Method: ${order.paymentMethod || "N/A"}`,
              `Grand Total: ${formatCurrency(order.grandTotal)}`,
              `Finished At: ${formatDateTime(order.finishedAt)}`,
            ]
          );
        });
      }

      drawSectionTitle("Driver Search Results");
      if (searchText.trim() === "") {
        drawSimpleCard("No Search Value Entered", [255, 152, 0], [
          "Driver search box is empty.",
        ]);
      } else if (!selectedDriver) {
        drawSimpleCard(`Search Results for "${searchText}"`, [255, 152, 0], [
          "No driver found for this name or email.",
        ]);
      } else {
        drawSimpleCard(
          selectedDriver.name || "Driver Details",
          [46, 125, 50],
          [
            `Email: ${selectedDriver.email || "N/A"}`,
            `Phone: ${selectedDriver.phone || "Not Available"}`,
            `Role: ${selectedDriver.role || "delivery"}`,
            `Vehicle Type: ${selectedDriver.vehicleType || "Not Available"}`,
            `Experience: ${selectedDriver.experience || "Not Available"}`,
            `Online Status: ${selectedDriver.isOnline ? "Online" : "Offline"}`,
            `Active Taken Orders: ${selectedDriverTakenCount}`,
            `Completed Deliveries: ${selectedDriverCompletedCount}`,
            `Revenue: ${formatCurrency(selectedDriverTotalRevenue)}`,
            `Created At: ${formatDateTime(selectedDriver.createdAt)}`,
          ]
        );

        if (selectedDriverCompletedOrders.length > 0) {
          selectedDriverCompletedOrders.slice(0, 10).forEach((order, index) => {
            drawSimpleCard(
              `${index + 1}. ${order.orderId || "Order"} Delivery Record`,
              [255, 152, 0],
              [
                `Customer: ${order.customerName || "N/A"}`,
                `Email: ${order.gmail || "N/A"}`,
                `Location: ${
                  order.selectedDeliveryLocation ||
                  order.deliveryLocation ||
                  order.customLocation ||
                  order.address ||
                  "N/A"
                }`,
                `Payment: ${order.paymentMethod || "N/A"}`,
                `Total: ${formatCurrency(order.grandTotal)}`,
                `Finished At: ${formatDateTime(order.finishedAt)}`,
              ]
            );
          });
        }
      }

      drawFooterOnAllPages();

      doc.save("Delivery_Manager_Summary_Report.pdf");
      showMessage("success", "Delivery manager PDF downloaded successfully.");
    } catch (error) {
      console.log("Delivery manager PDF generation error:", error);
      showMessage("error", "Failed to generate delivery manager PDF.");
    }
  };

  return (
    <section className="dmoverview-wrapper">
      <div className="dmoverview-header">
        <div className="dmoverview-header-left">
          <div className="dmoverview-header-icon">
            <FaTachometerAlt />
          </div>

          <div>
            <span className="dmoverview-badge">Overview</span>
            <h2>Delivery Manager Dashboard</h2>
            <p>
              Monitor delivery operations, drivers, active orders, completed
              orders, and performance in one place.
            </p>
          </div>
        </div>

        <div className="dmoverview-header-actions">
          <button
            className="dmoverview-refresh-btn"
            onClick={fetchOverviewData}
          >
            <FaSyncAlt />
            <span>Refresh</span>
          </button>

          <button
            className="dmoverview-pdf-btn"
            type="button"
            onClick={handleDownloadDeliveryManagerPDF}
          >
            <FaFilePdf />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`dmoverview-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="dmoverview-stats-grid">
        <div className="dmoverview-stat-card">
          <div className="dmoverview-stat-icon green">
            <FaClipboardList />
          </div>
          <div>
            <h3>{totalTakenOrders}</h3>
            <p>Active Taken Orders</p>
          </div>
        </div>

        <div className="dmoverview-stat-card">
          <div className="dmoverview-stat-icon green">
            <FaCheckCircle />
          </div>
          <div>
            <h3>{totalCompletedOrders}</h3>
            <p>Total Completed Orders</p>
          </div>
        </div>

        <div className="dmoverview-stat-card">
          <div className="dmoverview-stat-icon orange">
            <FaMoneyBillWave />
          </div>
          <div>
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="dmoverview-stat-card">
          <div className="dmoverview-stat-icon green">
            <FaUsers />
          </div>
          <div>
            <h3>{totalDrivers}</h3>
            <p>Total Drivers</p>
          </div>
        </div>
      </div>

      <div className="dmoverview-search-row">
        <div className="dmoverview-search-box">
          <FaSearch className="dmoverview-search-icon" />
          <input
            type="text"
            placeholder="Search driver by name or email..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="dmoverview-state-box">Loading overview data...</div>
      ) : (
        <>
          {searchText.trim() !== "" && (
            <div className="dmoverview-panel dmoverview-driver-search-panel">
              <div className="dmoverview-panel-head">
                <h3>Driver Search Result</h3>
              </div>

              {selectedDriver ? (
                <>
                  <div className="dmoverview-driver-details-card">
                    <div className="dmoverview-driver-details-top">
                      <div className="dmoverview-driver-avatar">
                        <FaUser />
                      </div>

                      <div className="dmoverview-driver-main-details">
                        <h3>{selectedDriver.name || "N/A"}</h3>
                        <p>
                          <FaEnvelope className="dmoverview-inline-icon" />
                          {selectedDriver.email || "N/A"}
                        </p>
                      </div>

                      <span
                        className={`dmoverview-driver-status-pill ${
                          selectedDriver.isOnline ? "online" : "offline"
                        }`}
                      >
                        {selectedDriver.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>

                    <div className="dmoverview-driver-details-grid">
                      <div className="dmoverview-driver-detail-box">
                        <h4>
                          <FaPhoneAlt className="dmoverview-inline-icon" />
                          Phone
                        </h4>
                        <p>{selectedDriver.phone || "Not Available"}</p>
                      </div>

                      <div className="dmoverview-driver-detail-box">
                        <h4>
                          <FaIdBadge className="dmoverview-inline-icon" />
                          Role
                        </h4>
                        <p>{selectedDriver.role || "delivery"}</p>
                      </div>

                      <div className="dmoverview-driver-detail-box">
                        <h4>
                          <FaMotorcycle className="dmoverview-inline-icon" />
                          Vehicle Type
                        </h4>
                        <p>{selectedDriver.vehicleType || "Not Available"}</p>
                      </div>

                      <div className="dmoverview-driver-detail-box">
                        <h4>
                          <FaTruck className="dmoverview-inline-icon" />
                          Experience
                        </h4>
                        <p>{selectedDriver.experience || "Not Available"}</p>
                      </div>

                      <div className="dmoverview-driver-detail-box">
                        <h4>
                          <FaClipboardList className="dmoverview-inline-icon" />
                          Active Taken Orders
                        </h4>
                        <p>{selectedDriverTakenCount}</p>
                      </div>

                      <div className="dmoverview-driver-detail-box">
                        <h4>
                          <FaCheckCircle className="dmoverview-inline-icon" />
                          Completed Deliveries
                        </h4>
                        <p>{selectedDriverCompletedCount}</p>
                      </div>

                      <div className="dmoverview-driver-detail-box">
                        <h4>
                          <FaMoneyBillWave className="dmoverview-inline-icon" />
                          Delivery Revenue
                        </h4>
                        <p>{formatCurrency(selectedDriverTotalRevenue)}</p>
                      </div>

                      <div className="dmoverview-driver-detail-box">
                        <h4>
                          <FaBoxOpen className="dmoverview-inline-icon" />
                          Delivery History Records
                        </h4>
                        <p>{selectedDriverCompletedOrders.length}</p>
                      </div>

                      <div className="dmoverview-driver-detail-box dmoverview-driver-detail-full">
                        <h4>
                          <FaClock className="dmoverview-inline-icon" />
                          Created At
                        </h4>
                        <p>{formatDateTime(selectedDriver.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="dmoverview-panel dmoverview-driver-history-panel">
                    <div className="dmoverview-panel-head">
                      <h3>{selectedDriver.name || "Driver"} Delivery History</h3>
                    </div>

                    {selectedDriverCompletedOrders.length === 0 ? (
                      <p className="dmoverview-empty-text">
                        This driver has no completed delivery history yet.
                      </p>
                    ) : (
                      <div className="dmoverview-table-wrap">
                        <table className="dmoverview-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Customer</th>
                              <th>Email</th>
                              <th>Location</th>
                              <th>Payment</th>
                              <th>Total</th>
                              <th>Finished At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedDriverCompletedOrders.map((order) => (
                              <tr key={order._id || order.orderId}>
                                <td>{order.orderId || "N/A"}</td>
                                <td>{order.customerName || "N/A"}</td>
                                <td>{order.gmail || "N/A"}</td>
                                <td>
                                  {order.selectedDeliveryLocation ||
                                    order.deliveryLocation ||
                                    order.customLocation ||
                                    order.address ||
                                    "N/A"}
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
              ) : (
                <div className="dmoverview-state-box">
                  No driver found for this name or email.
                </div>
              )}
            </div>
          )}

          <div className="dmoverview-main-grid">
            <div className="dmoverview-panel">
              <div className="dmoverview-panel-head">
                <h3>Today’s Summary</h3>
              </div>

              <div className="dmoverview-summary-grid">
                <div className="dmoverview-summary-card">
                  <span className="dmoverview-summary-label">Completed Today</span>
                  <strong>{todayCompletedOrders}</strong>
                </div>

                <div className="dmoverview-summary-card">
                  <span className="dmoverview-summary-label">Online Drivers</span>
                  <strong>{onlineDrivers}</strong>
                </div>

                <div className="dmoverview-summary-card">
                  <span className="dmoverview-summary-label">Offline Drivers</span>
                  <strong>{offlineDrivers}</strong>
                </div>

                <div className="dmoverview-summary-card">
                  <span className="dmoverview-summary-label">Orders In Progress</span>
                  <strong>{totalTakenOrders}</strong>
                </div>
              </div>
            </div>

            <div className="dmoverview-panel">
              <div className="dmoverview-panel-head">
                <h3>Driver Performance</h3>
              </div>

              {topDrivers.length === 0 ? (
                <p className="dmoverview-empty-text">
                  No driver performance data available.
                </p>
              ) : (
                <div className="dmoverview-driver-list">
                  {topDrivers.map((driver, index) => (
                    <div className="dmoverview-driver-item" key={driver.name}>
                      <div className="dmoverview-driver-rank">{index + 1}</div>
                      <div className="dmoverview-driver-info">
                        <h4>{driver.name}</h4>
                        <p>{driver.count} completed deliveries</p>
                      </div>
                      <div className="dmoverview-driver-amount">
                        {formatCurrency(driver.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="dmoverview-main-grid dmoverview-second-grid">
            <div className="dmoverview-panel">
              <div className="dmoverview-panel-head">
                <h3>Recent Activity</h3>
              </div>

              {latestActivities.length === 0 ? (
                <p className="dmoverview-empty-text">No recent activity found.</p>
              ) : (
                <div className="dmoverview-activity-list">
                  {latestActivities.map((activity) => (
                    <div className="dmoverview-activity-item" key={activity.id}>
                      <div className="dmoverview-activity-icon">
                        <FaArrowUp />
                      </div>

                      <div className="dmoverview-activity-content">
                        <h4>{activity.title}</h4>
                        <p>
                          <FaUser className="dmoverview-inline-icon" />
                          {activity.person}
                        </p>
                        <p>
                          <FaMapMarkerAlt className="dmoverview-inline-icon" />
                          {activity.location}
                        </p>
                      </div>

                      <div className="dmoverview-activity-meta">
                        <span className="dmoverview-activity-type">
                          {activity.type}
                        </span>
                        <small>
                          <FaClock className="dmoverview-inline-icon" />
                          {formatDateTime(activity.time)}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dmoverview-panel">
              <div className="dmoverview-panel-head">
                <h3>Driver Availability</h3>
              </div>

              <div className="dmoverview-availability-grid">
                <div className="dmoverview-availability-card online">
                  <h4>Online Drivers</h4>
                  <strong>{onlineDrivers}</strong>
                  <p>Currently active and available for delivery assignments.</p>
                </div>

                <div className="dmoverview-availability-card offline">
                  <h4>Offline Drivers</h4>
                  <strong>{offlineDrivers}</strong>
                  <p>Currently unavailable or not active in the system.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dmoverview-panel dmoverview-table-panel">
            <div className="dmoverview-panel-head">
              <h3>Latest Completed Deliveries</h3>
            </div>

            {filteredFinishedOrders.length === 0 ? (
              <p className="dmoverview-empty-text">
                No completed delivery records found.
              </p>
            ) : (
              <div className="dmoverview-table-wrap">
                <table className="dmoverview-table">
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
                    {filteredFinishedOrders.slice(0, 10).map((order) => (
                      <tr key={order._id || order.orderId}>
                        <td>{order.orderId || "N/A"}</td>
                        <td>{order.customerName || "N/A"}</td>
                        <td>{order.deliveredByStaffName || "N/A"}</td>
                        <td>
                          {order.selectedDeliveryLocation ||
                            order.deliveryLocation ||
                            order.customLocation ||
                            order.address ||
                            "N/A"}
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