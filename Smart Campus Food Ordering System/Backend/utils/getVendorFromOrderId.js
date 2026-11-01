import CompletedOrder from "../Model/CompletedOrderModel.js";
import DeliveryFenish from "../Model/DeliveryFenishModel.js";

export const getVendorFromOrderId = async (orderId) => {
  try {
    if (!orderId) {
      return { vendorId: null, vendorName: "" };
    }

    const completedOrder = await CompletedOrder.findOne({ orderId });
    if (completedOrder?.vendorId || completedOrder?.vendorName) {
      return {
        vendorId: completedOrder.vendorId || null,
        vendorName: completedOrder.vendorName || "",
      };
    }

    const finishedDelivery = await DeliveryFenish.findOne({ orderId });
    if (finishedDelivery?.vendorId || finishedDelivery?.vendorName) {
      return {
        vendorId: finishedDelivery.vendorId || null,
        vendorName: finishedDelivery.vendorName || "",
      };
    }

    return { vendorId: null, vendorName: "" };
  } catch (error) {
    console.log("getVendorFromOrderId error:", error.message);
    return { vendorId: null, vendorName: "" };
  }
};