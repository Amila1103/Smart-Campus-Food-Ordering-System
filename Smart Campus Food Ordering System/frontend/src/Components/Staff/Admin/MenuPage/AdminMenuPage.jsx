import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import AdminAddMenu from "../AdminAddMenu/AdminAddMenu";
import "./AdminMenuPage.css";

export default function AdminAddMenuPage() {
  const navigate = useNavigate();

  const handleAdded = () => {
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

      <AdminAddMenu onAdded={handleAdded} />
    </div>
  );
}