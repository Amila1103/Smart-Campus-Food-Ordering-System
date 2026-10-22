import { sendInvoiceEmail } from "../utils/sendInvoiceEmail.js";

const emailInvoice = async (req, res) => {
  try {
    const order = req.body;

    if (!order) {
      return res.status(400).json({ message: "Order data is required" });
    }

    await sendInvoiceEmail(order);

    return res.status(200).json({
      message: "Invoice email sent successfully",
    });
  } catch (err) {
    console.log("Invoice email error:", err);
    return res.status(500).json({
      message: "Failed to send invoice email",
      error: err.message,
    });
  }
};

export default {
  emailInvoice,
};