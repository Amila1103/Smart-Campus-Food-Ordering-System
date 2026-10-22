import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiShoppingCart,
  FiBell,
  FiUser,
  FiLogOut,
  FiCheckCircle,
  FiMessageSquare,
  FiClock,
} from "react-icons/fi";
import logo from "../../image/logo.png";
import "./RegisterNavbar.css";

const API_BASE = "http://localhost:5000";

export default function RegisterNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setMenuOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const storedCart = JSON.parse(localStorage.getItem("cartItems")) || [];

      const totalQty = storedCart.reduce((sum, item) => {
        return sum + Number(item.qty || 1);
      }, 0);

      setCartCount(totalQty);
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const customer = JSON.parse(localStorage.getItem("customer")) || {};
      const customerId = customer?._id || customer?.id;

      if (!customerId) {
        setNotifications([]);
        setNotificationCount(0);
        return;
      }

      const res = await axios.get(
        `${API_BASE}/complaints/customer/${customerId}/reply-notifications`
      );

      setNotifications(res.data?.notifications || []);
      setNotificationCount(res.data?.unreadCount || 0);
    } catch (err) {
      console.log("Fetch notifications error:", err);
      setNotifications([]);
      setNotificationCount(0);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    window.addEventListener("complaintReplyUpdated", fetchNotifications);

    return () => {
      window.removeEventListener("complaintReplyUpdated", fetchNotifications);
    };
  }, []);

  const handleNotificationToggle = async () => {
    const nextState = !notificationOpen;
    setNotificationOpen(nextState);

    if (!notificationOpen) {
      await fetchNotifications();
    }
  };

  const markOneAsRead = async (complaintId) => {
    try {
      await axios.put(`${API_BASE}/complaints/reply-notification/${complaintId}/read`);
      await fetchNotifications();
    } catch (err) {
      console.log("Mark one as read error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const customer = JSON.parse(localStorage.getItem("customer")) || {};
      const customerId = customer?._id || customer?.id;

      if (!customerId) return;

      await axios.put(
        `${API_BASE}/complaints/customer/${customerId}/reply-notifications/read-all`
      );

      await fetchNotifications();
    } catch (err) {
      console.log("Mark all as read error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      const customer = JSON.parse(localStorage.getItem("customer"));

      if (customer?._id) {
        await axios.post(`http://localhost:5000/Customers/logout/${customer._id}`);
      }
    } catch (err) {
      console.log("Logout error:", err);
    } finally {
      localStorage.removeItem("customer");
      setMenuOpen(false);
      setNotificationOpen(false);
      navigate("/customer-Logout");
    }
  };

  return (
    <nav className="rc-navbar">
      <div className="rc-navbar-left">
        <Link to="/RegisterHome" className="rc-logo-wrap">
          <img src={logo} alt="Campus Canteen Logo" className="rc-logo" />
          <div className="rc-brand-text">
            <h2>Campus Canteen</h2>
            <span>Fresh • Fast • Friendly</span>
          </div>
        </Link>
      </div>

      <ul className="rc-nav-links">
        <li>
          <Link to="/RegisterHome">Home</Link>
        </li>
        <li>
          <Link to="/RegisterUserMenu">Menu</Link>
        </li>
        <li>
          <Link to="/RegisterUserAboutUs">About Us</Link>
        </li>
        <li>
          <Link to="/RegisterUserContactUS">Contact Us</Link>
        </li>
        <li>
          <Link to="/RegisterUserComplain">Complain</Link>
        </li>
      </ul>

      <div className="rc-navbar-right">
        <div className="rc-notification-area" ref={notificationRef}>
          <button
            type="button"
            className="rc-icon-link rc-notification-btn"
            onClick={handleNotificationToggle}
          >
            <div className="rc-notification-wrap">
              <FiBell className="rc-nav-icon" />
              {notificationCount > 0 && (
                <span className="rc-notification-badge">{notificationCount}</span>
              )}
            </div>
          </button>

          {notificationOpen && (
            <div className="rc-notification-dropdown">
              <div className="rc-notification-header">
                <div>
                  <h4>Notifications</h4>
                  <p>Complaint replies</p>
                </div>

                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="rc-mark-all-btn"
                    onClick={markAllAsRead}
                  >
                    <FiCheckCircle />
                    Mark all
                  </button>
                )}
              </div>

              <div className="rc-notification-list">
                {loadingNotifications ? (
                  <div className="rc-notification-empty">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="rc-notification-empty">
                    No complaint replies yet.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      className={`rc-notification-item ${
                        item.replyNotificationRead ? "read" : "unread"
                      }`}
                      onClick={() => markOneAsRead(item._id)}
                    >
                      <div className="rc-notification-item-top">
                        <div className="rc-notification-subject">
                          <FiMessageSquare />
                          <span>{item.subject || "Complaint Reply"}</span>
                        </div>

                        {!item.replyNotificationRead && (
                          <span className="rc-notification-new">New</span>
                        )}
                      </div>

                      <div className="rc-notification-reply">
                        {item.adminReply || "You have received a reply."}
                      </div>

                      <div className="rc-notification-meta">
                        <span>{item.category || "General"}</span>
                        <span className="rc-notification-time">
                          <FiClock />
                          {item.repliedAt
                            ? new Date(item.repliedAt).toLocaleString()
                            : "No date"}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <Link to="/Cart" className="rc-icon-link">
          <div className="rc-cart-icon-wrap">
            <FiShoppingCart className="rc-nav-icon" />
            {cartCount > 0 && <span className="rc-cart-badge">{cartCount}</span>}
          </div>
        </Link>

        <div className="rc-profile-area" ref={profileRef}>
          <button
            className="rc-profile-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
          >
            <FiUser className="rc-profile-icon" />
          </button>

          {menuOpen && (
            <div className="rc-profile-dropdown">
              <Link
                to="/UserProfile"
                className="rc-dropdown-item"
                onClick={() => setMenuOpen(false)}
              >
                <FiUser className="rc-dropdown-icon" />
                <span>Profile</span>
              </Link>

              <button
                type="button"
                className="rc-dropdown-item rc-logout-item rc-logout-btn"
                onClick={handleLogout}
              >
                <FiLogOut className="rc-dropdown-icon" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}