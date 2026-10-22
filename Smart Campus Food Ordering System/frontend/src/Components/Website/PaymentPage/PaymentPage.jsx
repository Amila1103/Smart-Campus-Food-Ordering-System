import React, { useMemo, useState } from "react";
import axios from "axios";
import {
  FiArrowLeft,
  FiCreditCard,
  FiCheckCircle,
  FiMapPin,
  FiPhone,
  FiUser,
  FiMail,
  FiTruck,
  FiHash,
  FiClock,
  FiShoppingBag,
  FiShield,
  FiDownload,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./PaymentPage.css";
import { downloadInvoicePdf } from "./invoiceGenerator";

const API_BASE = "http://localhost:5000";

export default function PaymentPage() {
  const navigate = useNavigate();

  const storedOrder =
    JSON.parse(localStorage.getItem("finalConfirmedOrder")) ||
    JSON.parse(localStorage.getItem("cartCheckoutData")) ||
    null;

  const [paymentMethod, setPaymentMethod] = useState(
    storedOrder?.paymentMethod || "Cash on Delivery"
  );

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const [bankName, setBankName] = useState("Bank of Ceylon");
  const [referenceNumber, setReferenceNumber] = useState("");

  const items = storedOrder?.items || [];

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/600x400?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE}${imagePath}`;
  };

  const summary = useMemo(() => {
    const itemsTotal =
      Number(storedOrder?.totalAmount || 0) ||
      items.reduce(
        (sum, item) =>
          sum +
          Number(item?.unitPrice || item?.price || 0) * Number(item?.qty || 1),
        0
      );

    const deliveryFee = Number(storedOrder?.deliveryFee || 0);
    const discount = Number(storedOrder?.discount || 0);
    const grandTotal = Number(
      storedOrder?.grandTotal || itemsTotal + deliveryFee - discount
    );

    return {
      itemsTotal,
      deliveryFee,
      discount,
      grandTotal,
    };
  }, [storedOrder, items]);

  const handlePayment = async () => {
    if (!storedOrder || items.length === 0) {
      alert("No order available for payment.");
      return;
    }

    if (paymentMethod === "Card Payment") {
      if (!cardName.trim()) {
        alert("Please enter card holder name.");
        return;
      }
      if (!cardNumber.trim() || cardNumber.replace(/\s/g, "").length < 12) {
        alert("Please enter a valid card number.");
        return;
      }
      if (!expiryDate.trim()) {
        alert("Please enter expiry date.");
        return;
      }
      if (!cvv.trim() || cvv.length < 3) {
        alert("Please enter a valid CVV.");
        return;
      }
    }

    if (paymentMethod === "Online Payment") {
      if (!bankName.trim()) {
        alert("Please select a bank.");
        return;
      }
      if (!referenceNumber.trim()) {
        alert("Please enter payment reference number.");
        return;
      }
    }

    const now = new Date();

    const paidOrder = {
      ...storedOrder,
      paymentMethod,
      paymentStatus:
        paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
      orderStatus: "Confirmed",
      paidAt:
        paymentMethod === "Cash on Delivery" ? null : now.toISOString(),
      paymentDetails:
        paymentMethod === "Card Payment"
          ? {
              cardName,
              cardNumber: `**** **** **** ${cardNumber
                .replace(/\s/g, "")
                .slice(-4)}`,
              expiryDate,
            }
          : paymentMethod === "Online Payment"
          ? {
              bankName,
              referenceNumber,
            }
          : {},
      invoiceNo: `CC-${Date.now().toString().slice(-6)}`,
      invoiceDate: now.toLocaleString(),
    };

    const paymentData = {
      paymentId: `PAY-${Date.now().toString().slice(-8)}`,
      orderId: paidOrder.orderId,
      customerId: paidOrder.customerId || paidOrder.customer?._id || "",
      customerName: paidOrder.customerName || paidOrder.customer?.name || "",
      gmail:
        paidOrder.gmail ||
        paidOrder.customer?.gmail ||
        paidOrder.customer?.email ||
        "",
      phoneNumber:
        paidOrder.phoneNumber || paidOrder.customer?.phoneNumber || "",
      paymentMethod: paidOrder.paymentMethod,
      paymentStatus: paidOrder.paymentStatus,
      orderStatus: paidOrder.orderStatus,
      totalAmount: paidOrder.totalAmount || 0,
      deliveryFee: paidOrder.deliveryFee || 0,
      discount: paidOrder.discount || 0,
      grandTotal: paidOrder.grandTotal || 0,
      paymentDetails: paidOrder.paymentDetails,
      paidAt: paidOrder.paidAt,
      invoiceNo: paidOrder.invoiceNo,
      invoiceDate: paidOrder.invoiceDate,
    };

    localStorage.setItem("finalPaidOrder", JSON.stringify(paidOrder));

    try {
      await axios.post(`${API_BASE}/payment`, paymentData);
    } catch (paymentErr) {
      console.log("Payment DB save failed:", paymentErr);
    }

    const allOrders = JSON.parse(localStorage.getItem("allOrders")) || [];
    allOrders.push(paidOrder);
    localStorage.setItem("allOrders", JSON.stringify(allOrders));

    await downloadInvoicePdf(paidOrder);

    try {
      await axios.post(`${API_BASE}/invoice/send-email`, paidOrder);
    } catch (emailErr) {
      console.log("Invoice email send failed:", emailErr);
    }

    localStorage.removeItem("cartItems");
    localStorage.removeItem("cartCheckoutData");
    localStorage.removeItem("finalConfirmedOrder");

    alert(
      paymentMethod === "Cash on Delivery"
        ? `Order placed successfully! Invoice sent to email.`
        : `Payment successful! Invoice sent to email.`
    );

    navigate("/CustomerPaymentSucsse");
  };

  const handleDownloadLastInvoice = async () => {
    const finalPaidOrder = JSON.parse(localStorage.getItem("finalPaidOrder"));

    if (!finalPaidOrder) {
      alert("No paid order invoice found.");
      return;
    }

    await downloadInvoicePdf(finalPaidOrder);
  };

  if (!storedOrder || items.length === 0) {
    return (
      <div className="pay-page">
        <div className="pay-empty-wrap">
          <div className="pay-empty-card">
            <h2>No payment details found</h2>
            <p>Please confirm your order first before going to the payment page.</p>
            <button
              className="pay-primary-btn"
              onClick={() => navigate("/confirm-order")}
            >
              Go to Confirm Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pay-page">
      <section className="pay-hero">
        <div className="pay-hero-card">
          <div className="pay-hero-top">
            <button className="pay-back-btn" onClick={() => navigate(-1)}>
              <FiArrowLeft />
              Back
            </button>
            <span className="pay-chip">Secure Payment</span>
          </div>

          <h1>Complete Your Payment</h1>
          <p>
            Review your order details and choose your preferred payment method
            to complete the checkout process.
          </p>

          <div className="pay-order-id-box">
            <div className="pay-order-id-label">
              <FiHash />
              <span>Order ID</span>
            </div>
            <div className="pay-order-id-value">
              {storedOrder?.orderId || "Not Available"}
            </div>
          </div>
        </div>
      </section>

      <section className="pay-main">
        <div className="pay-left">
          <div className="pay-card">
            <div className="pay-card-title">
              <FiUser />
              <h3>Customer & Delivery Details</h3>
            </div>

            <div className="pay-info-grid">
              <div className="pay-info-item">
                <span>Name</span>
                <strong>{storedOrder?.customerName || "Not available"}</strong>
              </div>

              <div className="pay-info-item">
                <span>Phone</span>
                <strong>{storedOrder?.phoneNumber || "Not available"}</strong>
              </div>

              <div className="pay-info-item">
                <span>Email</span>
                <strong>{storedOrder?.gmail || "Not available"}</strong>
              </div>

              <div className="pay-info-item">
                <span>Order Type</span>
                <strong>{storedOrder?.orderType || "Not available"}</strong>
              </div>

              <div className="pay-info-item full">
                <span>Address</span>
                <strong>{storedOrder?.address || "Not available"}</strong>
              </div>

              <div className="pay-info-item">
                <span>Delivery Location</span>
                <strong>
                  {storedOrder?.deliveryLocation ||
                    storedOrder?.selectedDeliveryLocation ||
                    "Not available"}
                </strong>
              </div>

              <div className="pay-info-item">
                <span>Landmark</span>
                <strong>{storedOrder?.landmark || "Not available"}</strong>
              </div>
            </div>

            <div className="pay-info-tags">
              <span>
                <FiTruck />
                {storedOrder?.orderType || "Delivery"}
              </span>
              <span>
                <FiClock />
                25 - 35 mins
              </span>
              <span>
                <FiMapPin />
                Delivery Ready
              </span>
            </div>
          </div>

          <div className="pay-card">
            <div className="pay-card-title">
              <FiCreditCard />
              <h3>Choose Payment Method</h3>
            </div>

            <div className="pay-method-grid">
              <button
                className={`pay-method-card ${
                  paymentMethod === "Cash on Delivery" ? "active" : ""
                }`}
                onClick={() => setPaymentMethod("Cash on Delivery")}
              >
                <FiTruck />
                <div>
                  <h4>Cash on Delivery</h4>
                  <p>Pay when your order arrives</p>
                </div>
              </button>

              <button
                className={`pay-method-card ${
                  paymentMethod === "Card Payment" ? "active" : ""
                }`}
                onClick={() => setPaymentMethod("Card Payment")}
              >
                <FiCreditCard />
                <div>
                  <h4>Card Payment</h4>
                  <p>Visa, MasterCard, debit or credit</p>
                </div>
              </button>

              <button
                className={`pay-method-card ${
                  paymentMethod === "Online Payment" ? "active" : ""
                }`}
                onClick={() => setPaymentMethod("Online Payment")}
              >
                <FiShield />
                <div>
                  <h4>Online Payment</h4>
                  <p>Bank transfer or online reference</p>
                </div>
              </button>
            </div>

            {paymentMethod === "Card Payment" && (
              <div className="pay-form-wrap">
                <div className="pay-form-grid">
                  <div className="pay-field full">
                    <label>Card Holder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Enter card holder name"
                    />
                  </div>

                  <div className="pay-field full">
                    <label>Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div className="pay-field">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/YY"
                    />
                  </div>

                  <div className="pay-field">
                    <label>CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "Online Payment" && (
              <div className="pay-form-wrap">
                <div className="pay-form-grid">
                  <div className="pay-field full">
                    <label>Select Bank</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    >
                      <option value="Bank of Ceylon">Bank of Ceylon</option>
                      <option value="People's Bank">People's Bank</option>
                      <option value="Commercial Bank">Commercial Bank</option>
                      <option value="Sampath Bank">Sampath Bank</option>
                      <option value="HNB">HNB</option>
                    </select>
                  </div>

                  <div className="pay-field full">
                    <label>Reference Number</label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      placeholder="Enter transfer / payment reference number"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "Cash on Delivery" && (
              <div className="pay-cod-box">
                <FiCheckCircle />
                <div>
                  <h4>Cash on Delivery Selected</h4>
                  <p>
                    You can place the order now and pay the delivery person when
                    the order arrives.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pay-right">
          <div className="pay-card pay-summary-card">
            <div className="pay-card-title">
              <FiShoppingBag />
              <h3>Order Summary</h3>
            </div>

            <div className="pay-items-list">
              {items.map((item, index) => {
                const subtotal =
                  Number(item?.subtotal || 0) ||
                  Number(item?.unitPrice || item?.price || 0) *
                    Number(item?.qty || 1);

                return (
                  <div className="pay-item" key={`${item?.itemId}-${index}`}>
                    <div className="pay-item-image">
                      <img src={getImageUrl(item?.image)} alt={item?.name} />
                    </div>

                    <div className="pay-item-content">
                      <div className="pay-item-top">
                        <h4>{item?.name}</h4>
                        <span>Rs. {subtotal}</span>
                      </div>
                      <p>
                        {item?.portionSize || "Regular"} • Qty: {item?.qty || 1}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pay-summary-lines">
              <div className="pay-line">
                <span>Items Total</span>
                <strong>Rs. {summary.itemsTotal}</strong>
              </div>

              <div className="pay-line">
                <span>Delivery Fee</span>
                <strong>Rs. {summary.deliveryFee}</strong>
              </div>

              <div className="pay-line">
                <span>Discount</span>
                <strong>Rs. {summary.discount}</strong>
              </div>

              <div className="pay-line total">
                <span>Grand Total</span>
                <strong>Rs. {summary.grandTotal}</strong>
              </div>
            </div>

            <div className="pay-side-info">
              <div className="pay-side-row">
                <FiMail />
                <span>{storedOrder?.gmail || "No email available"}</span>
              </div>
              <div className="pay-side-row">
                <FiPhone />
                <span>{storedOrder?.phoneNumber || "No phone available"}</span>
              </div>
              <div className="pay-side-row">
                <FiMapPin />
                <span>
                  {storedOrder?.deliveryLocation ||
                    storedOrder?.selectedDeliveryLocation ||
                    storedOrder?.orderType}
                </span>
              </div>
            </div>

            <div className="pay-action-group">
              <button
                className="pay-secondary-btn"
                onClick={() => navigate(-1)}
              >
                <FiArrowLeft />
                Back to Confirm Order
              </button>

              <button className="pay-primary-btn" onClick={handlePayment}>
                <FiCheckCircle />
                {paymentMethod === "Cash on Delivery"
                  ? "Place Order"
                  : `Pay Rs. ${summary.grandTotal}`}
              </button>

              <button
                className="pay-secondary-btn"
                onClick={handleDownloadLastInvoice}
              >
                <FiDownload />
                Download Last Invoice
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}