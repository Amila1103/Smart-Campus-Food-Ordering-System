import mongoose from "mongoose";

const OrderRatingSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    customerId: {
      type: String,
      required: true,
      trim: true,
      index: true,
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

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    sourceTable: {
      type: String,
      default: "",
      trim: true,
      enum: ["Order", "CompletedOrder", "DeliveryFenish", ""],
    },
  },
  { timestamps: true }
);

OrderRatingSchema.index({ orderId: 1, customerId: 1 }, { unique: true });

const OrderRating = mongoose.model("OrderRating", OrderRatingSchema);

export default OrderRating;