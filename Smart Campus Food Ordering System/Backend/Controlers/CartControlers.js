import Cart from "../Model/CartModel.js";

// GET CUSTOMER CART
const getCartByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;

    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      return res.status(200).json({
        message: "Cart is empty",
        cart: null,
      });
    }

    return res.status(200).json({ cart });
  } catch (err) {
    console.log("getCartByCustomerId error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// SAVE / REPLACE FULL CART
const saveCart = async (req, res) => {
  try {
    const { customerId, customerName, gmail, items } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: "customerId is required" });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "items must be an array" });
    }

    const normalizedItems = items.map((item) => {
      const qty = Number(item?.qty || 1);
      const price = Number(item?.price || item?.unitPrice || 0);

      return {
        itemId: item?.itemId || item?._id || "",
        name: item?.name || "",
        image: item?.image || "",
        category: item?.category || "",
        portionSize: item?.portionSize || "Regular",
        availabilityStatus: item?.availabilityStatus || "Available",
        description: item?.description || "",
        qty,
        unitPrice: price,
        price,
        subtotal: price * qty,
      };
    });

    const totalAmount = normalizedItems.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0
    );

    const grandTotal = totalAmount;

    const cart = await Cart.findOneAndUpdate(
      { customerId },
      {
        $set: {
          customerId,
          customerName: customerName || "",
          gmail: gmail || "",
          items: normalizedItems,
          totalAmount,
          grandTotal,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      message: "Cart saved successfully",
      cart,
    });
  } catch (err) {
    console.log("saveCart error:", err);
    return res.status(500).json({ message: "Save cart error" });
  }
};

// ADD ITEM TO CART
const addToCart = async (req, res) => {
  try {
    const { customerId, customerName, gmail, item } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: "customerId is required" });
    }

    if (!item || !item.name) {
      return res.status(400).json({ message: "item is required" });
    }

    let cart = await Cart.findOne({ customerId });

    if (!cart) {
      cart = new Cart({
        customerId,
        customerName: customerName || "",
        gmail: gmail || "",
        items: [],
        totalAmount: 0,
        grandTotal: 0,
      });
    }

    const itemId = item?.itemId || item?._id || "";
    const existingIndex = cart.items.findIndex(
      (cartItem) => String(cartItem.itemId) === String(itemId)
    );

    if (existingIndex !== -1) {
      cart.items[existingIndex].qty += Number(item.qty || 1);
      cart.items[existingIndex].subtotal =
        Number(cart.items[existingIndex].price || 0) *
        Number(cart.items[existingIndex].qty || 1);
    } else {
      const qty = Number(item?.qty || 1);
      const price = Number(item?.price || item?.unitPrice || 0);

      cart.items.push({
        itemId,
        name: item?.name || "",
        image: item?.image || "",
        category: item?.category || "",
        portionSize: item?.portionSize || "Regular",
        availabilityStatus: item?.availabilityStatus || "Available",
        description: item?.description || "",
        qty,
        unitPrice: price,
        price,
        subtotal: price * qty,
      });
    }

    cart.totalAmount = cart.items.reduce(
      (sum, cartItem) => sum + Number(cartItem.subtotal || 0),
      0
    );
    cart.grandTotal = cart.totalAmount;

    await cart.save();

    return res.status(200).json({
      message: "Item added to cart successfully",
      cart,
    });
  } catch (err) {
    console.log("addToCart error:", err);
    return res.status(500).json({ message: "Add to cart error" });
  }
};

// UPDATE ITEM QTY
const updateCartItemQty = async (req, res) => {
  try {
    const { customerId, itemId } = req.params;
    const { qty } = req.body;

    if (!qty || Number(qty) < 1) {
      return res.status(400).json({ message: "Valid qty is required" });
    }

    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => String(item.itemId) === String(itemId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    cart.items[itemIndex].qty = Number(qty);
    cart.items[itemIndex].subtotal =
      Number(cart.items[itemIndex].price || 0) * Number(qty);

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0
    );
    cart.grandTotal = cart.totalAmount;

    await cart.save();

    return res.status(200).json({
      message: "Cart item updated successfully",
      cart,
    });
  } catch (err) {
    console.log("updateCartItemQty error:", err);
    return res.status(500).json({ message: "Update cart item error" });
  }
};

// REMOVE ONE ITEM
const removeCartItem = async (req, res) => {
  try {
    const { customerId, itemId } = req.params;

    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => String(item.itemId) !== String(itemId)
    );

    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + Number(item.subtotal || 0),
      0
    );
    cart.grandTotal = cart.totalAmount;

    await cart.save();

    return res.status(200).json({
      message: "Cart item removed successfully",
      cart,
    });
  } catch (err) {
    console.log("removeCartItem error:", err);
    return res.status(500).json({ message: "Remove cart item error" });
  }
};

// CLEAR FULL CART
const clearCart = async (req, res) => {
  try {
    const { customerId } = req.params;

    const cart = await Cart.findOneAndUpdate(
      { customerId },
      {
        $set: {
          items: [],
          totalAmount: 0,
          grandTotal: 0,
        },
      },
      { new: true }
    );

    return res.status(200).json({
      message: "Cart cleared successfully",
      cart,
    });
  } catch (err) {
    console.log("clearCart error:", err);
    return res.status(500).json({ message: "Clear cart error" });
  }
};

export default {
  getCartByCustomerId,
  saveCart,
  addToCart,
  updateCartItemQty,
  removeCartItem,
  clearCart,
};