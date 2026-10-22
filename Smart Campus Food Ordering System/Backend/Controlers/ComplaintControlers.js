import Complaint from "../Model/ComplaintModel.js";
import { getVendorFromOrderId } from "../utils/getVendorFromOrderId.js";

// CREATE COMPLAINT
const createComplaint = async (req, res) => {
  try {
    const {
      customerId,
      fullName,
      email,
      orderId,
      category,
      subject,
      complaint,
    } = req.body;

    if (!fullName || !email || !category || !subject || !complaint) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const { vendorId, vendorName } = await getVendorFromOrderId(orderId || "");

    const newComplaint = new Complaint({
      customerId: customerId || null,
      fullName,
      email: email.toLowerCase().trim(),
      orderId: orderId || "",
      vendorId: vendorId || null,
      vendorName: vendorName || "",
      category,
      subject,
      complaint,
      image: req.file ? `/uploads/complaints/${req.file.filename}` : "",
    });

    await newComplaint.save();

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint: newComplaint,
    });
  } catch (err) {
    console.log("Create complaint error:", err);
    res.status(500).json({
      message: "Server error while submitting complaint",
    });
  }
};

// GET ALL COMPLAINTS
const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });

    res.status(200).json({ complaints });
  } catch (err) {
    console.log("Get all complaints error:", err);
    res.status(500).json({
      message: "Server error while fetching complaints",
    });
  }
};

// GET COMPLAINT BY ID
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json({ complaint });
  } catch (err) {
    console.log("Get complaint by id error:", err);
    res.status(500).json({
      message: "Server error while fetching complaint",
    });
  }
};

// GET COMPLAINTS BY CUSTOMER ID
const getComplaintsByCustomerId = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      customerId: req.params.customerId,
    }).sort({ createdAt: -1 });

    res.status(200).json({ complaints });
  } catch (err) {
    console.log("Get complaints by customer id error:", err);
    res.status(500).json({
      message: "Server error while fetching customer complaints",
    });
  }
};

// UPDATE COMPLAINT STATUS
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      message: "Complaint status updated successfully",
      complaint,
    });
  } catch (err) {
    console.log("Update complaint status error:", err);
    res.status(500).json({
      message: "Server error while updating complaint status",
    });
  }
};

// REPLY TO COMPLAINT
const replyToComplaint = async (req, res) => {
  try {
    const { adminReply } = req.body;

    if (!adminReply || !adminReply.trim()) {
      return res.status(400).json({
        message: "Reply message is required",
      });
    }

    const existingComplaint = await Complaint.findById(req.params.id);

    if (!existingComplaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    existingComplaint.adminReply = adminReply.trim();
    existingComplaint.repliedAt = new Date();
    existingComplaint.replyNotificationRead = false;
    existingComplaint.replyNotificationText = `Your complaint "${existingComplaint.subject}" has received a staff reply.`;

    await existingComplaint.save();

    res.status(200).json({
      message: "Reply sent successfully",
      complaint: existingComplaint,
    });
  } catch (err) {
    console.log("Reply complaint error:", err);
    res.status(500).json({
      message: "Server error while replying to complaint",
    });
  }
};

// GET CUSTOMER REPLY NOTIFICATIONS
const getCustomerReplyNotifications = async (req, res) => {
  try {
    const notifications = await Complaint.find({
      customerId: req.params.customerId,
      adminReply: { $ne: "" },
    })
      .sort({ repliedAt: -1, updatedAt: -1 })
      .select(
        "_id subject category orderId adminReply repliedAt replyNotificationRead replyNotificationText status createdAt vendorId vendorName"
      );

    const unreadCount = notifications.filter(
      (item) => item.replyNotificationRead === false
    ).length;

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (err) {
    console.log("Get customer reply notifications error:", err);
    res.status(500).json({
      message: "Server error while fetching reply notifications",
    });
  }
};

// MARK SINGLE NOTIFICATION AS READ
const markReplyNotificationAsRead = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $set: { replyNotificationRead: true } },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      message: "Notification marked as read",
      complaint,
    });
  } catch (err) {
    console.log("Mark reply notification as read error:", err);
    res.status(500).json({
      message: "Server error while marking notification as read",
    });
  }
};

// MARK ALL CUSTOMER NOTIFICATIONS AS READ
const markAllReplyNotificationsAsRead = async (req, res) => {
  try {
    await Complaint.updateMany(
      {
        customerId: req.params.customerId,
        adminReply: { $ne: "" },
        replyNotificationRead: false,
      },
      {
        $set: {
          replyNotificationRead: true,
        },
      }
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (err) {
    console.log("Mark all reply notifications as read error:", err);
    res.status(500).json({
      message: "Server error while marking all notifications as read",
    });
  }
};

// DELETE COMPLAINT
const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    res.status(200).json({
      message: "Complaint deleted successfully",
      complaint,
    });
  } catch (err) {
    console.log("Delete complaint error:", err);
    res.status(500).json({
      message: "Server error while deleting complaint",
    });
  }
};

export default {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  getComplaintsByCustomerId,
  updateComplaintStatus,
  replyToComplaint,
  getCustomerReplyNotifications,
  markReplyNotificationAsRead,
  markAllReplyNotificationsAsRead,
  deleteComplaint,
};