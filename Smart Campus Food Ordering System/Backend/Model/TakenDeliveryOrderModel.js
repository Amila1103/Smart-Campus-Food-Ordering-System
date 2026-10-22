import mongoose from "mongoose";

const TakenDeliveryOrderItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      default: "",
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    qty: {
      type: Number,
      default: 1,
      min: 0,
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

    portionSize: {
      type: String,
      default: "",
      trim: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
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

const TakenDeliveryOrderSchema = new mongoose.Schema(
  {
    completedOrderRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompletedOrder",
      required: true,
      unique: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
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
      default: "",
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
      type: [TakenDeliveryOrderItemSchema],
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
      default: "",
      trim: true,
    },

    paymentStatus: {
      type: String,
      default: "",
      trim: true,
    },

    orderStatusSnapshot: {
      type: String,
      default: "Completed",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    originalCreatedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // order eka take karapu delivery person
    takenByStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },

    takenByStaffName: {
      type: String,
      default: "",
      trim: true,
    },

    takenByStaffEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    takenAt: {
      type: Date,
      default: Date.now,
    },

    // delivery progress status
    deliveryStatus: {
      type: String,
      default: "Taken",
      enum: [
        "Taken",
        "Picked Up",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      trim: true,
    },

    pickedUpAt: {
      type: Date,
      default: null,
    },

    outForDeliveryAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    deliveryNotes: {
      type: String,
      default: "",
      trim: true,
    },

    // actual delivery karapu delivery person
    deliveredByStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },

    deliveredByStaffName: {
      type: String,
      default: "",
      trim: true,
    },

    deliveredByStaffEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const TakenDeliveryOrder = mongoose.model(
  "TakenDeliveryOrder",
  TakenDeliveryOrderSchema
);

export default TakenDeliveryOrder;