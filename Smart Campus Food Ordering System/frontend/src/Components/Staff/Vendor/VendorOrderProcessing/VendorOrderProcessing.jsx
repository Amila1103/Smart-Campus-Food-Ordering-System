import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiClock,
  FiShoppingBag,
  FiCreditCard,
  FiCheckCircle,
} from "react-icons/fi";
import "./VendorOrderProcessing.css";

const API_BASE = "http://localhost:5000";

export default function VendorOrderProcessing() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/orders/${orderId}`);
      setOrder(res.data?.order || null);
    } catch (error) {
      console.log("Fetch order error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);

      await axios.put(`${API_BASE}/orders/${orderId}/status`, {
        orderStatus: newStatus,
      });

      if (newStatus.toLowerCase() === "completed") {
        navigate("/vendor-completed-orders", { replace: true });
        return;
      }

      setOrder((prev) => ({
        ...prev,
        orderStatus: newStatus,
      }));
    } catch (error) {
      console.log("Update order status error:", error);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE}${imagePath}`;
  };

  const statusSteps = useMemo(() => {
    const current = (order?.orderStatus || "Pending").toLowerCase();

    return [
      {
        key: "pending",
        label: "Pending",
        active:
          current === "pending" ||
          current === "preparing" ||
          current === "ready" ||
          current === "completed",
      },
      {
        key: "preparing",
        label: "Preparing",
        active:
          current === "preparing" ||
          current === "ready" ||
          current === "completed",
      },
      {
        key: "ready",
        label: "Ready",
        active: current === "ready" || current === "completed",
      },
      {
        key: "completed",
        label: "Completed",
        active: current === "completed",
      },
    ];
  }, [order]);

  if (loading) {
    return <div className="vendorprocess-loading">Loading order...</div>;
  }

  if (!order) {
    return <div className="vendorprocess-loading">Order not found.</div>;
  }

  return (
    <div className="vendorprocess-page">
      <div className="vendorprocess-topbar">
        <button
          className="vendorprocess-back-btn"
          onClick={() => navigate("/vendor-dashboard")}
        >
          <FiArrowLeft />
          <span>Back to Dashboard</span>
        </button>

        <div className="vendorprocess-topbar-text">
          <h1>Order Processing</h1>
          <p>Manage cooking progress, review details, and update order status.</p>
        </div>
      </div>

      <div className="vendorprocess-header-card">
        <div>
          <h2>{order.orderId}</h2>
          <p>
            {order.customerName || "Customer"} • {order.orderType || "Delivery"}
          </p>
        </div>

        <div className="vendorprocess-header-right">
          <span
            className={`vendorprocess-status-badge ${(
              order.orderStatus || ""
            ).toLowerCase()}`}
          >
            {order.orderStatus || "Pending"}
          </span>
          <div className="vendorprocess-created">
            <FiClock />
            <span>
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className="vendorprocess-grid">
        <div className="vendorprocess-left">
          <section className="vendorprocess-card">
            <div className="vendorprocess-section-title">
              <FiUser />
              <h3>Customer Details</h3>
            </div>

            <div className="vendorprocess-info-grid">
              <div className="vendorprocess-info-item">
                <span>Name</span>
                <strong>{order.customerName || "N/A"}</strong>
              </div>

              <div className="vendorprocess-info-item">
                <span>Email</span>
                <strong>{order.gmail || "N/A"}</strong>
              </div>

              <div className="vendorprocess-info-item">
                <span>Phone</span>
                <strong>{order.phoneNumber || "N/A"}</strong>
              </div>

              <div className="vendorprocess-info-item">
                <span>Order Type</span>
                <strong>{order.orderType || "N/A"}</strong>
              </div>

              <div className="vendorprocess-info-item vendorprocess-info-item-full">
                <span>Address / Location</span>
                <strong>
                  {order.address ||
                    order.deliveryLocation ||
                    order.selectedDeliveryLocation ||
                    order.customLocation ||
                    "Takeaway Order"}
                </strong>
              </div>
            </div>
          </section>

          <section className="vendorprocess-card">
            <div className="vendorprocess-section-title">
              <FiShoppingBag />
              <h3>Ordered Items</h3>
            </div>

            <div className="vendorprocess-item-list">
              {Array.isArray(order.items) && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <div className="vendorprocess-item-card" key={index}>
                    <div className="vendorprocess-item-left">
                      <div className="vendorprocess-item-image-wrap">
                        {item.image ? (
                          <>
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name || "Order item"}
                              className="vendorprocess-item-image"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback =
                                  e.currentTarget.parentElement.querySelector(
                                    ".vendorprocess-item-noimage"
                                  );
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                            <div
                              className="vendorprocess-item-noimage"
                              style={{ display: "none" }}
                            >
                              No Image
                            </div>
                          </>
                        ) : (
                          <div className="vendorprocess-item-noimage">
                            No Image
                          </div>
                        )}
                      </div>

                      <div className="vendorprocess-item-details">
                        <h4>{item.name}</h4>
                        <p>
                          Qty: {item.qty}{" "}
                          {item.portionSize ? `• ${item.portionSize}` : ""}
                        </p>
                        {item.category && <p>Category: {item.category}</p>}
                      </div>
                    </div>

                    <div className="vendorprocess-item-price">
                      {formatCurrency(item.subtotal || item.price)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="vendorprocess-empty-text">No items found.</p>
              )}
            </div>
          </section>
        </div>

        <div className="vendorprocess-right">
          <section className="vendorprocess-card">
            <div className="vendorprocess-section-title">
              <FiCreditCard />
              <h3>Order Summary</h3>
            </div>

            <div className="vendorprocess-summary-list">
              <div className="vendorprocess-summary-row">
                <span>Total Amount</span>
                <strong>{formatCurrency(order.totalAmount)}</strong>
              </div>
              <div className="vendorprocess-summary-row">
                <span>Delivery Fee</span>
                <strong>{formatCurrency(order.deliveryFee)}</strong>
              </div>
              <div className="vendorprocess-summary-row">
                <span>Discount</span>
                <strong>{formatCurrency(order.discount)}</strong>
              </div>
              <div className="vendorprocess-summary-row total">
                <span>Grand Total</span>
                <strong>{formatCurrency(order.grandTotal)}</strong>
              </div>
              <div className="vendorprocess-summary-row">
                <span>Payment Method</span>
                <strong>{order.paymentMethod || "N/A"}</strong>
              </div>
              <div className="vendorprocess-summary-row">
                <span>Payment Status</span>
                <strong>{order.paymentStatus || "Pending"}</strong>
              </div>
            </div>
          </section>

          <section className="vendorprocess-card">
            <div className="vendorprocess-section-title">
              <FiCheckCircle />
              <h3>Processing Timeline</h3>
            </div>

            <div className="vendorprocess-step-list">
              {statusSteps.map((step) => (
                <div
                  key={step.key}
                  className={`vendorprocess-step ${step.active ? "active" : ""}`}
                >
                  <div className="vendorprocess-step-dot"></div>
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="vendorprocess-card">
            <div className="vendorprocess-section-title">
              <FiCheckCircle />
              <h3>Actions</h3>
            </div>

            <div className="vendorprocess-actions">
              <button
                className="vendorprocess-action-btn green"
                disabled={
                  updating ||
                  (order.orderStatus || "").toLowerCase() === "preparing"
                }
                onClick={() => updateOrderStatus("Preparing")}
              >
                Mark as Preparing
              </button>

              <button
                className="vendorprocess-action-btn orange"
                disabled={
                  updating || (order.orderStatus || "").toLowerCase() === "ready"
                }
                onClick={() => updateOrderStatus("Ready")}
              >
                Mark as Ready
              </button>

              <button
                className="vendorprocess-action-btn dark"
                disabled={
                  updating ||
                  (order.orderStatus || "").toLowerCase() === "completed"
                }
                onClick={() => updateOrderStatus("Completed")}
              >
                {order.orderType?.toLowerCase() === "takeaway"
                  ? "Mark as Picked Up"
                  : "Mark as Completed"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}