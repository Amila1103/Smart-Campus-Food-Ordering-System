import mongoose from "mongoose";

const Schema = mongoose.Schema;

const DeliveryJobApplicationSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    nic: {
      type: String,
      required: true,
      trim: true,
    },

    dob: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      required: true,
      trim: true,
    },

    vehicleType: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: String,
      required: true,
      trim: true,
    },

    availability: {
      type: String,
      required: true,
      trim: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    cv: {
      type: String,
      default: "",
      trim: true,
    },

    applicationSource: {
      type: String,
      enum: ["register-home", "unregister-home"],
      default: "unregister-home",
      trim: true,
    },

    applicationStatus: {
      type: String,
      enum: ["Pending", "Reviewed", "Accepted", "Rejected"],
      default: "Pending",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "DeliveryJobApplication",
  DeliveryJobApplicationSchema
);