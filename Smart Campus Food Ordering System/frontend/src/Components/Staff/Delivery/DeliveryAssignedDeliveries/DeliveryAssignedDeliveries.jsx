import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaTruck,
  FaSearch,
  FaSyncAlt,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaMoneyBillWave,
  FaClipboardList,
  FaHandPaper,
} from "react-icons/fa";
import "./DeliveryAssignedDeliveries.css";

const API_BASE = "http://localhost:5000";

export default function DeliveryAssignedDeliveries() {
  const navigate = useNavigate();

  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [takingOrderId, setTakingOrderId] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchText, setSearchText] = useState("");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 2500);
  };

  const fetchCompletedDeliveryOrders = async () => {
    try {
      setLoading(true);

      const staffData = JSON.parse(localStorage.getItem("staff") || "{}");
      const token = staffData?.token;

      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        setDeliveryOrders([]);
        setLoading(false);
        return;
      }

      const [completedRes, takenRes] = await Promise.all([
        axios.get(`${API_BASE}/completed-orders`),
        axios.get(`${API_BASE}/taken-delivery-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const completedOrders = completedRes.data?.completedOrders || [];
      const takenOrders = takenRes.data?.takenOrders || [];

      console.log("completedOrders:", completedOrders);
      console.log("takenOrders:", takenOrders);

      const takenOrderIds = new Set(
        takenOrders.map((order) => String(order.orderId))
      );

      const filtered = completedOrders.filter((order) => {
        const type = String(order.orderType || "").toLowerCase().trim();
        const status = String(order.orderStatus || "").toLowerCase().trim();
        const isTaken = takenOrderIds.has(String(order.orderId));

        const isDelivery =
          type === "delivery" ||
          type === "deliver" ||
          type.includes("delivery");

        const isCompleted =
          status === "completed" || status === "finished";

        return isDelivery && isCompleted && !isTaken;
      });

      setDeliveryOrders(filtered);
    } catch (error) {
      console.log("fetchCompletedDeliveryOrders error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to load delivery orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedDeliveryOrders();
  }, []);

  const handleTakeOrder = async (order) => {
    try {
      const staffData = JSON.parse(localStorage.getItem("staff") || "{}");
      const token = staffData?.token;

      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        return;
      }

      setTakingOrderId(order.orderId);

      const res = await axios.post(
        `${API_BASE}/taken-delivery-orders/take/${order.orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMessage("success", res.data?.message || "Order taken successfully");

      setDeliveryOrders((prev) =>
        prev.filter((item) => item.orderId !== order.orderId)
      );

      navigate(`/delivery-taken-order/${order.orderId}`, {
        state: {
          order,
          takenOrder: res.data?.takenOrder,
        },
      });
    } catch (error) {
      console.log("handleTakeOrder error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to take order"
      );
    } finally {
      setTakingOrderId("");
    }
  };

  const filteredOrders = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    return deliveryOrders.filter((order) => {
      if (!value) return true;

      return (
        String(order.orderId || "").toLowerCase().includes(value) ||
        String(order.customerName || "").toLowerCase().includes(value) ||
        String(order.gmail || "").toLowerCase().includes(value) ||
        String(order.phoneNumber || "").toLowerCase().includes(value) ||
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
  }, [deliveryOrders, searchText]);

  const totalOrders = filteredOrders.length;

  const totalRevenue = filteredOrders.reduce(
    (sum, order) => sum + Number(order.grandTotal || 0),
    0
  );

  const totalItems = filteredOrders.reduce(
    (sum, order) =>
      sum +
      (order.items || []).reduce(
        (itemSum, item) => itemSum + Number(item.qty || 0),
        0
      ),
    0
  );

  const formatCurrency = (value) => `LKR ${Number(value || 0).toFixed(2)}`;

  const formatDateTime = (value) => {
    if (!value) return "Not Available";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not Available";

    return date.toLocaleString();
  };

  return (
    <section className="delassign-wrapper">
      <div className="delassign-header">
        <div className="delassign-header-left">
          <div className="delassign-header-icon">
            <FaTruck />
          </div>

          <div>
            <span className="delassign-badge">Delivery Orders</span>
            <h2>Delivery Orders</h2>
            <p>Only available completed delivery orders are shown here.</p>
          </div>
        </div>

        <button
          className="delassign-refresh-btn"
          onClick={fetchCompletedDeliveryOrders}
        >
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      {message.text && (
        <div className={`delassign-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="delassign-stats-grid">
        <div className="delassign-stat-card">
          <div className="delassign-stat-icon green">
            <FaCheckCircle />
          </div>
          <div>
            <h3>{totalOrders}</h3>
            <p>Available Delivery Orders</p>
          </div>
        </div>

        <div className="delassign-stat-card">
          <div className="delassign-stat-icon orange">
            <FaMoneyBillWave />
          </div>
          <div>
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="delassign-stat-card">
          <div className="delassign-stat-icon green">
            <FaClipboardList />
          </div>
          <div>
            <h3>{totalItems}</h3>
            <p>Total Ordered Items</p>
          </div>
        </div>
      </div>

      <div className="delassign-search-bar">
        <FaSearch className="delassign-search-icon" />
        <input
          type="text"
          placeholder="Search by Order ID, customer, email, phone, address..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="delassign-info-box">
          Loading completed delivery orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="delassign-info-box">
          No available completed delivery orders found.
        </div>
      ) : (
        <div className="delassign-card-list">
          {filteredOrders.map((order) => (
            <div
              className="delassign-order-card"
              key={order._id || order.orderId}
            >
              <div className="delassign-order-top">
                <div>
                  <h3>Order #{order.orderId}</h3>
                  <p>Completed At: {formatDateTime(order.completedAt)}</p>
                </div>

                <div className="delassign-status-wrap">
                  <span className="delassign-type-badge">Delivery</span>
                  <span className="delassign-status-badge">
                    {order.orderStatus || "Completed"}
                  </span>
                  <button
                    className="delassign-take-btn"
                    onClick={() => handleTakeOrder(order)}
                    disabled={takingOrderId === order.orderId}
                  >
                    <FaHandPaper />
                    <span>
                      {takingOrderId === order.orderId
                        ? "Taking..."
                        : "Take Order"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="delassign-grid">
                <div className="delassign-block">
                  <h4>Customer Details</h4>
                  <p>
                    <strong>Name:</strong> {order.customerName || "Not Available"}
                  </p>
                  <p>
                    <FaEnvelope className="delassign-inline-icon" />
                    {order.gmail || "Not Available"}
                  </p>
                  <p>
                    <FaPhoneAlt className="delassign-inline-icon" />
                    {order.phoneNumber || "Not Available"}
                  </p>
                </div>

                <div className="delassign-block">
                  <h4>Delivery Details</h4>
                  <p>
                    <FaMapMarkerAlt className="delassign-inline-icon" />
                    {order.selectedDeliveryLocation ||
                      order.deliveryLocation ||
                      order.customLocation ||
                      order.address ||
                      "Not Available"}
                  </p>
                  <p>
                    <strong>Landmark:</strong> {order.landmark || "Not Available"}
                  </p>
                  <p>
                    <strong>Payment:</strong> {order.paymentMethod || "Not Available"}
                  </p>
                </div>

                <div className="delassign-block">
                  <h4>Order Summary</h4>
                  <p>
                    <strong>Total Amount:</strong> {formatCurrency(order.totalAmount)}
                  </p>
                  <p>
                    <strong>Delivery Fee:</strong> {formatCurrency(order.deliveryFee)}
                  </p>
                  <p>
                    <strong>Discount:</strong> {formatCurrency(order.discount)}
                  </p>
                  <p className="delassign-grand-total">
                    <strong>Grand Total:</strong> {formatCurrency(order.grandTotal)}
                  </p>
                </div>
              </div>

              <div className="delassign-items-section">
                <h4>Ordered Items</h4>

                {(order.items || []).length === 0 ? (
                  <p className="delassign-empty-items">No items available.</p>
                ) : (
                  <div className="delassign-table-wrap">
                    <table className="delassign-items-table">
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
                            <td>
                              {formatCurrency(item.unitPrice || item.price || 0)}
                            </td>
                            <td>
                              {formatCurrency(item.subtotal || item.price || 0)}
                            </td>
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