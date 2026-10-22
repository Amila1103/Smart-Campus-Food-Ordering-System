import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserCircle,
  FaUsers,
  FaClipboardList,
  FaChartLine,
  FaHistory,
  FaCheckDouble,
  FaDollarSign,
  FaExclamationCircle,
  FaStore,
  FaBell,
  FaCommentDots,
} from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./AdminDashboard.css";

import logo from "../../../Website/image/logo.png";
import adminSliderImage from "../../../Website/image/hero1.avif";
import AdminSidebar from "../AdminSidebar/AdminSidebar";
import AdminStaffManagement from "../AdminStaffManagement/AdminStaffManagement";
import AdminMenuList from "../AdminMenuList/AdminMenuList";
import AdminCompletedOrders from "../AdminCompletedOrders/AdminCompletedOrders";
import AdminPayments from "../AdminPayments/AdminPayments";
import AdminAnalyticsContent from "../AdminAnalyticsContent/AdminAnalyticsContent";
import AdminProfileContent from "../AdminProfileContent/AdminProfileContent";
import AdminOverviewContent from "../AdminOverviewContent/AdminOverviewContent";
import AdminComplaintManagement from "../AdminComplaintManagement/AdminComplaintManagement";
import AdminVendorPerformance from "../AdminVendorPerformance/AdminVendorPerformance";

const API_BASE = "http://localhost:5000";

const AdminAdmins = () => (
  <div className="admindash-placeholder-box">Admin Management Content</div>
);

const AdminHistory = () => (
  <div className="admindash-placeholder-box">History Content</div>
);

