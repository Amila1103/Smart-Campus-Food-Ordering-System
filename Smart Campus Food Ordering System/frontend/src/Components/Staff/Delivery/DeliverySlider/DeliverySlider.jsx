import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DeliverySlider.css";
import logo from "../../../Website/image/logo.png";
import {
  FaHome,
  FaTruck,
  FaClipboardCheck,
  FaHistory,
  FaUserCircle,
  FaSignOutAlt,
  FaChartLine,
} from "react-icons/fa";

const API_BASE = "http://localhost:5000";

export default function DeliverySidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const activeStaff = JSON.parse(localStorage.getItem("activeStaff") || "null");
      const staff = JSON.parse(localStorage.getItem("staff") || "null");

      const staffId = activeStaff?._id || activeStaff?.id || staff?._id || staff?.id;

      if (staffId) {
        await axios.post(`${API_BASE}/StaffLogout/${staffId}`);
      }
    } catch (error) {
      console.log("Logout update error:", error);
    } finally {
      localStorage.removeItem("activeStaff");
      localStorage.removeItem("staff");
      localStorage.removeItem("staffToken");
      navigate("/staff-login", { replace: true });
    }
  };

  return (
    <aside
      className={`delivery-sidebar ${sidebarOpen ? "open" : "close"}`}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
    >
      <div className="delivery-sidebar-header">
        <img src={logo} alt="logo" />
        <h2 className={sidebarOpen ? "delivery-show" : "delivery-hide"}>
          Delivery Panel
        </h2>
      </div>

      <div className="delivery-sidebar-menu">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          <FaHome className="delivery-menu-icon" />
          <span className={sidebarOpen ? "delivery-show" : "delivery-hide"}>
            Overview
          </span>
        </button>

        <button
          className={activeTab === "assignedDeliveries" ? "active" : ""}
          onClick={() => setActiveTab("assignedDeliveries")}
        >
          <FaTruck className="delivery-menu-icon" />
          <span className={sidebarOpen ? "delivery-show" : "delivery-hide"}>
            Assigned Deliveries
          </span>
        </button>

        <button
          className={activeTab === "completedTrips" ? "active" : ""}
          onClick={() => setActiveTab("completedTrips")}
        >
          <FaClipboardCheck className="delivery-menu-icon" />
          <span className={sidebarOpen ? "delivery-show" : "delivery-hide"}>
            My Finish Deliveries
          </span>
        </button>

        <button
          className={activeTab === "analysis" ? "active" : ""}
          onClick={() => setActiveTab("analysis")}
        >
          <FaChartLine className="delivery-menu-icon" />
          <span className={sidebarOpen ? "delivery-show" : "delivery-hide"}>
            Analysis
          </span>
        </button>

        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory className="delivery-menu-icon" />
          <span className={sidebarOpen ? "delivery-show" : "delivery-hide"}>
            History
          </span>
        </button>

        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          <FaUserCircle className="delivery-menu-icon" />
          <span className={sidebarOpen ? "delivery-show" : "delivery-hide"}>
            Profile
          </span>
        </button>
      </div>

      <div className="delivery-sidebar-logout">
        <button className="delivery-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="delivery-logout-icon" />
          <span className={sidebarOpen ? "delivery-show" : "delivery-hide"}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}