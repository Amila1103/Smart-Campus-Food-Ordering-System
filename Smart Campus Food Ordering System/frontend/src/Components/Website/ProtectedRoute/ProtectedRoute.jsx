import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const customer = localStorage.getItem("customer");

  if (!customer) {
    return <Navigate to="/customer-login" replace />;
  }

  return children;
}