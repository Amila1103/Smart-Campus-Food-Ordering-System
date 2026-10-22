import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";

import Customer from "./Model/Customer.js";
import Staff from "./Model/StaffModel.js";

import CustomerRoutes from "./Routes/CustomerRoutes.js";
import ContactUsRoutes from "./Routes/ContactUsRoutes.js";
import MenuRoutes from "./Routes/MenuRoutes.js";
import StaffRoutes from "./Routes/StaffRoutes.js";
import InvoiceRoutes from "./Routes/InvoiceRoutes.js";
import CartRoutes from "./Routes/CartRoutes.js";
import OrderRoutes from "./Routes/OrderRoutes.js";
import PaymentRoutes from "./Routes/PaymentRoutes.js";
import completedOrderRoutes from "./Routes/CompletedOrderRoutes.js";
import inventoryRoutes from "./Routes/InventoryRoutes.js";
import takenDeliveryOrderRoutes from "./Routes/TakenDeliveryOrderRoutes.js";
import deliveryFenishRoutes from "./Routes/DeliveryFenishRoutes.js";
import deliveryJobApplicationRoutes from "./Routes/DeliveryJobApplicationRoutes.js";
import ComplaintRoutes from "./Routes/ComplaintRoutes.js";
import orderRatingRoutes from "./Routes/OrderRatingRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/Customers", CustomerRoutes);
app.use("/ContactUs", ContactUsRoutes);
app.use("/menus", MenuRoutes);
app.use("/staffs", StaffRoutes);
app.use("/invoice", InvoiceRoutes);
app.use("/cart", CartRoutes);
app.use("/orders", OrderRoutes);
app.use("/payment", PaymentRoutes);
app.use("/completed-orders", completedOrderRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/taken-delivery-orders", takenDeliveryOrderRoutes);
app.use("/delivery-fenish", deliveryFenishRoutes);
app.use("/delivery-job-applications", deliveryJobApplicationRoutes);
app.use("/complaints", ComplaintRoutes);
app.use("/order-ratings", orderRatingRoutes);


mongoose
  .connect(
    "mongodb+srv://admin:jOPXCpJb3c4pfnUd@cluster0.s3gphlc.mongodb.net/Canteen"
  )
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(5000, () => {
      console.log("Server running on 5000");
    });
  })
  .catch((err) => console.log(err));

// ---------------- CUSTOMER AUTH ----------------

// REGISTER
app.post("/CustomerRegister", async (req, res) => {
  try {
    const {
      name,
      phoneNumber,
      address,
      gender,
      gmail,
      password,
      dietaryPreferences,
      allergies,
      otherAllergy,
      calorieGoal,
      notes,
    } = req.body;

    const existingCustomer = await Customer.findOne({
      gmail: gmail.toLowerCase().trim(),
    });

    if (existingCustomer) {
      return res.status(400).json({ message: "Customer already exists" });
    }

    const newCustomer = await Customer.create({
      name,
      phoneNumber,
      address,
      gender,
      gmail: gmail.toLowerCase().trim(),
      password,
      dietaryPreferences: dietaryPreferences || [],
      allergies: allergies || [],
      otherAllergy: otherAllergy || "",
      calorieGoal: calorieGoal || "",
      notes: notes || "",
    });

    res.status(200).json({
      status: "ok",
      customer: {
        _id: newCustomer._id,
        name: newCustomer.name,
        gmail: newCustomer.gmail,
        phoneNumber: newCustomer.phoneNumber,
        address: newCustomer.address,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "error", message: "Registration failed" });
  }
});

// LOGIN
app.post("/CustomerLogin", async (req, res) => {
  const { gmail, password } = req.body;

  try {
    const customer = await Customer.findOne({
      gmail: gmail.toLowerCase().trim(),
    });

    if (!customer) {
      return res.status(400).json({ message: "User not found" });
    }

    if (customer.password !== password) {
      return res.status(400).json({ message: "Wrong password" });
    }

    customer.isOnline = true;
    await customer.save();

    res.status(200).json({
      _id: customer._id,
      name: customer.name,
      email: customer.gmail,
      address: customer.address,
      phoneNumber: customer.phoneNumber,
      telNumber: customer.phoneNumber,
      dietaryPreferences: customer.dietaryPreferences,
      allergies: customer.allergies,
      otherAllergy: customer.otherAllergy,
      calorieGoal: customer.calorieGoal,
      notes: customer.notes,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- STAFF AUTH ----------------

// STAFF REGISTER
app.post("/StaffRegister", async (req, res) => {
  const { name, email, password, role, phone, vehicleType, experience } =
    req.body;

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRole = role.toLowerCase().trim();

    const existing = await Staff.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "Staff already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = await Staff.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      phone: phone || "",
      vehicleType: vehicleType || "",
      experience: experience || "",
    });

    res.status(200).json({
      message: "Staff registered successfully",
      staff: {
        id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message || "Server error",
    });
  }
});

// STAFF LOGIN
app.post("/StaffLogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const staff = await Staff.findOne({ email: normalizedEmail });

    if (!staff) {
      return res.status(400).json({ message: "Staff not found" });
    }

    const isMatch = await bcrypt.compare(password, staff.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    staff.isOnline = true;
    await staff.save();

    const token = jwt.sign(
      {
        id: staff._id,
        email: staff.email,
        role: staff.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      name: staff.name,
      email: staff.email,
      role: staff.role,
      id: staff._id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// STAFF LOGOUT
app.post("/StaffLogout/:id", async (req, res) => {
  try {
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      { isOnline: false },
      { new: true }
    );

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json({
      message: "Logged out successfully",
      staff: {
        id: updatedStaff._id,
        isOnline: updatedStaff.isOnline,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error logging out" });
  }
});