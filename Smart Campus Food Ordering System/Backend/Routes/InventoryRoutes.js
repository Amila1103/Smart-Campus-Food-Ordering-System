import express from "express";
import {
  createInventoryItem,
  getAllInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
} from "../Controlers/InventoryControlers.js";

const router = express.Router();

router.post("/", createInventoryItem);
router.get("/", getAllInventoryItems);
router.get("/:id", getInventoryItemById);
router.put("/:id", updateInventoryItem);
router.delete("/:id", deleteInventoryItem);

export default router;