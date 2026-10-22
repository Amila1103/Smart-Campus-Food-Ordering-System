import React, { useMemo, useState } from "react";
import axios from "axios";
import {
  FiArrowLeft,
  FiMapPin,
  FiPhone,
  FiUser,
  FiTruck,
  FiCreditCard,
  FiClock,
  FiFileText,
  FiCheckCircle,
  FiAlertTriangle,
  FiHash,
  FiShoppingBag,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./ConfirmOrder.css";

const API_BASE = "http://localhost:5000";

const SLIIT_KANDY_LOCATIONS = [
  "SLIIT Kandy Main Gate",
  "SLIIT Kandy Back Gate",
  "SLIIT Kandy Car Park",
  "Pallekele Road Junction",
  "Nearby Bus Stop - SLIIT Kandy",
  "Peradeniya Road",
  "Getambe Junction",
  "Kandy Railway Station",
  "Kandy Clock Tower",
  "Bogambara",
  "Asgiriya",
  "Dalada Veediya",
  "Custom Location",
];

const DELIVERY_CHARGES = {
  "SLIIT Kandy Main Gate": 100,
  "SLIIT Kandy Back Gate": 120,
  "SLIIT Kandy Car Park": 100,
  "Pallekele Road Junction": 180,
  "Nearby Bus Stop - SLIIT Kandy": 120,
  "Peradeniya Road": 220,
  "Getambe Junction": 200,
  "Kandy Railway Station": 250,
  "Kandy Clock Tower": 280,
  Bogambara: 260,
  Asgiriya: 240,
  "Dalada Veediya": 300,
  "Custom Location": 350,
};

export default function ConfirmOrder() {
  const navigate = useNavigate();

  const cartOrder =
    JSON.parse(localStorage.getItem("cartCheckoutData")) || null;
  const payNowOrder =
    JSON.parse(localStorage.getItem("confirmOrderItem")) || null;

  const storedOrder = cartOrder || payNowOrder || null;

  const [orderType, setOrderType] = useState(
    storedOrder?.orderType || "Delivery"
  );
  const [paymentMethod, setPaymentMethod] = useState(
    storedOrder?.paymentMethod || "Cash on Delivery"
  );
  const [notes, setNotes] = useState(storedOrder?.notes || "");

  const [deliveryLocation, setDeliveryLocation] = useState(
    storedOrder?.deliveryLocation ||
      storedOrder?.selectedDeliveryLocation ||
      "SLIIT Kandy Main Gate"
  );
  const [customLocation, setCustomLocation] = useState(
    storedOrder?.customLocation || ""
  );
  const [landmark, setLandmark] = useState(storedOrder?.landmark || "");
  const [deliveryAddress, setDeliveryAddress] = useState(
    storedOrder?.customer?.address || storedOrder?.address || ""
  );

  const [orderId] = useState(() => {
    const existingOrderId = storedOrder?.orderId;
    if (existingOrderId) return existingOrderId;

    const randomPart = String(Math.floor(Math.random() * 100000)).padStart(
      5,
      "0"
    );
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `ORD-${datePart}-${randomPart}`;
  });

  const customer = storedOrder?.customer || {};

  const items = Array.isArray(storedOrder?.items)
    ? storedOrder.items
    : storedOrder?.item
    ? [storedOrder.item]
    : [];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/600x400?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE}${imagePath}`;
  };

  const customerEmail =
    customer?.gmail || customer?.email || "Email not available";

  const finalDeliveryLocation =
    deliveryLocation === "Custom Location"
      ? customLocation.trim()
      : deliveryLocation;

  const currentDeliveryCharge =
    orderType === "Delivery"
      ? DELIVERY_CHARGES[deliveryLocation] ?? 350
      : 0;

  const googleMapsLink = finalDeliveryLocation
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${finalDeliveryLocation}, SLIIT Kandy`
      )}`
    : "";

  const orderSummary = useMemo(() => {
    const itemsTotal = items.reduce(
      (sum, item) =>
        sum +
        Number(item?.unitPrice || item?.price || 0) * Number(item?.qty || 1),
      0
    );

    const deliveryFee =
      orderType === "Delivery" && items.length > 0 ? currentDeliveryCharge : 0;

    const discount = 0;
    const grandTotal = itemsTotal + deliveryFee - discount;

    return {
      itemsTotal,
      deliveryFee,
      discount,
      grandTotal,
    };
  }, [items, orderType, currentDeliveryCharge]);

  const handlePlaceOrder = async () => {
    if (!storedOrder || items.length === 0) {
      alert("No items available to confirm.");
      return;
    }

    if (orderType === "Delivery") {
      if (!deliveryAddress.trim()) {
        alert("Please enter your delivery address.");
        return;
      }

      if (!deliveryLocation.trim()) {
        alert("Please select a delivery location.");
        return;
      }

      if (deliveryLocation === "Custom Location" && !customLocation.trim()) {
        alert("Please type your custom delivery location.");
        return;
      }

      if (!landmark.trim()) {
        alert("Please enter a nearby landmark.");
        return;
      }
    }

    const finalOrder = {
      orderId,
      customerId: customer?._id || customer?.id || "",
      customerName: customer?.name || "",
      gmail: customer?.gmail || customer?.email || "",
      phoneNumber: customer?.phoneNumber || "",
      customer,
      address: orderType === "Delivery" ? deliveryAddress : "",
      orderType,
      deliveryLocation: orderType === "Delivery" ? finalDeliveryLocation : "",
      selectedDeliveryLocation:
        orderType === "Delivery" ? deliveryLocation : "",
      customLocation:
        orderType === "Delivery" && deliveryLocation === "Custom Location"
          ? customLocation
          : "",
      landmark: orderType === "Delivery" ? landmark : "",
      googleMapsLink: orderType === "Delivery" ? googleMapsLink : "",
      items: items.map((item) => ({
        _id: item?._id || item?.itemId || "",
        itemId: item?.itemId || item?._id || "",
        name: item?.name || "",
        qty: Number(item?.qty || 1),
        portionSize: item?.portionSize || "Regular",
        unitPrice: Number(item?.unitPrice || item?.price || 0),
        price: Number(item?.unitPrice || item?.price || 0),
        subtotal:
          Number(item?.unitPrice || item?.price || 0) * Number(item?.qty || 1),
        image: item?.image || "",
        category: item?.category || "",
        description: item?.description || "",
      })),
      totalAmount: orderSummary.itemsTotal,
      deliveryFee: orderSummary.deliveryFee,
      discount: orderSummary.discount,
      grandTotal: orderSummary.grandTotal,
      paymentMethod,
      paymentStatus: "Pending",
      orderStatus: "Pending",
      notes,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await axios.post(`${API_BASE}/orders`, finalOrder);
      const savedOrder = res.data?.order || finalOrder;

      localStorage.setItem("finalConfirmedOrder", JSON.stringify(savedOrder));

      const existingOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
      existingOrders.push(savedOrder);
      localStorage.setItem("allOrders", JSON.stringify(existingOrders));

      localStorage.removeItem("cartItems");
      localStorage.removeItem("cartCheckoutData");
      localStorage.removeItem("confirmOrderItem");
      window.dispatchEvent(new Event("cartUpdated"));

      alert(`Order confirmed successfully! Your Order ID is ${savedOrder.orderId}`);
      navigate("/Payment");
    } catch (err) {
      console.log("Confirm order error:", err);
      alert(err?.response?.data?.message || "Failed to confirm order.");
    }
  };

  if (!storedOrder || items.length === 0) {
    return (
      <div className="co-page">
        <div className="co-empty-wrap">
          <div className="co-empty-card">
            <FiAlertTriangle className="co-empty-icon" />
            <h2>No order selected</h2>
            <p>Please go back to the cart or menu and select items first.</p>
            <button
              className="co-primary-btn"
              onClick={() => navigate("/cart")}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="co-page">
      <section className="co-hero">
        <div className="co-hero-card">
          <div className="co-hero-top">
            <button className="co-back-top-btn" onClick={() => navigate(-1)}>
              <FiArrowLeft />
              Back
            </button>
            <span className="co-chip">Order Confirmation</span>
          </div>

          <h1>Confirm Your Order</h1>
          <p>
            Review your selected items, customer details, delivery details,
            payment details, and order summary before placing the order.
          </p>

          <div className="co-order-id-box">
            <div className="co-order-id-label">
              <FiHash />
              <span>Order ID</span>
            </div>
            <div className="co-order-id-value">{orderId}</div>
          </div>
        </div>
      </section>

      <section className="co-main">
        <div className="co-left">
          <div className="co-card">
            <div className="co-card-title">
              <FiUser />
              <h3>Customer Details</h3>
            </div>

            <div className="co-info-grid">
              <div className="co-info-item">
                <span>Name</span>
                <strong>{customer?.name || "Not available"}</strong>
              </div>

              <div className="co-info-item">
                <span>Phone Number</span>
                <strong>{customer?.phoneNumber || "Not available"}</strong>
              </div>

              <div className="co-info-item full">
                <span>Saved Address</span>
                <strong>{customer?.address || "Not available"}</strong>
              </div>
            </div>

            <div className="co-customer-tags">
              <span>{customer?.gender || "Customer"}</span>
              <span>{customerEmail}</span>
            </div>
          </div>

          <div className="co-card">
            <div className="co-card-title">
              <FiTruck />
              <h3>Delivery & Payment</h3>
            </div>

            <div className="co-form-grid">
              <div className="co-field">
                <label>Order Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                >
                  <option value="Delivery">Delivery</option>
                  <option value="Takeaway">Takeaway</option>
                  <option value="Dine-In">Dine-In</option>
                </select>
              </div>

              <div className="co-field">
                <label>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Card Payment">Card Payment</option>
                  <option value="Online Payment">Online Payment</option>
                </select>
              </div>

              {orderType === "Delivery" && (
                <>
                  <div className="co-field full">
                    <label>Select Delivery Location</label>
                    <select
                      value={deliveryLocation}
                      onChange={(e) => setDeliveryLocation(e.target.value)}
                    >
                      {SLIIT_KANDY_LOCATIONS.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>

                  {deliveryLocation === "Custom Location" && (
                    <div className="co-field full">
                      <label>Type Custom Location</label>
                      <input
                        type="text"
                        placeholder="Enter a location around SLIIT Kandy area"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        className="co-text-input"
                      />
                    </div>
                  )}

                  <div className="co-field full">
                    <label>Delivery Address</label>
                    <textarea
                      rows="3"
                      placeholder="Enter your full delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>

                  <div className="co-field full">
                    <label>Nearby Landmark</label>
                    <input
                      type="text"
                      placeholder="Example: Near main gate / bus stop / book shop"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="co-text-input"
                    />
                  </div>

                  {finalDeliveryLocation && (
                    <div className="co-note-box">
                      <p>
                        <strong>Selected Delivery Location:</strong>{" "}
                        {finalDeliveryLocation}
                      </p>
                      <p>
                        <strong>Delivery Charge:</strong> Rs.{" "}
                        {currentDeliveryCharge}
                      </p>
                      <p>
                        <strong>Google Maps Link:</strong>{" "}
                        <a
                          href={googleMapsLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#2e7d32", fontWeight: 700 }}
                        >
                          Open Location in Google Maps
                        </a>
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="co-field full">
                <label>Special Notes</label>
                <textarea
                  rows="4"
                  placeholder="Add any order notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="co-card">
            <div className="co-card-title">
              <FiFileText />
              <h3>Health & Dietary Notes</h3>
            </div>

            <div className="co-note-box">
              <p>
                <strong>Allergies:</strong>{" "}
                {customer?.allergies?.length > 0
                  ? customer.allergies.join(", ")
                  : "No allergies added"}
              </p>
              <p>
                <strong>Dietary Preferences:</strong>{" "}
                {customer?.dietaryPreferences?.length > 0
                  ? customer.dietaryPreferences.join(", ")
                  : "No dietary preferences added"}
              </p>
              <p>
                <strong>Calorie Goal:</strong>{" "}
                {customer?.calorieGoal || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        <div className="co-right">
          <div className="co-card">
            <div className="co-card-title">
              <FiShoppingBag />
              <h3>Ordered Items ({items.length})</h3>
            </div>

            <div className="co-items-list">
              {items.map((item, index) => {
                const subtotal =
                  Number(item?.unitPrice || item?.price || 0) *
                  Number(item?.qty || 1);

                return (
                  <div className="co-order-item" key={`${item._id}-${index}`}>
                    <div className="co-order-image">
                      <img src={getImageUrl(item.image)} alt={item.name} />
                    </div>

                    <div className="co-order-content">
                      <div className="co-order-top">
                        <h3>{item.name}</h3>
                        <span>
                          Rs. {Number(item?.unitPrice || item?.price || 0)}
                        </span>
                      </div>

                      <p>{item.description || "Freshly prepared menu item."}</p>

                      <div className="co-order-tags">
                        <span>{item.category || "Menu Item"}</span>
                        <span>{item.portionSize || "Regular"}</span>
                        <span>Qty: {item.qty || 1}</span>
                      </div>

                      <div className="co-line">
                        <span>Subtotal</span>
                        <strong>Rs. {subtotal}</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="co-card co-summary-card">
            <div className="co-card-title">
              <FiCreditCard />
              <h3>Order Summary</h3>
            </div>

            <div className="co-summary-lines">
              <div className="co-line">
                <span>Items Total</span>
                <strong>Rs. {orderSummary.itemsTotal}</strong>
              </div>
              <div className="co-line">
                <span>Delivery Fee</span>
                <strong>Rs. {orderSummary.deliveryFee}</strong>
              </div>
              <div className="co-line">
                <span>Discount</span>
                <strong>Rs. {orderSummary.discount}</strong>
              </div>
              <div className="co-line total">
                <span>Grand Total</span>
                <strong>Rs. {orderSummary.grandTotal}</strong>
              </div>
            </div>

            <div className="co-extra-info">
              <div className="co-extra-row">
                <FiClock />
                <span>
                  {orderType === "Delivery"
                    ? "Estimated delivery time: 25 - 35 mins"
                    : "Estimated preparation time: 15 - 20 mins"}
                </span>
              </div>

              <div className="co-extra-row">
                <FiMapPin />
                <span>
                  {orderType === "Delivery"
                    ? finalDeliveryLocation || "Delivery"
                    : orderType}
                </span>
              </div>

              <div className="co-extra-row">
                <FiPhone />
                <span>{customer?.phoneNumber || "Phone not available"}</span>
              </div>
            </div>

            <div className="co-action-group">
              <button className="co-secondary-btn" onClick={() => navigate(-1)}>
                <FiArrowLeft />
                Back
              </button>

              <button className="co-primary-btn" onClick={handlePlaceOrder}>
                <FiCheckCircle />
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}