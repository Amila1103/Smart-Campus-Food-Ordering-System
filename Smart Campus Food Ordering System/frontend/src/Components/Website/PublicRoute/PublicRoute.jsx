import React from "react";
import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const customer = localStorage.getItem("customer");
  const staff = localStorage.getItem("staff");

  if (customer) {
    return <Navigate to="/RegisterHome" replace />;
  }

  if (staff) {
    try {
      const parsedStaff = JSON.parse(staff);

      if (!parsedStaff?.token || !parsedStaff?.role) {
        localStorage.removeItem("staff");
        return children;
      }

      const role = parsedStaff.role.toLowerCase();

      if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
      if (role === "vendor") return <Navigate to="/vendor-dashboard" replace />;
      if (role === "delivery") {
        return <Navigate to="/delivery-dashboard" replace />;
      }
      if (role === "customer manager") {
        return <Navigate to="/customer-manager-dashboard" replace />;
      }
      if (role === "delivery manager") {
        return <Navigate to="/delivery-manager-dashboard" replace />;
      }
    } catch (error) {
      localStorage.removeItem("staff");
    }
  }

  return children;
}