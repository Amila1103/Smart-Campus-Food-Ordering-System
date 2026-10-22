import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./AdminComplaintManagement.css";

const API_BASE = "http://localhost:5000";

export default function AdminComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [replyInputs, setReplyInputs] = useState({});
  const [sendingReplyId, setSendingReplyId] = useState("");
  const [updatingStatusId, setUpdatingStatusId] = useState("");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/complaints`);
      setComplaints(res.data?.complaints || []);
    } catch (error) {
      console.log("Fetch complaints error:", error);
      alert("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const text = searchText.toLowerCase().trim();

      const matchesSearch =
        !text ||
        item.fullName?.toLowerCase().includes(text) ||
        item.email?.toLowerCase().includes(text) ||
        item.subject?.toLowerCase().includes(text) ||
        item.category?.toLowerCase().includes(text) ||
        item.orderId?.toLowerCase().includes(text);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchText, statusFilter]);

  const handleReplyChange = (complaintId, value) => {
    setReplyInputs((prev) => ({
      ...prev,
      [complaintId]: value,
    }));
  };

  const handleSendReply = async (complaintId) => {
    try {
      const replyMessage = (replyInputs[complaintId] || "").trim();

      if (!replyMessage) {
        alert("Please enter a reply message");
        return;
      }

      setSendingReplyId(complaintId);

      await axios.put(`${API_BASE}/complaints/${complaintId}/reply`, {
        adminReply: replyMessage,
      });

      setReplyInputs((prev) => ({
        ...prev,
        [complaintId]: "",
      }));

      await fetchComplaints();
      alert("Reply sent successfully");
    } catch (error) {
      console.log("Send reply error:", error);
      alert(error?.response?.data?.message || "Failed to send reply");
    } finally {
      setSendingReplyId("");
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      setUpdatingStatusId(complaintId);

      await axios.put(`${API_BASE}/complaints/${complaintId}/status`, {
        status: newStatus,
      });

      setComplaints((prev) =>
        prev.map((item) =>
          item._id === complaintId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.log("Update status error:", error);
      alert(error?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatusId("");
    }
  };

  const getStatusClass = (status) => {
    if (status === "Resolved") return "acm-status-resolved";
    if (status === "In Progress") return "acm-status-progress";
    if (status === "Rejected") return "acm-status-rejected";
    return "acm-status-pending";
  };

  return (
    <div className="acm-page-wrap">
      <div className="acm-hero-box">
        <div className="acm-hero-content">
          <p className="acm-mini-badge">Admin Complaints Desk</p>
          <h2 className="acm-main-title">Manage Customer Complaints</h2>
          <p className="acm-main-subtitle">
            Review submitted issues, update complaint progress, and send clear
            responses back to customers.
          </p>
        </div>
      </div>

      <div className="acm-toolbar-box">
        <input
          type="text"
          className="acm-search-input"
          placeholder="Search by name, email, subject, category or order ID"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <select
          className="acm-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button className="acm-refresh-btn" onClick={fetchComplaints}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="acm-message-box">Loading complaints...</div>
      ) : filteredComplaints.length === 0 ? (
        <div className="acm-message-box">No complaints found.</div>
      ) : (
        <div className="acm-card-list">
          {filteredComplaints.map((item) => (
            <div className="acm-card" key={item._id}>
              <div className="acm-card-top">
                <div>
                  <h3 className="acm-card-title">{item.subject}</h3>
                  <p className="acm-card-meta">
                    {item.fullName} • {item.email}
                  </p>
                </div>

                <span className={`acm-status-badge ${getStatusClass(item.status)}`}>
                  {item.status || "Pending"}
                </span>
              </div>

              <div className="acm-info-grid">
                <div className="acm-info-box">
                  <span className="acm-info-label">Category</span>
                  <span className="acm-info-value">{item.category || "-"}</span>
                </div>

                <div className="acm-info-box">
                  <span className="acm-info-label">Order ID</span>
                  <span className="acm-info-value">{item.orderId || "-"}</span>
                </div>

                <div className="acm-info-box">
                  <span className="acm-info-label">Created At</span>
                  <span className="acm-info-value">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "-"}
                  </span>
                </div>

                <div className="acm-info-box">
                  <span className="acm-info-label">Status</span>
                  <select
                    className="acm-status-select"
                    value={item.status || "Pending"}
                    onChange={(e) =>
                      handleStatusChange(item._id, e.target.value)
                    }
                    disabled={updatingStatusId === item._id}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="acm-section-block">
                <h4 className="acm-section-title">Complaint</h4>
                <p className="acm-complaint-text">{item.complaint}</p>
              </div>

              {item.image && (
                <div className="acm-section-block">
                  <h4 className="acm-section-title">Attached Image</h4>
                  <img
                    src={`${API_BASE}${item.image}`}
                    alt="Complaint"
                    className="acm-image-preview"
                  />
                </div>
              )}

              {item.adminReply && (
                <div className="acm-section-block">
                  <h4 className="acm-section-title">Previous Reply</h4>
                  <p className="acm-reply-text">{item.adminReply}</p>
                </div>
              )}

              <div className="acm-section-block">
                <h4 className="acm-section-title">Write Reply</h4>
                <textarea
                  className="acm-reply-textarea"
                  rows="4"
                  placeholder="Type your reply here"
                  value={replyInputs[item._id] || ""}
                  onChange={(e) => handleReplyChange(item._id, e.target.value)}
                />

                <div className="acm-btn-row">
                  <button
                    className="acm-send-btn"
                    onClick={() => handleSendReply(item._id)}
                    disabled={sendingReplyId === item._id}
                  >
                    {sendingReplyId === item._id ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}