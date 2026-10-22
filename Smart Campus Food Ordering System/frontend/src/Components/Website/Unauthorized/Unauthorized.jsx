import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Access Denied</h2>
      <p>You do not have permission to view this page.</p>
      <Link to="/stafflogingo">Go Home</Link>
    </div>
  );
}