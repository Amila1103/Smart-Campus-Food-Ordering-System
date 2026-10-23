import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserCircle,
  FaUsers,
  FaClipboardList,
  FaComments,
  FaBell,
  FaChartLine,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./CustomerManagerDashboard.css";

import logo from "../../../Website/image/logo.png";
import managerSliderImage from "../../../Website/image/hero1.avif";
import CustomerManagerSidebar from "../CustomerManagerSidebar/CustomerManagerSidebar";
import CustomerManagerCustomers from "../CustomerManagerCustomers/CustomerManagerCustomers";
import CustomerManagerComplaints from "../CustomerManagerComplaints/CustomerManagerComplaints";
import CustomerManagerOrders from "../CustomerManagerOrders/CustomerManagerOrders";
import CustomerInsightsAnalytics from "../CustomerInsightsAnalytics/CustomerInsightsAnalytics";
import CustomerManagerProfile from "../CustomerManagerProfile/CustomerManagerProfile";
import CustomerManagerOverviewContent from "../CustomerManagerOverviewContent/CustomerManagerOverviewContent";

const API_BASE = "http://localhost:5000";

const CustomersContent = () => <CustomerManagerCustomers />;
const OrdersContent = () => <CustomerManagerOrders />;
const FeedbackContent = () => <CustomerManagerComplaints />;

const NotificationsContent = () => (
  <div className="cmdash-placeholder-box">Notification Management Content</div>
);

const AnalyticsContent = () => <CustomerInsightsAnalytics />;
const ProfileContent = () => <CustomerManagerProfile />;

