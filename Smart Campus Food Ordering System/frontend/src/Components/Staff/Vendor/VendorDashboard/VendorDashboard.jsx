import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserCircle,
  FaClipboardList,
  FaChartLine,
  FaHistory,
  FaCheckDouble,
  FaDollarSign,
  FaExclamationCircle,
  FaBoxOpen,
  FaStore,
  FaShoppingBag,
  FaBell,
  FaCommentDots,
} from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./VendorDashboard.css";

import logo from "../../../Website/image/logo.png";
import vendorSliderImage from "../../../Website/image/hero1.avif";
import VendorSidebar from "../VendorSlider/VendorSlider";

import VendorOrders from "../VendorOrders/VendorOrders";
import VendorCompletedOrders from "../VendorCompletedOrders/VendorCompletedOrders";
import CompletedOrdersTakeaway from "../CompletedOrdersTakeaway/CompletedOrdersTakeaway";
import VendorMenuList from "../VendorMenuList/VendorMenuList";
import VendorInventoryList from "../VendorInventoryList/VendorInventoryList";
import VendorEarnings from "../VendorEarnings/VendorEarnings";
import VendorAnalytics from "../VendorAnalytics/VendorAnalytics";
import VendorHistory from "../VendorHistory/VendorHistory";
import VendorProfile from "../VendorProfile/VendorProfile";
import VendorComplaintManagement from "../VendorComplaintManagement/VendorComplaintManagement";
import VendorOverviewContent from "../VendorOverviewContent/VendorOverviewContent";

const API_BASE = "http://localhost:5000";

const VendorActiveOrders = () => (
  <div className="vendordash-placeholder-box">Vendor Active Orders Content</div>
);

