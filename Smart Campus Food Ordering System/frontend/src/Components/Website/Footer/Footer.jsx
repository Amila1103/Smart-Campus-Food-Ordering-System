import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="uf-footer">
      <div className="uf-footer-overlay"></div>

      <div className="uf-footer-top">
        <div className="uf-footer-brand">
          <h2>Campus Canteen</h2>
          <p>
            Fresh meals, quick service, and a student-friendly ordering
            experience made for busy campus life.
          </p>

          <div className="uf-footer-tags">
            <span>Fresh Daily</span>
            <span>Fast Service</span>
            <span>Student Friendly</span>
          </div>
        </div>

        <div className="uf-footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/UnHome">Home</Link></li>
            <li><Link to="/UNMenu">Menu</Link></li>
            <li><Link to="/UNContactUS">Contact Us</Link></li>
            <li><Link to="/UnAboutUs">About Us</Link></li>
          </ul>
        </div>

        <div className="uf-footer-contact">
          <h3>Contact Info</h3>
          <p><strong>Email:</strong> campuscanteen@gmail.com</p>
          <p><strong>Phone:</strong> +94 71 234 5678</p>
          <p><strong>Location:</strong> Main Campus, Student Food Court</p>
        </div>

        <div className="uf-footer-hours">
          <h3>Opening Hours</h3>
          <p>Monday - Friday: 7:30 AM - 7:00 PM</p>
          <p>Saturday: 8:00 AM - 4:00 PM</p>
          <p>Sunday: Closed</p>
        </div>
      </div>

      <div className="uf-footer-bottom">
        <p>© 2026 Campus Canteen. All Rights Reserved.</p>
        <span>Fresh • Fast • Friendly</span>
      </div>
    </footer>
  );
}