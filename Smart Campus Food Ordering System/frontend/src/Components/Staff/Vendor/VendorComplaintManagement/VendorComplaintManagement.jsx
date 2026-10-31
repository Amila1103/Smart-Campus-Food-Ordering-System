import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./VendorComplaintManagement.css";

const API_BASE = "http://localhost:5000";

export default function VendorComplaintManagement() {
  const [vendorComplaints, setVendorComplaints] = useState([]);
  const [vendorComplaintLoading, setVendorComplaintLoading] = useState(true);
  const [vendorComplaintSearch, setVendorComplaintSearch] = useState("");
  const [vendorComplaintStatusFilter, setVendorComplaintStatusFilter] =
    useState("All");
  const [vendorReplyInputs, setVendorReplyInputs] = useState({});
  const [vendorSendingReplyId, setVendorSendingReplyId] = useState("");
  const [vendorUpdatingStatusId, setVendorUpdatingStatusId] = useState("");

  const fetchVendorComplaints = async () => {
    try {
      setVendorComplaintLoading(true);
      const res = await axios.get(`${API_BASE}/complaints`);
      setVendorComplaints(res.data?.complaints || []);
    } catch (error) {
      console.log("Vendor fetch complaints error:", error);
      alert("Failed to load complaints");
    } finally {
      setVendorComplaintLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorComplaints();
  }, []);

  const filteredVendorComplaints = useMemo(() => {
    return vendorComplaints.filter((item) => {
      const text = vendorComplaintSearch.toLowerCase().trim();

      const matchesSearch =
        !text ||
        item.fullName?.toLowerCase().includes(text) ||
        item.email?.toLowerCase().includes(text) ||
        item.subject?.toLowerCase().includes(text) ||
        item.category?.toLowerCase().includes(text) ||
        item.orderId?.toLowerCase().includes(text);

      const matchesStatus =
        vendorComplaintStatusFilter === "All" ||
        item.status === vendorComplaintStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vendorComplaints, vendorComplaintSearch, vendorComplaintStatusFilter]);

  const handleVendorReplyChange = (complaintId, value) => {
    setVendorReplyInputs((prev) => ({
      ...prev,
      [complaintId]: value,
    }));
  };

  const handleVendorSendReply = async (complaintId) => {
    try {
      const replyMessage = (vendorReplyInputs[complaintId] || "").trim();

      if (!replyMessage) {
        alert("Please enter a reply message");
        return;
      }

      setVendorSendingReplyId(complaintId);

      await axios.put(`${API_BASE}/complaints/${complaintId}/reply`, {
        adminReply: replyMessage,
      });

      setVendorReplyInputs((prev) => ({
        ...prev,
        [complaintId]: "",
      }));

      await fetchVendorComplaints();
      alert("Reply sent successfully");
    } catch (error) {
      console.log("Vendor send reply error:", error);
      alert(error?.response?.data?.message || "Failed to send reply");
    } finally {
      setVendorSendingReplyId("");
    }
  };

  const handleVendorStatusChange = async (complaintId, newStatus) => {
    try {
      setVendorUpdatingStatusId(complaintId);

      await axios.put(`${API_BASE}/complaints/${complaintId}/status`, {
        status: newStatus,
      });

      setVendorComplaints((prev) =>
        prev.map((item) =>
          item._id === complaintId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.log("Vendor update status error:", error);
      alert(error?.response?.data?.message || "Failed to update status");
    } finally {
      setVendorUpdatingStatusId("");
    }
  };

  const getVendorStatusClass = (status) => {
    if (status === "Resolved") return "vcm-status-resolved";
    if (status === "In Progress") return "vcm-status-progress";
    if (status === "Rejected") return "vcm-status-rejected";
    return "vcm-status-pending";
  };

  return (
    <div className="vcm-page-wrap">
      <div className="vcm-hero-box">
        <div>
          <p className="vcm-mini-badge">Vendor Complaint Desk</p>
          <h2 className="vcm-main-title">Manage Customer Complaints</h2>
          <p className="vcm-main-subtitle">
            Review complaint details, update progress, and send replies from the
            vendor dashboard.
          </p>
        </div>
      </div>

      <div className="vcm-toolbar-box">
        <input
          type="text"
          className="vcm-search-input"
          placeholder="Search by name, email, subject, category or order ID"
          value={vendorComplaintSearch}
          onChange={(e) => setVendorComplaintSearch(e.target.value)}
        />

        <select
          className="vcm-filter-select"
          value={vendorComplaintStatusFilter}
          onChange={(e) => setVendorComplaintStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button className="vcm-refresh-btn" onClick={fetchVendorComplaints}>
          Refresh
        </button>
      </div>

      {vendorComplaintLoading ? (
        <div className="vcm-message-box">Loading complaints...</div>
      ) : filteredVendorComplaints.length === 0 ? (
        <div className="vcm-message-box">No complaints found.</div>
      ) : (
        <div className="vcm-card-list">
          {filteredVendorComplaints.map((item) => (
            <div className="vcm-card" key={item._id}>
              <div className="vcm-card-top">
                <div>
                  <h3 className="vcm-card-title">{item.subject}</h3>
                  <p className="vcm-card-meta">
                    {item.fullName} • {item.email}
                  </p>
                </div>

                <span
                  className={`vcm-status-badge ${getVendorStatusClass(
                    item.status
                  )}`}
                >
                  {item.status || "Pending"}
                </span>
              </div>

              <div className="vcm-info-grid">
                <div className="vcm-info-box">
                  <span className="vcm-info-label">Category</span>
                  <span className="vcm-info-value">{item.category || "-"}</span>
                </div>

                <div className="vcm-info-box">
                  <span className="vcm-info-label">Order ID</span>
                  <span className="vcm-info-value">{item.orderId || "-"}</span>
                </div>

                <div className="vcm-info-box">
                  <span className="vcm-info-label">Created At</span>
                  <span className="vcm-info-value">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "-"}
                  </span>
                </div>

                <div className="vcm-info-box">
                  <span className="vcm-info-label">Status</span>
                  <select
                    className="vcm-status-select"
                    value={item.status || "Pending"}
                    onChange={(e) =>
                      handleVendorStatusChange(item._id, e.target.value)
                    }
                    disabled={vendorUpdatingStatusId === item._id}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="vcm-section-block">
                <h4 className="vcm-section-title">Complaint</h4>
                <p className="vcm-complaint-text">{item.complaint}</p>
              </div>

              {item.image && (
                <div className="vcm-section-block">
                  <h4 className="vcm-section-title">Attached Image</h4>
                  <img
                    src={`${API_BASE}${item.image}`}
                    alt="Complaint"
                    className="vcm-image-preview"
                  />
                </div>
              )}

              {item.adminReply && (
                <div className="vcm-section-block">
                  <h4 className="vcm-section-title">Previous Reply</h4>
                  <p className="vcm-reply-text">{item.adminReply}</p>
                </div>
              )}

              <div className="vcm-section-block">
                <h4 className="vcm-section-title">Write Reply</h4>
                <textarea
                  className="vcm-reply-textarea"
                  rows="4"
                  placeholder="Type your reply here"
                  value={vendorReplyInputs[item._id] || ""}
                  onChange={(e) =>
                    handleVendorReplyChange(item._id, e.target.value)
                  }
                />

                <div className="vcm-btn-row">
                  <button
                    className="vcm-send-btn"
                    onClick={() => handleVendorSendReply(item._id)}
                    disabled={vendorSendingReplyId === item._id}
                  >
                    {vendorSendingReplyId === item._id
                      ? "Sending..."
                      : "Send Reply"}
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