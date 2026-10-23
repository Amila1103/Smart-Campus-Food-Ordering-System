import express from "express";
import PaymentControlers from "../Controlers/PaymentControlers.js";

const router = express.Router();

router.post("/", PaymentControlers.createPayment);
router.get("/", PaymentControlers.getAllPayments);
router.get("/order/:orderId", PaymentControlers.getPaymentByOrderId);
router.get("/payment-id/:paymentId", PaymentControlers.getPaymentByPaymentId);

export default router;