import mongoose from "mongoose";

const Schema = mongoose.Schema;

const CartItemSchema = new Schema(
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
    portionSize: {
      type: String,
      default: "Regular",
      trim: true,
    },
    availabilityStatus: {
      type: String,
      default: "Available",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    qty: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const CartSchema = new Schema(
  {
    customerId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
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
    items: {
      type: [CartItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Cart", CartSchema);