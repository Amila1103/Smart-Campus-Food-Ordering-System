import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ComplaintSchema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

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

    orderId: {
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

    category: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    complaint: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
    },

    adminReply: {
      type: String,
      default: "",
      trim: true,
    },

    repliedAt: {
      type: Date,
      default: null,
    },

    replyNotificationRead: {
      type: Boolean,
      default: false,
    },

    replyNotificationText: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Complaint", ComplaintSchema);