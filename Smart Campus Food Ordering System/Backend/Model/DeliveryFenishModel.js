import mongoose from "mongoose";

const DeliveryFenishItemSchema = new mongoose.Schema(
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

const DeliveryFenishSchema = new mongoose.Schema(
  {
    takenDeliveryOrderRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TakenDeliveryOrder",
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
      type: [DeliveryFenishItemSchema],
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

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    deliveryNotes: {
      type: String,
      default: "",
      trim: true,
    },

    takenByStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
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

    takenAt: {
      type: Date,
      default: null,
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
      default: Date.now,
    },

    finishedAt: {
      type: Date,
      default: Date.now,
    },

    finalDeliveryStatus: {
      type: String,
      default: "Finished",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const DeliveryFenish = mongoose.model("DeliveryFenish", DeliveryFenishSchema);

export default DeliveryFenish;