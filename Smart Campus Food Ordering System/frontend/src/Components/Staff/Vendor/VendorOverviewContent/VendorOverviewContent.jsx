import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import {
  FaClipboardList,
  FaCheckDouble,
  FaDollarSign,
  FaExclamationCircle,
  FaBoxes,
  FaSearch,
  FaSyncAlt,
  FaChartLine,
  FaTruck,
  FaShoppingBag,
  FaCreditCard,
  FaUserCheck,
  FaFilePdf,
} from "react-icons/fa";
import logo from "../../../Website/image/logo.png";
import "./VendorOverviewContent.css";

const API_BASE = "http://localhost:5000";

const vendorSummary = [
  {
    title: "Vendor Orders",
    text: "View active customer orders, monitor order status, and continue order processing from one place.",
  },
  {
    title: "Completed Orders",
    text: "Review completed takeaway and delivery orders with customer, payment, and item details.",
  },
  {
    title: "Vendor Earnings",
    text: "Track finished-order earnings, payment methods, average order value, and daily revenue.",
  },
  {
    title: "Vendor Analytics",
    text: "Analyze sales performance, top items, payment trends, and revenue by selected date range.",
  },
  {
    title: "Complaint Desk",
    text: "Review complaint details, update complaint status, and send responses to customers.",
  },
  {
    title: "Inventory",
    text: "Manage stock levels, supplier details, reorder levels, and inventory item availability.",
  },
];

