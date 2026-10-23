import express from "express";
import multer from "multer";
import path from "path";
import {
  getAllMenus,
  addMenu,
  getMenuById,
  updateMenu,
  deleteMenu,
  updateMenuStock,
  getRecommendedMenus,
} from "../Controlers/MenuControlers.js";

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.get("/", getAllMenus);
router.get("/recommend/:customerId", getRecommendedMenus);
router.post("/upload", upload.single("image"), addMenu);
router.get("/:id", getMenuById);
router.put("/:id", upload.single("image"), updateMenu);
router.delete("/:id", deleteMenu);
router.put("/stock/:id", updateMenuStock);

export default router;