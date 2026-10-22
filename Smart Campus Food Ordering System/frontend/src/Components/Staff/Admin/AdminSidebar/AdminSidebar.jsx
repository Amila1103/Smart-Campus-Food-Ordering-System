import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminSidebar.css";
import logo from "../../../Website/image/logo.png";
import {
  FaHome,
  FaClipboardList,
  FaUsers,
  FaChartLine,
  FaHistory,
  FaUserCircle,
  FaSignOutAlt,
  FaCog,
  FaUserShield,
  FaCheckDouble,
  FaDollarSign,
  FaExclamationCircle,
  FaStore,
} from "react-icons/fa";

const API_BASE = "http://localhost:5000";

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const activeStaff = JSON.parse(
        localStorage.getItem("activeStaff") || "null",
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
      className={`adminside-sidebar ${sidebarOpen ? "open" : "close"}`}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
    >
      <div className="adminside-sidebar-header">
        <img src={logo} alt="logo" />
        <h2 className={sidebarOpen ? "adminside-show" : "adminside-hide"}>
          Admin Panel
        </h2>
      </div>

      <div className="adminside-sidebar-menu">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          <FaHome className="adminside-menu-icon" />
          <span className={sidebarOpen ? "adminside-show" : "adminside-hide"}>
            Overview
          </span>
        </button>

        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          <FaUsers className="adminside-menu-icon" />
          <span className={sidebarOpen ? "adminside-show" : "adminside-hide"}>
            Staff
          </span>
        </button>

        <button
          className={activeTab === "menuList" ? "active" : ""}
          onClick={() => setActiveTab("menuList")}
        >
          <FaClipboardList className="adminside-menu-icon" />
          <span className={sidebarOpen ? "adminside-show" : "adminside-hide"}>
            Menu List
          </span>
        </button>

        <button
          className={activeTab === "completedOrders" ? "active" : ""}
          onClick={() => setActiveTab("completedOrders")}
        >
          <FaCheckDouble className="adminside-menu-icon" />
          <span className={sidebarOpen ? "adminside-show" : "adminside-hide"}>
            Completed Orders
          </span>
        </button>

        <button
          className={activeTab === "payments" ? "active" : ""}
          onClick={() => setActiveTab("payments")}
        >
          <FaDollarSign className="adminside-menu-icon" />
          <span className={sidebarOpen ? "adminside-show" : "adminside-hide"}>
            Payments
          </span>
        </button>

        <button
          className={activeTab === "complaints" ? "active" : ""}
          onClick={() => setActiveTab("complaints")}
        >
          <FaExclamationCircle className="adminside-menu-icon" />
          <span className={sidebarOpen ? "adminside-show" : "adminside-hide"}>
            Complaints
          </span>
        </button>

        <button
          className={activeTab === "vendorPerformance" ? "active" : ""}
          onClick={() => setActiveTab("vendorPerformance")}
        >
          <FaStore className="adminside-menu-icon" />
          <span className={sidebarOpen ? "adminside-show" : "adminside-hide"}>
            Vendor Performance
          </span>
        </button>

        <button
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          <FaChartLine className="adminside-menu-icon" />
          <span className={sidebarOpen ? "adminside-show" : "adminside-hide"}>
            Analytics
          </span>
        </button>

        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          <FaUserCircle className="adminside-menu-icon" />
          <span className={sidebarOpen ? "adminside-show" : "adminside-hide"}>
            Profile
          </span>
        </button>
      </div>

      <div className="adminside-sidebar-logout">
        <button className="adminside-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="adminside-logout-icon" />
          <span className={sidebarOpen ? "adminside-show" : "adminside-hide"}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
