import React from "react";
import { Link } from "react-router-dom";
import logo from "../../image/logo.png";
import "./UnregisterNavbar.css";

export default function UnregisterNavbar() {
  return (
    <nav className="uc-navbar">
      <div className="uc-navbar-left">
        <Link to="/goUnregisterHome" className="uc-logo-wrap">
          <img src={logo} alt="Campus Canteen Logo" className="uc-logo" />
          <div className="uc-brand-text">
            <h2>Campus Canteen</h2>
            <span>Fresh • Fast • Friendly</span>
          </div>
        </Link>
      </div>

      <ul className="uc-nav-links">
        <li><Link to="/UnregisterHome">Home</Link></li>
        <li><Link to="/UNregisterMenu">Menu</Link></li>
        <li><Link to="/UNregisterContactUS">Contact Us</Link></li>
        <li><Link to="/UnregisterAboutUs">About Us</Link></li>
      </ul>

      <div className="uc-navbar-right">
        <Link to="/UNregisterlogin">
          <button className="uc-btn uc-login-btn">Login</button>
        </Link>

        <Link to="/UNRegisterRegister">
          <button className="uc-btn uc-register-btn">Register</button>
        </Link>
      </div>
    </nav>
  );
}