import Payment from "../Model/PaymentModel.js";
import { getVendorFromOrderId } from "../utils/getVendorFromOrderId.js";

const createPayment = async (req, res) => {
  try {
    const {
      paymentId,
      orderId,
      customerId,
      customerName,
      gmail,
      phoneNumber,
      paymentMethod,
      paymentStatus,
      orderStatus,
      totalAmount,
      deliveryFee,
      discount,
      grandTotal,
      paymentDetails,
      paidAt,
      invoiceNo,
      invoiceDate,
    } = req.body;

    if (!paymentId) {
      return res.status(400).json({ message: "paymentId is required" });
    }

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    const existingPayment = await Payment.findOne({ paymentId });

    if (existingPayment) {
      return res.status(400).json({ message: "Payment already exists" });
    }

    const { vendorId, vendorName } = await getVendorFromOrderId(orderId);

    const newPayment = await Payment.create({
      paymentId,
      orderId,
      customerId: customerId || "",
      customerName: customerName || "",
      gmail: gmail || "",
      phoneNumber: phoneNumber || "",
      vendorId: vendorId || null,
      vendorName: vendorName || "",
      paymentMethod: paymentMethod || "Cash on Delivery",
      paymentStatus: paymentStatus || "Pending",
      orderStatus: orderStatus || "Confirmed",
      totalAmount: Number(totalAmount || 0),
      deliveryFee: Number(deliveryFee || 0),
      discount: Number(discount || 0),
      grandTotal: Number(grandTotal || 0),
      paymentDetails: paymentDetails || {},
      paidAt: paidAt || null,
      invoiceNo: invoiceNo || "",
      invoiceDate: invoiceDate || "",
    });

    return res.status(201).json({
      message: "Payment saved successfully",
      payment: newPayment,
    });
  } catch (err) {
    console.log("createPayment error:", err);
    return res.status(500).json({ message: "Create payment error" });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    return res.status(200).json({ payments });
  } catch (err) {
    console.log("getAllPayments error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getPaymentByOrderId = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json({ payment });
  } catch (err) {
    console.log("getPaymentByOrderId error:", err);
    return res.status(500).json({ message: "Fetch payment error" });
  }
};

const getPaymentByPaymentId = async (req, res) => {
  try {
    const payment = await Payment.findOne({ paymentId: req.params.paymentId });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    return res.status(200).json({ payment });
  } catch (err) {
    console.log("getPaymentByPaymentId error:", err);
    return res.status(500).json({ message: "Fetch payment error" });
  }
};

export default {
  createPayment,
  getAllPayments,
  getPaymentByOrderId,
  getPaymentByPaymentId,
};