export default function VendorOverviewContent() {
  const [vendorOrders, setVendorOrders] = useState([]);
  const [vendorCompletedOrders, setVendorCompletedOrders] = useState([]);
  const [vendorPayments, setVendorPayments] = useState([]);
  const [vendorComplaints, setVendorComplaints] = useState([]);
  const [vendorInventory, setVendorInventory] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(true);
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorMessage, setVendorMessage] = useState({
    type: "",
    text: "",
  });

  const showVendorMessage = (type, text) => {
    setVendorMessage({ type, text });
    setTimeout(() => {
      setVendorMessage({ type: "", text: "" });
    }, 3000);
  };

  const fetchVendorOverviewData = async () => {
    try {
      setVendorLoading(true);

      const [ordersRes, completedRes, paymentsRes, complaintsRes, inventoryRes] =
        await Promise.allSettled([
          axios.get(`${API_BASE}/orders`),
          axios.get(`${API_BASE}/completed-orders`),
          axios.get(`${API_BASE}/payment`),
          axios.get(`${API_BASE}/complaints`),
          axios.get(`${API_BASE}/inventory`),
        ]);

      setVendorOrders(
        ordersRes.status === "fulfilled" ? ordersRes.value.data?.orders || [] : []
      );

      setVendorCompletedOrders(
        completedRes.status === "fulfilled"
          ? completedRes.value.data?.completedOrders ||
              completedRes.value.data?.orders ||
              []
          : []
      );

      setVendorPayments(
        paymentsRes.status === "fulfilled"
          ? paymentsRes.value.data?.payments || []
          : []
      );

      setVendorComplaints(
        complaintsRes.status === "fulfilled"
          ? complaintsRes.value.data?.complaints || []
          : []
      );

      setVendorInventory(
        inventoryRes.status === "fulfilled"
          ? inventoryRes.value.data?.inventory ||
              inventoryRes.value.data?.items ||
              []
          : []
      );
    } catch (error) {
      console.log("Vendor overview fetch error:", error);
      showVendorMessage("error", "Failed to load vendor overview data.");
    } finally {
      setVendorLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorOverviewData();
  }, []);

  const vendorFilteredOrders = useMemo(() => {
    const value = vendorSearch.trim().toLowerCase();

    if (!value) return [];

    return [...vendorOrders, ...vendorCompletedOrders].filter((order) => {
      const orderId = String(order.orderId || "").toLowerCase();
      const customer = String(order.customerName || "").toLowerCase();
      const email = String(order.gmail || "").toLowerCase();

      return (
        orderId.includes(value) ||
        customer.includes(value) ||
        email.includes(value)
      );
    });
  }, [vendorSearch, vendorOrders, vendorCompletedOrders]);

  const activeOrdersCount = vendorOrders.filter(
    (order) => String(order.orderStatus || "").toLowerCase() !== "completed"
  ).length;

  const pendingOrdersCount = vendorOrders.filter(
    (order) => String(order.orderStatus || "").toLowerCase() === "pending"
  ).length;

  const completedOrdersCount = vendorCompletedOrders.filter((order) => {
    const status = String(order.orderStatus || "").toLowerCase();
    return status === "completed" || status === "finished";
  }).length;

  const finishedOrdersCount = vendorCompletedOrders.filter(
    (order) => String(order.orderStatus || "").toLowerCase() === "finished"
  ).length;

  const totalRevenue = vendorCompletedOrders.reduce(
    (sum, order) => sum + Number(order.grandTotal || 0),
    0
  );

  const totalPayments = vendorPayments.length;

  const paidPayments = vendorPayments.filter(
    (payment) => String(payment.paymentStatus || "").toLowerCase() === "paid"
  ).length;

  const pendingPayments = vendorPayments.filter(
    (payment) => String(payment.paymentStatus || "").toLowerCase() === "pending"
  ).length;

  const totalComplaints = vendorComplaints.length;

  const pendingComplaints = vendorComplaints.filter(
    (item) => String(item.status || "Pending").toLowerCase() === "pending"
  ).length;

  const resolvedComplaints = vendorComplaints.filter(
    (item) => String(item.status || "").toLowerCase() === "resolved"
  ).length;

  const totalInventory = vendorInventory.length;

  const availableInventory = vendorInventory.filter(
    (item) => String(item.stockStatus || "").toLowerCase() === "available"
  ).length;

  const lowStockInventory = vendorInventory.filter(
    (item) => String(item.stockStatus || "").toLowerCase() === "low stock"
  ).length;

  const getOrderTypeClass = (type) => {
    const value = String(type || "").toLowerCase();
    if (value === "delivery") return "venover-type-pill delivery";
    if (value === "takeaway") return "venover-type-pill takeaway";
    return "venover-type-pill default";
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
      nextY: y + lines.length * lineHeight,
    };
  };

  const handleDownloadVendorPDF = async () => {
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
        doc.text("VENDOR DASHBOARD SUMMARY REPORT", pageWidth / 2, 40, {
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
        `Active Orders: ${activeOrdersCount}`,
        `Pending Orders: ${pendingOrdersCount}`,
        `Completed Orders: ${completedOrdersCount}`,
        `Finished Orders: ${finishedOrdersCount}`,
        `Total Revenue: LKR ${totalRevenue.toFixed(2)}`,
        `Inventory Items: ${totalInventory}`,
      ]);

      drawSectionTitle("Vendor Dashboard Module Summary");
      vendorSummary.forEach((item, index) => {
        drawSimpleCard(
          `${index + 1}. ${item.title}`,
          [255, 152, 0],
          [item.text],
          [250, 250, 250]
        );
      });

      drawSectionTitle("Orders Snapshot");
      drawBulletList([
        `Active Orders: ${activeOrdersCount}`,
        `Pending Orders: ${pendingOrdersCount}`,
        `Completed Orders: ${completedOrdersCount}`,
        `Finished Orders: ${finishedOrdersCount}`,
      ]);

      vendorOrders.slice(0, 12).forEach((order, index) => {
        drawSimpleCard(
          `${index + 1}. ${order.orderId || "Order"} - ${
            order.customerName || "Unknown Customer"
          }`,
          [46, 125, 50],
          [
            `Order Type: ${order.orderType || "-"}`,
            `Order Status: ${order.orderStatus || "-"}`,
            `Payment Method: ${order.paymentMethod || "-"}`,
            `Grand Total: LKR ${Number(order.grandTotal || 0).toFixed(2)}`,
          ]
        );
      });

      drawSectionTitle("Payments Summary");
      drawBulletList([
        `Total Payments: ${totalPayments}`,
        `Paid Payments: ${paidPayments}`,
        `Pending Payments: ${pendingPayments}`,
        `Revenue from Completed Orders: LKR ${totalRevenue.toFixed(2)}`,
      ]);

      vendorPayments.slice(0, 12).forEach((payment, index) => {
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
        `Total Complaints: ${totalComplaints}`,
        `Pending Complaints: ${pendingComplaints}`,
        `Resolved Complaints: ${resolvedComplaints}`,
      ]);

      vendorComplaints.slice(0, 10).forEach((item, index) => {
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

      drawSectionTitle("Inventory Summary");
      drawBulletList([
        `Total Inventory Items: ${totalInventory}`,
        `Available Inventory: ${availableInventory}`,
        `Low Stock Inventory: ${lowStockInventory}`,
      ]);

      vendorInventory.slice(0, 10).forEach((item, index) => {
        drawSimpleCard(
          `${index + 1}. ${item.itemName || "Inventory Item"}`,
          [46, 125, 50],
          [
            `Category: ${item.category || "-"}`,
            `Quantity: ${item.quantity ?? 0}`,
            `Stock Status: ${item.stockStatus || "-"}`,
            `Supplier: ${item.supplierName || "-"}`,
          ]
        );
      });

      drawSectionTitle("Search Results");
      if (vendorSearch.trim() === "") {
        drawSimpleCard(
          "No Search Value Entered",
          [255, 152, 0],
          ["Search box is empty."]
        );
      } else if (vendorFilteredOrders.length === 0) {
        drawSimpleCard(
          `Search Results for "${vendorSearch}"`,
          [255, 152, 0],
          ["No matching orders found."]
        );
      } else {
        vendorFilteredOrders.slice(0, 12).forEach((order, index) => {
          drawSimpleCard(
            `${index + 1}. ${order.orderId || "Order"} - ${
              order.customerName || "Unknown Customer"
            }`,
            [255, 152, 0],
            [
              `Email: ${order.gmail || "N/A"}`,
              `Phone: ${order.phoneNumber || "N/A"}`,
              `Order Type: ${order.orderType || "N/A"}`,
              `Order Status: ${order.orderStatus || "N/A"}`,
              `Grand Total: LKR ${Number(order.grandTotal || 0).toFixed(2)}`,
            ]
          );
        });
      }

      drawFooterOnAllPages();

      doc.save("Vendor_Dashboard_Full_Report.pdf");
      showVendorMessage("success", "Vendor PDF downloaded successfully.");
    } catch (error) {
      console.log("Vendor PDF generation error:", error);
      showVendorMessage("error", "Failed to generate vendor PDF.");
    }
  };

  return (
    <section className="venover-wrapper">
      <div className="venover-topbar">
        <div>
          <span className="venover-badge">Vendor Overview</span>
          <h2>Vendor Overview Dashboard</h2>
          <p>
            View quick business insights, vendor module summary, and search
            orders by order ID, customer name, or email.
          </p>
        </div>

        <button className="venover-refresh-btn" onClick={fetchVendorOverviewData}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      {vendorMessage.text && (
        <div className={`venover-alert ${vendorMessage.type}`}>
          {vendorMessage.text}
        </div>
      )}

      <div className="venover-stats-grid">
        <div className="venover-stat-card">
          <div className="venover-stat-icon green">
            <FaClipboardList />
          </div>
          <div>
            <h3>{activeOrdersCount}</h3>
            <p>Active Orders</p>
          </div>
        </div>

        <div className="venover-stat-card">
          <div className="venover-stat-icon orange">
            <FaUserCheck />
          </div>
          <div>
            <h3>{completedOrdersCount}</h3>
            <p>Completed Orders</p>
          </div>
        </div>

        <div className="venover-stat-card">
          <div className="venover-stat-icon green">
            <FaDollarSign />
          </div>
          <div>
            <h3>LKR {totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="venover-stat-card">
          <div className="venover-stat-icon dark">
            <FaBoxes />
          </div>
          <div>
            <h3>{totalInventory}</h3>
            <p>Inventory Items</p>
          </div>
        </div>
      </div>

      <div className="venover-summary-card">
        <div className="venover-summary-head">
          <div>
            <span className="venover-summary-badge">System Summary</span>
            <h3>Vendor Dashboard Module Summary</h3>
            <p>
              Orders, completed orders, earnings, analytics, complaints, and
              inventory combined into one downloadable report.
            </p>
          </div>

          <button
            className="venover-pdf-btn"
            type="button"
            onClick={handleDownloadVendorPDF}
          >
            <FaFilePdf />
            <span>Download PDF</span>
          </button>
        </div>

        <div className="venover-summary-grid">
          {vendorSummary.map((item, index) => (
            <div className="venover-summary-item-card" key={index}>
              <div className="venover-summary-icon">
                {index === 0 && <FaClipboardList />}
                {index === 1 && <FaCheckDouble />}
                {index === 2 && <FaDollarSign />}
                {index === 3 && <FaChartLine />}
                {index === 4 && <FaExclamationCircle />}
                {index === 5 && <FaBoxes />}
              </div>
              <div>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="venover-quick-grid">
        <div className="venover-quick-card">
          <div className="venover-quick-head">
            <h3>
              <FaTruck />
              Order Snapshot
            </h3>
          </div>

          <div className="venover-quick-list">
            <div className="venover-quick-row">
              <span>Pending Orders</span>
              <strong>{pendingOrdersCount}</strong>
            </div>
            <div className="venover-quick-row">
              <span>Completed Orders</span>
              <strong>{completedOrdersCount}</strong>
            </div>
            <div className="venover-quick-row">
              <span>Finished Orders</span>
              <strong>{finishedOrdersCount}</strong>
            </div>
          </div>
        </div>

        <div className="venover-quick-card">
          <div className="venover-quick-head">
            <h3>
              <FaCreditCard />
              Payment Snapshot
            </h3>
          </div>

          <div className="venover-quick-list">
            <div className="venover-quick-row">
              <span>Total Payments</span>
              <strong>{totalPayments}</strong>
            </div>
            <div className="venover-quick-row">
              <span>Paid Payments</span>
              <strong>{paidPayments}</strong>
            </div>
            <div className="venover-quick-row">
              <span>Total Revenue</span>
              <strong>LKR {totalRevenue.toFixed(2)}</strong>
            </div>
          </div>
        </div>

        <div className="venover-quick-card">
          <div className="venover-quick-head">
            <h3>
              <FaExclamationCircle />
              Support Snapshot
            </h3>
          </div>

          <div className="venover-quick-list">
            <div className="venover-quick-row">
              <span>Total Complaints</span>
              <strong>{totalComplaints}</strong>
            </div>
            <div className="venover-quick-row">
              <span>Pending Complaints</span>
              <strong>{pendingComplaints}</strong>
            </div>
            <div className="venover-quick-row">
              <span>Available Inventory</span>
              <strong>{availableInventory}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="venover-search-card">
        <div className="venover-search-head">
          <h3>Search Orders</h3>
          <p>Type order ID, customer name, or email to view matching orders.</p>
        </div>

        <div className="venover-search-box">
          <FaSearch className="venover-search-icon" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, or email..."
            value={vendorSearch}
            onChange={(e) => setVendorSearch(e.target.value)}
          />
        </div>
      </div>

      {vendorLoading ? (
        <div className="venover-state-box">Loading vendor overview data...</div>
      ) : vendorSearch.trim() === "" ? (
        <div className="venover-state-box">
          Start typing an order ID, customer name, or email to see matching
          order details.
        </div>
      ) : vendorFilteredOrders.length === 0 ? (
        <div className="venover-state-box">No matching orders found.</div>
      ) : (
        <div className="venover-details-grid">
          {vendorFilteredOrders.map((order) => (
            <div className="venover-detail-card" key={order._id || order.orderId}>
              <div className="venover-detail-top">
                <div>
                  <h3>{order.orderId || "N/A"}</h3>
                  <p>{order.customerName || "N/A"}</p>
                </div>

                <span className={getOrderTypeClass(order.orderType)}>
                  {order.orderType || "N/A"}
                </span>
              </div>

              <div className="venover-info-grid">
                <div className="venover-info-item">
                  <span>Customer Email</span>
                  <strong>{order.gmail || "N/A"}</strong>
                </div>

                <div className="venover-info-item">
                  <span>Phone</span>
                  <strong>{order.phoneNumber || "N/A"}</strong>
                </div>

                <div className="venover-info-item">
                  <span>Order Status</span>
                  <strong>{order.orderStatus || "N/A"}</strong>
                </div>

                <div className="venover-info-item">
                  <span>Payment Method</span>
                  <strong>{order.paymentMethod || "N/A"}</strong>
                </div>

                <div className="venover-info-item">
                  <span>Grand Total</span>
                  <strong>LKR {Number(order.grandTotal || 0).toFixed(2)}</strong>
                </div>

                <div className="venover-info-item">
                  <span>Created At</span>
                  <strong>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : order.completedAt
                      ? new Date(order.completedAt).toLocaleString()
                      : "N/A"}
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