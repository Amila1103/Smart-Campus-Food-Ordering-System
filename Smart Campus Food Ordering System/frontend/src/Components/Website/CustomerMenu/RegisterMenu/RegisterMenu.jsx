import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiSearch,
  FiRefreshCw,
  FiAlertTriangle,
  FiStar,
  FiHeart,
  FiShoppingCart,
  FiCreditCard,
  FiArrowLeft,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./RegisterMenu.css";
import RegisterNavbar from "../../Navbar/RegisterNavbar/RegisterNavbar";
import Footer from "../../Footer/Footer";

const API_BASE = "http://localhost:5000";

export default function RegisterMenu() {
  const navigate = useNavigate();

  const [menus, setMenus] = useState([]);
  const [recommendedMenus, setRecommendedMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [error, setError] = useState("");
  const [recommendError, setRecommendError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("All");

  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [favoriteItems, setFavoriteItems] = useState(
    JSON.parse(localStorage.getItem("favoriteMenuItems")) || []
  );

  const customer = JSON.parse(localStorage.getItem("customer")) || null;
  const customerId = customer?._id || customer?.id || "";

  const categories = ["All", "Foods", "Drinks", "Snacks", "Desserts"];
  const availabilityOptions = ["All", "Available", "Limited", "Sold Out"];

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    if (customerId) {
      fetchRecommendedMenus(customerId);
    } else {
      setLoadingRecommendations(false);
    }
  }, [customerId]);

  useEffect(() => {
    if (selectedMenuItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedMenuItem]);

  const fetchMenus = async () => {
    try {
      setLoadingMenus(true);
      setError("");
      const res = await axios.get(`${API_BASE}/menus`);
      setMenus(res.data?.menus || []);
    } catch (err) {
      console.log("fetchMenus error:", err);
      setError("Failed to load menu items.");
    } finally {
      setLoadingMenus(false);
    }
  };

  const fetchRecommendedMenus = async (id) => {
    try {
      setLoadingRecommendations(true);
      setRecommendError("");
      const res = await axios.get(`${API_BASE}/menus/recommend/${id}`);
      setRecommendedMenus(res.data?.recommendedMenus || []);
    } catch (err) {
      console.log("fetchRecommendedMenus error:", err);
      setRecommendError("Could not load personalized recommendations.");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      const matchesCategory =
        selectedCategory === "All" || menu.category === selectedCategory;

      const matchesSearch =
        menu.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        menu.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        menu.category?.toLowerCase().includes(searchText.toLowerCase());

      const matchesAvailability =
        selectedAvailability === "All" ||
        menu.availabilityStatus === selectedAvailability;

      return matchesCategory && matchesSearch && matchesAvailability;
    });
  }, [menus, selectedCategory, searchText, selectedAvailability]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/600x400?text=No+Image";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_BASE}${imagePath}`;
  };

  const getAvailabilityClass = (status) => {
    if (status === "Available") return "menu-badge available";
    if (status === "Limited") return "menu-badge limited";
    return "menu-badge soldout";
  };

  const safeCustomerInfo = {
    name: customer?.name || "Customer",
    allergies: customer?.allergies || [],
    dietaryPreferences: customer?.dietaryPreferences || [],
    calorieGoal: customer?.calorieGoal || "",
  };

  const isFavorite = (menuId) => {
    return favoriteItems.some((item) => String(item._id) === String(menuId));
  };

  const toggleFavorite = (menu) => {
    let updatedFavorites = [];

    if (isFavorite(menu._id)) {
      updatedFavorites = favoriteItems.filter(
        (item) => String(item._id) !== String(menu._id)
      );
    } else {
      updatedFavorites = [...favoriteItems, menu];
    }

    setFavoriteItems(updatedFavorites);
    localStorage.setItem("favoriteMenuItems", JSON.stringify(updatedFavorites));
  };

  const openMenuModal = (menu) => {
    setSelectedMenuItem(menu);
    setSelectedQty(1);
  };

  const closeMenuModal = () => {
    setSelectedMenuItem(null);
    setSelectedQty(1);
  };

  const decreaseQty = () => {
    setSelectedQty((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const increaseQty = () => {
    setSelectedQty((prev) => prev + 1);
  };

  const handleAddToCart = async (menu) => {
  try {
    const storedCustomer = JSON.parse(localStorage.getItem("customer")) || null;
    const customerId = storedCustomer?._id || storedCustomer?.id || "";

    if (!customerId) {
      alert("Please login first.");
      navigate("/UNVlogin");
      return;
    }

    const payload = {
      customerId,
      customerName: storedCustomer?.name || "",
      gmail: storedCustomer?.gmail || storedCustomer?.email || "",
      item: {
        itemId: menu?._id || "",
        _id: menu?._id || "",
        name: menu?.name || "",
        image: menu?.image || "",
        category: menu?.category || "",
        portionSize: menu?.portionSize || "Regular",
        availabilityStatus: menu?.availabilityStatus || "Available",
        description: menu?.description || "",
        qty: Number(selectedQty || 1),
        unitPrice: Number(menu?.price || 0),
        price: Number(menu?.price || 0),
        subtotal: Number(menu?.price || 0) * Number(selectedQty || 1),
      },
    };

    const res = await axios.post(`${API_BASE}/cart/add`, payload);

    const savedItems = res.data?.cart?.items || [];
    localStorage.setItem("cartItems", JSON.stringify(savedItems));
    window.dispatchEvent(new Event("cartUpdated"));

    setSelectedMenuItem(null);
    setSelectedQty(1);

    navigate("/cart");
  } catch (err) {
    console.log("Add to cart error:", err);
    alert("Failed to add item to cart.");
  }
};

  const handlePayNow = (menu) => {
  const storedCustomer = JSON.parse(localStorage.getItem("customer")) || {};

  const safeCustomer = {
    _id: storedCustomer?._id || storedCustomer?.id || "",
    id: storedCustomer?._id || storedCustomer?.id || "",
    name: storedCustomer?.name || "",
    gmail: storedCustomer?.gmail || storedCustomer?.email || "",
    email: storedCustomer?.gmail || storedCustomer?.email || "",
    address: storedCustomer?.address || "",
    phoneNumber: storedCustomer?.phoneNumber || "",
    gender: storedCustomer?.gender || "",
    dietaryPreferences: storedCustomer?.dietaryPreferences || [],
    allergies: storedCustomer?.allergies || [],
    otherAllergy: storedCustomer?.otherAllergy || "",
    calorieGoal: storedCustomer?.calorieGoal || "",
    notes: storedCustomer?.notes || "",
  };

  const singleItemOrder = {
    customer: safeCustomer,
    items: [
      {
        _id: menu?._id || "",
        itemId: menu?._id || "",
        name: menu?.name || "",
        image: menu?.image || "",
        category: menu?.category || "",
        portionSize: menu?.portionSize || "Regular",
        availabilityStatus: menu?.availabilityStatus || "Available",
        description: menu?.description || "",
        qty: Number(selectedQty || 1),
        unitPrice: Number(menu?.price || 0),
        price: Number(menu?.price || 0),
        subtotal: Number(menu?.price || 0) * Number(selectedQty || 1),
      },
    ],
    orderType: "Delivery",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    orderStatus: "Pending",
    deliveryFee: 250,
    discount: 0,
    totalAmount: Number(menu?.price || 0) * Number(selectedQty || 1),
    grandTotal: Number(menu?.price || 0) * Number(selectedQty || 1) + 250,
    notes: safeCustomer?.notes || "",
    createdAt: new Date().toISOString(),
    orderSource: "payNow",
  };

  localStorage.setItem("confirmOrderItem", JSON.stringify(singleItemOrder));

  setSelectedMenuItem(null);
  setSelectedQty(1);

  navigate("/confirm-order");
};

  const renderMenuCard = (menu, isRecommended = false) => {
    const isSoldOut = menu.availabilityStatus === "Sold Out";

    return (
      <div
        className={`menu-card ${isRecommended ? "menu-recommend-card" : ""} ${
          isSoldOut ? "menu-card-soldout" : ""
        }`}
        key={menu._id}
      >
        <div className="menu-card-image-wrap">
          <img
            src={getImageUrl(menu.image)}
            alt={menu.name}
            className="menu-card-image"
          />
          <span className={getAvailabilityClass(menu.availabilityStatus)}>
            {menu.availabilityStatus}
          </span>
          {isRecommended && (
            <span className="menu-recommend-chip">Recommended</span>
          )}
        </div>

        <div className="menu-card-body">
          <div className="menu-card-top">
            <h3>{menu.name}</h3>
            <span className="menu-price">Rs. {menu.price}</span>
          </div>

          <p className="menu-desc">
            {menu.description || "Freshly prepared menu item for your meal."}
          </p>

          <div className="menu-meta-row">
            <span>{menu.category}</span>
            <span>{menu.portionSize}</span>
            <span>
              {isRecommended
                ? `${menu.calories || 0} cal`
                : `${menu.stockQty || 0} in stock`}
            </span>
          </div>

          {menu.labels?.length > 0 && (
            <div className="menu-label-wrap">
              {menu.labels.slice(0, 3).map((label, index) => (
                <span className="menu-label" key={index}>
                  {label}
                </span>
              ))}
              {menu.labels.length > 3 && (
                <span className="menu-label more">
                  +{menu.labels.length - 3} more
                </span>
              )}
            </div>
          )}

          {menu.allergens?.length > 0 && (
            <div className="menu-allergen-box">
              <FiAlertTriangle />
              <span>
                Allergens: {menu.allergens.slice(0, 3).join(", ")}
                {menu.allergens.length > 3 ? "..." : ""}
              </span>
            </div>
          )}

          <div className="menu-bottom-row">
            <div className="menu-rating">
              <FiStar />
              <span>{menu.rating || 0}</span>
            </div>

            <button
              className="menu-view-btn"
              onClick={() => openMenuModal(menu)}
              disabled={isSoldOut}
            >
              View Item
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <RegisterNavbar />

      <div className={`menu-page ${selectedMenuItem ? "menu-page-blur" : ""}`}>
        <section className="menu-hero">
          <div className="menu-hero-content">
            <span className="menu-mini-badge">Smart Menu Experience</span>
            <h1>Discover meals that match your taste and dietary needs</h1>
            <p>
              Browse all foods, filter by category, and get personalized meal
              suggestions based on your allergies and dietary preferences.
            </p>

            <div className="menu-hero-tags">
              <span>Fresh Meals</span>
              <span>Safe Choices</span>
              <span>Fast Ordering</span>
            </div>
          </div>
        </section>

        <section className="menu-user-summary">
          <div className="menu-summary-card">
            <div className="menu-summary-top">
              <h2>Hello, {safeCustomerInfo.name}</h2>

              <button className="menu-refresh-btn" onClick={fetchMenus}>
                <FiRefreshCw />
                Refresh Menu
              </button>
            </div>

            <div className="menu-summary-grid">
              <div className="menu-summary-box">
                <h4>Dietary Preferences</h4>
                <p>
                  {safeCustomerInfo.dietaryPreferences.length > 0
                    ? safeCustomerInfo.dietaryPreferences.join(", ")
                    : "No dietary preferences added"}
                </p>
              </div>

              <div className="menu-summary-box menu-summary-box-alert">
                <h4>Allergies</h4>
                <p>
                  {safeCustomerInfo.allergies.length > 0
                    ? safeCustomerInfo.allergies.join(", ")
                    : "No allergies added"}
                </p>
              </div>

              <div className="menu-summary-box">
                <h4>Calorie Goal</h4>
                <p>
                  {safeCustomerInfo.calorieGoal
                    ? safeCustomerInfo.calorieGoal
                    : "No calorie goal selected"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="menu-recommend-section">
          <div className="menu-section-header">
            <div>
              <span className="menu-title-chip">
                <FiHeart />
                Recommended For You
              </span>
              <h2>Personalized food suggestions</h2>
            </div>
          </div>

          {loadingRecommendations ? (
            <div className="menu-loading-card">Loading recommendations...</div>
          ) : recommendError ? (
            <div className="menu-error-card">{recommendError}</div>
          ) : recommendedMenus.length === 0 ? (
            <div className="menu-empty-card">
              No personalized recommendations found yet.
            </div>
          ) : (
            <div className="menu-grid">
              {recommendedMenus
                .slice(0, 4)
                .map((menu) => renderMenuCard(menu, true))}
            </div>
          )}
        </section>

        <section className="menu-browse-section">
          <div className="menu-section-header">
            <div>
              <span className="menu-title-chip">Browse Menu</span>
              <h2>Explore all available foods and drinks</h2>
            </div>
          </div>

          <div className="menu-filter-bar">
            <div className="menu-search-box">
              <FiSearch className="menu-search-icon" />
              <input
                type="text"
                placeholder="Search foods, drinks, desserts..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="menu-filter-row">
              <div className="menu-category-list">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`menu-category-btn ${
                      selectedCategory === category ? "active" : ""
                    }`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <select
                className="menu-availability-select"
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
              >
                {availabilityOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingMenus ? (
            <div className="menu-loading-card">Loading full menu...</div>
          ) : error ? (
            <div className="menu-error-card">{error}</div>
          ) : filteredMenus.length === 0 ? (
            <div className="menu-empty-card">
              No menu items found for your filters.
            </div>
          ) : (
            <div className="menu-grid">
              {filteredMenus.map((menu) => renderMenuCard(menu))}
            </div>
          )}
        </section>
      </div>

      {selectedMenuItem && (
        <div className="menu-modal-overlay" onClick={closeMenuModal}>
          <div className="menu-mini-modal" onClick={(e) => e.stopPropagation()}>
            <div className="menu-card-image-wrap menu-mini-modal-image-wrap">
              <img
                src={getImageUrl(selectedMenuItem.image)}
                alt={selectedMenuItem.name}
                className="menu-card-image"
              />
              <span
                className={getAvailabilityClass(
                  selectedMenuItem.availabilityStatus
                )}
              >
                {selectedMenuItem.availabilityStatus}
              </span>
              <span className="menu-recommend-chip">Selected Item</span>
              <div className="menu-modal-rating-badge">
                <FiStar />
                <span>{selectedMenuItem.rating || 0}</span>
              </div>
            </div>

            <div className="menu-card-body menu-mini-modal-body">
              <div className="menu-card-top">
                <h3>{selectedMenuItem.name}</h3>
                <span className="menu-price">Rs. {selectedMenuItem.price}</span>
              </div>

              <p className="menu-desc menu-mini-modal-desc">
                {selectedMenuItem.description ||
                  "Freshly prepared menu item for your meal."}
              </p>

              <div className="menu-meta-row">
                <span>{selectedMenuItem.category}</span>
                <span>{selectedMenuItem.portionSize}</span>
                <span>{selectedMenuItem.stockQty || 0} in stock</span>
                <span>{selectedMenuItem.calories || 0} cal</span>
              </div>

              {selectedMenuItem.labels?.length > 0 && (
                <div className="menu-label-wrap">
                  {selectedMenuItem.labels.slice(0, 3).map((label, index) => (
                    <span className="menu-label" key={index}>
                      {label}
                    </span>
                  ))}
                  {selectedMenuItem.labels.length > 3 && (
                    <span className="menu-label more">
                      +{selectedMenuItem.labels.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {selectedMenuItem.allergens?.length > 0 && (
                <div className="menu-allergen-box">
                  <FiAlertTriangle />
                  <span>
                    Allergens: {selectedMenuItem.allergens.join(", ")}
                  </span>
                </div>
              )}

              <div className="menu-favorite-row">
                <span className="menu-favorite-title">Favorite</span>
                <button
                  className={`menu-favorite-btn-inline ${
                    isFavorite(selectedMenuItem._id) ? "active" : ""
                  }`}
                  onClick={() => toggleFavorite(selectedMenuItem)}
                >
                  <FiHeart />
                  {isFavorite(selectedMenuItem._id)
                    ? "Added to Favorites"
                    : "Add to Favorites"}
                </button>
              </div>

              <div className="menu-qty-section">
                <span className="menu-qty-title">Quantity</span>
                <div className="menu-qty-control">
                  <button onClick={decreaseQty}>
                    <FiMinus />
                  </button>
                  <span>{selectedQty}</span>
                  <button onClick={increaseQty}>
                    <FiPlus />
                  </button>
                </div>
              </div>

              <div className="menu-bottom-row menu-mini-modal-bottom">
                <div className="menu-rating">
                  <FiStar />
                  <span>{selectedMenuItem.rating || 0}</span>
                </div>

                <div className="menu-mini-modal-actions">
                  <button className="menu-back-btn" onClick={closeMenuModal}>
                    <FiArrowLeft />
                    Back
                  </button>

                  <button
                    className="menu-cart-btn"
                    onClick={() => handleAddToCart(selectedMenuItem)}
                    disabled={
                      selectedMenuItem.availabilityStatus === "Sold Out"
                    }
                  >
                    <FiShoppingCart />
                    Add to Cart
                  </button>

                  <button
                    className="menu-pay-btn"
                    onClick={() => handlePayNow(selectedMenuItem)}
                    disabled={
                      selectedMenuItem.availabilityStatus === "Sold Out"
                    }
                  >
                    <FiCreditCard />
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}