import React from "react";
import {
  FiUsers,
  FiHeart,
  FiShield,
  FiTarget,
  FiCheckCircle,
  FiStar,
} from "react-icons/fi";
import "./UnregisterAboutUS.css";
import UnregisterNavbar from "../../Navbar/UnregisterNavbar/UnregisterNavbar";
import Footer from "../../Footer/Footer";

export default function UnregisterAboutUS() {
  return (
    <div className="au-page">
      <UnregisterNavbar />

      <section className="au-hero">
        <div className="au-hero-overlay"></div>
        <div className="au-hero-content">
          <span className="au-badge">About Campus Canteen</span>
          <h1>Making Campus Food Easier and Smarter</h1>
          <p>
            Our system is designed to help students enjoy a simple, safe, and
            student-friendly food ordering experience on campus.
          </p>
        </div>
      </section>

      <section className="au-intro">
        <div className="au-container">
          <div className="au-intro-left">
            <span className="au-section-mini">Who We Are</span>
            <h2>A Modern Food Ordering Experience for Students</h2>
            <p>
              Campus Canteen is a smart food ordering platform created to make
              campus meal access faster, easier, and more comfortable for
              students. We focus on convenience, clean design, and a better user
              experience for everyday food ordering.
            </p>
            <p>
              Our goal is not only to provide food access, but also to support a
              more organized and reliable system where students can explore menu
              items, manage preferences, and enjoy a smoother canteen service.
            </p>
          </div>

          <div className="au-intro-right">
            <div className="au-stat-card">
              <h3>Fresh</h3>
              <p>Daily meal experience with simple digital access.</p>
            </div>
            <div className="au-stat-card">
              <h3>Fast</h3>
              <p>Easy browsing and quick ordering for busy students.</p>
            </div>
            <div className="au-stat-card">
              <h3>Friendly</h3>
              <p>Built with a student-focused and clean interface style.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="au-values">
        <div className="au-section-head">
          <span>Our Core Values</span>
          <h2>What Makes Our System Better</h2>
          <p>
            We focus on practical features that improve the student food
            ordering journey.
          </p>
        </div>

        <div className="au-values-grid">
          <div className="au-value-card">
            <div className="au-value-icon">
              <FiUsers />
            </div>
            <h3>Student Focused</h3>
            <p>
              The platform is designed for student needs, with simple navigation
              and clear features.
            </p>
          </div>

          <div className="au-value-card">
            <div className="au-value-icon">
              <FiHeart />
            </div>
            <h3>Better Experience</h3>
            <p>
              We aim to make food ordering more comfortable, smooth, and
              user-friendly.
            </p>
          </div>

          <div className="au-value-card">
            <div className="au-value-icon">
              <FiShield />
            </div>
            <h3>Safer Choices</h3>
            <p>
              Preference and allergy-aware features help support smarter food
              suggestions.
            </p>
          </div>
        </div>
      </section>

      <section className="au-mission">
        <div className="au-container au-mission-wrap">
          <div className="au-mission-box">
            <div className="au-mission-icon">
              <FiTarget />
            </div>
            <h2>Our Mission</h2>
            <p>
              Our mission is to improve campus canteen services through a smart
              digital solution that helps students access food easily, save
              preferences, and enjoy a more organized ordering process.
            </p>
          </div>

          <div className="au-mission-points">
            <div className="au-point-item">
              <FiCheckCircle />
              <span>Easy access to meals and food information</span>
            </div>
            <div className="au-point-item">
              <FiCheckCircle />
              <span>Clean and modern interface for students</span>
            </div>
            <div className="au-point-item">
              <FiCheckCircle />
              <span>Smarter food selection support</span>
            </div>
            <div className="au-point-item">
              <FiCheckCircle />
              <span>Better convenience for daily campus life</span>
            </div>
          </div>
        </div>
      </section>

      <section className="au-special">
        <div className="au-container au-special-grid">
          <div className="au-special-left">
            <span className="au-section-mini">Why It Matters</span>
            <h2>Smart Food Systems Create Better Campus Life</h2>
            <p>
              Students often need quick, simple, and reliable access to meals.
              Our system helps reduce confusion and creates a more efficient
              environment for both students and canteen operations.
            </p>
          </div>

          <div className="au-special-right">
            <div className="au-feature-box">
              <FiStar className="au-feature-icon" />
              <div>
                <h3>Simple to Use</h3>
                <p>Easy layout and clear actions for every user.</p>
              </div>
            </div>

            <div className="au-feature-box">
              <FiStar className="au-feature-icon" />
              <div>
                <h3>Modern Design</h3>
                <p>Fresh colors and a professional student-friendly style.</p>
              </div>
            </div>

            <div className="au-feature-box">
              <FiStar className="au-feature-icon" />
              <div>
                <h3>Future Ready</h3>
                <p>
                  A strong base for smarter recommendations and better services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}