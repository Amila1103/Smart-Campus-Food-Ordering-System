import React from "react";
import { Navigate } from "react-router-dom";

export default function StaffProtectedRoute({ children, allowedRoles = [] }) {
  const staffData = localStorage.getItem("staff");

  if (!staffData) {
    return <Navigate to="/staff-login" replace />;
  }

  let parsedStaff;

  try {
    parsedStaff = JSON.parse(staffData);
  } catch (error) {
    localStorage.removeItem("staff");
    return <Navigate to="/staff-login" replace />;
  }

  if (!parsedStaff?.token || !parsedStaff?.role) {
    localStorage.removeItem("staff");
    return <Navigate to="/staff-login" replace />;
  }

  // Optional JWT expiry check
  try {
    const tokenParts = parsedStaff.token.split(".");
    if (tokenParts.length !== 3) {
      localStorage.removeItem("staff");
      return <Navigate to="/staff-login" replace />;
    }

    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < currentTime) {
      localStorage.removeItem("staff");
      return <Navigate to="/staff-login" replace />;
    }
  } catch (error) {
    localStorage.removeItem("staff");
    return <Navigate to="/staff-login" replace />;
  }

  const role = parsedStaff.role.toLowerCase();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}