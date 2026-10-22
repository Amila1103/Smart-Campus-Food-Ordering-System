import OrderRating from "../Model/OrderRatingModel.js";
import { getVendorFromOrderId } from "../utils/getVendorFromOrderId.js";

// CREATE OR UPDATE RATING
export const createOrUpdateOrderRating = async (req, res) => {
  try {
    const {
      orderId,
      customerId,
      customerName,
      gmail,
      rating,
      comment,
      sourceTable,
    } = req.body;

    if (!orderId || !customerId) {
      return res.status(400).json({
        success: false,
        message: "orderId and customerId are required",
      });
    }

    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const { vendorId, vendorName } = await getVendorFromOrderId(orderId);

    const savedRating = await OrderRating.findOneAndUpdate(
      { orderId, customerId },
      {
        orderId,
        customerId,
        customerName: customerName || "",
        gmail: gmail || "",
        vendorId: vendorId || null,
        vendorName: vendorName || "",
        rating: numericRating,
        comment: comment || "",
        sourceTable: sourceTable || "",
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Order rating saved successfully",
      rating: savedRating,
    });
  } catch (error) {
    console.log("createOrUpdateOrderRating error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving order rating",
      error: error.message,
    });
  }
};

export const getAllOrderRatings = async (req, res) => {
  try {
    const ratings = await OrderRating.find().sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.log("getAllOrderRatings error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching all ratings",
      error: error.message,
    });
  }
};

// GET ALL RATINGS OF A CUSTOMER
export const getRatingsByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;

    const ratings = await OrderRating.find({ customerId }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch (error) {
    console.log("getRatingsByCustomerId error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching ratings",
      error: error.message,
    });
  }
};

// GET SINGLE RATING BY ORDER + CUSTOMER
export const getRatingByOrderAndCustomer = async (req, res) => {
  try {
    const { orderId, customerId } = req.params;

    const rating = await OrderRating.findOne({ orderId, customerId });

    return res.status(200).json({
      success: true,
      rating: rating || null,
    });
  } catch (error) {
    console.log("getRatingByOrderAndCustomer error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order rating",
      error: error.message,
    });
  }
};