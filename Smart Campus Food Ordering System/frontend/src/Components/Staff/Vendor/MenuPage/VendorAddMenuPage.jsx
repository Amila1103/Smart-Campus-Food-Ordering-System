import React from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import VendorAddMenu from "../VendorAddMenu/VendorAddMenu";
import "./VendorMenuPage.css";

export default function VendorAddMenuPage() {
  const navigate = useNavigate();

  const handleAdded = () => {
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

      <VendorAddMenu onAdded={handleAdded} />
    </div>
  );
}