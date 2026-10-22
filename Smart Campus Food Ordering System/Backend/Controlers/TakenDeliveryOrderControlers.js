import TakenDeliveryOrder from "../Model/TakenDeliveryOrderModel.js";
import CompletedOrder from "../Model/CompletedOrderModel.js";
import Staff from "../Model/StaffModel.js";

// TAKE ORDER AND SAVE INTO TAKEN DELIVERY ORDERS
export const takeDeliveryOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!req.staff || !req.staff.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const completedOrder = await CompletedOrder.findOne({ orderId });

    if (!completedOrder) {
      return res.status(404).json({
        success: false,
        message: "Completed order not found",
      });
    }

    const existingTakenOrder = await TakenDeliveryOrder.findOne({
      $or: [{ completedOrderRef: completedOrder._id }, { orderId }],
    });

    if (existingTakenOrder) {
      return res.status(400).json({
        success: false,
        message: "This order has already been taken",
      });
    }

    const deliveryStaff = await Staff.findById(req.staff.id);

    if (!deliveryStaff) {
      return res.status(404).json({
        success: false,
        message: "Delivery staff not found",
      });
    }

    const takenOrder = new TakenDeliveryOrder({
      completedOrderRef: completedOrder._id,
      orderId: completedOrder.orderId,
      customerId: completedOrder.customerId,
      customerName: completedOrder.customerName,
      gmail: completedOrder.gmail,
      phoneNumber: completedOrder.phoneNumber,
      customer: completedOrder.customer || {},
      address: completedOrder.address,
      orderType: completedOrder.orderType,
      deliveryLocation: completedOrder.deliveryLocation,
      selectedDeliveryLocation: completedOrder.selectedDeliveryLocation,
      customLocation: completedOrder.customLocation,
      landmark: completedOrder.landmark,
      googleMapsLink: completedOrder.googleMapsLink,
      items: completedOrder.items || [],
      totalAmount: completedOrder.totalAmount,
      deliveryFee: completedOrder.deliveryFee,
      discount: completedOrder.discount,
      grandTotal: completedOrder.grandTotal,
      paymentMethod: completedOrder.paymentMethod,
      paymentStatus: completedOrder.paymentStatus,
      orderStatusSnapshot: completedOrder.orderStatus || "Completed",
      notes: completedOrder.notes,
      originalCreatedAt: completedOrder.originalCreatedAt,
      completedAt: completedOrder.completedAt,

      takenByStaffId: deliveryStaff._id,
      takenByStaffName: deliveryStaff.name,
      takenByStaffEmail: deliveryStaff.email,
      takenAt: new Date(),

      deliveryStatus: "Taken",
      isActive: true,
    });

    await takenOrder.save();

    return res.status(201).json({
      success: true,
      message: "Order taken successfully",
      takenOrder,
    });
  } catch (error) {
    console.log("takeDeliveryOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while taking delivery order",
      error: error.message,
    });
  }
};

// GET ALL TAKEN DELIVERY ORDERS
export const getAllTakenDeliveryOrders = async (req, res) => {
  try {
    const takenOrders = await TakenDeliveryOrder.find().sort({ takenAt: -1 });

    return res.status(200).json({
      success: true,
      count: takenOrders.length,
      takenOrders,
    });
  } catch (error) {
    console.log("getAllTakenDeliveryOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching taken delivery orders",
      error: error.message,
    });
  }
};

// GET TAKEN DELIVERY ORDER BY ORDER ID
export const getTakenDeliveryOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const takenOrder = await TakenDeliveryOrder.findOne({ orderId });

    if (!takenOrder) {
      return res.status(404).json({
        success: false,
        message: "Taken delivery order not found",
      });
    }

    return res.status(200).json({
      success: true,
      takenOrder,
    });
  } catch (error) {
    console.log("getTakenDeliveryOrderByOrderId error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching taken delivery order",
      error: error.message,
    });
  }
};

// GET MY TAKEN DELIVERY ORDERS
export const getMyTakenDeliveryOrders = async (req, res) => {
  try {
    if (!req.staff || !req.staff.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const myOrders = await TakenDeliveryOrder.find({
      takenByStaffId: req.staff.id,
    }).sort({ takenAt: -1 });

    return res.status(200).json({
      success: true,
      count: myOrders.length,
      takenOrders: myOrders,
    });
  } catch (error) {
    console.log("getMyTakenDeliveryOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching my taken orders",
      error: error.message,
    });
  }
};

// UPDATE DELIVERY STATUS
export const updateTakenDeliveryOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus, deliveryNotes } = req.body;

    if (!req.staff || !req.staff.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const takenOrder = await TakenDeliveryOrder.findOne({ orderId });

    if (!takenOrder) {
      return res.status(404).json({
        success: false,
        message: "Taken delivery order not found",
      });
    }

    takenOrder.deliveryStatus = deliveryStatus || takenOrder.deliveryStatus;

    if (deliveryNotes !== undefined) {
      takenOrder.deliveryNotes = deliveryNotes;
    }

    if (deliveryStatus === "Picked Up") {
      takenOrder.pickedUpAt = new Date();
    }

    if (deliveryStatus === "Out for Delivery") {
      takenOrder.outForDeliveryAt = new Date();
    }

    if (deliveryStatus === "Delivered") {
      const deliveryStaff = await Staff.findById(req.staff.id);

      takenOrder.deliveredAt = new Date();
      takenOrder.isActive = false;

      if (deliveryStaff) {
        takenOrder.deliveredByStaffId = deliveryStaff._id;
        takenOrder.deliveredByStaffName = deliveryStaff.name;
        takenOrder.deliveredByStaffEmail = deliveryStaff.email;
      }
    }

    await takenOrder.save();

    return res.status(200).json({
      success: true,
      message: "Taken delivery order status updated successfully",
      takenOrder,
    });
  } catch (error) {
    console.log("updateTakenDeliveryOrderStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating taken delivery order status",
      error: error.message,
    });
  }
};

// DELETE TAKEN DELIVERY ORDER
export const deleteTakenDeliveryOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const deletedOrder = await TakenDeliveryOrder.findOneAndDelete({ orderId });

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Taken delivery order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Taken delivery order deleted successfully",
      takenOrder: deletedOrder,
    });
  } catch (error) {
    console.log("deleteTakenDeliveryOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting taken delivery order",
      error: error.message,
    });
  }
};

