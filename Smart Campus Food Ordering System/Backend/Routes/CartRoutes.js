import express from "express";
import CartControllers from "../Controlers/CartControlers.js";

const router = express.Router();

router.get("/:customerId", CartControllers.getCartByCustomerId);
router.post("/", CartControllers.saveCart);
router.post("/add", CartControllers.addToCart);
router.put("/:customerId/item/:itemId", CartControllers.updateCartItemQty);
router.delete("/:customerId/item/:itemId", CartControllers.removeCartItem);
router.delete("/:customerId", CartControllers.clearCart);

export default router;