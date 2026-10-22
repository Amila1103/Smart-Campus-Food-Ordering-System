import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiArrowLeft,
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiCreditCard,
  FiTruck,
  FiShoppingBag,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";
import RegisterNavbar from "../Navbar/RegisterNavbar/RegisterNavbar";
import Footer from "../Footer/Footer";

const API_BASE = "http://localhost:5000";

export default function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
  const storedCustomer = JSON.parse(localStorage.getItem("customer")) || null;
  setCustomer(storedCustomer);

  const loadCart = async () => {
    try {
      const localCart = JSON.parse(localStorage.getItem("cartItems")) || [];

      if (storedCustomer?._id || storedCustomer?.id) {
        const customerId = storedCustomer._id || storedCustomer.id;
        const res = await axios.get(`${API_BASE}/cart/${customerId}`);
        const dbCartItems = res.data?.cart?.items || [];

        if (dbCartItems.length > 0) {
          setCartItems(dbCartItems);
          localStorage.setItem("cartItems", JSON.stringify(dbCartItems));
        } else {
          setCartItems(localCart);
        }
      } else {
        setCartItems(localCart);
      }
    } catch (err) {
      console.log("Load cart error:", err);
      const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      setCartItems(storedCart);
    }
  };

  loadCart();
}, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/600x400?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE}${imagePath}`;
  };

  const saveCartToDb = async (updatedCart) => {
    try {
      const customerId = customer?._id || customer?.id;

      if (!customerId) return;

      await axios.post(`${API_BASE}/cart`, {
        customerId,
        customerName: customer?.name || "",
        gmail: customer?.gmail || customer?.email || "",
        items: updatedCart,
      });
    } catch (err) {
      console.log("Save cart DB error:", err);
    }
  };

  const updateCartStorage = async (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    await saveCartToDb(updatedCart);
  };

  const increaseQty = async (id) => {
    const updatedCart = cartItems.map((item) =>
      String(item.itemId || item._id) === String(id)
        ? { ...item, qty: Number(item.qty || 1) + 1 }
        : item
    );
    await updateCartStorage(updatedCart);
  };

  const decreaseQty = async (id) => {
    const updatedCart = cartItems.map((item) =>
      String(item.itemId || item._id) === String(id)
        ? { ...item, qty: Math.max(1, Number(item.qty || 1) - 1) }
        : item
    );
    await updateCartStorage(updatedCart);
  };

  const removeItem = async (id) => {
    const updatedCart = cartItems.filter(
      (item) => String(item.itemId || item._id) !== String(id)
    );
    await updateCartStorage(updatedCart);
  };

  const clearCart = async () => {
    try {
      const customerId = customer?._id || customer?.id;

      setCartItems([]);
      localStorage.removeItem("cartItems");
      window.dispatchEvent(new Event("cartUpdated"));

      if (customerId) {
        await axios.delete(`${API_BASE}/cart/${customerId}`);
      }
    } catch (err) {
      console.log("Clear cart DB error:", err);
    }
  };

  const summary = useMemo(() => {
    const itemsTotal = cartItems.reduce(
      (sum, item) =>
        sum + Number(item.price || item.unitPrice || 0) * Number(item.qty || 1),
      0
    );

    const discount = 0;
    const grandTotal = itemsTotal - discount;

    return {
      itemsTotal,
      discount,
      grandTotal,
    };
  }, [cartItems]);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const checkoutData = {
      customer: {
        _id: customer?._id || customer?.id || "",
        id: customer?._id || customer?.id || "",
        name: customer?.name || "",
        gmail: customer?.gmail || customer?.email || "",
        email: customer?.gmail || customer?.email || "",
        address: customer?.address || "",
        phoneNumber: customer?.phoneNumber || "",
        gender: customer?.gender || "",
        dietaryPreferences: customer?.dietaryPreferences || [],
        allergies: customer?.allergies || [],
        otherAllergy: customer?.otherAllergy || "",
        calorieGoal: customer?.calorieGoal || "",
        notes: customer?.notes || "",
      },

      items: cartItems.map((item) => ({
        _id: item?.itemId || item?._id || "",
        itemId: item?.itemId || item?._id || "",
        name: item?.name || "",
        image: item?.image || "",
        category: item?.category || "",
        portionSize: item?.portionSize || "Regular",
        availabilityStatus: item?.availabilityStatus || "Available",
        description: item?.description || "",
        qty: Number(item?.qty || 1),
        unitPrice: Number(item?.price || item?.unitPrice || 0),
        price: Number(item?.price || item?.unitPrice || 0),
        subtotal:
          Number(item?.price || item?.unitPrice || 0) *
          Number(item?.qty || 1),
      })),

      orderType: "Delivery",
      paymentMethod: "Cash on Delivery",
      paymentStatus: "Pending",
      orderStatus: "Pending",
      discount: summary.discount,
      totalAmount: summary.itemsTotal,
      grandTotal: summary.grandTotal,
      notes: customer?.notes || "",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("cartCheckoutData", JSON.stringify(checkoutData));
    navigate("/confirm-order");
  };

  return (
    <div>
      <RegisterNavbar />

      <div className="cart-page">
        <section className="cart-hero">
          <div className="cart-hero-card">
            <div className="cart-hero-top">
              <button className="cart-back-btn" onClick={() => navigate(-1)}>
                <FiArrowLeft />
                Back
              </button>
              <span className="cart-chip">Your Shopping Cart</span>
            </div>

            <h1>Review your selected food items</h1>
            <p>
              Update quantities, remove items, and check your order summary
              before proceeding to checkout.
            </p>
          </div>
        </section>

        <section className="cart-main">
          <div className="cart-left">
            <div className="cart-card">
              <div className="cart-card-title">
                <FiShoppingCart />
                <h3>Cart Items</h3>
              </div>

              {cartItems.length === 0 ? (
                <div className="cart-empty-wrap">
                  <FiShoppingBag className="cart-empty-icon" />
                  <h2>Your cart is empty</h2>
                  <p>Add your favorite meals from the menu to continue.</p>
                  <button
                    className="cart-primary-btn"
                    onClick={() => navigate("/customerBrowseMenu")}
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div className="cart-items-list">
                  {cartItems.map((item) => {
                    const itemKey = item.itemId || item._id;
                    const subtotal =
                      Number(item.price || item.unitPrice || 0) *
                      Number(item.qty || 1);

                    return (
                      <div className="cart-item-card" key={itemKey}>
                        <div className="cart-item-image">
                          <img src={getImageUrl(item.image)} alt={item.name} />
                        </div>

                        <div className="cart-item-content">
                          <div className="cart-item-top">
                            <div>
                              <h3>{item.name}</h3>
                              <p>
                                {item.description ||
                                  "Freshly prepared menu item for your meal."}
                              </p>
                            </div>
                            <span className="cart-price">Rs. {item.price}</span>
                          </div>

                          <div className="cart-item-tags">
                            <span>{item.category}</span>
                            <span>{item.portionSize}</span>
                            <span>{item.availabilityStatus}</span>
                          </div>

                          <div className="cart-item-bottom">
                            <div className="cart-qty-control">
                              <button
                                type="button"
                                onClick={() => decreaseQty(itemKey)}
                              >
                                <FiMinus />
                              </button>
                              <span>{item.qty || 1}</span>
                              <button
                                type="button"
                                onClick={() => increaseQty(itemKey)}
                              >
                                <FiPlus />
                              </button>
                            </div>

                            <div className="cart-subtotal-box">
                              <span>Subtotal</span>
                              <strong>Rs. {subtotal}</strong>
                            </div>

                            <button
                              type="button"
                              className="cart-remove-btn"
                              onClick={() => removeItem(itemKey)}
                            >
                              <FiTrash2 />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="cart-right">
            <div className="cart-card cart-summary-card">
              <div className="cart-card-title">
                <FiCreditCard />
                <h3>Order Summary</h3>
              </div>

              <div className="cart-summary-lines">
                <div className="cart-line">
                  <span>Items Total</span>
                  <strong>Rs. {summary.itemsTotal}</strong>
                </div>

                <div className="cart-line">
                  <span>Discount</span>
                  <strong>Rs. {summary.discount}</strong>
                </div>

                <div className="cart-line total">
                  <span>Grand Total</span>
                  <strong>Rs. {summary.grandTotal}</strong>
                </div>
              </div>

              <div className="cart-extra-info">
                <div className="cart-extra-row">
                  <FiTruck />
                  <span>Estimated delivery: 25 - 35 mins</span>
                </div>

                <div className="cart-extra-row">
                  <FiShoppingBag />
                  <span>
                    {cartItems.reduce(
                      (sum, item) => sum + Number(item.qty || 1),
                      0
                    )}{" "}
                    item(s) in your cart
                  </span>
                </div>
              </div>

              <div className="cart-action-group">
                <button
                  type="button"
                  className="cart-secondary-btn"
                  onClick={() => navigate("/customerContinueShopping")}
                >
                  <FiArrowLeft />
                  Continue Shopping
                </button>

                <button
                  type="button"
                  className="cart-primary-btn"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  <FiCreditCard />
                  Proceed to Checkout
                </button>

                <button
                  type="button"
                  className="cart-clear-btn"
                  onClick={clearCart}
                  disabled={cartItems.length === 0}
                >
                  <FiTrash2 />
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}