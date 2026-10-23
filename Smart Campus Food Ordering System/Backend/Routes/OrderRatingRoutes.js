import express from "express";
import {
  createOrUpdateOrderRating,
  getAllOrderRatings,
  getRatingsByCustomerId,
  getRatingByOrderAndCustomer,
} from "../Controlers/OrderRatingControlers.js";

const router = express.Router();

router.post("/", createOrUpdateOrderRating);
router.get("/", getAllOrderRatings);
router.get("/customer/:customerId", getRatingsByCustomerId);
router.get("/:orderId/:customerId", getRatingByOrderAndCustomer);

export default router;