import mongoose from "mongoose";

const Schema = mongoose.Schema;

const StaffSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
            value
          );
        },
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
      },
    },

    role: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: [
        "admin",
        "vendor",
        "delivery",
        "customer manager",
        "delivery manager",
      ],
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    vehicleType: {
      type: String,
      default: "",
      trim: true,
    },

    experience: {
      type: String,
      default: "",
      trim: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Staff", StaffSchema);