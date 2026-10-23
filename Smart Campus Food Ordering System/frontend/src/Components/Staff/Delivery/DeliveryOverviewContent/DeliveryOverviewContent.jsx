import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import {
  FaMotorcycle,
  FaSyncAlt,
  FaSearch,
  FaClipboardList,
  FaCheckCircle,
  FaMoneyBillWave,
  FaChartLine,
  FaMapMarkerAlt,
  FaClock,
  FaTruck,
  FaFilePdf,
  FaWallet,
  FaHistory,
  FaUserCheck,
} from "react-icons/fa";
import logo from "../../../Website/image/logo.png";
import "./DeliveryOverviewContent.css";

const API_BASE = "http://localhost:5000";

const deliverySummary = [
  {
    title: "My Delivery Analysis",
    text: "View your active taken orders, finished deliveries, revenue trends, payment breakdown, and performance summary.",
  },
  {
    title: "My Delivery History",
    text: "Review your completed delivery records with customer details, item details, payment info, and delivery location.",
  },
  {
    title: "Revenue Tracking",
    text: "Track total delivery revenue, average order value, and recent earnings from completed delivery orders.",
  },
  {
    title: "Recent Deliveries",
    text: "Quickly access your latest finished delivery orders and customer delivery locations.",
  },
];

export default function DeliveryOverviewContent() {
  const [takenOrders, setTakenOrders] = useState([]);
  const [finishedOrders, setFinishedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
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

  const fetchDeliveryOverviewData = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        setTakenOrders([]);
        setFinishedOrders([]);
        return;
      }

      const [takenRes, finishedRes] = await Promise.all([
        axios.get(`${API_BASE}/taken-delivery-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_BASE}/delivery-fenish/my-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTakenOrders(takenRes.data?.takenOrders || []);
      setFinishedOrders(finishedRes.data?.finishedOrders || []);
    } catch (error) {
      console.log("fetchDeliveryOverviewData error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to load delivery overview data."
      );
      setTakenOrders([]);
      setFinishedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryOverviewData();
  }, []);

  const filteredOrders = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    return [...takenOrders, ...finishedOrders].filter((order) => {
      if (!value) return false;

      return (
        String(order.orderId || "").toLowerCase().includes(value) ||
        String(order.customerName || "").toLowerCase().includes(value) ||
        String(order.gmail || "").toLowerCase().includes(value) ||
        String(order.phoneNumber || "").toLowerCase().includes(value) ||
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
  }, [takenOrders, finishedOrders, searchText]);

  const totalTaken = takenOrders.length;
  const totalFinished = finishedOrders.length;

  const totalRevenue = finishedOrders.reduce(
    (sum, order) => sum + Number(order.grandTotal || 0),
    0
  );

  const totalItems = finishedOrders.reduce((sum, order) => {
    const count = Array.isArray(order.items)
      ? order.items.reduce((acc, item) => acc + Number(item.qty || 0), 0)
      : 0;
    return sum + count;
  }, 0);

  const averageOrderValue = totalFinished > 0 ? totalRevenue / totalFinished : 0;

  const paymentStats = useMemo(() => {
    const stats = {};

    finishedOrders.forEach((order) => {
      const key = String(order.paymentMethod || "Unknown").trim() || "Unknown";
      stats[key] = (stats[key] || 0) + 1;
    });

    return Object.entries(stats).map(([name, count]) => ({
      name,
      count,
    }));
  }, [finishedOrders]);

  const revenueByDay = useMemo(() => {
    const map = {};

    finishedOrders.forEach((order) => {
      const rawDate = order.finishedAt || order.deliveredAt || order.createdAt;
      if (!rawDate) return;

      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return;

      const label = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

      map[label] = (map[label] || 0) + Number(order.grandTotal || 0);
    });

    return Object.entries(map)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-7)
      .map(([date, amount]) => ({ date, amount }));
  }, [finishedOrders]);

  const latestFinishedOrders = [...finishedOrders]
    .sort((a, b) => new Date(b.finishedAt || 0) - new Date(a.finishedAt || 0))
    .slice(0, 5);

  const formatCurrency = (value) => `LKR ${Number(value || 0).toFixed(2)}`;

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
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

  const handleDownloadDeliveryPDF = async () => {
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
        doc.text("DELIVERY SUMMARY REPORT", pageWidth / 2, 40, {
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
        `Active Taken Orders: ${totalTaken}`,
        `Finished Deliveries: ${totalFinished}`,
        `Total Revenue: ${formatCurrency(totalRevenue)}`,
        `Average Order Value: ${formatCurrency(averageOrderValue)}`,
        `Total Delivered Items: ${totalItems}`,
      ]);

      drawSectionTitle("Delivery Module Summary");
      deliverySummary.forEach((item, index) => {
        drawSimpleCard(
          `${index + 1}. ${item.title}`,
          [255, 152, 0],
          [item.text],
          [250, 250, 250]
        );
      });

      drawSectionTitle("Payment Method Breakdown");
      if (paymentStats.length === 0) {
        drawSimpleCard("No Payment Data", [255, 152, 0], [
          "No payment data available.",
        ]);
      } else {
        paymentStats.forEach((item, index) => {
          drawSimpleCard(
            `${index + 1}. ${item.name}`,
            [46, 125, 50],
            [`Usage Count: ${item.count}`]
          );
        });
      }

      drawSectionTitle("Revenue Trend");
      if (revenueByDay.length === 0) {
        drawSimpleCard("No Revenue Trend Data", [255, 152, 0], [
          "No revenue trend data available.",
        ]);
      } else {
        revenueByDay.forEach((item, index) => {
          drawSimpleCard(
            `${index + 1}. ${item.date}`,
            [46, 125, 50],
            [`Revenue: ${formatCurrency(item.amount)}`]
          );
        });
      }

      drawSectionTitle("Recent Finished Deliveries");
      if (latestFinishedOrders.length === 0) {
        drawSimpleCard("No Finished Deliveries", [255, 152, 0], [
          "No finished deliveries found.",
        ]);
      } else {
        latestFinishedOrders.forEach((order, index) => {
          drawSimpleCard(
            `${index + 1}. ${order.orderId || "Order"} - ${
              order.customerName || "Unknown Customer"
            }`,
            [46, 125, 50],
            [
              `Payment: ${order.paymentMethod || "N/A"}`,
              `Location: ${
                order.selectedDeliveryLocation ||
                order.deliveryLocation ||
                order.customLocation ||
                order.address ||
                "N/A"
              }`,
              `Order Type: ${order.orderType || "N/A"}`,
              `Total: ${formatCurrency(order.grandTotal)}`,
              `Finished At: ${formatDateTime(order.finishedAt)}`,
            ]
          );
        });
      }

      drawSectionTitle("Search Results");
      if (searchText.trim() === "") {
        drawSimpleCard("No Search Value Entered", [255, 152, 0], [
          "Search box is empty.",
        ]);
      } else if (filteredOrders.length === 0) {
        drawSimpleCard(`Search Results for "${searchText}"`, [255, 152, 0], [
          "No matching delivery records found.",
        ]);
      } else {
        filteredOrders.slice(0, 12).forEach((order, index) => {
          drawSimpleCard(
            `${index + 1}. ${order.orderId || "Order"} - ${
              order.customerName || "Unknown Customer"
            }`,
            [255, 152, 0],
            [
              `Email: ${order.gmail || "N/A"}`,
              `Phone: ${order.phoneNumber || "N/A"}`,
              `Payment Method: ${order.paymentMethod || "N/A"}`,
              `Location: ${
                order.selectedDeliveryLocation ||
                order.deliveryLocation ||
                order.customLocation ||
                order.address ||
                "N/A"
              }`,
              `Grand Total: ${formatCurrency(order.grandTotal)}`,
            ]
          );
        });
      }

      drawFooterOnAllPages();

      doc.save("Delivery_Summary_Report.pdf");
      showMessage("success", "Delivery PDF downloaded successfully.");
    } catch (error) {
      console.log("Delivery PDF generation error:", error);
      showMessage("error", "Failed to generate delivery PDF.");
    }
  };

  return (
    <section className="delover-wrapper">
      <div className="delover-topbar">
        <div>
          <span className="delover-badge">Overview</span>
          <h2>Delivery Overview Dashboard</h2>
          <p>
            View your active deliveries, finished orders, revenue summary,
            recent history, and search delivery records in one place.
          </p>
        </div>

        <div className="delover-topbar-actions">
          <button className="delover-refresh-btn" onClick={fetchDeliveryOverviewData}>
            <FaSyncAlt />
            <span>Refresh</span>
          </button>

          <button
            className="delover-pdf-btn"
            type="button"
            onClick={handleDownloadDeliveryPDF}
          >
            <FaFilePdf />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`delover-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="delover-stats-grid">
        <div className="delover-stat-card">
          <div className="delover-stat-icon green">
            <FaClipboardList />
          </div>
          <div>
            <h3>{totalTaken}</h3>
            <p>Active Taken Orders</p>
          </div>
        </div>

        <div className="delover-stat-card">
          <div className="delover-stat-icon green">
            <FaCheckCircle />
          </div>
          <div>
            <h3>{totalFinished}</h3>
            <p>Finished Deliveries</p>
          </div>
        </div>

        <div className="delover-stat-card">
          <div className="delover-stat-icon orange">
            <FaMoneyBillWave />
          </div>
          <div>
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="delover-stat-card">
          <div className="delover-stat-icon dark">
            <FaUserCheck />
          </div>
          <div>
            <h3>{formatCurrency(averageOrderValue)}</h3>
            <p>Average Order Value</p>
          </div>
        </div>
      </div>

      <div className="delover-summary-card">
        <div className="delover-summary-head">
          <div>
            <span className="delover-summary-badge">System Summary</span>
            <h3>Delivery Dashboard Module Summary</h3>
            <p>
              Delivery analysis, delivery history, revenue tracking, and recent
              finished deliveries combined into one downloadable report.
            </p>
          </div>
        </div>

        <div className="delover-summary-grid">
          {deliverySummary.map((item, index) => (
            <div className="delover-summary-item-card" key={index}>
              <div className="delover-summary-icon">
                {index === 0 && <FaChartLine />}
                {index === 1 && <FaHistory />}
                {index === 2 && <FaWallet />}
                {index === 3 && <FaTruck />}
              </div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="delover-search-card">
        <div className="delover-search-head">
          <h3>Search Delivery Records</h3>
          <p>Search by order ID, customer, email, payment method, or location.</p>
        </div>

        <div className="delover-search-box">
          <FaSearch className="delover-search-icon" />
          <input
            type="text"
            placeholder="Search by order ID, customer, email, payment or location..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="delover-state-box">Loading delivery overview data...</div>
      ) : searchText.trim() === "" ? (
        <div className="delover-state-box">
          Start typing an order ID, customer, email, payment, or location to see
          matching delivery records.
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="delover-state-box">No matching delivery records found.</div>
      ) : (
        <div className="delover-details-grid">
          {filteredOrders.map((order) => (
            <div className="delover-detail-card" key={order._id || order.orderId}>
              <div className="delover-detail-top">
                <div>
                  <h3>{order.orderId || "N/A"}</h3>
                  <p>{order.customerName || "N/A"}</p>
                </div>

                <span className="delover-type-pill">
                  {order.finalDeliveryStatus || order.deliveryStatus || "Active"}
                </span>
              </div>

              <div className="delover-info-grid">
                <div className="delover-info-item">
                  <span>Customer Email</span>
                  <strong>{order.gmail || "N/A"}</strong>
                </div>

                <div className="delover-info-item">
                  <span>Phone</span>
                  <strong>{order.phoneNumber || "N/A"}</strong>
                </div>

                <div className="delover-info-item">
                  <span>Payment Method</span>
                  <strong>{order.paymentMethod || "N/A"}</strong>
                </div>

                <div className="delover-info-item">
                  <span>Grand Total</span>
                  <strong>{formatCurrency(order.grandTotal)}</strong>
                </div>

                <div className="delover-info-item delover-full-width">
                  <span>
                    <FaMapMarkerAlt /> Delivery Location
                  </span>
                  <strong>
                    {order.selectedDeliveryLocation ||
                      order.deliveryLocation ||
                      order.customLocation ||
                      order.address ||
                      "N/A"}
                  </strong>
                </div>

                <div className="delover-info-item">
                  <span>
                    <FaClock /> Finished / Updated At
                  </span>
                  <strong>
                    {formatDateTime(
                      order.finishedAt ||
                        order.deliveredAt ||
                        order.takenAt ||
                        order.createdAt
                    )}
                  </strong>
                </div>

                <div className="delover-info-item">
                  <span>Order Type</span>
                  <strong>{order.orderType || "N/A"}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && latestFinishedOrders.length > 0 && (
        <div className="delover-latest-card">
          <div className="delover-latest-head">
            <h3>Recent Finished Deliveries</h3>
          </div>

          <div className="delover-latest-grid">
            {latestFinishedOrders.map((order) => (
              <div className="delover-latest-item" key={order._id || order.orderId}>
                <h4>{order.orderId || "N/A"}</h4>
                <p>{order.customerName || "N/A"}</p>
                <span>{formatCurrency(order.grandTotal)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}