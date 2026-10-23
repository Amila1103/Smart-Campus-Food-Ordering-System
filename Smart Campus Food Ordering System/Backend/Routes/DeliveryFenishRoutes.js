import express from "express";
import {
  finishDeliveryOrder,
  getAllFinishedDeliveryOrders,
  getFinishedDeliveryOrderByOrderId,
  getMyFinishedDeliveryOrders,
  getFinishedDeliveryOrdersByCustomer,
} from "../Controlers/DeliveryFenishControlers.js";
import { verifyStaffToken, allowRoles } from "../Middleware/authMiddleware.js";

const router = express.Router();

// public route for customer profile history
router.get("/customer/:customerId/history", getFinishedDeliveryOrdersByCustomer);

router.post(
  "/finish/:orderId",
  verifyStaffToken,
  allowRoles("delivery", "delivery manager", "admin"),
  finishDeliveryOrder
);

router.get(
  "/",
  verifyStaffToken,
  allowRoles("delivery", "delivery manager", "admin"),
  getAllFinishedDeliveryOrders
);

router.get(
  "/my-orders",
  verifyStaffToken,
  allowRoles("delivery", "delivery manager", "admin"),
  getMyFinishedDeliveryOrders
);

router.get(
  "/:orderId",
  verifyStaffToken,
  allowRoles("delivery", "delivery manager", "admin"),
  getFinishedDeliveryOrderByOrderId
);

export default router;