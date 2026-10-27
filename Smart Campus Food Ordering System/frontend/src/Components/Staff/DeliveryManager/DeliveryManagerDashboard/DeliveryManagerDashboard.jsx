import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaTruck,
  FaClipboardCheck,
  FaUsers,
  FaChartLine,
  FaBell,
  FaExclamationCircle,
  FaFileAlt,
} from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import DeliveryManagerSidebar from "../DeliveryManagerSlider/DeliveryManagerSlider";
import "./DeliveryManagerDashboard.css";

import logo from "../../../Website/image/logo.png";
import sliderBgImage from "../../../Website/image/hero1.avif";

import DeliveryManagerOverview from "../DeliveryManagerOverview/DeliveryManagerOverview";
import DeliveryManagerCompletedOrders from "../DeliveryManagerCompletedOrders/DeliveryManagerCompletedOrders";
import DeliveryManagerTakenOrders from "../DeliveryManagerTakenOrders/DeliveryManagerTakenOrders";
import DeliveryManagerDrivers from "../DeliveryManagerDrivers/DeliveryManagerDrivers";
import DeliveryManagerAnalytics from "../DeliveryManagerAnalytics/DeliveryManagerAnalytics";
import DeliveryManagerHistory from "../DeliveryManagerHistory/DeliveryManagerHistory";
import DeliveryManagerProfile from "../DeliveryManagerProfile/DeliveryManagerProfile";
import DeliveryManagerApplications from "../DeliveryManagerApplications/DeliveryManagerApplications";
import DeliveryManagerComplaintManagement from "../DeliveryManagerComplaintManagement/DeliveryManagerComplaintManagement";

const API_BASE = "http://localhost:5000";

