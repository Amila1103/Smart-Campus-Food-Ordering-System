import ContactUs from "../Model/ContactUsModel.js";

// GET ALL CONTACT MESSAGES
const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactUs.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET MESSAGE BY ID
const getMessageById = async (req, res) => {
  try {
    const message = await ContactUs.findById(req.params.id);

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    res.status(200).json({ success: true, message });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Fetch error" });
  }
};

// CREATE MESSAGE
const createMessage = async (req, res) => {
  try {
    const { customerId, name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const newMessage = new ContactUs({
      customerId: customerId || null,
      name,
      email,
      subject,
      message,
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Create error" });
  }
};

// UPDATE STATUS
const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const updatedMessage = await ContactUs.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    if (!updatedMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Update failed" });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedMessage,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Update error" });
  }
};

// DELETE MESSAGE
const deleteMessage = async (req, res) => {
  try {
    const deletedMessage = await ContactUs.findByIdAndDelete(req.params.id);

    if (!deletedMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Delete failed" });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: deletedMessage,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Delete error" });
  }
};

export default {
  getAllMessages,
  getMessageById,
  createMessage,
  updateMessageStatus,
  deleteMessage,
};