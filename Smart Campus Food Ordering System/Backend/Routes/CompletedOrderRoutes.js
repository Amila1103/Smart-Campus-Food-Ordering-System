import express from "express";
import {
  createCompletedOrder,
  getAllCompletedOrders,
  getCompletedOrderByOrderId,
  markCompletedOrderAsFinished,
  getFinishedCompletedOrdersByCustomer,
} from "../Controlers/CompletedOrderControlers.js";

const router = express.Router();

router.post("/", createCompletedOrder);
router.get("/", getAllCompletedOrders);

// IMPORTANT: specific route first
router.get("/customer/:customerId/history", getFinishedCompletedOrdersByCustomer);

router.get("/:orderId", getCompletedOrderByOrderId);
router.put("/:orderId/finish", markCompletedOrderAsFinished);

export default router;