export default function DeliveryManagerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [applicationNotifications, setApplicationNotifications] = useState([]);
  const [complaintNotifications, setComplaintNotifications] = useState([]);

  const notificationRef = useRef(null);

  const slides = [
    {
      badge: "Delivery Control Center",
      title: "Manage Deliveries Smoothly",
      text: "Track active orders, monitor drivers, review applications, and manage delivery operations from one clean dashboard.",
    },
    {
      badge: "Operations Overview",
      title: "Monitor Orders and Driver Activity",
      text: "Stay updated with taken orders, completed deliveries, staff performance, and real-time activity in one place.",
    },
    {
      badge: "Analytics Dashboard",
      title: "Smart Delivery Management",
      text: "Review delivery history, check revenue insights, manage driver details, and improve daily performance efficiently.",
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

      if (!staff || staff.role?.toLowerCase() !== "delivery manager") {
        alert("Access denied!");
        navigate("/staff-login", { replace: true });
      }
    } catch (error) {
      localStorage.removeItem("staff");
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
    fetchDashboardNotifications();

    const interval = setInterval(() => {
      fetchDashboardNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const fetchDashboardNotifications = async () => {
    try {
      const [applicationsRes, complaintsRes] = await Promise.all([
        axios.get(`${API_BASE}/delivery-job-applications`),
        axios.get(`${API_BASE}/complaints`),
      ]);

      const applications = Array.isArray(applicationsRes.data?.applications)
        ? applicationsRes.data.applications
        : [];

      const complaints = Array.isArray(complaintsRes.data?.complaints)
        ? complaintsRes.data.complaints
        : [];

      const pendingApplications = applications
        .filter(
          (app) =>
            String(app.applicationStatus || "Pending").toLowerCase() === "pending"
        )
        .map((app) => ({
          id: app._id,
          type: "application",
          title: "New delivery application received",
          description: `${app.fullName || "Unknown applicant"} applied as delivery staff`,
          time: app.createdAt,
          status: app.applicationStatus || "Pending",
        }));

      const lateDeliveryComplaints = complaints
        .filter((item) => {
          const category = String(item.category || "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");
          const status = String(item.status || "Pending").toLowerCase();

          return (
            category === "late delivery" &&
            (status === "pending" || status === "in progress")
          );
        })
        .map((item) => ({
          id: item._id,
          type: "complaint",
          title: "Late delivery complaint received",
          description: `${item.fullName || "Customer"} - ${item.subject || "Complaint submitted"}`,
          time: item.createdAt,
          status: item.status || "Pending",
        }));

      setApplicationNotifications(pendingApplications);
      setComplaintNotifications(lateDeliveryComplaints);
    } catch (error) {
      console.log("fetchDashboardNotifications error:", error);
      setApplicationNotifications([]);
      setComplaintNotifications([]);
    }
  };

  const allNotifications = useMemo(() => {
    return [...applicationNotifications, ...complaintNotifications].sort(
      (a, b) => new Date(b.time || 0) - new Date(a.time || 0)
    );
  }, [applicationNotifications, complaintNotifications]);

  const totalNotificationCount = allNotifications.length;

  const formatNotificationTime = (value) => {
    if (!value) return "Just now";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";
    return date.toLocaleString();
  };

  const handleNotificationClick = (item) => {
    setNotificationsOpen(false);

    if (item.type === "application") {
      setActiveTab("applications");
      return;
    }

    if (item.type === "complaint") {
      setActiveTab("complaints");
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="dmanager-layout">
      <DeliveryManagerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="dmanager-main">
        <div className="dmanager-content">
          <div className="dmanager-topbar">
            <div className="dmanager-topbar-text">
              <h1 className="dmanager-title">Delivery Manager Dashboard</h1>
              <p className="dmanager-subtitle">
                Manage delivery operations, drivers, complaints, analytics, and
                reports
              </p>
            </div>

            <div className="dmanager-topbar-actions">
              <div className="dmanager-notification-wrap" ref={notificationRef}>
                <button
                  className="dmanager-notification-btn"
                  onClick={() => setNotificationsOpen((prev) => !prev)}
                  title="Notifications"
                >
                  <FaBell />
                  {totalNotificationCount > 0 && (
                    <span className="dmanager-notification-badge">
                      {totalNotificationCount > 99 ? "99+" : totalNotificationCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="dmanager-notification-dropdown">
                    <div className="dmanager-notification-header">
                      <h3>Notifications</h3>
                      <span>{totalNotificationCount} New</span>
                    </div>

                    {allNotifications.length === 0 ? (
                      <div className="dmanager-notification-empty">
                        No new notifications
                      </div>
                    ) : (
                      <div className="dmanager-notification-list">
                        {allNotifications.map((item) => (
                          <button
                            key={`${item.type}-${item.id}`}
                            className="dmanager-notification-item"
                            onClick={() => handleNotificationClick(item)}
                          >
                            <div
                              className={`dmanager-notification-icon ${
                                item.type === "complaint"
                                  ? "complaint"
                                  : "application"
                              }`}
                            >
                              {item.type === "complaint" ? (
                                <FaExclamationCircle />
                              ) : (
                                <FaFileAlt />
                              )}
                            </div>

                            <div className="dmanager-notification-content">
                              <h4>{item.title}</h4>
                              <p>{item.description}</p>
                              <span>
                                {item.status} • {formatNotificationTime(item.time)}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                className="dmanager-profile-icon-btn"
                onClick={() => setActiveTab("profile")}
                title="Delivery Manager Profile"
              >
                <FaUserCircle />
              </button>
            </div>
          </div>

          <section className="dmslider-section">
            <div className="dmslider-card">
              <div className="dmslider-image-wrap">
                <img
                  src={sliderBgImage}
                  alt="Delivery manager dashboard visual"
                  className="dmslider-side-image"
                />
              </div>

              <div className="dmslider-content">
                <div className="dmslider-brand">
                  <div className="dmslider-brand-icon">
                    <img
                      src={logo}
                      alt="Campus Canteen Logo"
                      className="dmslider-brand-logo"
                    />
                  </div>

                  <div className="dmslider-brand-text">
                    <h3>Campus Canteen</h3>
                    <span>Delivery Manager Panel</span>
                  </div>
                </div>

                <span className="dmslider-badge">
                  {slides[currentSlide].badge}
                </span>

                <h2>{slides[currentSlide].title}</h2>
                <p>{slides[currentSlide].text}</p>

                <div className="dmslider-actions">
                  <button
                    className="dmslider-primary-btn"
                    onClick={() => setActiveTab("assignedOrders")}
                  >
                    <FaTruck />
                    <span>View Taken Orders</span>
                  </button>

                  <button
                    className="dmslider-secondary-btn"
                    onClick={() => setActiveTab("analytics")}
                  >
                    <span>View Analytics</span>
                  </button>
                </div>

                <div className="dmslider-dots">
                  {slides.map((_, index) => (
                    <span
                      key={index}
                      className={
                        currentSlide === index
                          ? "dmslider-dot active"
                          : "dmslider-dot"
                      }
                      onClick={() => setCurrentSlide(index)}
                    ></span>
                  ))}
                </div>
              </div>

              <button className="dmslider-arrow left" onClick={prevSlide}>
                <FiChevronLeft />
              </button>

              <button className="dmslider-arrow right" onClick={nextSlide}>
                <FiChevronRight />
              </button>
            </div>
          </section>

          <div className="dmanager-stats-grid">
            <div className="dmanager-stat-card">
              <div className="dmanager-stat-icon green">
                <FaClipboardCheck />
              </div>
              <div>
                <p className="dmanager-stat-label">Overview</p>
                <h3 className="dmanager-stat-value">Live Dashboard</h3>
              </div>
            </div>

            <div className="dmanager-stat-card">
              <div className="dmanager-stat-icon orange">
                <FaTruck />
              </div>
              <div>
                <p className="dmanager-stat-label">Applications</p>
                <h3 className="dmanager-stat-value">Manage Staff Requests</h3>
              </div>
            </div>

            <div className="dmanager-stat-card">
              <div className="dmanager-stat-icon green">
                <FaUsers />
              </div>
              <div>
                <p className="dmanager-stat-label">Drivers</p>
                <h3 className="dmanager-stat-value">Track Team Status</h3>
              </div>
            </div>

            <div className="dmanager-stat-card">
              <div className="dmanager-stat-icon orange">
                <FaChartLine />
              </div>
              <div>
                <p className="dmanager-stat-label">Analytics</p>
                <h3 className="dmanager-stat-value">Delivery Insights</h3>
              </div>
            </div>
          </div>

          <div className="dmanager-panel-wrapper">
            {activeTab === "overview" && <DeliveryManagerOverview />}
            {activeTab === "deliveries" && <DeliveryManagerCompletedOrders />}
            {activeTab === "assignedOrders" && <DeliveryManagerTakenOrders />}
            {activeTab === "drivers" && <DeliveryManagerDrivers />}
            {activeTab === "complaints" && (
              <DeliveryManagerComplaintManagement />
            )}
            {activeTab === "analytics" && <DeliveryManagerAnalytics />}
            {activeTab === "history" && <DeliveryManagerHistory />}
            {activeTab === "applications" && <DeliveryManagerApplications />}
            {activeTab === "profile" && <DeliveryManagerProfile />}
          </div>
        </div>
      </main>
    </div>
  );
}