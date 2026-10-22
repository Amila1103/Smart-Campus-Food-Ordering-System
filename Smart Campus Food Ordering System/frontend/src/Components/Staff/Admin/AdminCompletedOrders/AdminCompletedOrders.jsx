import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiCheckCircle,
  FiClock,
  FiSearch,
  FiRefreshCw,
  FiMapPin,
  FiPhone,
  FiMail,
  FiPackage,
  FiDollarSign,
  FiTruck,
} from "react-icons/fi";
import "./AdminCompletedOrders.css";

const ADMIN_COMPLETED_ORDERS_API = "http://localhost:5000/completed-orders";

export default function AdminCompletedOrders() {
  const [adminCompletedOrders, setAdminCompletedOrders] = useState([]);
  const [adminCompletedLoading, setAdminCompletedLoading] = useState(true);
  const [adminCompletedMessage, setAdminCompletedMessage] = useState({
    type: "",
    text: "",
  });
  const [adminCompletedSearch, setAdminCompletedSearch] = useState("");
  const [adminCompletedStatusFilter, setAdminCompletedStatusFilter] =
    useState("All");
  const [adminFinishLoadingId, setAdminFinishLoadingId] = useState("");

  const showAdminCompletedMessage = (type, text) => {
    setAdminCompletedMessage({ type, text });
    setTimeout(() => {
      setAdminCompletedMessage({ type: "", text: "" });
    }, 2500);
  };

  const fetchAdminCompletedOrders = async () => {
    try {
      setAdminCompletedLoading(true);
      const res = await axios.get(ADMIN_COMPLETED_ORDERS_API);
      setAdminCompletedOrders(res.data?.completedOrders || []);
    } catch (error) {
      console.log("Fetch completed orders error:", error);
      showAdminCompletedMessage(
        "error",
        error.response?.data?.message || "Failed to fetch completed orders."
      );
    } finally {
      setAdminCompletedLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminCompletedOrders();
  }, []);

  const handleMarkAsFinished = async (orderId) => {
    try {
      setAdminFinishLoadingId(orderId);

      const res = await axios.put(
        `${ADMIN_COMPLETED_ORDERS_API}/${orderId}/finish`
      );

      const updated = res.data?.completedOrder;

      setAdminCompletedOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId
            ? { ...order, orderStatus: updated?.orderStatus || "Finished" }
            : order
        )
      );

      showAdminCompletedMessage("success", "Order marked as finished.");
    } catch (error) {
      console.log("Mark finished error:", error);
      showAdminCompletedMessage(
        "error",
        error.response?.data?.message || "Failed to update order status."
      );
    } finally {
      setAdminFinishLoadingId("");
    }
  };

  const filteredAdminCompletedOrders = useMemo(() => {
    return adminCompletedOrders.filter((order) => {
      const search = adminCompletedSearch.toLowerCase();

      const matchesSearch =
        order.orderId?.toLowerCase().includes(search) ||
        order.customerName?.toLowerCase().includes(search) ||
        order.gmail?.toLowerCase().includes(search) ||
        order.phoneNumber?.toLowerCase().includes(search);

      const matchesStatus =
        adminCompletedStatusFilter === "All"
          ? true
          : order.orderStatus === adminCompletedStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    adminCompletedOrders,
    adminCompletedSearch,
    adminCompletedStatusFilter,
  ]);

  const adminTotalOrders = adminCompletedOrders.length;
  const adminCompletedCount = adminCompletedOrders.filter(
    (order) => order.orderStatus === "Completed"
  ).length;
  const adminFinishedCount = adminCompletedOrders.filter(
    (order) => order.orderStatus === "Finished"
  ).length;

  return (
    <section className="adco-wrapper">
      <div className="adco-topbar">
        <div>
          <span className="adco-badge">Completed Orders</span>
          <h2>Completed Order Management</h2>
          <p>View all completed orders and update them as finished.</p>
        </div>

        <button className="adco-refresh-btn" onClick={fetchAdminCompletedOrders}>
          <FiRefreshCw />
          <span>Refresh</span>
        </button>
      </div>

      {adminCompletedMessage.text && (
        <div className={`adco-toast ${adminCompletedMessage.type}`}>
          {adminCompletedMessage.text}
        </div>
      )}

      <div className="adco-stats">
        <div className="adco-stat-card">
          <div className="adco-stat-icon green">
            <FiPackage />
          </div>
          <div>
            <h3>{adminTotalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="adco-stat-card">
          <div className="adco-stat-icon orange">
            <FiClock />
          </div>
          <div>
            <h3>{adminCompletedCount}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="adco-stat-card">
          <div className="adco-stat-icon green">
            <FiCheckCircle />
          </div>
          <div>
            <h3>{adminFinishedCount}</h3>
            <p>Finished</p>
          </div>
        </div>
      </div>

      <div className="adco-toolbar">
        <div className="adco-searchbox">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by order ID, customer, email, phone..."
            value={adminCompletedSearch}
            onChange={(e) => setAdminCompletedSearch(e.target.value)}
          />
        </div>

        <select
          className="adco-select"
          value={adminCompletedStatusFilter}
          onChange={(e) => setAdminCompletedStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Finished">Finished</option>
        </select>
      </div>

      {adminCompletedLoading ? (
        <div className="adco-info-box">Loading completed orders...</div>
      ) : filteredAdminCompletedOrders.length === 0 ? (
        <div className="adco-info-box">No completed orders found.</div>
      ) : (
        <div className="adco-grid">
          {filteredAdminCompletedOrders.map((order) => (
            <div className="adco-card" key={order._id || order.orderId}>
              <div className="adco-card-top">
                <div>
                  <h3>{order.orderId}</h3>
                  <p>{order.customerName || "Unknown Customer"}</p>
                </div>

                <span
                  className={`adco-status ${
                    order.orderStatus === "Finished"
                      ? "finished"
                      : "completed"
                  }`}
                >
                  {order.orderStatus || "Completed"}
                </span>
              </div>

              <div className="adco-section-grid">
                <div className="adco-info-item">
                  <span>
                    <FiMail className="adco-inline-icon" />
                    Email
                  </span>
                  <strong>{order.gmail || "-"}</strong>
                </div>

                <div className="adco-info-item">
                  <span>
                    <FiPhone className="adco-inline-icon" />
                    Phone
                  </span>
                  <strong>{order.phoneNumber || "-"}</strong>
                </div>

                <div className="adco-info-item">
                  <span>
                    <FiTruck className="adco-inline-icon" />
                    Order Type
                  </span>
                  <strong>{order.orderType || "-"}</strong>
                </div>

                <div className="adco-info-item">
                  <span>
                    <FiDollarSign className="adco-inline-icon" />
                    Grand Total
                  </span>
                  <strong>LKR {Number(order.grandTotal || 0).toFixed(2)}</strong>
                </div>
              </div>

              <div className="adco-address-box">
                <span>
                  <FiMapPin className="adco-inline-icon" />
                  Delivery / Address
                </span>
                <p>
                  {order.address ||
                    order.deliveryLocation ||
                    order.selectedDeliveryLocation ||
                    order.customLocation ||
                    "No address provided"}
                </p>
              </div>

              <div className="adco-items-section">
                <h4>Order Items</h4>
                <div className="adco-items-list">
                  {(order.items || []).length > 0 ? (
                    order.items.map((item, index) => (
                      <div className="adco-item-row" key={index}>
                        <div>
                          <strong>{item.name}</strong>
                          <p>
                            Qty: {item.qty} | Portion:{" "}
                            {item.portionSize || "Regular"}
                          </p>
                        </div>
                        <span>LKR {Number(item.subtotal || 0).toFixed(2)}</span>
                      </div>
                    ))
                  ) : (
                    <p className="adco-muted-text">No items available.</p>
                  )}
                </div>
              </div>

              <div className="adco-summary-row">
                <div className="adco-summary-chip">
                  Payment: {order.paymentMethod || "-"}
                </div>
                <div className="adco-summary-chip">
                  Status: {order.paymentStatus || "-"}
                </div>
                <div className="adco-summary-chip">
                  Completed:{" "}
                  {order.completedAt
                    ? new Date(order.completedAt).toLocaleString()
                    : "-"}
                </div>
              </div>

              <div className="adco-actions">
                <button
                  className="adco-finish-btn"
                  onClick={() => handleMarkAsFinished(order.orderId)}
                  disabled={
                    order.orderStatus === "Finished" ||
                    adminFinishLoadingId === order.orderId
                  }
                >
                  <FiCheckCircle />
                  <span>
                    {adminFinishLoadingId === order.orderId
                      ? "Updating..."
                      : order.orderStatus === "Finished"
                      ? "Already Finished"
                      : "Mark as Finished"}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}