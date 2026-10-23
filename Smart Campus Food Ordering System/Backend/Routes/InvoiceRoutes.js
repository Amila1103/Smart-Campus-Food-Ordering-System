import express from "express";
import InvoiceController from "../Controlers/InvoiceController.js";

const router = express.Router();

router.post("/send-email", InvoiceController.emailInvoice);

export default router;