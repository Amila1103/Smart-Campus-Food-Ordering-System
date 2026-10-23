import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaClipboardList,
  FaChartLine,
  FaHistory,
  FaCheckDouble,
  FaTruck,
  FaMapMarkedAlt,
  FaMotorcycle,
} from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import DeliverySidebar from "../DeliverySlider/DeliverySlider";
import DeliveryAssignedDeliveries from "../DeliveryAssignedDeliveries/DeliveryAssignedDeliveries";
import MyFinishDelivery from "../MyFinishDelivery/MyFinishDelivery";
import DeliveryProfile from "../DeliveryProfile/DeliveryProfile";
import DeliveryAnalysis from "../DeliveryAnalysis/DeliveryAnalysis";
import DeliveryHistory from "../DeliveryHistory/DeliveryHistory";
import DeliveryOverviewContent from "../DeliveryOverviewContent/DeliveryOverviewContent";
import "./DeliveryDashboard.css";
import logo from "../../../Website/image/logo.png";
import deliverySliderImage from "../../../Website/image/hero1.avif";

const DeliveryOverview = ({
  setActiveTab,
  slides,
  currentSlide,
  prevSlide,
  nextSlide,
  setCurrentSlide,
}) => (
  <>
    <section className="deliverydash-slider-section">
      <div className="deliverydash-slider-card">
        <div className="deliverydash-slider-image-side">
          <img
            src={deliverySliderImage}
            alt="Delivery dashboard visual"
            className="deliverydash-slider-image"
          />
        </div>

        <div className="deliverydash-slider-content-side">
          <div className="deliverydash-brand-row">
            <div className="deliverydash-brand-icon-box">
              <img
                src={logo}
                alt="System logo"
                className="deliverydash-brand-logo-img"
              />
            </div>

            <div className="deliverydash-brand-text-box">
              <h3>Campus Canteen</h3>
              <span>Delivery Operations Panel</span>
            </div>
          </div>

          <span className="deliverydash-slide-badge">
            {slides[currentSlide].badge}
          </span>

          <h2 className="deliverydash-slide-title">
            {slides[currentSlide].title}
          </h2>

          <p className="deliverydash-slide-text">
            {slides[currentSlide].text}
          </p>

          <div className="deliverydash-slide-action-row">
            <button
              className="deliverydash-primary-action-btn"
              onClick={() => setActiveTab("assignedDeliveries")}
            >
              <FaTruck />
              <span>Assigned Deliveries</span>
            </button>

            <button
              className="deliverydash-secondary-action-btn"
              onClick={() => setActiveTab("completedTrips")}
            >
              <span>My Finished Deliveries</span>
            </button>

            <button
              className="deliverydash-secondary-action-btn"
              onClick={() => setActiveTab("analysis")}
            >
              <span>View Analysis</span>
            </button>

            <button
              className="deliverydash-secondary-action-btn"
              onClick={() => setActiveTab("history")}
            >
              <span>View History</span>
            </button>
          </div>

          <div className="deliverydash-dots-row">
            {slides.map((_, index) => (
              <span
                key={index}
                className={
                  currentSlide === index
                    ? "deliverydash-dot-item active"
                    : "deliverydash-dot-item"
                }
                onClick={() => setCurrentSlide(index)}
              ></span>
            ))}
          </div>
        </div>

        <button
          className="deliverydash-arrow-btn deliverydash-arrow-left"
          onClick={prevSlide}
        >
          <FiChevronLeft />
        </button>

        <button
          className="deliverydash-arrow-btn deliverydash-arrow-right"
          onClick={nextSlide}
        >
          <FiChevronRight />
        </button>
      </div>
    </section>

    <div className="deliverydash-stats-grid-box">
      <div className="deliverydash-stat-card-box">
        <div className="deliverydash-stat-icon-box deliverydash-green-tone">
          <FaTruck />
        </div>
        <div>
          <p className="deliverydash-stat-label-text">Deliveries</p>
          <h3 className="deliverydash-stat-main-text">Assigned Orders</h3>
        </div>
      </div>

      <div className="deliverydash-stat-card-box">
        <div className="deliverydash-stat-icon-box deliverydash-orange-tone">
          <FaCheckDouble />
        </div>
        <div>
          <p className="deliverydash-stat-label-text">Completed</p>
          <h3 className="deliverydash-stat-main-text">Finished Trips</h3>
        </div>
      </div>

      <div className="deliverydash-stat-card-box">
        <div className="deliverydash-stat-icon-box deliverydash-green-tone">
          <FaChartLine />
        </div>
        <div>
          <p className="deliverydash-stat-label-text">Analysis</p>
          <h3 className="deliverydash-stat-main-text">Delivery Insights</h3>
        </div>
      </div>

      <div className="deliverydash-stat-card-box">
        <div className="deliverydash-stat-icon-box deliverydash-orange-tone">
          <FaHistory />
        </div>
        <div>
          <p className="deliverydash-stat-label-text">History</p>
          <h3 className="deliverydash-stat-main-text">Past Records</h3>
        </div>
      </div>

      <div className="deliverydash-stat-card-box">
        <div className="deliverydash-stat-icon-box deliverydash-green-tone">
          <FaClipboardList />
        </div>
        <div>
          <p className="deliverydash-stat-label-text">Orders</p>
          <h3 className="deliverydash-stat-main-text">Track Status</h3>
        </div>
      </div>

      <div className="deliverydash-stat-card-box">
        <div className="deliverydash-stat-icon-box deliverydash-orange-tone">
          <FaMapMarkedAlt />
        </div>
        <div>
          <p className="deliverydash-stat-label-text">Routes</p>
          <h3 className="deliverydash-stat-main-text">Delivery Locations</h3>
        </div>
      </div>

      <div className="deliverydash-stat-card-box">
        <div className="deliverydash-stat-icon-box deliverydash-green-tone">
          <FaMotorcycle />
        </div>
        <div>
          <p className="deliverydash-stat-label-text">Rider</p>
          <h3 className="deliverydash-stat-main-text">My Performance</h3>
        </div>
      </div>
    </div>
  </>
);

