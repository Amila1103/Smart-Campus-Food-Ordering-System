import express from "express";
import OrderControlers from "../Controlers/OrderControlers.js";

const router = express.Router();

router.post("/", OrderControlers.createOrder);
router.get("/", OrderControlers.getAllOrders);
router.get("/:orderId", OrderControlers.getOrderByOrderId);
router.put("/:orderId/status", OrderControlers.updateOrderStatus);

export default router;