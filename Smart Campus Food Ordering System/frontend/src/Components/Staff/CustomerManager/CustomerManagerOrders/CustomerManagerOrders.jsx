import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaClipboardList,
  FaSearch,
  FaSyncAlt,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaBoxOpen,
  FaReceipt,
  FaStickyNote,
} from "react-icons/fa";
import "./CustomerManagerOrders.css";

const API_BASE = "http://localhost:5000";

export default function CustomerManagerOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [actionMessage, setActionMessage] = useState("");
  const [finishLoading, setFinishLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setFetchError("");

      const res = await axios.get(`${API_BASE}/completed-orders`);
      const orderList = Array.isArray(res?.data?.completedOrders)
        ? res.data.completedOrders
        : [];

      setOrders(orderList);
      setFilteredOrders(orderList);

      if (selectedOrder) {
        const updatedSelected = orderList.find(
          (item) => item._id === selectedOrder._id
        );
        setSelectedOrder(updatedSelected || null);
      }
    } catch (error) {
      console.log("Fetch completed orders error:", error);
      setFetchError("Failed to load customer orders.");
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = [...orders];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        return (
          item?.orderId?.toLowerCase().includes(term) ||
          item?.customerName?.toLowerCase().includes(term) ||
          item?.gmail?.toLowerCase().includes(term) ||
          item?.phoneNumber?.toLowerCase().includes(term) ||
          item?.address?.toLowerCase().includes(term) ||
          item?.vendorName?.toLowerCase().includes(term)
        );
      });
    }

    if (statusFilter !== "ALL") {
      result = result.filter((item) => item?.orderStatus === statusFilter);
    }

    if (typeFilter !== "ALL") {
      result = result.filter((item) => item?.orderType === typeFilter);
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter(
      (item) => item.orderStatus === "Completed"
    ).length;
    const finished = orders.filter(
      (item) => item.orderStatus === "Finished"
    ).length;
    const delivery = orders.filter(
      (item) => (item.orderType || "").toLowerCase() === "delivery"
    ).length;
    const pickup = orders.filter(
      (item) => (item.orderType || "").toLowerCase() === "pickup"
    ).length;

    return {
      total,
      completed,
      finished,
      delivery,
      pickup,
    };
  }, [orders]);

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "Not available";
    const date = new Date(dateValue);
    return date.toLocaleString();
  };

  const formatCurrency = (value) => {
    return `Rs. ${Number(value || 0).toLocaleString()}`;
  };

  const getStatusClass = (status) => {
    if (status === "Finished") return "finished";
    if (status === "Completed") return "completed";
    return "pending";
  };

  const openOrder = (order) => {
    setSelectedOrder(order);
    setActionMessage("");
  };

  const handleMarkFinished = async () => {
    if (!selectedOrder?.orderId) return;

    try {
      setFinishLoading(true);
      setActionMessage("");

      const res = await axios.put(
        `${API_BASE}/completed-orders/${selectedOrder.orderId}/finish`
      );

      const updatedOrder = res?.data?.completedOrder;

      const updatedList = orders.map((item) =>
        item.orderId === selectedOrder.orderId ? updatedOrder : item
      );

      setOrders(updatedList);
      setSelectedOrder(updatedOrder);
      setActionMessage("Order marked as Finished successfully.");
    } catch (error) {
      console.log("Mark finished error:", error);
      setActionMessage(
        error?.response?.data?.message || "Failed to update order."
      );
    } finally {
      setFinishLoading(false);
    }
  };

  return (
    <div className="cmorders-page">
      <div className="cmorders-header">
        <div>
          <span className="cmorders-badge">Order Center</span>
          <h2>Customer Orders Management</h2>
          <p>
            View all customer completed orders, inspect order details, and mark
            completed orders as finished from one professional panel.
          </p>
        </div>

        <button className="cmorders-refresh-btn" onClick={fetchOrders}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      <div className="cmorders-stats-grid">
        <div className="cmorders-stat-card">
          <div className="cmorders-stat-icon green">
            <FaClipboardList />
          </div>
          <div>
            <p>Total Orders</p>
            <h3>{stats.total}</h3>
          </div>
        </div>

        <div className="cmorders-stat-card">
          <div className="cmorders-stat-icon orange">
            <FaClock />
          </div>
          <div>
            <p>Completed</p>
            <h3>{stats.completed}</h3>
          </div>
        </div>

        <div className="cmorders-stat-card">
          <div className="cmorders-stat-icon green">
            <FaCheckCircle />
          </div>
          <div>
            <p>Finished</p>
            <h3>{stats.finished}</h3>
          </div>
        </div>

        <div className="cmorders-stat-card">
          <div className="cmorders-stat-icon orange">
            <FaTruck />
          </div>
          <div>
            <p>Delivery</p>
            <h3>{stats.delivery}</h3>
          </div>
        </div>

        <div className="cmorders-stat-card">
          <div className="cmorders-stat-icon green">
            <FaBoxOpen />
          </div>
          <div>
            <p>Pickup</p>
            <h3>{stats.pickup}</h3>
          </div>
        </div>
      </div>

      <div className="cmorders-toolbar">
        <div className="cmorders-search-box">
          <FaSearch className="cmorders-search-icon" />
          <input
            type="text"
            placeholder="Search by order id, customer, gmail, phone, vendor"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="cmorders-filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Finished">Finished</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="Delivery">Delivery</option>
            <option value="Pickup">Pickup</option>
          </select>
        </div>
      </div>

      <div className="cmorders-content-grid">
        <div className="cmorders-table-card">
          <div className="cmorders-card-head">
            <h3>Customer Orders</h3>
            <span>{filteredOrders.length} records</span>
          </div>

          {loading ? (
            <div className="cmorders-empty-box">Loading orders...</div>
          ) : fetchError ? (
            <div className="cmorders-empty-box error">{fetchError}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="cmorders-empty-box">
              No customer orders found for current filters.
            </div>
          ) : (
            <div className="cmorders-table-wrap">
              <table className="cmorders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((item) => (
                    <tr key={item._id}>
                      <td>{item?.orderId || "-"}</td>
                      <td>
                        <div className="cmorders-user-cell">
                          <div className="cmorders-avatar">
                            {item?.customerName?.charAt(0)?.toUpperCase() || "C"}
                          </div>
                          <div>
                            <h4>{item?.customerName || "No name"}</h4>
                            <p>{item?.gmail || "No gmail"}</p>
                          </div>
                        </div>
                      </td>

                      <td>{item?.orderType || "-"}</td>

                      <td>
                        <span
                          className={`cmorders-status ${getStatusClass(
                            item?.orderStatus
                          )}`}
                        >
                          {item?.orderStatus}
                        </span>
                      </td>

                      <td>{formatCurrency(item?.grandTotal)}</td>

                      <td>
                        <button
                          className="cmorders-view-btn"
                          onClick={() => openOrder(item)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="cmorders-details-card">
          <div className="cmorders-card-head">
            <h3>Order Details</h3>
            <span>Customer order view</span>
          </div>

          {!selectedOrder ? (
            <div className="cmorders-empty-box">
              Select an order to view full details.
            </div>
          ) : (
            <div className="cmorders-details-body">
              <div className="cmorders-top">
                <div className="cmorders-avatar large">
                  {selectedOrder?.customerName?.charAt(0)?.toUpperCase() || "C"}
                </div>

                <div className="cmorders-top-text">
                  <h3>{selectedOrder?.customerName || "Customer"}</h3>
                  <p>{selectedOrder?.gmail || "No gmail"}</p>
                  <div className="cmorders-top-badges">
                    <span
                      className={`cmorders-status ${getStatusClass(
                        selectedOrder?.orderStatus
                      )}`}
                    >
                      {selectedOrder?.orderStatus}
                    </span>
                    <span className="cmorders-type-tag">
                      {selectedOrder?.orderType || "No type"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="cmorders-detail-grid">
                <div className="cmorders-detail-item">
                  <span className="cmorders-detail-label">
                    <FaReceipt /> Order ID
                  </span>
                  <p>{selectedOrder?.orderId || "Not available"}</p>
                </div>

                <div className="cmorders-detail-item">
                  <span className="cmorders-detail-label">
                    <FaUser /> Customer Name
                  </span>
                  <p>{selectedOrder?.customerName || "Not available"}</p>
                </div>

                <div className="cmorders-detail-item">
                  <span className="cmorders-detail-label">
                    <FaEnvelope /> Gmail
                  </span>
                  <p>{selectedOrder?.gmail || "Not available"}</p>
                </div>

                <div className="cmorders-detail-item">
                  <span className="cmorders-detail-label">
                    <FaPhoneAlt /> Phone Number
                  </span>
                  <p>{selectedOrder?.phoneNumber || "Not available"}</p>
                </div>

                <div className="cmorders-detail-item full">
                  <span className="cmorders-detail-label">
                    <FaMapMarkerAlt /> Address
                  </span>
                  <p>{selectedOrder?.address || "Not available"}</p>
                </div>

                <div className="cmorders-detail-item">
                  <span className="cmorders-detail-label">
                    <FaTruck /> Delivery Location
                  </span>
                  <p>
                    {selectedOrder?.deliveryLocation ||
                      selectedOrder?.selectedDeliveryLocation ||
                      selectedOrder?.customLocation ||
                      "Not available"}
                  </p>
                </div>

                <div className="cmorders-detail-item">
                  <span className="cmorders-detail-label">
                    <FaClipboardList /> Vendor Name
                  </span>
                  <p>{selectedOrder?.vendorName || "Not assigned"}</p>
                </div>

                <div className="cmorders-detail-item">
                  <span className="cmorders-detail-label">
                    <FaMoneyBillWave /> Payment Method
                  </span>
                  <p>{selectedOrder?.paymentMethod || "Not available"}</p>
                </div>

                <div className="cmorders-detail-item">
                  <span className="cmorders-detail-label">
                    <FaMoneyBillWave /> Payment Status
                  </span>
                  <p>{selectedOrder?.paymentStatus || "Not available"}</p>
                </div>

                <div className="cmorders-detail-item">
                  <span className="cmorders-detail-label">
                    <FaClock /> Completed At
                  </span>
                  <p>{formatDateTime(selectedOrder?.completedAt)}</p>
                </div>

                <div className="cmorders-detail-item">
                  <span className="cmorders-detail-label">
                    <FaCheckCircle /> Order Status
                  </span>
                  <p>{selectedOrder?.orderStatus || "Not available"}</p>
                </div>

                <div className="cmorders-detail-item full">
                  <span className="cmorders-detail-label">
                    <FaStickyNote /> Notes
                  </span>
                  <p>{selectedOrder?.notes || "No notes available"}</p>
                </div>
              </div>

              <div className="cmorders-items-panel">
                <h4>Ordered Items</h4>

                {!Array.isArray(selectedOrder?.items) ||
                selectedOrder.items.length === 0 ? (
                  <div className="cmorders-empty-items">No items available.</div>
                ) : (
                  <div className="cmorders-items-list">
                    {selectedOrder.items.map((item, index) => (
                      <div className="cmorders-item-card" key={index}>
                        <div className="cmorders-item-top">
                          <h5>{item?.name || "Item"}</h5>
                          <span>x{item?.qty || 0}</span>
                        </div>

                        <div className="cmorders-item-meta">
                          <p>Portion: {item?.portionSize || "-"}</p>
                          <p>Category: {item?.category || "-"}</p>
                          <p>Unit Price: {formatCurrency(item?.unitPrice)}</p>
                          <p>Subtotal: {formatCurrency(item?.subtotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="cmorders-bill-grid">
                <div className="cmorders-bill-card">
                  <span>Total Amount</span>
                  <strong>{formatCurrency(selectedOrder?.totalAmount)}</strong>
                </div>

                <div className="cmorders-bill-card">
                  <span>Delivery Fee</span>
                  <strong>{formatCurrency(selectedOrder?.deliveryFee)}</strong>
                </div>

                <div className="cmorders-bill-card">
                  <span>Discount</span>
                  <strong>{formatCurrency(selectedOrder?.discount)}</strong>
                </div>

                <div className="cmorders-bill-card grand">
                  <span>Grand Total</span>
                  <strong>{formatCurrency(selectedOrder?.grandTotal)}</strong>
                </div>
              </div>

              {actionMessage && (
                <div className="cmorders-message-box">{actionMessage}</div>
              )}

              {selectedOrder?.orderStatus !== "Finished" && (
                <button
                  className="cmorders-finish-btn"
                  onClick={handleMarkFinished}
                  disabled={finishLoading}
                >
                  <FaCheckCircle />
                  <span>
                    {finishLoading ? "Updating..." : "Mark as Finished"}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}