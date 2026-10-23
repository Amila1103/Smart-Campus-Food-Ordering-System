import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import DeliveryJobApplicationControllers from "../Controlers/DeliveryJobApplicationControlers.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const safeOriginalName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeOriginalName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];

  const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    allowedMimeTypes.includes(file.mimetype) &&
    allowedExtensions.includes(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, JPEG, PNG files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.post(
  "/",
  upload.single("cv"),
  DeliveryJobApplicationControllers.createApplication
);

router.get("/", DeliveryJobApplicationControllers.getAllApplications);
router.get("/:id", DeliveryJobApplicationControllers.getApplicationById);
router.put("/:id/status", DeliveryJobApplicationControllers.updateApplicationStatus);
router.delete("/:id", DeliveryJobApplicationControllers.deleteApplication);

export default router;