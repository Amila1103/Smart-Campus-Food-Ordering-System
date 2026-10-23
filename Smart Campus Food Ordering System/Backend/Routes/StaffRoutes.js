import express from "express";
import {
  getAllStaffs,
  getStaffById,
  addStaff,
  updateStaff,
  deleteStaff,
  getMyProfile,
  updateMyPassword,
  getDeliveryStaffs,
  getDeliveryStaffById,
  addDeliveryStaff,
  updateDeliveryStaff,
  deleteDeliveryStaff,
} from "../Controlers/StaffControlers.js";
import { verifyStaffToken, allowRoles } from "../Middleware/authMiddleware.js";

const router = express.Router();

// logged in staff own profile
router.get("/me/profile", verifyStaffToken, getMyProfile);
router.put("/me/password", verifyStaffToken, updateMyPassword);

// ---------------- ADMIN ONLY: FULL STAFF MANAGEMENT ----------------
router.get("/", verifyStaffToken, allowRoles("admin"), getAllStaffs);
router.get("/:id", verifyStaffToken, allowRoles("admin"), getStaffById);
router.post("/", verifyStaffToken, allowRoles("admin"), addStaff);
router.put("/:id", verifyStaffToken, allowRoles("admin"), updateStaff);
router.delete("/:id", verifyStaffToken, allowRoles("admin"), deleteStaff);

// ---------------- DELIVERY MANAGER ONLY: DELIVERY STAFF MANAGEMENT ----------------
router.get(
  "/delivery-team/all",
  verifyStaffToken,
  allowRoles("delivery manager", "admin"),
  getDeliveryStaffs
);

router.get(
  "/delivery-team/:id",
  verifyStaffToken,
  allowRoles("delivery manager", "admin"),
  getDeliveryStaffById
);

router.post(
  "/delivery-team",
  verifyStaffToken,
  allowRoles("delivery manager", "admin"),
  addDeliveryStaff
);

router.put(
  "/delivery-team/:id",
  verifyStaffToken,
  allowRoles("delivery manager", "admin"),
  updateDeliveryStaff
);

router.delete(
  "/delivery-team/:id",
  verifyStaffToken,
  allowRoles("delivery manager", "admin"),
  deleteDeliveryStaff
);

export default router;