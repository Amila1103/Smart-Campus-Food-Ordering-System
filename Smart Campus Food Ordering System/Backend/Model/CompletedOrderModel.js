import mongoose from "mongoose";

const CompletedOrderItemSchema = new mongoose.Schema(
  {
    itemId: { type: String, default: "" },
    name: { type: String, required: true },
    qty: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    portionSize: { type: String, default: "" },
    category: { type: String, default: "" },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { _id: false }
);

const CompletedOrderSchema = new mongoose.Schema(
  {
    orderRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },

    orderId: { type: String, required: true, unique: true },
    customerId: { type: String, default: "" },
    customerName: { type: String, default: "" },
    gmail: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
      index: true,
    },

    vendorName: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    customer: {
      type: Object,
      default: {},
    },

    address: { type: String, default: "" },

    orderType: { type: String, default: "" },
    deliveryLocation: { type: String, default: "" },
    selectedDeliveryLocation: { type: String, default: "" },
    customLocation: { type: String, default: "" },
    landmark: { type: String, default: "" },
    googleMapsLink: { type: String, default: "" },

    items: {
      type: [CompletedOrderItemSchema],
      default: [],
    },

    totalAmount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },

    paymentMethod: { type: String, default: "" },
    paymentStatus: { type: String, default: "" },
    orderStatus: { type: String, default: "Completed" },
    notes: { type: String, default: "" },

    originalCreatedAt: { type: Date, default: null },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const CompletedOrder = mongoose.model("CompletedOrder", CompletedOrderSchema);

export default CompletedOrder;