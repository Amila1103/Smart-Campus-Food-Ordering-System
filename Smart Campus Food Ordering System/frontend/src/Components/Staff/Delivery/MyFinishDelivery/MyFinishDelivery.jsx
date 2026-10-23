import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
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
  FaUserTie,
  FaClock,
  FaBoxOpen,
} from "react-icons/fa";
import "./MyFinishDelivery.css";

const API_BASE = "http://localhost:5000";

export default function MyFinishDelivery() {
  const [finishedOrders, setFinishedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchText, setSearchText] = useState("");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 2500);
  };

  const fetchMyFinishedOrders = async () => {
    try {
      setLoading(true);

      const staffData = JSON.parse(localStorage.getItem("staff") || "{}");
      const token = staffData?.token;

      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        setFinishedOrders([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE}/delivery-fenish/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFinishedOrders(res.data?.finishedOrders || []);
    } catch (error) {
      console.log("fetchMyFinishedOrders error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to load finished delivery orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFinishedOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    return finishedOrders.filter((order) => {
      if (!value) return true;

      return (
        String(order.orderId || "").toLowerCase().includes(value) ||
        String(order.customerName || "").toLowerCase().includes(value) ||
        String(order.gmail || "").toLowerCase().includes(value) ||
        String(order.phoneNumber || "").toLowerCase().includes(value) ||
        String(order.deliveredByStaffName || "").toLowerCase().includes(value) ||
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
    <section className="myfinish-wrapper">
      <div className="myfinish-header">
        <div className="myfinish-header-left">
          <div className="myfinish-header-icon">
            <FaTruck />
          </div>

          <div>
            <span className="myfinish-badge">My Finished Deliveries</span>
            <h2>My Finished Delivery Orders</h2>
            <p>View all delivery orders that you have successfully finished.</p>
          </div>
        </div>

        <button className="myfinish-refresh-btn" onClick={fetchMyFinishedOrders}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      {message.text && (
        <div className={`myfinish-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="myfinish-stats-grid">
        <div className="myfinish-stat-card">
          <div className="myfinish-stat-icon green">
            <FaCheckCircle />
          </div>
          <div>
            <h3>{totalOrders}</h3>
            <p>Finished Orders</p>
          </div>
        </div>

        <div className="myfinish-stat-card">
          <div className="myfinish-stat-icon orange">
            <FaMoneyBillWave />
          </div>
          <div>
            <h3>{formatCurrency(totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="myfinish-stat-card">
          <div className="myfinish-stat-icon green">
            <FaClipboardList />
          </div>
          <div>
            <h3>{totalItems}</h3>
            <p>Total Delivered Items</p>
          </div>
        </div>
      </div>

      <div className="myfinish-search-bar">
        <FaSearch className="myfinish-search-icon" />
        <input
          type="text"
          placeholder="Search by Order ID, customer, email, phone, address..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="myfinish-info-box">Loading finished delivery orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="myfinish-empty-state">
          <div className="myfinish-empty-icon">
            <FaBoxOpen />
          </div>
          <h3>No Finished Orders Found</h3>
          <p>Your finished delivery orders will appear here.</p>
        </div>
      ) : (
        <div className="myfinish-card-list">
          {filteredOrders.map((order) => (
            <div className="myfinish-order-card" key={order._id || order.orderId}>
              <div className="myfinish-order-top">
                <div>
                  <h3>Order #{order.orderId}</h3>
                  <p>Finished At: {formatDateTime(order.finishedAt)}</p>
                </div>

                <div className="myfinish-status-wrap">
                  <span className="myfinish-type-badge">Delivery</span>
                  <span className="myfinish-status-badge">
                    {order.finalDeliveryStatus || "Finished"}
                  </span>
                </div>
              </div>

              <div className="myfinish-grid">
                <div className="myfinish-block">
                  <h4>Customer Details</h4>
                  <p>
                    <strong>Name:</strong> {order.customerName || "Not Available"}
                  </p>
                  <p>
                    <FaEnvelope className="myfinish-inline-icon" />
                    {order.gmail || "Not Available"}
                  </p>
                  <p>
                    <FaPhoneAlt className="myfinish-inline-icon" />
                    {order.phoneNumber || "Not Available"}
                  </p>
                </div>

                <div className="myfinish-block">
                  <h4>Delivery Details</h4>
                  <p>
                    <FaMapMarkerAlt className="myfinish-inline-icon" />
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

                <div className="myfinish-block">
                  <h4>Amount Details</h4>
                  <p>
                    <strong>Total Amount:</strong> {formatCurrency(order.totalAmount)}
                  </p>
                  <p>
                    <strong>Delivery Fee:</strong> {formatCurrency(order.deliveryFee)}
                  </p>
                  <p>
                    <strong>Discount:</strong> {formatCurrency(order.discount)}
                  </p>
                  <p className="myfinish-grand-total">
                    <strong>Grand Total:</strong> {formatCurrency(order.grandTotal)}
                  </p>
                </div>
              </div>

              <div className="myfinish-meta-grid">
                <div className="myfinish-meta-card">
                  <FaUserTie className="myfinish-meta-icon" />
                  <div>
                    <h5>Delivered By</h5>
                    <p>{order.deliveredByStaffName || "Not Available"}</p>
                  </div>
                </div>

                <div className="myfinish-meta-card">
                  <FaClock className="myfinish-meta-icon" />
                  <div>
                    <h5>Taken At</h5>
                    <p>{formatDateTime(order.takenAt)}</p>
                  </div>
                </div>

                <div className="myfinish-meta-card">
                  <FaClock className="myfinish-meta-icon" />
                  <div>
                    <h5>Delivered At</h5>
                    <p>{formatDateTime(order.deliveredAt)}</p>
                  </div>
                </div>
              </div>

              <div className="myfinish-items-section">
                <h4>Delivered Items</h4>

                {(order.items || []).length === 0 ? (
                  <p className="myfinish-empty-items">No items available.</p>
                ) : (
                  <div className="myfinish-table-wrap">
                    <table className="myfinish-items-table">
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

              {order.deliveryNotes && (
                <div className="myfinish-notes-box">
                  <h4>Delivery Notes</h4>
                  <p>{order.deliveryNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}