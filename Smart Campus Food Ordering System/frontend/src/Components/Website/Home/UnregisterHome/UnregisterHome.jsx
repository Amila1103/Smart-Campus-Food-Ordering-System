import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./UnregisterHome.css";
import UnregisterNavbar from "../../Navbar/UnregisterNavbar/UnregisterNavbar";

import hero1 from "../../image/hero1.avif";
import hero2 from "../../image/hero2.avif";
import hero3 from "../../image/hero3.avif";
import hero4 from "../../image/hero4.avif";
import hero5 from "../../image/hero5.avif";
import hero6 from "../../image/hero6.avif";

import experiencedTeamImg from "../../image/Experienced Team.jpg";
import freshIngredientsImg from "../../image/Fresh Ingredients.jpg";
import cleanPreparationImg from "../../image/Clean Preparation.jpg";
import Footer from "../../Footer/Footer";

export default function UnregisterHome() {
  const heroImages = [hero1, hero2, hero3, hero4, hero5, hero6];

  const [currentImage, setCurrentImage] = useState(0);
  const [nextImage, setNextImage] = useState(1);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNextImage((currentImage + 1) % heroImages.length);
      setIsFading(true);

      setTimeout(() => {
        setCurrentImage((prev) => (prev + 1) % heroImages.length);
        setIsFading(false);
      }, 1200);
    }, 4500);

    return () => clearInterval(interval);
  }, [currentImage, heroImages.length]);

  return (
    <div className="uhome-wrapper">
      <UnregisterNavbar />

      <section className="uhome-hero">
        <div className="uhome-hero-content">
          <span className="uhome-badge">Welcome to Campus Canteen</span>

          <h1>
            Fresh Food for <span>Every Student</span>
          </h1>

          <p>
            Enjoy delicious meals, refreshing drinks, and quick snacks made for
            busy campus life. Simple, safe, and student-friendly food ordering
            all in one place.
          </p>

          <div className="uhome-hero-buttons">
            <Link to="/UNMenu">
              <button className="uhome-btn uhome-primary-btn">
                Explore Menu
              </button>
            </Link>

            <Link to="/UNVregister">
              <button className="uhome-btn uhome-secondary-btn">
                Register Now
              </button>
            </Link>
          </div>

          <div className="uhome-hero-stats">
            <div className="uhome-stat-box">
              <h3>Fresh</h3>
              <p>Daily prepared meals</p>
            </div>
            <div className="uhome-stat-box">
              <h3>Fast</h3>
              <p>Quick campus ordering</p>
            </div>
            <div className="uhome-stat-box">
              <h3>Friendly</h3>
              <p>Made for students</p>
            </div>
          </div>
        </div>

        <div className="uhome-hero-visual">
          <div className="uhome-hero-glow uhome-hero-glow-green"></div>
          <div className="uhome-hero-glow uhome-hero-glow-orange"></div>

          <div className="uhome-collage">
            <div className="uhome-card uhome-card-main">
              <img
                src={heroImages[currentImage]}
                alt="Main campus canteen food"
                className={`uhome-main-image base-image ${
                  isFading ? "fade-out" : "show"
                }`}
              />

              <img
                src={heroImages[nextImage]}
                alt="Next campus canteen food"
                className={`uhome-main-image overlay-image ${
                  isFading ? "fade-in" : ""
                }`}
              />
            </div>

            <div className="uhome-card uhome-card-top">
              <img src={hero2} alt="Campus canteen food 2" />
            </div>

            <div className="uhome-card uhome-card-right">
              <img src={hero3} alt="Campus canteen food 3" />
            </div>

            <div className="uhome-card uhome-card-bottom-left">
              <img src={hero4} alt="Campus canteen food 4" />
            </div>

            <div className="uhome-card uhome-card-bottom">
              <img src={hero5} alt="Campus canteen food 5" />
            </div>

            <div className="uhome-card uhome-card-floating">
              <img src={hero6} alt="Campus canteen food 6" />
            </div>
          </div>
        </div>
      </section>

      <section className="uhome-features">
        <h2>Why Students Love Our Canteen</h2>
        <div className="uhome-feature-grid">
          <div className="uhome-feature-card">
            <div className="uhome-icon">🍔</div>
            <h3>Tasty Food</h3>
            <p>Fresh and flavorful meals prepared for students every day.</p>
          </div>

          <div className="uhome-feature-card">
            <div className="uhome-icon">⚡</div>
            <h3>Fast Service</h3>
            <p>
              Quick ordering and faster serving to match your busy schedule.
            </p>
          </div>

          <div className="uhome-feature-card">
            <div className="uhome-icon">🥗</div>
            <h3>Healthy Choices</h3>
            <p>
              Balanced meal options with better choices for student wellness.
            </p>
          </div>
        </div>
      </section>

      <section className="uhome-popular">
        <div className="uhome-section-head">
          <span>Popular Menu</span>
          <h2>Student Favorites This Week</h2>
          <p>Quick picks that students love the most on campus.</p>
        </div>

        <div className="uhome-popular-grid">
          <div className="uhome-menu-card">
            <div className="uhome-menu-badge">Best Seller</div>
            <img src={hero1} alt="Chicken Rice Bowl" />
            <div className="uhome-menu-content">
              <h3>Chicken Rice Bowl</h3>
              <p>Fresh rice, grilled chicken, and flavorful toppings.</p>
              <div className="uhome-menu-meta">
                <span className="uhome-price">Rs. 650</span>
                <span className="uhome-tag">Popular</span>
              </div>
            </div>
          </div>

          <div className="uhome-menu-card">
            <div className="uhome-menu-badge">Healthy</div>
            <img src={hero2} alt="Veggie Combo" />
            <div className="uhome-menu-content">
              <h3>Veggie Combo</h3>
              <p>Balanced meal with fresh vegetables and protein.</p>
              <div className="uhome-menu-meta">
                <span className="uhome-price">Rs. 520</span>
                <span className="uhome-tag">Fresh</span>
              </div>
            </div>
          </div>

          <div className="uhome-menu-card">
            <div className="uhome-menu-badge">Quick Bite</div>
            <img src={hero3} alt="Burger Meal" />
            <div className="uhome-menu-content">
              <h3>Burger Meal</h3>
              <p>Tasty burger meal made for busy student breaks.</p>
              <div className="uhome-menu-meta">
                <span className="uhome-price">Rs. 700</span>
                <span className="uhome-tag">Fast</span>
              </div>
            </div>
          </div>

          <div className="uhome-menu-card">
            <div className="uhome-menu-badge">Daily Pick</div>
            <img src={hero4} alt="Pasta Plate" />
            <div className="uhome-menu-content">
              <h3>Pasta Plate</h3>
              <p>Creamy and filling meal prepared fresh every day.</p>
              <div className="uhome-menu-meta">
                <span className="uhome-price">Rs. 680</span>
                <span className="uhome-tag">Tasty</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="uhome-special-day">
        <div className="uhome-special-banner">
          <div className="uhome-special-day-left">
            <span className="uhome-mini-label">Today’s Special</span>
            <h2>Fresh Special Meal Prepared Just for Today</h2>
            <p>
              Enjoy a special campus meal with fresh ingredients, affordable
              pricing, and student-friendly taste.
            </p>
            <Link to="/UNMenu">
              <button className="uhome-btn uhome-special-btn">
                View Special
              </button>
            </Link>
          </div>

          <div className="uhome-special-day-right">
            <div className="uhome-special-highlight">
              <div className="uhome-special-topline">Limited Offer</div>
              <h3>Special Combo</h3>
              <p>Rice + Chicken + Juice</p>
              <span>Only Rs. 850</span>
            </div>
          </div>
        </div>
      </section>

      <section className="uhome-how">
        <div className="uhome-section-head">
          <span>How It Works</span>
          <h2>Order in 3 Simple Steps</h2>
          <p>Easy for every student to browse, choose, and enjoy.</p>
        </div>

        <div className="uhome-how-grid">
          <div className="uhome-how-card">
            <div className="uhome-step-no">01</div>
            <h3>Browse Menu</h3>
            <p>Check meals, drinks, and snacks available in the canteen.</p>
          </div>

          <div className="uhome-how-card">
            <div className="uhome-step-no">02</div>
            <h3>Register or Login</h3>
            <p>Create your account and access a smarter ordering experience.</p>
          </div>

          <div className="uhome-how-card">
            <div className="uhome-step-no">03</div>
            <h3>Place Your Order</h3>
            <p>Select your favorite food and enjoy quick campus service.</p>
          </div>
        </div>
      </section>

      <section className="uhome-hiring">
        <div className="uhome-hiring-inner">
          <div className="uhome-hiring-left">
            <span className="uhome-hiring-badge">We Are Hiring</span>
            <h2>Join Our Delivery Team</h2>
            <p>
              We are looking for friendly, responsible, and active delivery
              staff to join our campus canteen service team.
            </p>

            <div className="uhome-hiring-points">
              <span>Flexible Work</span>
              <span>Friendly Team</span>
              <span>Student Friendly</span>
            </div>
          </div>

          <div className="uhome-hiring-right">
            <div className="uhome-hiring-card">
              <h3>Delivery Staff Wanted</h3>
              <p>
                Help us provide fast and reliable delivery service for students
                on campus.
              </p>
              <Link to="/UnregisterHomeDeliveryApplicationForm">
                <button className="uhome-btn uhome-secondary-btn">
                  Apply Now
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="uhome-kitchen">
        <div className="uhome-section-head">
          <span>Our Kitchen Team</span>
          <h2>Freshly Prepared Daily</h2>
          <p>Meals are prepared with care by our kitchen team for students.</p>
        </div>

        <div className="uhome-kitchen-wrap">
          <div className="uhome-kitchen-card">
            <div className="uhome-kitchen-image-wrap">
              <img
                src={experiencedTeamImg}
                alt="Experienced kitchen team"
                className="uhome-kitchen-image"
              />
            </div>
            <div className="uhome-kitchen-content">
              <h3>Experienced Team</h3>
              <p>
                Prepared by trained kitchen staff with attention to quality.
              </p>
            </div>
          </div>

          <div className="uhome-kitchen-card">
            <div className="uhome-kitchen-image-wrap">
              <img
                src={freshIngredientsImg}
                alt="Fresh ingredients"
                className="uhome-kitchen-image"
              />
            </div>
            <div className="uhome-kitchen-content">
              <h3>Fresh Ingredients</h3>
              <p>
                Meals are made using fresh ingredients selected for daily use.
              </p>
            </div>
          </div>

          <div className="uhome-kitchen-card">
            <div className="uhome-kitchen-image-wrap">
              <img
                src={cleanPreparationImg}
                alt="Clean food preparation"
                className="uhome-kitchen-image"
              />
            </div>
            <div className="uhome-kitchen-content">
              <h3>Clean Preparation</h3>
              <p>
                Food is prepared in a hygienic and student-safe environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="uhome-special">
        <div className="uhome-special-left">
          <h2>Safe and Smart Food Experience</h2>
          <p>
            Our system is designed to make food ordering easier for students.
            You can view menu items, check available options, and enjoy a more
            comfortable canteen experience with a modern digital touch.
          </p>
          <Link to="/UnAboutUs">
            <button className="uhome-btn uhome-primary-btn">Learn More</button>
          </Link>
        </div>

        <div className="uhome-special-right">
          <div className="uhome-info-box">
            <h3>Student Friendly</h3>
            <p>Simple interface made for easy browsing and ordering.</p>
          </div>
          <div className="uhome-info-box">
            <h3>Fresh Daily</h3>
            <p>Meals and snacks updated with care for campus needs.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
