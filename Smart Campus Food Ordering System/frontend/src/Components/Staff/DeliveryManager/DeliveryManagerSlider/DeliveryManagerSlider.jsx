import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./DeliveryManagerSlider.css";
import logo from "../../../Website/image/logo.png";
import {
  FaHome,
  FaTruck,
  FaClipboardList,
  FaUsers,
  FaChartLine,
  FaHistory,
  FaUserCircle,
  FaSignOutAlt,
  FaFileAlt,
  FaCommentDots,
} from "react-icons/fa";

const API_BASE = "http://localhost:5000";

export default function DeliveryManagerSidebar({
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
      className={`dmanager-sidebar ${sidebarOpen ? "open" : "close"}`}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
    >
      <div className="dmanager-sidebar-header">
        <img src={logo} alt="logo" />
        <h2 className={sidebarOpen ? "dmanager-show" : "dmanager-hide"}>
          Delivery Manager
        </h2>
      </div>

      <div className="dmanager-sidebar-menu">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          <FaHome className="dmanager-menu-icon" />
          <span className={sidebarOpen ? "dmanager-show" : "dmanager-hide"}>
            Overview
          </span>
        </button>

        <button
          className={activeTab === "deliveries" ? "active" : ""}
          onClick={() => setActiveTab("deliveries")}
        >
          <FaTruck className="dmanager-menu-icon" />
          <span className={sidebarOpen ? "dmanager-show" : "dmanager-hide"}>
            Delivery Orders
          </span>
        </button>

        <button
          className={activeTab === "assignedOrders" ? "active" : ""}
          onClick={() => setActiveTab("assignedOrders")}
        >
          <FaClipboardList className="dmanager-menu-icon" />
          <span className={sidebarOpen ? "dmanager-show" : "dmanager-hide"}>
            Taken Orders
          </span>
        </button>

        <button
          className={activeTab === "drivers" ? "active" : ""}
          onClick={() => setActiveTab("drivers")}
        >
          <FaUsers className="dmanager-menu-icon" />
          <span className={sidebarOpen ? "dmanager-show" : "dmanager-hide"}>
            Drivers
          </span>
        </button>

        <button
          className={activeTab === "complaints" ? "active" : ""}
          onClick={() => setActiveTab("complaints")}
        >
          <FaCommentDots className="dmanager-menu-icon" />
          <span className={sidebarOpen ? "dmanager-show" : "dmanager-hide"}>
            Complaints
          </span>
        </button>

        <button
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          <FaChartLine className="dmanager-menu-icon" />
          <span className={sidebarOpen ? "dmanager-show" : "dmanager-hide"}>
            Analytics
          </span>
        </button>

        <button
          className={activeTab === "applications" ? "active" : ""}
          onClick={() => setActiveTab("applications")}
        >
          <FaFileAlt className="dmanager-menu-icon" />
          <span className={sidebarOpen ? "dmanager-show" : "dmanager-hide"}>
            Applications
          </span>
        </button>

        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory className="dmanager-menu-icon" />
          <span className={sidebarOpen ? "dmanager-show" : "dmanager-hide"}>
            History
          </span>
        </button>

        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          <FaUserCircle className="dmanager-menu-icon" />
          <span className={sidebarOpen ? "dmanager-show" : "dmanager-hide"}>
            Profile
          </span>
        </button>
      </div>

      <div className="dmanager-sidebar-logout">
        <button className="dmanager-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="dmanager-logout-icon" />
          <span className={sidebarOpen ? "dmanager-show" : "dmanager-hide"}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}