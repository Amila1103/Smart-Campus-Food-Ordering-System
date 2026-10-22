import DeliveryFenish from "../Model/DeliveryFenishModel.js";
import TakenDeliveryOrder from "../Model/TakenDeliveryOrderModel.js";
import CompletedOrder from "../Model/CompletedOrderModel.js";
import Staff from "../Model/StaffModel.js";

// FINISH ORDER AND SAVE INTO DELIVERY FENISH COLLECTION
export const finishDeliveryOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

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

    const alreadyFinished = await DeliveryFenish.findOne({
      $or: [{ takenDeliveryOrderRef: takenOrder._id }, { orderId }],
    });

    if (alreadyFinished) {
      return res.status(400).json({
        success: false,
        message: "This order is already finished",
      });
    }

    const deliveryStaff = await Staff.findById(req.staff.id);

    if (!deliveryStaff) {
      return res.status(404).json({
        success: false,
        message: "Delivery staff not found",
      });
    }

    const now = new Date();

    const finishedOrder = new DeliveryFenish({
      takenDeliveryOrderRef: takenOrder._id,
      orderId: takenOrder.orderId,
      customerId: takenOrder.customerId,
      customerName: takenOrder.customerName,
      gmail: takenOrder.gmail,
      phoneNumber: takenOrder.phoneNumber,
      vendorId: takenOrder.vendorId || null,
      vendorName: takenOrder.vendorName || "",
      customer: takenOrder.customer || {},
      address: takenOrder.address,
      orderType: takenOrder.orderType,
      deliveryLocation: takenOrder.deliveryLocation,
      selectedDeliveryLocation: takenOrder.selectedDeliveryLocation,
      customLocation: takenOrder.customLocation,
      landmark: takenOrder.landmark,
      googleMapsLink: takenOrder.googleMapsLink,
      items: takenOrder.items || [],
      totalAmount: takenOrder.totalAmount,
      deliveryFee: takenOrder.deliveryFee,
      discount: takenOrder.discount,
      grandTotal: takenOrder.grandTotal,
      paymentMethod: takenOrder.paymentMethod,
      paymentStatus: takenOrder.paymentStatus,
      notes: takenOrder.notes,
      deliveryNotes: takenOrder.deliveryNotes,

      takenByStaffId: takenOrder.takenByStaffId,
      takenByStaffName: takenOrder.takenByStaffName,
      takenByStaffEmail: takenOrder.takenByStaffEmail,

      deliveredByStaffId: deliveryStaff._id,
      deliveredByStaffName: deliveryStaff.name,
      deliveredByStaffEmail: deliveryStaff.email,

      takenAt: takenOrder.takenAt,
      pickedUpAt: takenOrder.pickedUpAt,
      outForDeliveryAt: takenOrder.outForDeliveryAt,
      deliveredAt: now,
      finishedAt: now,

      finalDeliveryStatus: "Finished",
      isActive: false,
    });

    await finishedOrder.save();

    await CompletedOrder.findOneAndDelete({ orderId });
    await TakenDeliveryOrder.findOneAndDelete({ orderId });

    return res.status(201).json({
      success: true,
      message:
        "Order finished successfully and removed from completed orders and taken orders",
      finishedOrder,
    });
  } catch (error) {
    console.log("finishDeliveryOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while finishing delivery order",
      error: error.message,
    });
  }
};

export const getAllFinishedDeliveryOrders = async (req, res) => {
  try {
    const finishedOrders = await DeliveryFenish.find().sort({ finishedAt: -1 });

    return res.status(200).json({
      success: true,
      count: finishedOrders.length,
      finishedOrders,
    });
  } catch (error) {
    console.log("getAllFinishedDeliveryOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching finished delivery orders",
      error: error.message,
    });
  }
};

export const getFinishedDeliveryOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    const finishedOrders = await DeliveryFenish.find({
      customerId: String(customerId),
      finalDeliveryStatus: "Finished",
    }).sort({ finishedAt: -1, deliveredAt: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: finishedOrders.length,
      finishedOrders,
    });
  } catch (error) {
    console.log("getFinishedDeliveryOrdersByCustomer error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching customer finished delivery orders",
      error: error.message,
    });
  }
};

export const getFinishedDeliveryOrderByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    const finishedOrder = await DeliveryFenish.findOne({ orderId });

    if (!finishedOrder) {
      return res.status(404).json({
        success: false,
        message: "Finished delivery order not found",
      });
    }

    return res.status(200).json({
      success: true,
      finishedOrder,
    });
  } catch (error) {
    console.log("getFinishedDeliveryOrderByOrderId error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching finished delivery order",
      error: error.message,
    });
  }
};

export const getMyFinishedDeliveryOrders = async (req, res) => {
  try {
    if (!req.staff || !req.staff.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const myFinishedOrders = await DeliveryFenish.find({
      deliveredByStaffId: req.staff.id,
    }).sort({ finishedAt: -1 });

    return res.status(200).json({
      success: true,
      count: myFinishedOrders.length,
      finishedOrders: myFinishedOrders,
    });
  } catch (error) {
    console.log("getMyFinishedDeliveryOrders error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching my finished delivery orders",
      error: error.message,
    });
  }
};