export default function CustomerManagerDashboard() {
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
      badge: "Customer Service Hub",
      title: "Manage Customer Experience Efficiently",
      text: "Handle customer support, monitor feedback, review service activity, and keep communication organized from one clean and professional dashboard.",
    },
    {
      badge: "Customer Orders",
      title: "View Customer Orders with Full Details",
      text: "Check completed customer orders, inspect ordered items, delivery information, payment status, and mark completed orders as finished through one organized order panel.",
    },
    {
      badge: "Complaint Management",
      title: "Review Complaints and Send Replies Quickly",
      text: "Check all customer complaints, update complaint status, send replies, and view already replied complaints through a clean complaint management panel.",
    },
    {
      badge: "Customer Analytics",
      title: "Track Insights and Customer Trends",
      text: "Analyze customer activity, order behavior, complaint performance, revenue trends, and top customer engagement through a modern analytics panel.",
    },
    {
      badge: "Profile Security",
      title: "Protect Your Customer Manager Account",
      text: "View your profile details and update your password securely with uppercase, lowercase, number, and special character requirements.",
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

      if (!staff || staff.role?.toLowerCase() !== "customer manager") {
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

    const interval = setInterval(() => {
      fetchComplaintNotifications();
    }, 15000);

    return () => clearInterval(interval);
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
      setComplaints(
        Array.isArray(res.data?.complaints) ? res.data.complaints : []
      );
    } catch (error) {
      console.log("Fetch complaint notification error:", error);
      setComplaints([]);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const pendingComplaints = useMemo(() => {
    return complaints
      .filter(
        (item) => String(item.status || "Pending").toLowerCase() === "pending"
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
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
    setActiveTab("feedback");
    setShowNotificationDropdown(false);
  };

  const formatComplaintTime = (value) => {
    if (!value) return "Just now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";
    return date.toLocaleString();
  };

  return (
    <div className="cmdash-layout-shell">
      <CustomerManagerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="cmdash-main-area">
        <div className="cmdash-content-wrap">
          <div className="cmdash-topbar-row">
            <div className="cmdash-topbar-texts">
              <h1 className="cmdash-main-title">Customer Manager Dashboard</h1>
              <p className="cmdash-main-subtitle">
                Welcome to the customer management workspace.
              </p>
            </div>

            <div className="cmdash-topbar-actions">
              <div className="cmdash-notification-wrap" ref={notificationRef}>
                <button
                  className="cmdash-notification-btn"
                  onClick={handleNotificationClick}
                  title="Complaint Notifications"
                >
                  <FaBell />
                  {!loadingComplaints && totalComplaintNotifications > 0 && (
                    <span className="cmdash-notification-count">
                      {totalComplaintNotifications > 99
                        ? "99+"
                        : totalComplaintNotifications}
                    </span>
                  )}
                </button>

                {showNotificationDropdown && (
                  <div className="cmdash-notification-dropdown">
                    <div className="cmdash-notification-dropdown-head">
                      <h4>Complaint Notifications</h4>
                      <span>{totalComplaintNotifications} Pending</span>
                    </div>

                    {loadingComplaints ? (
                      <div className="cmdash-notification-empty">
                        Loading notifications...
                      </div>
                    ) : pendingComplaints.length === 0 ? (
                      <div className="cmdash-notification-empty">
                        No new complaints right now.
                      </div>
                    ) : (
                      <>
                        <div className="cmdash-notification-list">
                          {pendingComplaints.slice(0, 5).map((item) => (
                            <button
                              key={item._id}
                              className="cmdash-notification-item"
                              onClick={handleOpenComplaintPage}
                            >
                              <div className="cmdash-notification-item-icon">
                                <FaExclamationCircle />
                              </div>

                              <div className="cmdash-notification-item-text">
                                <h5>{item.subject || "New Complaint"}</h5>
                                <p>
                                  {item.fullName || "Customer"} •{" "}
                                  {item.category || "General"}
                                </p>
                                <span>{formatComplaintTime(item.createdAt)}</span>
                              </div>
                            </button>
                          ))}
                        </div>

                        <button
                          className="cmdash-notification-viewall"
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
                className="cmdash-profile-round-btn"
                onClick={() => setActiveTab("profile")}
                title="Customer Manager Profile"
              >
                <FaUserCircle />
              </button>
            </div>
          </div>

          {activeTab === "overview" && (
            <>
              <section className="cmdash-slider-section">
                <div className="cmdash-slider-card">
                  <div className="cmdash-slider-image-side">
                    <img
                      src={managerSliderImage}
                      alt="Customer manager dashboard visual"
                      className="cmdash-slider-image"
                    />
                  </div>

                  <div className="cmdash-slider-content-side">
                    <div className="cmdash-brand-row">
                      <div className="cmdash-brand-icon-box">
                        <img
                          src={logo}
                          alt="System logo"
                          className="cmdash-brand-logo-img"
                        />
                      </div>

                      <div className="cmdash-brand-text-box">
                        <h3>Campus Canteen</h3>
                        <span>Customer Manager Panel</span>
                      </div>
                    </div>

                    <span className="cmdash-slide-badge">
                      {slides[currentSlide].badge}
                    </span>

                    <h2 className="cmdash-slide-title">
                      {slides[currentSlide].title}
                    </h2>

                    <p className="cmdash-slide-text">
                      {slides[currentSlide].text}
                    </p>

                    <div className="cmdash-slide-action-row">
                      <button
                        className="cmdash-primary-action-btn"
                        onClick={() => setActiveTab("customers")}
                      >
                        <FaUsers />
                        <span>Manage Customers</span>
                      </button>

                      <button
                        className="cmdash-secondary-action-btn"
                        onClick={() => setActiveTab("orders")}
                      >
                        <span>View Orders</span>
                      </button>

                      <button
                        className="cmdash-secondary-action-btn"
                        onClick={() => setActiveTab("feedback")}
                      >
                        <span>Review Complaints</span>
                      </button>

                      <button
                        className="cmdash-secondary-action-btn"
                        onClick={() => setActiveTab("notifications")}
                      >
                        <span>Send Notifications</span>
                      </button>

                      <button
                        className="cmdash-secondary-action-btn"
                        onClick={() => setActiveTab("analytics")}
                      >
                        <span>View Analytics</span>
                      </button>

                      <button
                        className="cmdash-secondary-action-btn"
                        onClick={() => setActiveTab("profile")}
                      >
                        <span>Profile Settings</span>
                      </button>
                    </div>

                    <div className="cmdash-dots-row">
                      {slides.map((_, index) => (
                        <span
                          key={index}
                          className={
                            currentSlide === index
                              ? "cmdash-dot-item active"
                              : "cmdash-dot-item"
                          }
                          onClick={() => setCurrentSlide(index)}
                        ></span>
                      ))}
                    </div>
                  </div>

                  <button
                    className="cmdash-arrow-btn cmdash-arrow-left"
                    onClick={prevSlide}
                  >
                    <FiChevronLeft />
                  </button>

                  <button
                    className="cmdash-arrow-btn cmdash-arrow-right"
                    onClick={nextSlide}
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </section>

              {!loadingComplaints && totalComplaintNotifications > 0 && (
                <section className="cmdash-complaint-alert-section">
                  <div className="cmdash-complaint-alert-card">
                    <div className="cmdash-complaint-alert-left">
                      <div className="cmdash-complaint-alert-icon">
                        <FaComments />
                      </div>

                      <div className="cmdash-complaint-alert-texts">
                        <span className="cmdash-complaint-alert-badge">
                          Complaint Notification
                        </span>

                        <h3>
                          {totalComplaintNotifications} complaint(s) need attention
                        </h3>

                        <p>
                          Pending complaints:{" "}
                          {pendingComplaints
                            .slice(0, 4)
                            .map(
                              (item) =>
                                item.subject || item.category || "Complaint"
                            )
                            .join(", ")}
                          {pendingComplaints.length > 4 ? " ..." : ""}
                        </p>
                      </div>
                    </div>

                    <button
                      className="cmdash-complaint-alert-btn"
                      onClick={() => setActiveTab("feedback")}
                    >
                      View Complaints
                    </button>
                  </div>
                </section>
              )}

              <div className="cmdash-stats-grid-box">
                <div
                  className="cmdash-stat-card-box"
                  onClick={() => setActiveTab("customers")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="cmdash-stat-icon-box cmdash-green-tone">
                    <FaUsers />
                  </div>
                  <div>
                    <p className="cmdash-stat-label-text">Customers</p>
                    <h3 className="cmdash-stat-main-text">Manage Accounts</h3>
                  </div>
                </div>

                <div
                  className="cmdash-stat-card-box"
                  onClick={() => setActiveTab("orders")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="cmdash-stat-icon-box cmdash-orange-tone">
                    <FaClipboardList />
                  </div>
                  <div>
                    <p className="cmdash-stat-label-text">Orders</p>
                    <h3 className="cmdash-stat-main-text">Track Requests</h3>
                  </div>
                </div>

                <div
                  className="cmdash-stat-card-box"
                  onClick={() => setActiveTab("feedback")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="cmdash-stat-icon-box cmdash-green-tone">
                    <FaComments />
                  </div>
                  <div>
                    <p className="cmdash-stat-label-text">Complaints</p>
                    <h3 className="cmdash-stat-main-text">
                      {totalComplaintNotifications > 0
                        ? `${totalComplaintNotifications} Pending`
                        : "Reply to Issues"}
                    </h3>
                  </div>
                </div>

                <div
                  className="cmdash-stat-card-box"
                  onClick={() => setActiveTab("notifications")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="cmdash-stat-icon-box cmdash-orange-tone">
                    <FaBell />
                  </div>
                  <div>
                    <p className="cmdash-stat-label-text">Notifications</p>
                    <h3 className="cmdash-stat-main-text">Send Updates</h3>
                  </div>
                </div>

                <div
                  className="cmdash-stat-card-box"
                  onClick={() => setActiveTab("analytics")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="cmdash-stat-icon-box cmdash-green-tone">
                    <FaChartLine />
                  </div>
                  <div>
                    <p className="cmdash-stat-label-text">Analytics</p>
                    <h3 className="cmdash-stat-main-text">View Insights</h3>
                  </div>
                </div>

                <div
                  className="cmdash-stat-card-box"
                  onClick={() => setActiveTab("profile")}
                  style={{ cursor: "pointer" }}
                >
                  <div className="cmdash-stat-icon-box cmdash-orange-tone">
                    <FaCheckCircle />
                  </div>
                  <div>
                    <p className="cmdash-stat-label-text">Profile</p>
                    <h3 className="cmdash-stat-main-text">Security Settings</h3>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="cmdash-panel-main-box">
            {activeTab === "overview" && <CustomerManagerOverviewContent />}
            {activeTab === "customers" && <CustomersContent />}
            {activeTab === "orders" && <OrdersContent />}
            {activeTab === "feedback" && <FeedbackContent />}
            {activeTab === "notifications" && <NotificationsContent />}
            {activeTab === "analytics" && <AnalyticsContent />}
            {activeTab === "profile" && <ProfileContent />}
          </div>
        </div>
      </main>
    </div>
  );
}