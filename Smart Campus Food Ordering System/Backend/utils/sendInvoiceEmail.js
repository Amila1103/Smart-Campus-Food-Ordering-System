import nodemailer from "nodemailer";

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const safeText = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not Available";
  }
  return String(value);
};

export const sendInvoiceEmail = async (order) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const items = order?.items || [];

  const customerName =
    order?.customerName || order?.customer?.name || "Customer";

  const customerEmail =
    order?.gmail ||
    order?.email ||
    order?.customer?.gmail ||
    order?.customer?.email ||
    "";

  if (!customerEmail) {
    throw new Error("Customer email not found");
  }

  const orderId = order?.orderId || "N/A";
  const invoiceNo = order?.invoiceNo || `CC-${Date.now().toString().slice(-6)}`;
  const invoiceDate = order?.invoiceDate || new Date().toLocaleString();

  const itemsTotal =
    Number(order?.totalAmount || 0) ||
    items.reduce(
      (sum, item) =>
        sum +
        (Number(item?.subtotal || 0) ||
          Number(item?.unitPrice || item?.price || 0) * Number(item?.qty || 1)),
      0
    );

  const deliveryFee = Number(order?.deliveryFee || 0);
  const discount = Number(order?.discount || 0);
  const grandTotal = Number(
    order?.grandTotal || itemsTotal + deliveryFee - discount
  );

  const itemsRows = items
    .map((item, index) => {
      const qty = Number(item?.qty || 1);
      const unitPrice = Number(item?.unitPrice || item?.price || 0);
      const subtotal = Number(item?.subtotal || unitPrice * qty);

      return `
        <tr>
          <td style="padding:10px; border:1px solid #e0e0e0;">${index + 1}</td>
          <td style="padding:10px; border:1px solid #e0e0e0;">${safeText(
            item?.name
          )}</td>
          <td style="padding:10px; border:1px solid #e0e0e0;">${safeText(
            item?.portionSize || "Regular"
          )}</td>
          <td style="padding:10px; border:1px solid #e0e0e0;">${qty}</td>
          <td style="padding:10px; border:1px solid #e0e0e0;">${formatCurrency(
            unitPrice
          )}</td>
          <td style="padding:10px; border:1px solid #e0e0e0;">${formatCurrency(
            subtotal
          )}</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; background:#f5f5f5; padding:24px; color:#222222;">
      <div style="max-width:800px; margin:0 auto; background:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #e8e8e8;">
        
        <div style="background:#2E7D32; color:#ffffff; padding:28px 24px;">
          <h1 style="margin:0; font-size:28px;">Campus Canteen</h1>
          <p style="margin:8px 0 0;">Payment Invoice</p>
        </div>

        <div style="padding:24px;">
          <p style="margin-top:0;">Hello ${safeText(customerName)},</p>
          <p>Thank you for your order. Your invoice details are below.</p>

          <div style="background:#f5f5f5; border-radius:14px; padding:16px; margin:20px 0;">
            <p><strong>Invoice No:</strong> ${safeText(invoiceNo)}</p>
            <p><strong>Invoice Date:</strong> ${safeText(invoiceDate)}</p>
            <p><strong>Order ID:</strong> ${safeText(orderId)}</p>
            <p><strong>Payment Method:</strong> ${safeText(
              order?.paymentMethod
            )}</p>
            <p><strong>Payment Status:</strong> ${safeText(
              order?.paymentStatus
            )}</p>
          </div>

          <h3 style="margin-bottom:12px;">Customer Details</h3>
          <div style="background:#ffffff; border:1px solid #e8e8e8; border-radius:14px; padding:16px; margin-bottom:22px;">
            <p><strong>Name:</strong> ${safeText(customerName)}</p>
            <p><strong>Email:</strong> ${safeText(customerEmail)}</p>
            <p><strong>Phone:</strong> ${safeText(
              order?.phoneNumber || order?.customer?.phoneNumber
            )}</p>
            <p><strong>Address:</strong> ${safeText(
              order?.address || order?.customer?.address
            )}</p>
            <p><strong>Delivery Location:</strong> ${safeText(
              order?.deliveryLocation || order?.selectedDeliveryLocation
            )}</p>
          </div>

          <h3 style="margin-bottom:12px;">Ordered Items</h3>
          <table style="width:100%; border-collapse:collapse; margin-bottom:22px;">
            <thead>
              <tr style="background:#f5f5f5;">
                <th style="padding:10px; border:1px solid #e0e0e0;">#</th>
                <th style="padding:10px; border:1px solid #e0e0e0;">Item</th>
                <th style="padding:10px; border:1px solid #e0e0e0;">Size</th>
                <th style="padding:10px; border:1px solid #e0e0e0;">Qty</th>
                <th style="padding:10px; border:1px solid #e0e0e0;">Unit Price</th>
                <th style="padding:10px; border:1px solid #e0e0e0;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div style="background:#fffaf2; border:1px solid #ffe0b2; border-radius:14px; padding:16px;">
            <p><strong>Items Total:</strong> ${formatCurrency(itemsTotal)}</p>
            <p><strong>Delivery Fee:</strong> ${formatCurrency(deliveryFee)}</p>
            <p><strong>Discount:</strong> ${formatCurrency(discount)}</p>
            <p style="font-size:18px; color:#FF9800;"><strong>Grand Total:</strong> ${formatCurrency(
              grandTotal
            )}</p>
          </div>

          <p style="margin-top:24px;">Thank you for choosing Campus Canteen.</p>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Campus Canteen" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: `Campus Canteen Invoice - ${invoiceNo}`,
    html,
  });
};