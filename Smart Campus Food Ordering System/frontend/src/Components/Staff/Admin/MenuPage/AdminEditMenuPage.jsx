import React, { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import AdminEditMenu from "../AdminEditMenu/AdminEditMenu";
import "./AdminMenuPage.css";

const API_BASE = "http://localhost:5000";

export default function AdminEditMenuPage() {
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
    navigate("/admin-dashboard");
  };

  return (
    <div className="amp-page-wrap">
      <div className="amp-page-top">
        <button
          className="amp-back-btn"
          onClick={() => navigate("/admin-dashboard")}
        >
          <FiArrowLeft />
          <span>Back to Menu List</span>
        </button>
      </div>

      {loading ? (
        <div className="amp-loading-box">Loading selected menu...</div>
      ) : selectedMenu ? (
        <AdminEditMenu selectedMenu={selectedMenu} onUpdated={handleUpdated} />
      ) : (
        <div className="amp-loading-box">
          Selected menu item not found.
        </div>
      )}
    </div>
  );
}