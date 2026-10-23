import express from "express";
import Customer from "../Model/Customer.js";
import CustomerControllers from "../Controlers/CustomerControlers.js";

const router = express.Router();

router.get("/", CustomerControllers.getAllCustomers);
router.get("/:id", CustomerControllers.getByid);
router.put("/:id", CustomerControllers.UpdateCustomers);
router.put("/:id/dietary", CustomerControllers.updateDietaryPreferences);
router.delete("/:id", CustomerControllers.deleteCustomers);

// CUSTOMER LOGOUT
router.post("/logout/:id", async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, {
      isOnline: false,
    });

    res.status(200).json({ message: "Logged out" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Logout error" });
  }
});

export default router;