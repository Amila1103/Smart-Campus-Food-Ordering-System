import Staff from "../Model/StaffModel.js";
import bcrypt from "bcryptjs";

// GET ALL STAFFS (ADMIN)
export const getAllStaffs = async (req, res) => {
  try {
    const staffs = await Staff.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ staffs });
  } catch (err) {
    console.log("getAllStaffs error:", err);
    return res.status(500).json({ message: "Error fetching staffs" });
  }
};

// GET STAFF BY ID (ADMIN)
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select("-password");

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    return res.status(200).json({ staff });
  } catch (err) {
    console.log("getStaffById error:", err);
    return res.status(500).json({ message: "Error fetching staff" });
  }
};

// ADD STAFF (ADMIN)
export const addStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone, vehicleType, experience } =
      req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRole = role.toLowerCase().trim();

    const existingStaff = await Staff.findOne({ email: normalizedEmail });
    if (existingStaff) {
      return res.status(400).json({ message: "Staff already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = new Staff({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      phone: phone?.trim() || "",
      vehicleType: vehicleType?.trim() || "",
      experience: experience?.trim() || "",
    });

    await newStaff.save();

    return res.status(201).json({
      message: "Staff added successfully",
      staff: {
        _id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        phone: newStaff.phone,
        vehicleType: newStaff.vehicleType,
        experience: newStaff.experience,
        isOnline: newStaff.isOnline,
        createdAt: newStaff.createdAt,
        updatedAt: newStaff.updatedAt,
      },
    });
  } catch (err) {
    console.log("addStaff error:", err);
    return res.status(500).json({
      message: err.message || "Error adding staff",
    });
  }
};

// UPDATE STAFF (ADMIN)
export const updateStaff = async (req, res) => {
  try {
    const id = req.params.id;
    const staff = await Staff.findById(id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const {
      name,
      email,
      password,
      role,
      isOnline,
      phone,
      vehicleType,
      experience,
    } = req.body;

    if (name !== undefined) {
      staff.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();

      const existingEmail = await Staff.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      staff.email = normalizedEmail;
    }

    if (role !== undefined) {
      staff.role = role.toLowerCase().trim();
    }

    if (phone !== undefined) {
      staff.phone = phone.trim();
    }

    if (vehicleType !== undefined) {
      staff.vehicleType = vehicleType.trim();
    }

    if (experience !== undefined) {
      staff.experience = experience.trim();
    }

    if (isOnline !== undefined) {
      staff.isOnline = isOnline;
    }

    if (password !== undefined && password.trim() !== "") {
      staff.password = await bcrypt.hash(password, 10);
    }

    await staff.save();

    return res.status(200).json({
      message: "Staff updated successfully",
      staff: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        phone: staff.phone,
        vehicleType: staff.vehicleType,
        experience: staff.experience,
        isOnline: staff.isOnline,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
      },
    });
  } catch (err) {
    console.log("updateStaff error:", err);
    return res.status(500).json({
      message: err.message || "Error updating staff",
    });
  }
};

