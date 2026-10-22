import DeliveryJobApplication from "../Model/DeliveryJobApplicationModel.js";
import Staff from "../Model/StaffModel.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const generateRandomPassword = () => {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const nums = "0123456789";
  const special = "@$!%*?&";
  const all = upper + lower + nums + special;

  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    nums[Math.floor(Math.random() * nums.length)] +
    special[Math.floor(Math.random() * special.length)];

  for (let i = 0; i < 6; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

const removeUploadedCvIfExists = (cvPath) => {
  try {
    if (!cvPath) return;

    const filename = path.basename(cvPath);
    const filePath = path.join(process.cwd(), "uploads", filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.log("removeUploadedCvIfExists error:", error);
  }
};

// CREATE APPLICATION
const createApplication = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      nic,
      dob,
      gender,
      vehicleType,
      experience,
      availability,
      reason,
      applicationSource,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !nic ||
      !dob ||
      !gender ||
      !vehicleType ||
      !experience ||
      !availability ||
      !reason
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const newApplication = new DeliveryJobApplication({
      fullName,
      email: email.toLowerCase().trim(),
      phone,
      address,
      nic,
      dob,
      gender,
      vehicleType,
      experience,
      availability,
      reason,
      cv: req.file ? `/uploads/${req.file.filename}` : "",
      applicationSource: applicationSource || "unregister-home",
    });

    await newApplication.save();

    return res.status(201).json({
      message: "Application submitted successfully",
      application: newApplication,
    });
  } catch (err) {
    console.log("createApplication error:", err);
    return res.status(500).json({
      message: "Server error while creating application",
    });
  }
};

// GET ALL APPLICATIONS
const getAllApplications = async (req, res) => {
  try {
    const applications = await DeliveryJobApplication.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      applications,
    });
  } catch (err) {
    console.log("getAllApplications error:", err);
    return res.status(500).json({
      message: "Server error while fetching applications",
    });
  }
};

// GET APPLICATION BY ID
const getApplicationById = async (req, res) => {
  try {
    const application = await DeliveryJobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    return res.status(200).json({
      application,
    });
  } catch (err) {
    console.log("getApplicationById error:", err);
    return res.status(500).json({
      message: "Server error while fetching application",
    });
  }
};

// UPDATE APPLICATION STATUS + EMAIL + SAVE STAFF + DELETE APPLICATION ON ACCEPT/REJECT
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationStatus } = req.body;

    if (!applicationStatus) {
      return res.status(400).json({
        message: "applicationStatus is required",
      });
    }

    const application = await DeliveryJobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // REVIEWED => only update status, keep in DB
    if (applicationStatus === "Reviewed") {
      application.applicationStatus = "Reviewed";
      await application.save();

      return res.status(200).json({
        message: "Application reviewed successfully",
        application,
        removed: false,
      });
    }

    // ACCEPTED => create staff if needed, send mail, then delete application
    if (applicationStatus === "Accepted") {
      const normalizedEmail = application.email.toLowerCase().trim();
      let existingStaff = await Staff.findOne({ email: normalizedEmail });

      let plainPassword = "";

      if (!existingStaff) {
        plainPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const newStaff = new Staff({
          name: application.fullName,
          email: normalizedEmail,
          password: hashedPassword,
          role: "delivery",
          phone: application.phone || "",
          vehicleType: application.vehicleType || "",
          experience: application.experience || "",
        });

        await newStaff.save();
        existingStaff = newStaff;
      }

      const transporter = createTransporter();

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: "Your Delivery Staff Application Has Been Accepted",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.7;">
            <h2 style="color:#2E7D32;">Application Accepted</h2>
            <p>Dear ${application.fullName},</p>
            <p>Your delivery staff application has been <strong>accepted</strong>.</p>
            <p>You can now log in to the system using these credentials:</p>

            <div style="background:#f5f5f5;padding:14px 18px;border-radius:10px;border:1px solid #ddd;">
              <p><strong>Email:</strong> ${normalizedEmail}</p>
              <p><strong>Password:</strong> ${
                plainPassword || "Your existing account password"
              }</p>
              <p><strong>Role:</strong> delivery</p>
            </div>

            <p style="margin-top:16px;">Please change your password after first login.</p>
            <p>Best regards,<br/>Canteen Management Team</p>
          </div>
        `,
      });

      const deletedApplication = application.toObject();

      removeUploadedCvIfExists(application.cv);
      await DeliveryJobApplication.findByIdAndDelete(req.params.id);

      return res.status(200).json({
        message: "Application accepted and removed successfully",
        application: deletedApplication,
        removed: true,
      });
    }

    // REJECTED => send mail, then delete application
    if (applicationStatus === "Rejected") {
      const transporter = createTransporter();

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: application.email,
        subject: "Your Delivery Staff Application Status",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.7;">
            <h2 style="color:#C62828;">Application Update</h2>
            <p>Dear ${application.fullName},</p>
            <p>Thank you for applying for the delivery staff position.</p>
            <p>We are sorry to inform you that your application has been <strong>rejected</strong>.</p>
            <p>We appreciate your interest and encourage you to apply again in the future.</p>
            <p>Best regards,<br/>Canteen Management Team</p>
          </div>
        `,
      });

      const deletedApplication = application.toObject();

      removeUploadedCvIfExists(application.cv);
      await DeliveryJobApplication.findByIdAndDelete(req.params.id);

      return res.status(200).json({
        message: "Application rejected and removed successfully",
        application: deletedApplication,
        removed: true,
      });
    }

    return res.status(400).json({
      message: "Invalid application status",
    });
  } catch (err) {
    console.log("updateApplicationStatus error:", err);
    return res.status(500).json({
      message: err.message || "Server error while updating application",
    });
  }
};

// DELETE APPLICATION
const deleteApplication = async (req, res) => {
  try {
    const application = await DeliveryJobApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    removeUploadedCvIfExists(application.cv);

    await DeliveryJobApplication.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Application deleted successfully",
      application,
    });
  } catch (err) {
    console.log("deleteApplication error:", err);
    return res.status(500).json({
      message: "Server error while deleting application",
    });
  }
};

export default {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
};