import Order from "../Model/OrderModel.js";
import Cart from "../Model/CartModel.js";
import { saveCompletedOrderFromOrder } from "./CompletedOrderControlers.js";

// CREATE ORDER + DELETE CUSTOMER CART RECORD
const createOrder = async (req, res) => {
  try {
    const {
      orderId,
      customerId,
      customerName,
      gmail,
      phoneNumber,
      customer,
      address,
      orderType,
      deliveryLocation,
      selectedDeliveryLocation,
      customLocation,
      landmark,
      googleMapsLink,
      items,
      totalAmount,
      deliveryFee,
      discount,
      grandTotal,
      paymentMethod,
      paymentStatus,
      orderStatus,
      notes,
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "orderId is required" });
    }

    if (!customerId) {
      return res.status(400).json({ message: "customerId is required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const existingOrder = await Order.findOne({ orderId });

    if (existingOrder) {
      return res.status(400).json({ message: "Order already exists" });
    }

    const normalizedItems = items.map((item) => {
      const qty = Number(item?.qty || 1);
      const price = Number(item?.unitPrice || item?.price || 0);

      return {
        itemId: item?.itemId || item?._id || "",
        name: item?.name || "",
        qty,
        portionSize: item?.portionSize || "Regular",
        unitPrice: price,
        price,
        subtotal: Number(item?.subtotal || price * qty),
        image: item?.image || "",
        category: item?.category || "",
        description: item?.description || "",
      };
    });

    const newOrder = await Order.create({
      orderId,
      customerId,
      customerName: customerName || "",
      gmail: gmail || "",
      phoneNumber: phoneNumber || "",
      customer: customer || {},
      address: address || "",
      orderType: orderType || "Delivery",
      deliveryLocation: deliveryLocation || "",
      selectedDeliveryLocation: selectedDeliveryLocation || "",
      customLocation: customLocation || "",
      landmark: landmark || "",
      googleMapsLink: googleMapsLink || "",
      items: normalizedItems,
      totalAmount: Number(totalAmount || 0),
      deliveryFee: Number(deliveryFee || 0),
      discount: Number(discount || 0),
      grandTotal: Number(grandTotal || 0),
      paymentMethod: paymentMethod || "Cash on Delivery",
      paymentStatus: paymentStatus || "Pending",
      orderStatus: orderStatus || "Pending",
      notes: notes || "",
    });

    await Cart.findOneAndDelete({ customerId });

    return res.status(201).json({
      message: "Order created successfully and cart deleted",
      order: newOrder,
    });
  } catch (err) {
    console.log("createOrder error:", err);
    return res.status(500).json({ message: "Create order error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (err) {
    console.log("getAllOrders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getOrderByOrderId = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ order });
  } catch (err) {
    console.log("getOrderByOrderId error:", err);
    return res.status(500).json({ message: "Fetch order error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = orderStatus;
    await order.save();

    if ((orderStatus || "").toLowerCase() === "completed") {
      await saveCompletedOrderFromOrder(order);

      await Order.deleteOne({ _id: order._id });

      return res.status(200).json({
        message: "Order completed, moved to completed orders, and removed from orders",
      });
    }

    return res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    console.log("updateOrderStatus error:", err);
    return res.status(500).json({ message: "Update order status error" });
  }
};

export default {
  createOrder,
  getAllOrders,
  getOrderByOrderId,
  updateOrderStatus,
};