// DELETE STAFF (ADMIN)
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    return res.status(200).json({
      message: "Staff deleted successfully",
      staff: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (err) {
    console.log("deleteStaff error:", err);
    return res.status(500).json({ message: "Error deleting staff" });
  }
};

// ---------------- DELIVERY MANAGER ONLY: DELIVERY STAFF MANAGEMENT ----------------

// GET ONLY DELIVERY STAFFS
export const getDeliveryStaffs = async (req, res) => {
  try {
    const staffs = await Staff.find({ role: "delivery" })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({ staffs });
  } catch (err) {
    console.log("getDeliveryStaffs error:", err);
    return res.status(500).json({ message: "Error fetching delivery staffs" });
  }
};

// GET SINGLE DELIVERY STAFF
export const getDeliveryStaffById = async (req, res) => {
  try {
    const staff = await Staff.findOne({
      _id: req.params.id,
      role: "delivery",
    }).select("-password");

    if (!staff) {
      return res.status(404).json({ message: "Delivery staff not found" });
    }

    return res.status(200).json({ staff });
  } catch (err) {
    console.log("getDeliveryStaffById error:", err);
    return res.status(500).json({ message: "Error fetching delivery staff" });
  }
};

// ADD DELIVERY STAFF
export const addDeliveryStaff = async (req, res) => {
  try {
    const { name, email, password, phone, vehicleType, experience } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingStaff = await Staff.findOne({ email: normalizedEmail });
    if (existingStaff) {
      return res.status(400).json({ message: "Staff already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = new Staff({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "delivery",
      phone: phone?.trim() || "",
      vehicleType: vehicleType?.trim() || "",
      experience: experience?.trim() || "",
    });

    await newStaff.save();

    return res.status(201).json({
      message: "Delivery staff added successfully",
      staff: {
        _id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        phone: newStaff.phone,
        vehicleType: newStaff.vehicleType,
        experience: newStaff.experience,
        isOnline: newStaff.isOnline,
        createdAt: newStaff.createdAt,
        updatedAt: newStaff.updatedAt,
      },
    });
  } catch (err) {
    console.log("addDeliveryStaff error:", err);
    return res.status(500).json({
      message: err.message || "Error adding delivery staff",
    });
  }
};

// UPDATE DELIVERY STAFF ONLY
export const updateDeliveryStaff = async (req, res) => {
  try {
    const id = req.params.id;
    const staff = await Staff.findOne({ _id: id, role: "delivery" });

    if (!staff) {
      return res.status(404).json({ message: "Delivery staff not found" });
    }

    const { name, email, password, isOnline, phone, vehicleType, experience } =
      req.body;

    if (name !== undefined) {
      staff.name = name.trim();
    }

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();

      const existingEmail = await Staff.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      staff.email = normalizedEmail;
    }

    if (phone !== undefined) {
      staff.phone = phone.trim();
    }

    if (vehicleType !== undefined) {
      staff.vehicleType = vehicleType.trim();
    }

    if (experience !== undefined) {
      staff.experience = experience.trim();
    }

    if (isOnline !== undefined) {
      staff.isOnline = isOnline;
    }

    // delivery manager cannot change role here
    staff.role = "delivery";

    if (password !== undefined && password.trim() !== "") {
      staff.password = await bcrypt.hash(password, 10);
    }

    await staff.save();

    return res.status(200).json({
      message: "Delivery staff updated successfully",
      staff: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        phone: staff.phone,
        vehicleType: staff.vehicleType,
        experience: staff.experience,
        isOnline: staff.isOnline,
        createdAt: staff.createdAt,
        updatedAt: staff.updatedAt,
      },
    });
  } catch (err) {
    console.log("updateDeliveryStaff error:", err);
    return res.status(500).json({
      message: err.message || "Error updating delivery staff",
    });
  }
};

// DELETE DELIVERY STAFF ONLY
export const deleteDeliveryStaff = async (req, res) => {
  try {
    const staff = await Staff.findOneAndDelete({
      _id: req.params.id,
      role: "delivery",
    });

    if (!staff) {
      return res.status(404).json({ message: "Delivery staff not found" });
    }

    return res.status(200).json({
      message: "Delivery staff deleted successfully",
      staff: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
      },
    });
  } catch (err) {
    console.log("deleteDeliveryStaff error:", err);
    return res.status(500).json({ message: "Error deleting delivery staff" });
  }
};

// GET LOGGED-IN STAFF PROFILE
export const getMyProfile = async (req, res) => {
  try {
    if (!req.staff || !req.staff.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const staff = await Staff.findById(req.staff.id).select("-password");

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    return res.status(200).json({ staff });
  } catch (err) {
    console.log("getMyProfile error:", err);
    return res.status(500).json({ message: "Error fetching profile" });
  }
};

// UPDATE MY PASSWORD
export const updateMyPassword = async (req, res) => {
  try {
    if (!req.staff || !req.staff.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New password and confirm password do not match",
      });
    }

    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!strongPasswordRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const staff = await Staff.findById(req.staff.id);

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, staff.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, staff.password);

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    staff.password = await bcrypt.hash(newPassword, 10);
    await staff.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.log("updateMyPassword error:", err);
    return res.status(500).json({
      message: err.message || "Error updating password",
    });
  }
};