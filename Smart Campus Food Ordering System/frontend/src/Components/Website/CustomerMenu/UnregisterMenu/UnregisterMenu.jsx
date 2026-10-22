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
import "./UnregisterMenu.css";
import UnregisterNavbar from "../../Navbar/UnregisterNavbar/UnregisterNavbar";
import Footer from "../../Footer/Footer";

const API_BASE = "http://localhost:5000";

export default function UnregisterMenu() {
  const navigate = useNavigate();

  const [menus, setMenus] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("All");

  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [selectedQty, setSelectedQty] = useState(1);

  const categories = ["All", "Foods", "Drinks", "Snacks", "Desserts"];
  const availabilityOptions = ["All", "Available", "Limited", "Sold Out"];

  useEffect(() => {
    fetchMenus();
  }, []);

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

  const goToLogin = () => {
    navigate("/UnregisterMenuLogin");
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

  const renderMenuCard = (menu) => {
    const isSoldOut = menu.availabilityStatus === "Sold Out";

    return (
      <div
        className={`menu-card ${isSoldOut ? "menu-card-soldout" : ""}`}
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
            <span>{menu.stockQty || 0} in stock</span>
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
      <UnregisterNavbar />

      <div className={`menu-page ${selectedMenuItem ? "menu-page-blur" : ""}`}>
        <section className="menu-hero">
          <div className="menu-hero-content">
            <span className="menu-mini-badge">Smart Menu Experience</span>
            <h1>Discover meals that match your taste and dietary needs</h1>
            <p>
              Browse all foods, filter by category, and explore the campus menu
              with a clean and modern food ordering experience.
            </p>

            <div className="menu-hero-tags">
              <span>Fresh Meals</span>
              <span>Safe Choices</span>
              <span>Fast Ordering</span>
            </div>
          </div>
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
          <div
            className="menu-mini-modal"
            onClick={(e) => e.stopPropagation()}
          >
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
                  className="menu-favorite-btn-inline"
                  onClick={goToLogin}
                >
                  <FiHeart />
                  Add to Favorites
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
                    onClick={goToLogin}
                    disabled={selectedMenuItem.availabilityStatus === "Sold Out"}
                  >
                    <FiShoppingCart />
                    Add to Cart
                  </button>

                  <button
                    className="menu-pay-btn"
                    onClick={goToLogin}
                    disabled={selectedMenuItem.availabilityStatus === "Sold Out"}
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