export default function VendorDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingLowStock, setLoadingLowStock] = useState(true);

  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);

  const slides = [
    {
      badge: "Vendor Control Center",
      title: "Manage Your Food Business Easily",
      text: "Handle orders, completed orders, takeaway records, menu items, inventory, complaints, earnings, analytics, and history from one clean and modern vendor dashboard.",
    },
    {
      badge: "Order Management",
      title: "Track Daily Orders Without Confusion",
      text: "Monitor incoming customer orders, active order flow, completed deliveries, takeaway completions, and kitchen activity with a simple and organized workspace.",
    },
    {
      badge: "Reports & Performance",
      title: "View Earnings and Improve Performance",
      text: "Check revenue, stock levels, analytics, complaint handling, and business history to make better vendor decisions and improve your canteen operations.",
    },
  ];

  useEffect(() => {
    const staffData = localStorage.getItem("staff");

    if (!staffData) {
      navigate("/staff-login", { replace: true });
      return;
    }

    try {
      const staff = JSON.parse(staffData);

      if (!staff || staff.role?.toLowerCase() !== "vendor") {
        localStorage.removeItem("staff");
        localStorage.removeItem("staffToken");
        navigate("/staff-login", { replace: true });
      }
    } catch (error) {
      localStorage.removeItem("staff");
      localStorage.removeItem("staffToken");
      navigate("/staff-login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    fetchInventoryAlerts();
    fetchComplaintNotifications();
  }, []);

  const fetchInventoryAlerts = async () => {
    try {
      setLoadingLowStock(true);
      const res = await axios.get(`${API_BASE}/inventory`);
      setInventoryItems(res.data?.inventory || res.data?.items || []);
    } catch (error) {
      console.log("Fetch low stock alert error:", error);
      setInventoryItems([]);
    } finally {
      setLoadingLowStock(false);
    }
  };

  const fetchComplaintNotifications = async () => {
    try {
      setLoadingComplaints(true);
      const res = await axios.get(`${API_BASE}/complaints`);
      setComplaints(res.data?.complaints || []);
    } catch (error) {
      console.log("Fetch complaint notification error:", error);
      setComplaints([]);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const lowStockItems = useMemo(() => {
    return inventoryItems.filter(
      (item) => String(item.stockStatus || "").toLowerCase() === "low stock"
    );
  }, [inventoryItems]);

  const outOfStockItems = useMemo(() => {
    return inventoryItems.filter(
      (item) => String(item.stockStatus || "").toLowerCase() === "out of stock"
    );
  }, [inventoryItems]);

  const pendingComplaints = useMemo(() => {
    return complaints.filter(
      (item) => String(item.status || "Pending").toLowerCase() === "pending"
    );
  }, [complaints]);

  const totalComplaintNotifications = pendingComplaints.length;

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="vendordash-layout-shell">
      <VendorSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="vendordash-main-area">
        <div className="vendordash-content-wrap">
          <div className="vendordash-topbar-row">
            <div className="vendordash-topbar-texts">
              <h1 className="vendordash-main-title">Vendor Dashboard</h1>
              <p className="vendordash-main-subtitle">
                Manage orders, menu, inventory, complaints, earnings, analytics,
                history, and vendor profile from one place.
              </p>
            </div>

            <div className="vendordash-topbar-actions">
              <button
                className="vendordash-notification-btn"
                onClick={() => setActiveTab("complaints")}
                title="Vendor Complaint Notifications"
              >
                <FaBell />
                {!loadingComplaints && totalComplaintNotifications > 0 && (
                  <span className="vendordash-notification-count">
                    {totalComplaintNotifications > 99
                      ? "99+"
                      : totalComplaintNotifications}
                  </span>
                )}
              </button>

              <button
                className="vendordash-profile-round-btn"
                onClick={() => setActiveTab("profile")}
                title="Vendor Profile"
              >
                <FaUserCircle />
              </button>
            </div>
          </div>

          {activeTab === "overview" && (
            <>
              <section className="vendordash-slider-section">
                <div className="vendordash-slider-card">
                  <div className="vendordash-slider-image-side">
                    <img
                      src={vendorSliderImage}
                      alt="Vendor dashboard visual"
                      className="vendordash-slider-image"
                    />
                  </div>

                  <div className="vendordash-slider-content-side">
                    <div className="vendordash-brand-row">
                      <div className="vendordash-brand-icon-box">
                        <img
                          src={logo}
                          alt="System logo"
                          className="vendordash-brand-logo-img"
                        />
                      </div>

                      <div className="vendordash-brand-text-box">
                        <h3>Campus Canteen</h3>
                        <span>Vendor Management Panel</span>
                      </div>
                    </div>

                    <span className="vendordash-slide-badge">
                      {slides[currentSlide].badge}
                    </span>

                    <h2 className="vendordash-slide-title">
                      {slides[currentSlide].title}
                    </h2>

                    <p className="vendordash-slide-text">
                      {slides[currentSlide].text}
                    </p>

                    <div className="vendordash-slide-action-row">
                      <button
                        className="vendordash-primary-action-btn"
                        onClick={() => setActiveTab("orders")}
                      >
                        <FaShoppingBag />
                        <span>View Orders</span>
                      </button>

                      <button
                        className="vendordash-secondary-action-btn"
                        onClick={() => setActiveTab("menuList")}
                      >
                        <span>Menu List</span>
                      </button>

                      <button
                        className="vendordash-secondary-action-btn"
                        onClick={() => setActiveTab("inventory")}
                      >
                        <span>Inventory</span>
                      </button>

                      <button
                        className="vendordash-secondary-action-btn"
                        onClick={() => setActiveTab("completedOrders")}
                      >
                        <span>Completed Orders</span>
                      </button>

                      <button
                        className="vendordash-secondary-action-btn"
                        onClick={() => setActiveTab("completedOrdersTakeaway")}
                      >
                        <span>Takeaway Orders</span>
                      </button>

                      <button
                        className="vendordash-secondary-action-btn"
                        onClick={() => setActiveTab("complaints")}
                      >
                        <span>Complaints</span>
                      </button>

                      <button
                        className="vendordash-secondary-action-btn"
                        onClick={() => setActiveTab("earnings")}
                      >
                        <span>Earnings</span>
                      </button>

                      <button
                        className="vendordash-secondary-action-btn"
                        onClick={() => setActiveTab("analytics")}
                      >
                        <span>Analytics</span>
                      </button>
                    </div>

                    <div className="vendordash-dots-row">
                      {slides.map((_, index) => (
                        <span
                          key={index}
                          className={
                            currentSlide === index
                              ? "vendordash-dot-item active"
                              : "vendordash-dot-item"
                          }
                          onClick={() => setCurrentSlide(index)}
                        ></span>
                      ))}
                    </div>
                  </div>

                  <button
                    className="vendordash-arrow-btn vendordash-arrow-left"
                    onClick={prevSlide}
                  >
                    <FiChevronLeft />
                  </button>

                  <button
                    className="vendordash-arrow-btn vendordash-arrow-right"
                    onClick={nextSlide}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </section>

              {!loadingComplaints && totalComplaintNotifications > 0 && (
                <section className="vendordash-complaint-alert-section">
                  <div className="vendordash-complaint-alert-card">
                    <div className="vendordash-complaint-alert-left">
                      <div className="vendordash-complaint-alert-icon">
                        <FaCommentDots />
                      </div>

                      <div className="vendordash-complaint-alert-texts">
                        <span className="vendordash-complaint-alert-badge">
                          Complaint Notification
                        </span>

                        <h3>
                          {totalComplaintNotifications} complaint(s) need your attention
                        </h3>

                        <p>
                          Pending complaints:{" "}
                          {pendingComplaints
                            .slice(0, 4)
                            .map((item) => item.subject || item.category || "Complaint")
                            .join(", ")}
                          {pendingComplaints.length > 4 ? " ..." : ""}
                        </p>
                      </div>
                    </div>

                    <button
                      className="vendordash-complaint-alert-btn"
                      onClick={() => setActiveTab("complaints")}
                    >
                      View Complaints
                    </button>
                  </div>
                </section>
              )}

              {!loadingLowStock && (lowStockItems.length > 0 || outOfStockItems.length > 0) && (
                <section className="vendordash-alert-section">
                  <div className="vendordash-alert-card">
                    <div className="vendordash-alert-left">
                      <div className="vendordash-alert-icon">
                        <FaExclamationCircle />
                      </div>

                      <div className="vendordash-alert-texts">
                        <span className="vendordash-alert-badge">
                          Inventory Alert
                        </span>

                        <h3>
                          {lowStockItems.length > 0
                            ? `${lowStockItems.length} item(s) are currently Low Stock`
                            : `${outOfStockItems.length} item(s) are currently Out of Stock`}
                        </h3>

                        <p>
                          {lowStockItems.length > 0 && (
                            <>
                              Low stock items:{" "}
                              {lowStockItems
                                .slice(0, 5)
                                .map((item) => item.itemName)
                                .join(", ")}
                              {lowStockItems.length > 5 ? " ..." : ""}
                            </>
                          )}
                          {lowStockItems.length > 0 && outOfStockItems.length > 0
                            ? " | "
                            : ""}
                          {outOfStockItems.length > 0 && (
                            <>
                              Out of stock items:{" "}
                              {outOfStockItems
                                .slice(0, 5)
                                .map((item) => item.itemName)
                                .join(", ")}
                              {outOfStockItems.length > 5 ? " ..." : ""}
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      className="vendordash-alert-btn"
                      onClick={() => setActiveTab("inventory")}
                    >
                      View Inventory
                    </button>
                  </div>
                </section>
              )}

              <div className="vendordash-stats-grid-box">
                <div className="vendordash-stat-card-box">
                  <div className="vendordash-stat-icon-box vendordash-green-tone">
                    <FaClipboardList />
                  </div>
                  <div>
                    <p className="vendordash-stat-label-text">Orders</p>
                    <h3 className="vendordash-stat-main-text">Manage Orders</h3>
                  </div>
                </div>

                <div className="vendordash-stat-card-box">
                  <div className="vendordash-stat-icon-box vendordash-orange-tone">
                    <FaCheckDouble />
                  </div>
                  <div>
                    <p className="vendordash-stat-label-text">Completed</p>
                    <h3 className="vendordash-stat-main-text">
                      Finished Orders
                    </h3>
                  </div>
                </div>

                <div className="vendordash-stat-card-box">
                  <div className="vendordash-stat-icon-box vendordash-green-tone">
                    <FaStore />
                  </div>
                  <div>
                    <p className="vendordash-stat-label-text">Menu</p>
                    <h3 className="vendordash-stat-main-text">Manage Items</h3>
                  </div>
                </div>

                <div className="vendordash-stat-card-box">
                  <div className="vendordash-stat-icon-box vendordash-orange-tone">
                    <FaBoxOpen />
                  </div>
                  <div>
                    <p className="vendordash-stat-label-text">Inventory</p>
                    <h3 className="vendordash-stat-main-text">Stock Control</h3>
                  </div>
                </div>

                <div
                  className="vendordash-stat-card-box"
                  onClick={() => setActiveTab("complaints")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="vendordash-stat-icon-box vendordash-green-tone">
                    <FaExclamationCircle />
                  </div>
                  <div>
                    <p className="vendordash-stat-label-text">Complaints</p>
                    <h3 className="vendordash-stat-main-text">
                      {totalComplaintNotifications > 0
                        ? `${totalComplaintNotifications} Pending`
                        : "Resolve Issues"}
                    </h3>
                  </div>
                </div>

                <div className="vendordash-stat-card-box">
                  <div className="vendordash-stat-icon-box vendordash-orange-tone">
                    <FaDollarSign />
                  </div>
                  <div>
                    <p className="vendordash-stat-label-text">Earnings</p>
                    <h3 className="vendordash-stat-main-text">Track Revenue</h3>
                  </div>
                </div>

                <div className="vendordash-stat-card-box">
                  <div className="vendordash-stat-icon-box vendordash-green-tone">
                    <FaChartLine />
                  </div>
                  <div>
                    <p className="vendordash-stat-label-text">Analytics</p>
                    <h3 className="vendordash-stat-main-text">Business Insights</h3>
                  </div>
                </div>

                <div className="vendordash-stat-card-box">
                  <div className="vendordash-stat-icon-box vendordash-orange-tone">
                    <FaHistory />
                  </div>
                  <div>
                    <p className="vendordash-stat-label-text">History</p>
                    <h3 className="vendordash-stat-main-text">Past Records</h3>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="vendordash-panel-main-box">
            {activeTab === "profile" && <VendorProfile />}
            {activeTab === "overview" && <VendorOverviewContent />}
            {activeTab === "orders" && <VendorOrders />}
            {activeTab === "activeOrders" && <VendorActiveOrders />}
            {activeTab === "completedOrders" && <VendorCompletedOrders />}
            {activeTab === "completedOrdersTakeaway" && (
              <CompletedOrdersTakeaway />
            )}
            {activeTab === "menuList" && <VendorMenuList />}
            {activeTab === "inventory" && <VendorInventoryList />}
            {activeTab === "complaints" && <VendorComplaintManagement />}
            {activeTab === "earnings" && <VendorEarnings />}
            {activeTab === "analytics" && <VendorAnalytics />}
            {activeTab === "history" && <VendorHistory />}
          </div>
        </div>
      </main>
    </div>
  );
}