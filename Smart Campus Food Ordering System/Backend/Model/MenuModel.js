import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MenuSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["Foods", "Drinks", "Snacks", "Desserts"],
      trim: true,
    },

    portionSize: {
      type: String,
      enum: ["Half", "Full", "Regular", "Large"],
      default: "Regular",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
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

    stockQty: {
      type: Number,
      default: 0,
      min: 0,
    },

    limitedThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },

    availabilityStatus: {
      type: String,
      enum: ["Available", "Limited", "Sold Out"],
      default: "Available",
    },

    availableOrderTypes: {
      type: [String],
      enum: ["Takeaway", "Delivery", "Dine-In"],
      default: ["Takeaway"],
    },

    labels: {
      type: [String],
      enum: [
        "Vegan",
        "Vegetarian",
        "Low Sugar",
        "Low Calorie",
        "High Protein",
        "No Dairy",
        "No Nuts",
        "Spicy",
      ],
      default: [],
    },

    allergens: {
      type: [String],
      enum: [
        "Milk",
        "Egg",
        "Fish",
        "Shellfish",
        "Peanuts",
        "Tree Nuts",
        "Soy",
        "Wheat",
        "Gluten",
      ],
      default: [],
    },

    calories: {
      type: Number,
      default: 0,
      min: 0,
    },

    nutrients: {
      type: [String],
      default: [],
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Menu", MenuSchema);