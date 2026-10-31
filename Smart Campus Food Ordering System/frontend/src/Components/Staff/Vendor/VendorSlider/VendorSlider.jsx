import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./VendorSlider.css";
import logo from "../../../Website/image/logo.png";
import {
  FaStore,
  FaClipboardList,
  FaCheckCircle,
  FaBoxes,
  FaMoneyBillWave,
  FaChartLine,
  FaHistory,
  FaSignOutAlt,
  FaShoppingBag,
  FaUtensils,
  FaCommentDots,
} from "react-icons/fa";

const API_BASE = "http://localhost:5000";

export default function VendorSidebar({
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
      className={`vendor-sidebar ${sidebarOpen ? "open" : "close"}`}
      onMouseEnter={() => setSidebarOpen(true)}
      onMouseLeave={() => setSidebarOpen(false)}
    >
      <div className="vendor-sidebar-header">
        <img src={logo} alt="logo" />
        <h2 className={sidebarOpen ? "vendor-show" : "vendor-hide"}>
          Vendor Panel
        </h2>
      </div>

      <div className="vendor-sidebar-menu">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          <FaStore className="vendor-menu-icon" />
          <span className={sidebarOpen ? "vendor-show" : "vendor-hide"}>
            Overview
          </span>
        </button>

        <button
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          <FaClipboardList className="vendor-menu-icon" />
          <span className={sidebarOpen ? "vendor-show" : "vendor-hide"}>
            Orders
          </span>
        </button>

        <button
          className={activeTab === "completedOrders" ? "active" : ""}
          onClick={() => setActiveTab("completedOrders")}
        >
          <FaCheckCircle className="vendor-menu-icon" />
          <span className={sidebarOpen ? "vendor-show" : "vendor-hide"}>
            Completed Orders
          </span>
        </button>

        <button
          className={activeTab === "completedOrdersTakeaway" ? "active" : ""}
          onClick={() => setActiveTab("completedOrdersTakeaway")}
        >
          <FaShoppingBag className="vendor-menu-icon" />
          <span className={sidebarOpen ? "vendor-show" : "vendor-hide"}>
            Takeaway Completed
          </span>
        </button>

        <button
          className={activeTab === "menuList" ? "active" : ""}
          onClick={() => setActiveTab("menuList")}
        >
          <FaUtensils className="vendor-menu-icon" />
          <span className={sidebarOpen ? "vendor-show" : "vendor-hide"}>
            Menu List
          </span>
        </button>

        <button
          className={activeTab === "inventory" ? "active" : ""}
          onClick={() => setActiveTab("inventory")}
        >
          <FaBoxes className="vendor-menu-icon" />
          <span className={sidebarOpen ? "vendor-show" : "vendor-hide"}>
            Inventory
          </span>
        </button>

        <button
          className={activeTab === "complaints" ? "active" : ""}
          onClick={() => setActiveTab("complaints")}
        >
          <FaCommentDots className="vendor-menu-icon" />
          <span className={sidebarOpen ? "vendor-show" : "vendor-hide"}>
            Complaints
          </span>
        </button>

        <button
          className={activeTab === "earnings" ? "active" : ""}
          onClick={() => setActiveTab("earnings")}
        >
          <FaMoneyBillWave className="vendor-menu-icon" />
          <span className={sidebarOpen ? "vendor-show" : "vendor-hide"}>
            Earnings
          </span>
        </button>

        <button
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          <FaChartLine className="vendor-menu-icon" />
          <span className={sidebarOpen ? "vendor-show" : "vendor-hide"}>
            Analytics
          </span>
        </button>

        <button
          className={activeTab === "history" ? "active" : ""}
          onClick={() => setActiveTab("history")}
        >
          <FaHistory className="vendor-menu-icon" />
          <span className={sidebarOpen ? "vendor-show" : "vendor-hide"}>
            History
          </span>
        </button>
      </div>

      <div className="vendor-sidebar-logout">
        <button className="vendor-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="vendor-logout-icon" />
          <span className={sidebarOpen ? "vendor-show" : "vendor-hide"}>
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}