const AdminSettings = () => (
  <div className="admindash-placeholder-box">Settings Content</div>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);

  const notificationRef = useRef(null);

  const slides = [
    {
      badge: "Administration Hub",
      title: "Manage Your Entire System Easily",
      text: "Control staff, menu items, completed orders, payments, complaints, vendor performance, and settings from one clean and professional admin dashboard.",
    },
    {
      badge: "Operations Control",
      title: "Track Platform Activity Efficiently",
      text: "Stay updated with staff operations, menu records, completed orders, vendor performance, complaints, payments, and platform activity using a simple modern interface.",
    },
    {
      badge: "Reports & Insights",
      title: "View Analytics and Make Better Decisions",
      text: "Monitor trends, review vendor performance, history, customer complaints, and keep your canteen management work organized with useful insights and quick actions.",
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

      if (!staff || staff.role?.toLowerCase() !== "admin") {
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
    fetchComplaintNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleNotificationClick = () => {
    setShowNotificationDropdown((prev) => !prev);
  };

  const handleOpenComplaintPage = () => {
    setActiveTab("complaints");
    setShowNotificationDropdown(false);
  };

  const handleOpenComplaintFromDropdown = () => {
    setActiveTab("complaints");
    setShowNotificationDropdown(false);
  };

  return (
    <div className="admindash-layout-shell">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="admindash-main-area">
        <div className="admindash-content-wrap">
          <div className="admindash-topbar-row">
            <div className="admindash-topbar-texts">
              <h1 className="admindash-main-title">Admin Dashboard</h1>
            </div>

            <div className="admindash-topbar-actions">
              <div
                className="admindash-notification-wrap"
                ref={notificationRef}
              >
                <button
                  className="admindash-notification-btn"
                  onClick={handleNotificationClick}
                  title="Complaint Notifications"
                >
                  <FaBell />
                  {!loadingComplaints && totalComplaintNotifications > 0 && (
                    <span className="admindash-notification-count">
                      {totalComplaintNotifications > 99
                        ? "99+"
                        : totalComplaintNotifications}
                    </span>
                  )}
                </button>

                {showNotificationDropdown && (
                  <div className="admindash-notification-dropdown">
                    <div className="admindash-notification-dropdown-head">
                      <h4>Complaint Notifications</h4>
                      <span>{totalComplaintNotifications} Pending</span>
                    </div>

                    {loadingComplaints ? (
                      <div className="admindash-notification-empty">
                        Loading notifications...
                      </div>
                    ) : pendingComplaints.length === 0 ? (
                      <div className="admindash-notification-empty">
                        No pending complaints right now.
                      </div>
                    ) : (
                      <>
                        <div className="admindash-notification-list">
                          {pendingComplaints.slice(0, 5).map((item) => (
                            <button
                              key={item._id}
                              className="admindash-notification-item"
                              onClick={handleOpenComplaintFromDropdown}
                            >
                              <div className="admindash-notification-item-icon">
                                <FaCommentDots />
                              </div>

                              <div className="admindash-notification-item-text">
                                <h5>{item.subject || "Complaint"}</h5>
                                <p>
                                  {item.fullName || "Customer"} •{" "}
                                  {item.category || "General"}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>

                        <button
                          className="admindash-notification-viewall"
                          onClick={handleOpenComplaintPage}
                        >
                          View All Complaints
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <button
                className="admindash-profile-round-btn"
                onClick={() => setActiveTab("profile")}
                title="Admin Profile"
              >
                <FaUserCircle />
              </button>
            </div>
          </div>

          {activeTab === "overview" && (
            <>
              <section className="admindash-slider-section">
                <div className="admindash-slider-card">
                  <div className="admindash-slider-image-side">
                    <img
                      src={adminSliderImage}
                      alt="Admin dashboard visual"
                      className="admindash-slider-image"
                    />
                  </div>

                  <div className="admindash-slider-content-side">
                    <div className="admindash-brand-row">
                      <div className="admindash-brand-icon-box">
                        <img
                          src={logo}
                          alt="System logo"
                          className="admindash-brand-logo-img"
                        />
                      </div>

                      <div className="admindash-brand-text-box">
                        <h3>Campus Canteen</h3>
                        <span>Admin Control Panel</span>
                      </div>
                    </div>

                    <span className="admindash-slide-badge">
                      {slides[currentSlide].badge}
                    </span>

                    <h2 className="admindash-slide-title">
                      {slides[currentSlide].title}
                    </h2>

                    <p className="admindash-slide-text">
                      {slides[currentSlide].text}
                    </p>

                    <div className="admindash-slide-action-row">
                      <button
                        className="admindash-primary-action-btn"
                        onClick={() => setActiveTab("users")}
                      >
                        <FaUsers />
                        <span>Manage Staff</span>
                      </button>

                      <button
                        className="admindash-secondary-action-btn"
                        onClick={() => setActiveTab("menuList")}
                      >
                        <span>View Menu List</span>
                      </button>

                      <button
                        className="admindash-secondary-action-btn"
                        onClick={() => setActiveTab("completedOrders")}
                      >
                        <span>Completed Orders</span>
                      </button>

                      <button
                        className="admindash-secondary-action-btn"
                        onClick={() => setActiveTab("payments")}
                      >
                        <span>View Payments</span>
                      </button>

                      <button
                        className="admindash-secondary-action-btn"
                        onClick={() => setActiveTab("complaints")}
                      >
                        <span>View Complaints</span>
                      </button>

                      <button
                        className="admindash-secondary-action-btn"
                        onClick={() => setActiveTab("vendorPerformance")}
                      >
                        <span>Vendor Performance</span>
                      </button>

                      <button
                        className="admindash-secondary-action-btn"
                        onClick={() => setActiveTab("analytics")}
                      >
                        <span>View Analytics</span>
                      </button>
                    </div>

                    <div className="admindash-dots-row">
                      {slides.map((_, index) => (
                        <span
                          key={index}
                          className={
                            currentSlide === index
                              ? "admindash-dot-item active"
                              : "admindash-dot-item"
                          }
                          onClick={() => setCurrentSlide(index)}
                        ></span>
                      ))}
                    </div>
                  </div>

                  <button
                    className="admindash-arrow-btn admindash-arrow-left"
                    onClick={prevSlide}
                  >
                    <FiChevronLeft />
                  </button>

                  <button
                    className="admindash-arrow-btn admindash-arrow-right"
                    onClick={nextSlide}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </section>

              {!loadingComplaints && totalComplaintNotifications > 0 && (
                <section className="admindash-complaint-alert-section">
                  <div className="admindash-complaint-alert-card">
                    <div className="admindash-complaint-alert-left">
                      <div className="admindash-complaint-alert-icon">
                        <FaCommentDots />
                      </div>

                      <div className="admindash-complaint-alert-texts">
                        <span className="admindash-complaint-alert-badge">
                          Complaint Notification
                        </span>

                        <h3>
                          {totalComplaintNotifications} complaint(s) need attention
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
                      className="admindash-complaint-alert-btn"
                      onClick={() => setActiveTab("complaints")}
                    >
                      View Complaints
                    </button>
                  </div>
                </section>
              )}

              <div className="admindash-stats-grid-box">
                <div className="admindash-stat-card-box">
                  <div className="admindash-stat-icon-box admindash-green-tone">
                    <FaUsers />
                  </div>
                  <div>
                    <p className="admindash-stat-label-text">Staff</p>
                    <h3 className="admindash-stat-main-text">Manage Team</h3>
                  </div>
                </div>

                <div className="admindash-stat-card-box">
                  <div className="admindash-stat-icon-box admindash-orange-tone">
                    <FaClipboardList />
                  </div>
                  <div>
                    <p className="admindash-stat-label-text">Menu</p>
                    <h3 className="admindash-stat-main-text">Manage Items</h3>
                  </div>
                </div>

                <div className="admindash-stat-card-box">
                  <div className="admindash-stat-icon-box admindash-green-tone">
                    <FaCheckDouble />
                  </div>
                  <div>
                    <p className="admindash-stat-label-text">Completed Orders</p>
                    <h3 className="admindash-stat-main-text">
                      Track Finished Orders
                    </h3>
                  </div>
                </div>

                <div className="admindash-stat-card-box">
                  <div className="admindash-stat-icon-box admindash-orange-tone">
                    <FaDollarSign />
                  </div>
                  <div>
                    <p className="admindash-stat-label-text">Payments</p>
                    <h3 className="admindash-stat-main-text">Track Revenue</h3>
                  </div>
                </div>

                <div
                  className="admindash-stat-card-box"
                  onClick={() => setActiveTab("complaints")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="admindash-stat-icon-box admindash-green-tone">
                    <FaExclamationCircle />
                  </div>
                  <div>
                    <p className="admindash-stat-label-text">Complaints</p>
                    <h3 className="admindash-stat-main-text">
                      {totalComplaintNotifications > 0
                        ? `${totalComplaintNotifications} Pending`
                        : "Handle Issues"}
                    </h3>
                  </div>
                </div>

                <div className="admindash-stat-card-box">
                  <div className="admindash-stat-icon-box admindash-orange-tone">
                    <FaStore />
                  </div>
                  <div>
                    <p className="admindash-stat-label-text">Vendors</p>
                    <h3 className="admindash-stat-main-text">
                      Performance Scoring
                    </h3>
                  </div>
                </div>

                <div className="admindash-stat-card-box">
                  <div className="admindash-stat-icon-box admindash-green-tone">
                    <FaChartLine />
                  </div>
                  <div>
                    <p className="admindash-stat-label-text">Analytics</p>
                    <h3 className="admindash-stat-main-text">View Insights</h3>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="admindash-panel-main-box">
            {activeTab === "overview" && <AdminOverviewContent />}
            {activeTab === "users" && <AdminStaffManagement />}
            {activeTab === "menuList" && <AdminMenuList />}
            {activeTab === "completedOrders" && <AdminCompletedOrders />}
            {activeTab === "payments" && <AdminPayments />}
            {activeTab === "complaints" && <AdminComplaintManagement />}
            {activeTab === "vendorPerformance" && <AdminVendorPerformance />}
            {activeTab === "analytics" && <AdminAnalyticsContent />}
            {activeTab === "admins" && <AdminAdmins />}
            {activeTab === "history" && <AdminHistory />}
            {activeTab === "settings" && <AdminSettings />}
            {activeTab === "profile" && <AdminProfileContent />}
          </div>
        </div>
      </main>
    </div>
  );
}