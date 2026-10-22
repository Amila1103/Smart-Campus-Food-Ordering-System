import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    orderId: {
      type: String,
      required: true,
      trim: true,
    },

    customerId: {
      type: String,
      default: "",
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

    paymentMethod: {
      type: String,
      required: true,
      trim: true,
    },

    paymentStatus: {
      type: String,
      default: "Pending",
      trim: true,
    },

    orderStatus: {
      type: String,
      default: "Confirmed",
      trim: true,
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
  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentSchema);