import mongoose from "mongoose";

const Schema = mongoose.Schema;

const OrderItemSchema = new Schema(
  {
    itemId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    qty: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    portionSize: {
      type: String,
      default: "Regular",
      trim: true,
    },
    unitPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerId: {
      type: String,
      required: true,
      trim: true,
    },
    customerName: {
      type: String,
      default: "",
      trim: true,
    },
    gmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      default: "",
      trim: true,
    },
    customer: {
      type: Object,
      default: {},
    },
    address: {
      type: String,
      default: "",
      trim: true,
    },
    orderType: {
      type: String,
      default: "Delivery",
      trim: true,
    },
    deliveryLocation: {
      type: String,
      default: "",
      trim: true,
    },
    selectedDeliveryLocation: {
      type: String,
      default: "",
      trim: true,
    },
    customLocation: {
      type: String,
      default: "",
      trim: true,
    },
    landmark: {
      type: String,
      default: "",
      trim: true,
    },
    googleMapsLink: {
      type: String,
      default: "",
      trim: true,
    },
    items: {
      type: [OrderItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMethod: {
      type: String,
      default: "Cash on Delivery",
      trim: true,
    },
    paymentStatus: {
      type: String,
      default: "Pending",
      trim: true,
    },
    orderStatus: {
      type: String,
      default: "Pending",
      trim: true,
    },
    paymentDetails: {
      type: Object,
      default: {},
    },
    paidAt: {
      type: Date,
      default: null,
    },
    invoiceNo: {
      type: String,
      default: "",
      trim: true,
    },
    invoiceDate: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);