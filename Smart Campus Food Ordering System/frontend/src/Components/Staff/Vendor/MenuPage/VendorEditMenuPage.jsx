import React, { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import VendorEditMenu from "../VendorEditMenu/VendorEditMenu";
import "./VendorMenuPage.css";

const API_BASE = "http://localhost:5000";

export default function VendorEditMenuPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [selectedMenu, setSelectedMenu] = useState(location.state?.menu || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenuById = async () => {
      try {
        setLoading(true);

        if (location.state?.menu) {
          setSelectedMenu(location.state.menu);
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_BASE}/menus/${id}`);
        setSelectedMenu(res.data?.menu || null);
      } catch (error) {
        console.log("Fetch menu by id error:", error);
        setSelectedMenu(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMenuById();
    } else {
      setSelectedMenu(null);
      setLoading(false);
    }
  }, [id, location.state]);

  const handleUpdated = () => {
    navigate("/vendor-dashboard");
  };

  return (
    <div className="vmp-page-wrap">
      <div className="vmp-page-top">
        <button
          className="vmp-back-btn"
          onClick={() => navigate("/vendor-dashboard")}
        >
          <FiArrowLeft />
          <span>Back to Menu List</span>
        </button>
      </div>

      {loading ? (
        <div className="vmp-loading-box">Loading selected menu...</div>
      ) : selectedMenu ? (
        <VendorEditMenu selectedMenu={selectedMenu} onUpdated={handleUpdated} />
      ) : (
        <div className="vmp-loading-box">
          Selected menu item not found.
        </div>
      )}
    </div>
  );
}