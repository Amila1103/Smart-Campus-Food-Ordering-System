import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerManagerSidebar.css";
import logo from "../../../Website/image/logo.png";
import {
  FaHome,
  FaUsers,
  FaClipboardList,
  FaComments,
  FaBell,
  FaChartLine,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";

const API_BASE = "http://localhost:5000";

export default function CustomerManagerSidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const activeStaff = JSON.parse(
        localStorage.getItem("activeStaff") || "null"
      );
      const staff = JSON.parse(localStorage.getItem("staff") || "null");

      const staffId =
        activeStaff?._id || activeStaff?.id || staff?._id || staff?.id;

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
      className={`cmdside-sidebar ${sidebarOpen ? "open" : "close"}`}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
    >
      <div className="cmdside-sidebar-header">
        <img src={logo} alt="logo" />
        <h2 className={sidebarOpen ? "cmdside-show" : "cmdside-hide"}>
          Customer Manager
        </h2>
      </div>

      <div className="cmdside-sidebar-menu">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          <FaHome className="cmdside-menu-icon" />
          <span className={sidebarOpen ? "cmdside-show" : "cmdside-hide"}>
            Overview
          </span>
        </button>

        <button
          className={activeTab === "customers" ? "active" : ""}
          onClick={() => setActiveTab("customers")}
        >
          <FaUsers className="cmdside-menu-icon" />
          <span className={sidebarOpen ? "cmdside-show" : "cmdside-hide"}>
            Customers
          </span>
        </button>

        <button
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          <FaClipboardList className="cmdside-menu-icon" />
          <span className={sidebarOpen ? "cmdside-show" : "cmdside-hide"}>
            Orders
          </span>
        </button>

        <button
          className={activeTab === "feedback" ? "active" : ""}
          onClick={() => setActiveTab("feedback")}
        >
          <FaComments className="cmdside-menu-icon" />
          <span className={sidebarOpen ? "cmdside-show" : "cmdside-hide"}>
            Complaints
          </span>
        </button>

        

        <button
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          <FaChartLine className="cmdside-menu-icon" />
          <span className={sidebarOpen ? "cmdside-show" : "cmdside-hide"}>
            Analytics
          </span>
        </button>

        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          <FaUserCircle className="cmdside-menu-icon" />
          <span className={sidebarOpen ? "cmdside-show" : "cmdside-hide"}>
            Profile
          </span>
        </button>
      </div>

      <div className="cmdside-sidebar-logout">
        <button className="cmdside-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="cmdside-logout-icon" />
          <span className={sidebarOpen ? "cmdside-show" : "cmdside-hide"}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}