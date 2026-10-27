import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaFileAlt,
  FaSearch,
  FaSyncAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaTrash,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaIdCard,
  FaMapMarkerAlt,
  FaTruck,
  FaCalendarAlt,
  FaExternalLinkAlt,
} from "react-icons/fa";
import "./DeliveryManagerApplications.css";

const API_BASE = "http://localhost:5000";

export default function DeliveryManagerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchText, setSearchText] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type, text: "" });
    }, 2500);
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/delivery-job-applications`);
      setApplications(res.data?.applications || []);
    } catch (error) {
      console.log("fetchApplications error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to load applications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    return applications.filter((app) => {
      if (!value) return true;

      return (
        String(app.fullName || "").toLowerCase().includes(value) ||
        String(app.email || "").toLowerCase().includes(value) ||
        String(app.phone || "").toLowerCase().includes(value) ||
        String(app.nic || "").toLowerCase().includes(value) ||
        String(app.vehicleType || "").toLowerCase().includes(value) ||
        String(app.experience || "").toLowerCase().includes(value) ||
        String(app.availability || "").toLowerCase().includes(value) ||
        String(app.applicationStatus || "").toLowerCase().includes(value) ||
        String(app.applicationSource || "").toLowerCase().includes(value)
      );
    });
  }, [applications, searchText]);

  const pendingCount = filteredApplications.filter(
    (app) => app.applicationStatus === "Pending"
  ).length;

  const acceptedCount = filteredApplications.filter(
    (app) => app.applicationStatus === "Accepted"
  ).length;

  const rejectedCount = filteredApplications.filter(
    (app) => app.applicationStatus === "Rejected"
  ).length;

  const handleStatusUpdate = async (id, applicationStatus) => {
    try {
      setUpdatingId(id);

      const res = await axios.put(
        `${API_BASE}/delivery-job-applications/${id}/status`,
        { applicationStatus }
      );

      showMessage(
        "success",
        res.data?.message || "Application status updated successfully"
      );

      if (applicationStatus === "Accepted" || applicationStatus === "Rejected") {
        setApplications((prev) => prev.filter((app) => app._id !== id));
      } else {
        setApplications((prev) =>
          prev.map((app) =>
            app._id === id ? { ...app, applicationStatus } : app
          )
        );
      }
    } catch (error) {
      console.log("handleStatusUpdate error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to update application status"
      );
    } finally {
      setUpdatingId("");
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );
    if (!confirmed) return;

    try {
      setDeletingId(id);

      const res = await axios.delete(
        `${API_BASE}/delivery-job-applications/${id}`
      );

      showMessage(
        "success",
        res.data?.message || "Application deleted successfully"
      );

      setApplications((prev) => prev.filter((app) => app._id !== id));
    } catch (error) {
      console.log("handleDelete error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to delete application"
      );
    } finally {
      setDeletingId("");
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "Not Available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not Available";
    return date.toLocaleString();
  };

  const statusClassName = (status) => {
    const value = String(status || "").toLowerCase();
    if (value === "accepted") return "accepted";
    if (value === "rejected") return "rejected";
    if (value === "reviewed") return "reviewed";
    return "pending";
  };

  const getCvUrl = (cvValue) => {
    if (!cvValue) return "";

    if (cvValue.startsWith("http://") || cvValue.startsWith("https://")) {
      return cvValue;
    }

    if (cvValue.startsWith("/uploads/")) {
      return `${API_BASE}${cvValue}`;
    }

    if (cvValue.startsWith("uploads/")) {
      return `${API_BASE}/${cvValue}`;
    }

    return `${API_BASE}/uploads/${cvValue}`;
  };

  return (
    <section className="dmapps-wrapper">
      <div className="dmapps-header">
        <div className="dmapps-header-left">
          <div className="dmapps-header-icon">
            <FaFileAlt />
          </div>

          <div>
            <span className="dmapps-badge">Applications</span>
            <h2>Delivery Staff Applications</h2>
            <p>View, review, update, and manage submitted delivery applications.</p>
          </div>
        </div>

        <button className="dmapps-refresh-btn" onClick={fetchApplications}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      {message.text && (
        <div className={`dmapps-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="dmapps-stats-grid">
        <div className="dmapps-stat-card">
          <div className="dmapps-stat-icon pending">
            <FaClock />
          </div>
          <div>
            <h3>{pendingCount}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="dmapps-stat-card">
          <div className="dmapps-stat-icon accepted">
            <FaCheckCircle />
          </div>
          <div>
            <h3>{acceptedCount}</h3>
            <p>Accepted</p>
          </div>
        </div>

        <div className="dmapps-stat-card">
          <div className="dmapps-stat-icon rejected">
            <FaTimesCircle />
          </div>
          <div>
            <h3>{rejectedCount}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      <div className="dmapps-search-row">
        <div className="dmapps-search-box">
          <FaSearch className="dmapps-search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, NIC, vehicle, status..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="dmapps-state-box">Loading applications...</div>
      ) : filteredApplications.length === 0 ? (
        <div className="dmapps-state-box">No applications found.</div>
      ) : (
        <div className="dmapps-card-list">
          {filteredApplications.map((app) => (
            <div className="dmapps-app-card" key={app._id}>
              <div className="dmapps-app-top">
                <div>
                  <h3>{app.fullName || "N/A"}</h3>
                  <p className="dmapps-top-sub">
                    <FaCalendarAlt className="dmapps-inline-icon" />
                    Submitted: {formatDateTime(app.createdAt)}
                  </p>
                </div>

                <span
                  className={`dmapps-status-pill ${statusClassName(
                    app.applicationStatus
                  )}`}
                >
                  {app.applicationStatus || "Pending"}
                </span>
              </div>

              <div className="dmapps-info-grid">
                <div className="dmapps-info-box">
                  <h4>Personal Details</h4>
                  <p>
                    <FaUser className="dmapps-inline-icon" />
                    {app.fullName || "N/A"}
                  </p>
                  <p>
                    <FaEnvelope className="dmapps-inline-icon" />
                    {app.email || "N/A"}
                  </p>
                  <p>
                    <FaPhone className="dmapps-inline-icon" />
                    {app.phone || "N/A"}
                  </p>
                  <p>
                    <FaIdCard className="dmapps-inline-icon" />
                    {app.nic || "N/A"}
                  </p>
                </div>

                <div className="dmapps-info-box">
                  <h4>Application Details</h4>
                  <p>
                    <strong>DOB:</strong> {app.dob || "N/A"}
                  </p>
                  <p>
                    <strong>Gender:</strong> {app.gender || "N/A"}
                  </p>
                  <p>
                    <FaTruck className="dmapps-inline-icon" />
                    {app.vehicleType || "N/A"}
                  </p>
                  <p>
                    <strong>Experience:</strong> {app.experience || "N/A"}
                  </p>
                  <p>
                    <strong>Availability:</strong> {app.availability || "N/A"}
                  </p>
                  <p>
                    <strong>Source:</strong> {app.applicationSource || "N/A"}
                  </p>
                </div>

                <div className="dmapps-info-box">
                  <h4>Address & CV</h4>
                  <p className="dmapps-address-text">
                    <FaMapMarkerAlt className="dmapps-inline-icon" />
                    {app.address || "N/A"}
                  </p>
                  <p>
                    <strong>CV:</strong>{" "}
                    {app.cv ? (
                      <a
                        href={getCvUrl(app.cv)}
                        target="_blank"
                        rel="noreferrer"
                        className="dmapps-cv-link"
                      >
                        <FaExternalLinkAlt />
                        <span>Open CV</span>
                      </a>
                    ) : (
                      "No file"
                    )}
                  </p>
                </div>
              </div>

              <div className="dmapps-reason-box">
                <h4>Reason</h4>
                <p>{app.reason || "N/A"}</p>
              </div>

              <div className="dmapps-actions">
                <button
                  className="dmapps-action-btn reviewed"
                  disabled={updatingId === app._id}
                  onClick={() => handleStatusUpdate(app._id, "Reviewed")}
                >
                  Review
                </button>

                <button
                  className="dmapps-action-btn accept"
                  disabled={updatingId === app._id}
                  onClick={() => handleStatusUpdate(app._id, "Accepted")}
                >
                  Accept
                </button>

                <button
                  className="dmapps-action-btn reject"
                  disabled={updatingId === app._id}
                  onClick={() => handleStatusUpdate(app._id, "Rejected")}
                >
                  Reject
                </button>

                <button
                  className="dmapps-action-btn delete"
                  disabled={deletingId === app._id}
                  onClick={() => handleDelete(app._id)}
                >
                  <FaTrash />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}