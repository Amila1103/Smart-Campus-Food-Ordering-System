import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CustomerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: Number, required: true },
    address: { type: String, required: true, trim: true },
    gender: { type: String, required: true, trim: true },
    gmail: { type: String, required: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    isOnline: { type: Boolean, default: false },

    dietaryPreferences: {
      type: [String],
      default: [],
    },

    allergies: {
      type: [String],
      default: [],
    },

    otherAllergy: {
      type: String,
      default: "",
      trim: true,
    },

    calorieGoal: {
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

export default mongoose.model("Customer", CustomerSchema);