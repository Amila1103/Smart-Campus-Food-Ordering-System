import express from "express";
import {
  takeDeliveryOrder,
  getAllTakenDeliveryOrders,
  getTakenDeliveryOrderByOrderId,
  getMyTakenDeliveryOrders,
  updateTakenDeliveryOrderStatus,
  deleteTakenDeliveryOrder,
} from "../Controlers/TakenDeliveryOrderControlers.js";
import { verifyStaffToken, allowRoles } from "../Middleware/authMiddleware.js";

const router = express.Router();

// delivery / delivery manager / admin
router.post(
  "/take/:orderId",
  verifyStaffToken,
  allowRoles("delivery", "delivery manager", "admin"),
  takeDeliveryOrder
);

router.get(
  "/",
  verifyStaffToken,
  allowRoles("delivery", "delivery manager", "admin"),
  getAllTakenDeliveryOrders
);

router.get(
  "/my-orders",
  verifyStaffToken,
  allowRoles("delivery", "delivery manager", "admin"),
  getMyTakenDeliveryOrders
);

router.get(
  "/:orderId",
  verifyStaffToken,
  allowRoles("delivery", "delivery manager", "admin"),
  getTakenDeliveryOrderByOrderId
);

router.put(
  "/:orderId/status",
  verifyStaffToken,
  allowRoles("delivery", "delivery manager", "admin"),
  updateTakenDeliveryOrderStatus
);

router.delete(
  "/:orderId",
  verifyStaffToken,
  allowRoles("delivery", "delivery manager", "admin"),
  deleteTakenDeliveryOrder
);

export default router;