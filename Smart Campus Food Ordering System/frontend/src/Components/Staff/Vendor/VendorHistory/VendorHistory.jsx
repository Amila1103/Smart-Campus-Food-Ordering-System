import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaHistory,
  FaSearch,
  FaFilter,
  FaSyncAlt,
  FaCheckCircle,
  FaMoneyBillWave,
  FaTruck,
  FaShoppingBag,
  FaReceipt,
  FaTimesCircle,
  FaChartPie,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import "./VendorHistory.css";

const API_BASE = "http://localhost:5000";

export default function VendorHistory() {
  const [historyOrders, setHistoryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchText, setSearchText] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchVendorHistory = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const [completedRes, paymentRes] = await Promise.all([
        axios.get(`${API_BASE}/completed-orders`),
        axios.get(`${API_BASE}/payment`),
      ]);

      const completedOrders = completedRes?.data?.completedOrders || [];
      const payments = paymentRes?.data?.payments || [];

      const mergedOrders = completedOrders.map((order) => {
        const matchedPayment = payments.find(
          (payment) => String(payment.orderId) === String(order.orderId)
        );

        return {
          ...order,
          paymentRecord: matchedPayment || null,
          paymentMethod:
            matchedPayment?.paymentMethod ||
            order?.paymentMethod ||
            "Not Available",
          paymentStatus:
            matchedPayment?.paymentStatus ||
            order?.paymentStatus ||
            "Pending",
          invoiceNo: matchedPayment?.invoiceNo || "",
          invoiceDate: matchedPayment?.invoiceDate || "",
          paidAt: matchedPayment?.paidAt || null,
        };
      });

      const usableHistory = mergedOrders.filter((order) => {
        const status = String(order.orderStatus || "").toLowerCase();
        return status === "completed" || status === "finished";
      });

      setHistoryOrders(usableHistory);
    } catch (error) {
      console.log("Vendor history fetch error:", error);
      setErrorMsg("Failed to load vendor history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorHistory();
  }, []);

  const filteredOrders = useMemo(() => {
    return historyOrders.filter((order) => {
      const searchValue = searchText.trim().toLowerCase();

      const matchesSearch =
        !searchValue ||
        String(order.orderId || "").toLowerCase().includes(searchValue) ||
        String(order.customerName || "").toLowerCase().includes(searchValue) ||
        String(order.gmail || "").toLowerCase().includes(searchValue) ||
        String(order.phoneNumber || "").toLowerCase().includes(searchValue);

      const matchesType =
        orderTypeFilter === "all" ||
        String(order.orderType || "").toLowerCase() === orderTypeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        String(order.orderStatus || "").toLowerCase() === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [historyOrders, searchText, orderTypeFilter, statusFilter]);

  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + Number(order.grandTotal || 0),
    0
  );

  const paidCount = filteredOrders.filter(
    (order) => String(order.paymentStatus || "").toLowerCase() === "paid"
  ).length;

  const pendingCount = filteredOrders.filter(
    (order) => String(order.paymentStatus || "").toLowerCase() === "pending"
  ).length;

  const deliveryCount = filteredOrders.filter(
    (order) => String(order.orderType || "").toLowerCase() === "delivery"
  ).length;

  const takeawayCount = filteredOrders.filter(
    (order) => String(order.orderType || "").toLowerCase() === "takeaway"
  ).length;

  const completedCount = filteredOrders.filter(
    (order) => String(order.orderStatus || "").toLowerCase() === "completed"
  ).length;

  const finishedCount = filteredOrders.filter(
    (order) => String(order.orderStatus || "").toLowerCase() === "finished"
  ).length;

  const getStatusBadgeClass = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "finished") return "venhis-badge venhis-badge--green";
    if (normalized === "completed") return "venhis-badge venhis-badge--orange";
    return "venhis-badge venhis-badge--gray";
  };

  const getPaymentBadgeClass = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "paid") return "venhis-badge venhis-badge--green";
    if (normalized === "pending") return "venhis-badge venhis-badge--orange";
    return "venhis-badge venhis-badge--gray";
  };

  const formatCurrency = (value) => {
    return `LKR ${Number(value || 0).toFixed(2)}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "Not Available";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
  };

  const orderTypeChartData = [
    { name: "Delivery", value: deliveryCount },
    { name: "Takeaway", value: takeawayCount },
  ];

  const paymentChartData = [
    { name: "Paid", value: paidCount },
    { name: "Pending", value: pendingCount },
  ];

  const statusChartData = [
    { name: "Completed", value: completedCount },
    { name: "Finished", value: finishedCount },
  ];

  const ORDER_TOP_COLORS = ["#2E7D32", "#FF9800"];
  const ORDER_SIDE_COLORS = ["#1B5E20", "#E67600"];

  const PAYMENT_TOP_COLORS = ["#16A34A", "#F59E0B"];
  const PAYMENT_SIDE_COLORS = ["#166534", "#B45309"];

  const STATUS_TOP_COLORS = ["#38BDF8", "#8B5CF6"];
  const STATUS_SIDE_COLORS = ["#0369A1", "#6D28D9"];

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
          {data?.value || 0} records
        </p>
      </div>
    );
  };

  const render3DPieChart = (
    data,
    topColors,
    sideColors,
    title,
    subtitle
  ) => {
    const hasData = data.some((item) => Number(item.value) > 0);

    return (
      <div className="venhis-chart-card">
        <div className="venhis-chart-head">
          <div className="venhis-chart-title">
            <FaChartPie />
            <h3>{title}</h3>
          </div>
          <span className="venhis-chart-subtitle">{subtitle}</span>
        </div>

        {!hasData ? (
          <div className="venhis-empty-chart-box">No summary data available.</div>
        ) : (
          <div className="venhis-pie-wrap">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="56%"
                  outerRadius={92}
                  innerRadius={48}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`bottom-${title}-${index}`}
                      fill={sideColors[index % sideColors.length]}
                    />
                  ))}
                </Pie>

                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  outerRadius={92}
                  innerRadius={48}
                  paddingAngle={4}
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`top-${title}-${index}`}
                      fill={topColors[index % topColors.length]}
                    />
                  ))}
                </Pie>

                <Tooltip content={<CustomPieTooltip />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="venhis-wrapper">
      <div className="venhis-header">
        <div className="venhis-header-left">
          <div className="venhis-icon-box">
            <FaHistory />
          </div>
          <div>
            <p className="venhis-mini-title">Vendor Dashboard</p>
            <h2 className="venhis-main-title">Vendor Order History</h2>
            <p className="venhis-sub-title">
              Completed and finished orders with payment history.
            </p>
          </div>
        </div>

        <button className="venhis-refresh-btn" onClick={fetchVendorHistory}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      <div className="venhis-summary-grid">
        <div className="venhis-summary-card">
          <div className="venhis-summary-icon venhis-summary-icon--green">
            <FaMoneyBillWave />
          </div>
          <div>
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="venhis-summary-card">
          <div className="venhis-summary-icon venhis-summary-icon--orange">
            <FaCheckCircle />
          </div>
          <div>
            <h3>{filteredOrders.length}</h3>
            <p>History Orders</p>
          </div>
        </div>

        <div className="venhis-summary-card">
          <div className="venhis-summary-icon venhis-summary-icon--green">
            <FaTruck />
          </div>
          <div>
            <h3>{deliveryCount}</h3>
            <p>Delivery Orders</p>
          </div>
        </div>

        <div className="venhis-summary-card">
          <div className="venhis-summary-icon venhis-summary-icon--orange">
            <FaShoppingBag />
          </div>
          <div>
            <h3>{takeawayCount}</h3>
            <p>Takeaway Orders</p>
          </div>
        </div>

        <div className="venhis-summary-card">
          <div className="venhis-summary-icon venhis-summary-icon--green">
            <FaReceipt />
          </div>
          <div>
            <h3>{paidCount}</h3>
            <p>Paid Payments</p>
          </div>
        </div>
      </div>

      <div className="venhis-chart-grid">
        {render3DPieChart(
          orderTypeChartData,
          ORDER_TOP_COLORS,
          ORDER_SIDE_COLORS,
          "Order Type Summary",
          "Delivery vs takeaway history"
        )}

        {render3DPieChart(
          paymentChartData,
          PAYMENT_TOP_COLORS,
          PAYMENT_SIDE_COLORS,
          "Payment Summary",
          "Paid vs pending payments"
        )}

        {render3DPieChart(
          statusChartData,
          STATUS_TOP_COLORS,
          STATUS_SIDE_COLORS,
          "Status Summary",
          "Completed vs finished orders"
        )}
      </div>

      <div className="venhis-filter-bar">
        <div className="venhis-search-box">
          <FaSearch className="venhis-search-icon" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, gmail, phone..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="venhis-filter-group">
          <div className="venhis-filter-item">
            <FaFilter />
            <select
              value={orderTypeFilter}
              onChange={(e) => setOrderTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="delivery">Delivery</option>
              <option value="takeaway">Takeaway</option>
            </select>
          </div>

          <div className="venhis-filter-item">
            <FaFilter />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="finished">Finished</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="venhis-message-box">Loading history...</div>}
      {errorMsg && !loading && (
        <div className="venhis-message-box venhis-message-box--error">
          <FaTimesCircle />
          <span>{errorMsg}</span>
        </div>
      )}

      {!loading && !errorMsg && filteredOrders.length === 0 && (
        <div className="venhis-empty-box">
          No vendor history records found.
        </div>
      )}

      {!loading && !errorMsg && filteredOrders.length > 0 && (
        <div className="venhis-card-list">
          {filteredOrders.map((order) => (
            <div className="venhis-order-card" key={order._id || order.orderId}>
              <div className="venhis-order-top">
                <div>
                  <h3 className="venhis-order-id">Order #{order.orderId}</h3>
                  <p className="venhis-order-date">
                    Completed At: {formatDateTime(order.completedAt || order.createdAt)}
                  </p>
                </div>

                <div className="venhis-badge-wrap">
                  <span className={getStatusBadgeClass(order.orderStatus)}>
                    {order.orderStatus || "Unknown"}
                  </span>
                  <span className={getPaymentBadgeClass(order.paymentStatus)}>
                    {order.paymentStatus || "Pending"}
                  </span>
                </div>
              </div>

              <div className="venhis-detail-grid">
                <div className="venhis-detail-block">
                  <h4>Customer Details</h4>
                  <p><strong>Name:</strong> {order.customerName || "Not Available"}</p>
                  <p><strong>Email:</strong> {order.gmail || "Not Available"}</p>
                  <p><strong>Phone:</strong> {order.phoneNumber || "Not Available"}</p>
                  <p><strong>Address:</strong> {order.address || "Not Available"}</p>
                </div>

                <div className="venhis-detail-block">
                  <h4>Order Details</h4>
                  <p><strong>Type:</strong> {order.orderType || "Not Available"}</p>
                  <p>
                    <strong>Location:</strong>{" "}
                    {order.selectedDeliveryLocation ||
                      order.deliveryLocation ||
                      order.customLocation ||
                      "Not Available"}
                  </p>
                  <p><strong>Items:</strong> {(order.items || []).length}</p>
                  <p><strong>Notes:</strong> {order.notes || "No notes"}</p>
                </div>

                <div className="venhis-detail-block">
                  <h4>Payment Details</h4>
                  <p><strong>Method:</strong> {order.paymentMethod || "Not Available"}</p>
                  <p><strong>Invoice No:</strong> {order.invoiceNo || "Not Available"}</p>
                  <p><strong>Invoice Date:</strong> {order.invoiceDate || "Not Available"}</p>
                  <p><strong>Paid At:</strong> {formatDateTime(order.paidAt)}</p>
                </div>
              </div>

              <div className="venhis-amount-row">
                <div className="venhis-amount-box">
                  <span>Total Amount</span>
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </div>

                <div className="venhis-amount-box">
                  <span>Delivery Fee</span>
                  <strong>{formatCurrency(order.deliveryFee)}</strong>
                </div>

                <div className="venhis-amount-box">
                  <span>Discount</span>
                  <strong>{formatCurrency(order.discount)}</strong>
                </div>

                <div className="venhis-amount-box venhis-amount-box--highlight">
                  <span>Grand Total</span>
                  <strong>{formatCurrency(order.grandTotal)}</strong>
                </div>
              </div>

              <div className="venhis-items-section">
                <h4>Ordered Items</h4>

                {(order.items || []).length === 0 ? (
                  <p className="venhis-no-items">No items available.</p>
                ) : (
                  <div className="venhis-items-table-wrap">
                    <table className="venhis-items-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Qty</th>
                          <th>Unit Price</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order.items || []).map((item, index) => (
                          <tr key={`${order.orderId}-${index}`}>
                            <td>{item.name || "Unknown Item"}</td>
                            <td>{item.qty || 0}</td>
                            <td>{formatCurrency(item.unitPrice || item.price || 0)}</td>
                            <td>{formatCurrency(item.subtotal || item.price || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}