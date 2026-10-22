import CompletedOrder from "../Model/CompletedOrderModel.js";

// completed order එකක් manually save කරන්න
export const createCompletedOrder = async (req, res) => {
  try {
    const {
      orderRef,
      orderId,
      customerId,
      customerName,
      gmail,
      phoneNumber,
      vendorId,
      vendorName,
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
      originalCreatedAt,
      completedAt,
    } = req.body;

    const exists = await CompletedOrder.findOne({
      $or: [{ orderId }, ...(orderRef ? [{ orderRef }] : [])],
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "This completed order already exists",
      });
    }

    const completedOrder = new CompletedOrder({
      orderRef,
      orderId,
      customerId,
      customerName,
      gmail,
      phoneNumber,
      vendorId: vendorId || null,
      vendorName: vendorName || "",
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
      orderStatus: orderStatus || "Completed",
      notes,
      originalCreatedAt,
      completedAt: completedAt || new Date(),
    });

    await completedOrder.save();

    return res.status(201).json({
      success: true,
      message: "Completed order saved successfully",
      completedOrder,
    });
  } catch (error) {
    console.log("createCompletedOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving completed order",
      error: error.message,
    });
  }
};

export const getAllCompletedOrders = async (req, res) => {
  try {
    const completedOrders = await CompletedOrder.find().sort({ completedAt: -1 });

    return res.status(200).json({
      success: true,
      count: completedOrders.length,
      completedOrders,
    });
  } catch (error) {
    console.log("getAllCompletedOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching completed orders",
      error: error.message,
    });
  }
};

export const getFinishedCompletedOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const completedOrders = await CompletedOrder.find({
      customerId: String(customerId),
      orderStatus: "Finished",
    }).sort({ completedAt: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: completedOrders.length,
      completedOrders,
    });
  } catch (error) {
    console.log("getFinishedCompletedOrdersByCustomer error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching finished completed orders",
      error: error.message,
    });
  }
};

export const getCompletedOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const completedOrder = await CompletedOrder.findOne({ orderId });

    if (!completedOrder) {
      return res.status(404).json({
        success: false,
        message: "Completed order not found",
      });
    }

    return res.status(200).json({
      success: true,
      completedOrder,
    });
  } catch (error) {
    console.log("getCompletedOrderByOrderId error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching completed order",
      error: error.message,
    });
  }
};

export const markCompletedOrderAsFinished = async (req, res) => {
  try {
    const { orderId } = req.params;

    const updatedOrder = await CompletedOrder.findOneAndUpdate(
      { orderId },
      { orderStatus: "Finished" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Completed order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Completed order marked as Finished",
      completedOrder: updatedOrder,
    });
  } catch (error) {
    console.log("markCompletedOrderAsFinished error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating completed order status",
      error: error.message,
    });
  }
};

export const saveCompletedOrderFromOrder = async (orderDoc) => {
  try {
    if (!orderDoc) return null;

    const alreadySaved = await CompletedOrder.findOne({
      $or: [{ orderRef: orderDoc._id }, { orderId: orderDoc.orderId }],
    });

    if (alreadySaved) return alreadySaved;

    const completedOrder = new CompletedOrder({
      orderRef: orderDoc._id,
      orderId: orderDoc.orderId,
      customerId: orderDoc.customerId,
      customerName: orderDoc.customerName,
      gmail: orderDoc.gmail,
      phoneNumber: orderDoc.phoneNumber,
      vendorId: orderDoc.vendorId || null,
      vendorName: orderDoc.vendorName || "",
      customer: orderDoc.customer || {},
      address: orderDoc.address,
      orderType: orderDoc.orderType,
      deliveryLocation: orderDoc.deliveryLocation,
      selectedDeliveryLocation: orderDoc.selectedDeliveryLocation,
      customLocation: orderDoc.customLocation,
      landmark: orderDoc.landmark,
      googleMapsLink: orderDoc.googleMapsLink,
      items: orderDoc.items || [],
      totalAmount: orderDoc.totalAmount,
      deliveryFee: orderDoc.deliveryFee,
      discount: orderDoc.discount,
      grandTotal: orderDoc.grandTotal,
      paymentMethod: orderDoc.paymentMethod,
      paymentStatus: orderDoc.paymentStatus,
      orderStatus: "Completed",
      notes: orderDoc.notes,
      originalCreatedAt: orderDoc.createdAt,
      completedAt: new Date(),
    });

    await completedOrder.save();
    return completedOrder;
  } catch (error) {
    console.log("saveCompletedOrderFromOrder error:", error.message);
    throw error;
  }
};