const DeliveryTracking = () => (
  <div className="deliverydash-placeholder-box">Tracking Content</div>
);

export default function DeliveryDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: "Delivery Control",
      title: "Manage Assigned Deliveries Efficiently",
      text: "Track assigned deliveries, complete orders on time, and stay updated with delivery activity through one simple and professional dashboard.",
    },
    {
      badge: "Delivery Insights",
      title: "Monitor Your Work and Improve Performance",
      text: "Review finished deliveries, check delivery analysis, and understand your order trends, revenue, and work progress from one place.",
    },
    {
      badge: "History & Records",
      title: "Keep Every Delivery Organized",
      text: "Access your delivery history, completed trips, and performance records with a clean modern interface built for fast daily use.",
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

      if (!staff || staff.role?.toLowerCase() !== "delivery") {
        alert("Access denied!");
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

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="deliverydash-layout-shell">
      <DeliverySidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="deliverydash-main-area">
        <div className="deliverydash-content-wrap">
          <div className="deliverydash-topbar-row">
            <div className="deliverydash-topbar-texts">
              <h1 className="deliverydash-main-title">Delivery Dashboard</h1>
              <p className="deliverydash-main-subtitle">
                Manage assigned deliveries, finished deliveries, analysis,
                history, and profile from one place.
              </p>
            </div>

            <button
              className="deliverydash-profile-round-btn"
              onClick={() => setActiveTab("profile")}
              title="Delivery Profile"
            >
              <FaUserCircle />
            </button>
          </div>

          {activeTab === "overview" && (
            <>
              <DeliveryOverview
                setActiveTab={setActiveTab}
                slides={slides}
                currentSlide={currentSlide}
                prevSlide={prevSlide}
                nextSlide={nextSlide}
                setCurrentSlide={setCurrentSlide}
              />

              <div className="deliverydash-panel-main-box">
                <DeliveryOverviewContent />
              </div>
            </>
          )}

          {activeTab === "assignedDeliveries" && (
            <div className="deliverydash-panel-main-box">
              <DeliveryAssignedDeliveries />
            </div>
          )}

          {activeTab === "completedTrips" && (
            <div className="deliverydash-panel-main-box">
              <MyFinishDelivery />
            </div>
          )}

          {activeTab === "tracking" && (
            <div className="deliverydash-panel-main-box">
              <DeliveryTracking />
            </div>
          )}

          {activeTab === "analysis" && (
            <div className="deliverydash-panel-main-box">
              <DeliveryAnalysis />
            </div>
          )}

          {activeTab === "history" && (
            <div className="deliverydash-panel-main-box">
              <DeliveryHistory />
            </div>
          )}

          {activeTab === "profile" && (
            <div className="deliverydash-panel-main-box">
              <DeliveryProfile />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}