import { jsPDF } from "jspdf";

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`;

const safeText = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not Available";
  }
  return String(value);
};

const loadImageAsDataURL = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = (error) => reject(error);
    img.src = url;
  });

export const downloadInvoicePdf = async (order) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginLeft = 14;
  const labelX = 20;
  const valueX = 92;
  const rightX = pageWidth - 14;

  let y = 12;

  const items = order?.items || [];
  const firstItem = items[0] || {};

  const invoiceNo = order?.invoiceNo || `CC-${Date.now().toString().slice(-6)}`;
  const invoiceDate = order?.invoiceDate || new Date().toLocaleString();
  const orderId = order?.orderId || "N/A";

  const foodName = firstItem?.name || "Not Available";
  const foodSize = firstItem?.portionSize || "Regular";
  const quantity = Number(firstItem?.qty || 1);

  const orderType = order?.orderType || "Delivery";
  const paymentMethod = order?.paymentMethod || "Cash";

  const customerName =
    order?.customerName || order?.customer?.name || "Not Available";

  const customerEmail =
    order?.gmail ||
    order?.email ||
    order?.customer?.gmail ||
    order?.customer?.email ||
    "Not Available";

  const customerPhone =
    order?.phoneNumber || order?.customer?.phoneNumber || "Not Available";

  const deliveryLocation =
    order?.deliveryLocation ||
    order?.selectedDeliveryLocation ||
    "Not Available";

  const address =
    order?.address || order?.customer?.address || "Not Available";

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
  const grandTotal = Number(order?.grandTotal || itemsTotal + deliveryFee);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  let logoData = null;

  try {
    logoData = await loadImageAsDataURL("/campus-logo.png");
  } catch (error) {
    console.log("Logo load failed:", error);
  }

  // Watermark logo
  if (logoData) {
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 0.08 }));
    doc.addImage(
      logoData,
      "PNG",
      pageWidth / 2 - 55,
      pageHeight / 2 - 45,
      110,
      90
    );
    doc.restoreGraphicsState();
  }

  // Header logo - larger than before
  if (logoData) {
    doc.addImage(logoData, "PNG", 12, 10, 34, 26);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Campus Canteen", pageWidth / 2, y + 4, { align: "center" });

  doc.setFontSize(10.5);
  doc.text("SLIIT Kandy Uni, Balagolla, Kandy", pageWidth / 2, y + 11, {
    align: "center",
  });
  doc.text("Tel: 081 2345658", pageWidth / 2, y + 17, {
    align: "center",
  });

  doc.setFontSize(17);
  doc.text("PAYMENT INVOICE", pageWidth / 2, y + 28, {
    align: "center",
  });

  y = 44;

  doc.setFontSize(12);
  doc.text(`Invoice No: ${invoiceNo}`, marginLeft, y);
  doc.text(`Date: ${invoiceDate}`, rightX, y, { align: "right" });

  y += 4;
  doc.line(marginLeft, y + 2, pageWidth - marginLeft, y + 2);

  y += 12;
  doc.setFontSize(13);
  doc.text("Order Details", marginLeft, y);

  y += 12;
  doc.setFontSize(11.5);

  doc.text("Order ID", labelX, y);
  doc.text(safeText(orderId), valueX, y);

  y += 10;
  doc.text("Food", labelX, y);
  doc.text(safeText(foodName), valueX, y);

  y += 10;
  doc.text("Size", labelX, y);
  doc.text(safeText(foodSize), valueX, y);

  y += 10;
  doc.text("Quantity", labelX, y);
  doc.text(String(quantity), valueX, y);

  y += 10;
  doc.text("Order Type", labelX, y);
  doc.text(safeText(orderType), valueX, y);

  y += 10;
  doc.text("Payment Method", labelX, y);
  doc.text(safeText(paymentMethod), valueX, y);

  y += 12;
  doc.line(marginLeft, y, pageWidth - marginLeft, y);

  y += 14;
  doc.setFontSize(13);
  doc.text("Payment Summary", marginLeft, y);

  y += 12;
  doc.setFontSize(11.5);

  doc.text("Food Total", labelX, y);
  doc.text(formatCurrency(itemsTotal), valueX, y);

  y += 10;
  doc.text("Delivery Charge", labelX, y);
  doc.text(formatCurrency(deliveryFee), valueX, y);

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Grand Total", labelX, y);
  doc.text(formatCurrency(grandTotal), valueX, y);

  y += 14;
  doc.line(marginLeft, y, pageWidth - marginLeft, y);

  y += 14;
  doc.setFontSize(13);
  doc.text("Customer Details", marginLeft, y);

  y += 12;
  doc.setFontSize(11.5);
  doc.setFont("helvetica", "normal");

  doc.text("Name", labelX, y);
  doc.text(safeText(customerName), valueX, y);

  y += 10;
  doc.text("Email", labelX, y);
  doc.text(safeText(customerEmail), valueX, y);

  y += 10;
  doc.text("Phone", labelX, y);
  doc.text(safeText(customerPhone), valueX, y);

  y += 10;
  doc.text("Delivery Location", labelX, y);
  doc.text(safeText(deliveryLocation), valueX, y);

  y += 10;
  doc.text("Address", labelX, y);
  const addressLines = doc.splitTextToSize(safeText(address), 90);
  doc.text(addressLines, valueX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    "Thank you for choosing Campus Canteen — We appreciate your business.",
    pageWidth / 2,
    pageHeight - 12,
    { align: "center" }
  );

  doc.save(`Campus-Canteen-Invoice-${orderId}.pdf`);
};