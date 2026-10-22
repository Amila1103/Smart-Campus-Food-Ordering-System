import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Vegetables",
        "Meat",
        "Dairy",
        "Dry Goods",
        "Beverages",
        "Spices",
        "Packaging",
      ],
      default: "Vegetables",
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      enum: ["kg", "g", "L", "ml", "pcs", "packs", "bottles"],
      default: "kg",
    },
    reorderLevel: {
      type: Number,
      required: [true, "Reorder level is required"],
      min: [0, "Reorder level cannot be negative"],
      default: 5,
    },
    supplierName: {
      type: String,
      trim: true,
      default: "",
    },
    expiryDate: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    stockStatus: {
      type: String,
      enum: ["Available", "Low Stock", "Out of Stock"],
      default: "Available",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;