import Inventory from "../Model/InventoryModel.js";

// auto stock status helper
const getAutoStockStatus = (quantity, reorderLevel, currentStatus) => {
  const qty = Number(quantity) || 0;
  const reorder = Number(reorderLevel) || 0;

  if (qty <= 0) return "Out of Stock";
  if (qty <= reorder) return "Low Stock";
  return currentStatus && currentStatus !== "Out of Stock"
    ? "Available"
    : "Available";
};

// CREATE inventory item
export const createInventoryItem = async (req, res) => {
  try {
    const {
      itemName,
      category,
      quantity,
      unit,
      reorderLevel,
      supplierName,
      expiryDate,
      description,
      stockStatus,
      isActive,
    } = req.body;

    if (!itemName || !category || quantity === undefined || !unit) {
      return res.status(400).json({
        success: false,
        message: "itemName, category, quantity and unit are required",
      });
    }

    const existingItem = await Inventory.findOne({
      itemName: itemName.trim(),
      category,
      unit,
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Inventory item already exists",
      });
    }

    const finalStatus = getAutoStockStatus(quantity, reorderLevel, stockStatus);

    const newItem = new Inventory({
      itemName,
      category,
      quantity,
      unit,
      reorderLevel,
      supplierName,
      expiryDate,
      description,
      stockStatus: finalStatus,
      isActive,
    });

    const savedItem = await newItem.save();

    return res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      item: savedItem,
    });
  } catch (error) {
    console.log("createInventoryItem error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create inventory item",
      error: error.message,
    });
  }
};

// GET all inventory items
export const getAllInventoryItems = async (req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      inventory: items,
    });
  } catch (error) {
    console.log("getAllInventoryItems error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory items",
      error: error.message,
    });
  }
};

// GET single inventory item by id
export const getInventoryItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Inventory.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    return res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.log("getInventoryItemById error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory item",
      error: error.message,
    });
  }
};

// UPDATE inventory item
export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const existingItem = await Inventory.findById(id);

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    const updatedData = { ...req.body };

    const newQuantity =
      updatedData.quantity !== undefined
        ? updatedData.quantity
        : existingItem.quantity;

    const newReorderLevel =
      updatedData.reorderLevel !== undefined
        ? updatedData.reorderLevel
        : existingItem.reorderLevel;

    updatedData.stockStatus = getAutoStockStatus(
      newQuantity,
      newReorderLevel,
      updatedData.stockStatus || existingItem.stockStatus
    );

    const updatedItem = await Inventory.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      message: "Inventory item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.log("updateInventoryItem error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update inventory item",
      error: error.message,
    });
  }
};

// DELETE inventory item
export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await Inventory.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully",
    });
  } catch (error) {
    console.log("deleteInventoryItem error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete inventory item",
      error: error.message,
    });
  }
};