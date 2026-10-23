import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import ComplaintControllers from "../Controlers/ComplaintControlers.js";

const router = express.Router();

const uploadDir = "uploads/complaints";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "complaint-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/", upload.single("image"), ComplaintControllers.createComplaint);
router.get("/customer/:customerId", ComplaintControllers.getComplaintsByCustomerId);

router.get(
  "/customer/:customerId/reply-notifications",
  ComplaintControllers.getCustomerReplyNotifications
);

router.put(
  "/reply-notification/:id/read",
  ComplaintControllers.markReplyNotificationAsRead
);

router.put(
  "/customer/:customerId/reply-notifications/read-all",
  ComplaintControllers.markAllReplyNotificationsAsRead
);

router.get("/", ComplaintControllers.getAllComplaints);
router.get("/:id", ComplaintControllers.getComplaintById);
router.put("/:id/status", ComplaintControllers.updateComplaintStatus);
router.put("/:id/reply", ComplaintControllers.replyToComplaint);
router.delete("/:id", ComplaintControllers.deleteComplaint);

export default router;