import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FaTruck,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClipboardList,
  FaRoute,
  FaCheckCircle,
} from "react-icons/fa";
import "./DeliveryTakenOrderPage.css";

const API_BASE = "http://localhost:5000";

export default function DeliveryTakenOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId } = useParams();

  const [order, setOrder] = useState(location.state?.takenOrder || location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.takenOrder && !location.state?.order);
  const [finishMessage, setFinishMessage] = useState("");
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    const fetchTakenOrder = async () => {
      try {
        const staffData = JSON.parse(localStorage.getItem("staff") || "{}");
        const token = staffData?.token;

        if (!token) {
          setFinishMessage("Staff token not found. Please login again.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${API_BASE}/taken-delivery-orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrder(res.data?.takenOrder || null);
      } catch (error) {
        console.log("fetchTakenOrder error:", error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    if (!orderId) return;
    if (!order) {
      fetchTakenOrder();
    }
  }, [order, orderId]);

  const formatCurrency = (value) => `LKR ${Number(value || 0).toFixed(2)}`;

  const formatDateTime = (value) => {
    if (!value) return "Not Available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not Available";
    return date.toLocaleString();
  };

  const deliveryDestination =
    order?.selectedDeliveryLocation ||
    order?.deliveryLocation ||
    order?.customLocation ||
    order?.address ||
    "";

  const originLocation = "Pallekele, SLIIT Kandy University";

  const directionsMapUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    `${originLocation} to ${deliveryDestination}`
  )}&output=embed`;

  const openDirectionsInGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(
      originLocation
    )}/${encodeURIComponent(deliveryDestination)}`;
    window.open(mapsUrl, "_blank");
  };

  const handleFinishOrder = async () => {
    try {
      const staffData = JSON.parse(localStorage.getItem("staff") || "{}");
      const token = staffData?.token;

      if (!token) {
        setFinishMessage("Staff token not found. Please login again.");
        return;
      }

      setFinishing(true);

      const res = await axios.post(
        `${API_BASE}/delivery-fenish/finish/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFinishMessage(res.data?.message || "Order finished successfully");

      setTimeout(() => {
        navigate("/delivery-dashboard/finishOrder", { replace: true });
      }, 1000);
    } catch (error) {
      console.log("handleFinishOrder error:", error);
      setFinishMessage(
        error.response?.data?.message || "Failed to finish order"
      );
    } finally {
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <section className="deltaken-wrapper">
        <div className="deltaken-empty-card">
          <h2>Loading order details...</h2>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="deltaken-wrapper">
        <div className="deltaken-empty-card">
          <h2>Order details not found</h2>
          <p>Selected order ID: {orderId}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="deltaken-wrapper">
      <div className="deltaken-topbar">
        <div className="deltaken-topbar-right">
          <span className="deltaken-badge">Taken Order</span>
        </div>
      </div>

      {finishMessage && (
        <div className="deltaken-finish-alert">{finishMessage}</div>
      )}

      <div className="deltaken-hero-card">
        <div className="deltaken-hero-left">
          <div className="deltaken-hero-icon">
            <FaTruck />
          </div>
          <div>
            <h1>Order #{order.orderId}</h1>
            <p>This page shows the selected delivery order details.</p>
          </div>
        </div>

        <div className="deltaken-status-wrap">
          <span className="deltaken-type-badge">Delivery</span>
          <span className="deltaken-status-badge">
            {order.deliveryStatus || order.orderStatus || "Taken"}
          </span>
        </div>
      </div>

      <div className="deltaken-summary-grid">
        <div className="deltaken-summary-card">
          <div className="deltaken-summary-icon green">
            <FaMoneyBillWave />
          </div>
          <div>
            <h3>{formatCurrency(order.grandTotal)}</h3>
            <p>Grand Total</p>
          </div>
        </div>

        <div className="deltaken-summary-card">
          <div className="deltaken-summary-icon orange">
            <FaClipboardList />
          </div>
          <div>
            <h3>{(order.items || []).length}</h3>
            <p>Total Items</p>
          </div>
        </div>

        <div className="deltaken-summary-card">
          <div className="deltaken-summary-icon green">
            <FaTruck />
          </div>
          <div>
            <h3>{formatDateTime(order.takenAt || order.completedAt)}</h3>
            <p>Taken At</p>
          </div>
        </div>
      </div>

      <div className="deltaken-grid">
        <div className="deltaken-block">
          <h3>Customer Details</h3>
          <p>
            <FaUser className="deltaken-inline-icon" />
            {order.customerName || "Not Available"}
          </p>
          <p>
            <FaEnvelope className="deltaken-inline-icon" />
            {order.gmail || "Not Available"}
          </p>
          <p>
            <FaPhoneAlt className="deltaken-inline-icon" />
            {order.phoneNumber || "Not Available"}
          </p>
        </div>

        <div className="deltaken-block">
          <h3>Delivery Details</h3>
          <p>
            <FaMapMarkerAlt className="deltaken-inline-icon" />
            {deliveryDestination || "Not Available"}
          </p>
          <p>
            <strong>Landmark:</strong> {order.landmark || "Not Available"}
          </p>
          <p>
            <strong>Payment Method:</strong> {order.paymentMethod || "Not Available"}
          </p>
        </div>

        <div className="deltaken-block">
          <h3>Amount Details</h3>
          <p>
            <strong>Total Amount:</strong> {formatCurrency(order.totalAmount)}
          </p>
          <p>
            <strong>Delivery Fee:</strong> {formatCurrency(order.deliveryFee)}
          </p>
          <p>
            <strong>Discount:</strong> {formatCurrency(order.discount)}
          </p>
          <p className="deltaken-grand-total">
            <strong>Grand Total:</strong> {formatCurrency(order.grandTotal)}
          </p>
        </div>
      </div>

      <div className="deltaken-map-card">
        <div className="deltaken-map-head">
          <div className="deltaken-map-title">
            <FaRoute />
            <h3>Delivery Route Map</h3>
          </div>

          <button
            className="deltaken-map-btn"
            onClick={openDirectionsInGoogleMaps}
            disabled={!deliveryDestination}
          >
            Open in Google Maps
          </button>
        </div>

        <div className="deltaken-route-info">
          <p>
            <strong>From:</strong> Pallekele, SLIIT Kandy University
          </p>
          <p>
            <strong>To:</strong> {deliveryDestination || "Not Available"}
          </p>
        </div>

        {deliveryDestination ? (
          <div className="deltaken-map-frame-wrap">
            <iframe
              title="Delivery Route Map"
              src={directionsMapUrl}
              className="deltaken-map-frame"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
          <div className="deltaken-empty-items">
            No delivery location available for map display.
          </div>
        )}
      </div>

      <div className="deltaken-finish-row">
        <button
          className="deltaken-finish-btn"
          onClick={handleFinishOrder}
          disabled={finishing}
        >
          <FaCheckCircle />
          <span>{finishing ? "Finishing..." : "Finish Order"}</span>
        </button>
      </div>

      <div className="deltaken-items-card">
        <h3>Ordered Items</h3>

        {(order.items || []).length === 0 ? (
          <p className="deltaken-empty-items">No items available.</p>
        ) : (
          <div className="deltaken-table-wrap">
            <table className="deltaken-items-table">
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
    </section>
  );
}