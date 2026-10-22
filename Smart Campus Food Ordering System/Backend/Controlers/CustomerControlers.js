import Customer from "../Model/Customer.js";

// GET ALL CUSTOMERS
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json({ Customers: customers });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET CUSTOMER BY ID
const getByid = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ Customers: customer });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Fetch error" });
  }
};

// GENERAL UPDATE
const UpdateCustomers = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "phoneNumber",
      "address",
      "gender",
      "gmail",
      "password",
      "isOnline",
      "dietaryPreferences",
      "allergies",
      "otherAllergy",
      "calorieGoal",
      "notes",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Update failed" });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      Customers: customer,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Update error" });
  }
};

// UPDATE ONLY DIETARY DETAILS
const updateDietaryPreferences = async (req, res) => {
  try {
    const {
      dietaryPreferences,
      allergies,
      otherAllergy,
      calorieGoal,
      notes,
    } = req.body;

    const updateData = {
      dietaryPreferences: Array.isArray(dietaryPreferences)
        ? dietaryPreferences
        : [],
      allergies: Array.isArray(allergies) ? allergies : [],
      otherAllergy: otherAllergy || "",
      calorieGoal: calorieGoal || "",
      notes: notes || "",
    };

    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Dietary preferences updated successfully",
      Customers: customer,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Dietary update error" });
  }
};

// DELETE CUSTOMER
const deleteCustomers = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: "Delete failed" });
    }

    res.status(200).json({
      message: "Customer deleted successfully",
      Customers: customer,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Delete error" });
  }
};

export default {
  getAllCustomers,
  getByid,
  UpdateCustomers,
  updateDietaryPreferences,
  deleteCustomers,
};