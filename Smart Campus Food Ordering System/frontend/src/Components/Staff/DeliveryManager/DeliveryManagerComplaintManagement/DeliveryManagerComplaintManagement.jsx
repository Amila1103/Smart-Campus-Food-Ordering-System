import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./DeliveryManagerComplaintManagement.css";

const API_BASE = "http://localhost:5000";

export default function DeliveryManagerComplaintManagement() {
  const [dmcComplaints, setDmcComplaints] = useState([]);
  const [dmcLoading, setDmcLoading] = useState(true);
  const [dmcSearchText, setDmcSearchText] = useState("");
  const [dmcStatusFilter, setDmcStatusFilter] = useState("All");
  const [dmcReplyInputs, setDmcReplyInputs] = useState({});
  const [dmcSendingReplyId, setDmcSendingReplyId] = useState("");
  const [dmcUpdatingStatusId, setDmcUpdatingStatusId] = useState("");

  const normalizeCategory = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  const isLateDeliveryComplaint = (item) =>
    normalizeCategory(item?.category) === "late delivery";

  const fetchDmcComplaints = async () => {
    try {
      setDmcLoading(true);

      const res = await axios.get(`${API_BASE}/complaints`);
      const allComplaints = Array.isArray(res.data?.complaints)
        ? res.data.complaints
        : [];

      const onlyLateDeliveryComplaints = allComplaints.filter(
        isLateDeliveryComplaint
      );

      setDmcComplaints(onlyLateDeliveryComplaints);
    } catch (error) {
      console.log("Delivery Manager fetch complaints error:", error);
      alert("Failed to load late delivery complaints");
      setDmcComplaints([]);
    } finally {
      setDmcLoading(false);
    }
  };

  useEffect(() => {
    fetchDmcComplaints();
  }, []);

  const filteredDmcComplaints = useMemo(() => {
    return dmcComplaints
      .filter(isLateDeliveryComplaint)
      .filter((item) => {
        const text = dmcSearchText.toLowerCase().trim();

        const matchesSearch =
          !text ||
          item.fullName?.toLowerCase().includes(text) ||
          item.email?.toLowerCase().includes(text) ||
          item.subject?.toLowerCase().includes(text) ||
          item.orderId?.toLowerCase().includes(text);

        const matchesStatus =
          dmcStatusFilter === "All" || item.status === dmcStatusFilter;

        return matchesSearch && matchesStatus;
      });
  }, [dmcComplaints, dmcSearchText, dmcStatusFilter]);

  const handleDmcReplyChange = (complaintId, value) => {
    setDmcReplyInputs((prev) => ({
      ...prev,
      [complaintId]: value,
    }));
  };

  const handleDmcSendReply = async (complaintId) => {
    try {
      const targetComplaint = dmcComplaints.find(
        (item) => item._id === complaintId
      );

      if (!targetComplaint || !isLateDeliveryComplaint(targetComplaint)) {
        alert("Only Late Delivery complaints can be handled here");
        return;
      }

      const replyMessage = (dmcReplyInputs[complaintId] || "").trim();

      if (!replyMessage) {
        alert("Please enter a reply message");
        return;
      }

      setDmcSendingReplyId(complaintId);

      await axios.put(`${API_BASE}/complaints/${complaintId}/reply`, {
        adminReply: replyMessage,
      });

      setDmcReplyInputs((prev) => ({
        ...prev,
        [complaintId]: "",
      }));

      await fetchDmcComplaints();
      alert("Reply sent successfully");
    } catch (error) {
      console.log("Delivery Manager send reply error:", error);
      alert(error?.response?.data?.message || "Failed to send reply");
    } finally {
      setDmcSendingReplyId("");
    }
  };

  const handleDmcStatusChange = async (complaintId, newStatus) => {
    try {
      const targetComplaint = dmcComplaints.find(
        (item) => item._id === complaintId
      );

      if (!targetComplaint || !isLateDeliveryComplaint(targetComplaint)) {
        alert("Only Late Delivery complaints can be handled here");
        return;
      }

      setDmcUpdatingStatusId(complaintId);

      await axios.put(`${API_BASE}/complaints/${complaintId}/status`, {
        status: newStatus,
      });

      setDmcComplaints((prev) =>
        prev
          .map((item) =>
            item._id === complaintId ? { ...item, status: newStatus } : item
          )
          .filter(isLateDeliveryComplaint)
      );
    } catch (error) {
      console.log("Delivery Manager update status error:", error);
      alert(error?.response?.data?.message || "Failed to update status");
    } finally {
      setDmcUpdatingStatusId("");
    }
  };

  const getDmcStatusClass = (status) => {
    if (status === "Resolved") return "dmc-status-resolved";
    if (status === "In Progress") return "dmc-status-progress";
    if (status === "Rejected") return "dmc-status-rejected";
    return "dmc-status-pending";
  };

  return (
    <div className="dmc-page-wrap">
      <div className="dmc-hero-box">
        <div>
          <p className="dmc-mini-badge">Delivery Manager Complaints</p>
          <h2 className="dmc-main-title">Late Delivery Complaints</h2>
          <p className="dmc-main-subtitle">
            Only complaints under the Late Delivery category are shown here.
          </p>
        </div>
      </div>

      <div className="dmc-toolbar-box">
        <input
          type="text"
          className="dmc-search-input"
          placeholder="Search by name, email, subject or order ID"
          value={dmcSearchText}
          onChange={(e) => setDmcSearchText(e.target.value)}
        />

        <select
          className="dmc-filter-select"
          value={dmcStatusFilter}
          onChange={(e) => setDmcStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button className="dmc-refresh-btn" onClick={fetchDmcComplaints}>
          Refresh
        </button>
      </div>

      {dmcLoading ? (
        <div className="dmc-message-box">Loading late delivery complaints...</div>
      ) : filteredDmcComplaints.length === 0 ? (
        <div className="dmc-message-box">
          No late delivery complaints found.
        </div>
      ) : (
        <div className="dmc-card-list">
          {filteredDmcComplaints.filter(isLateDeliveryComplaint).map((item) => (
            <div className="dmc-card" key={item._id}>
              <div className="dmc-card-top">
                <div>
                  <h3 className="dmc-card-title">{item.subject}</h3>
                  <p className="dmc-card-meta">
                    {item.fullName} • {item.email}
                  </p>
                </div>

                <span
                  className={`dmc-status-badge ${getDmcStatusClass(item.status)}`}
                >
                  {item.status || "Pending"}
                </span>
              </div>

              <div className="dmc-info-grid">
                <div className="dmc-info-box">
                  <span className="dmc-info-label">Category</span>
                  <span className="dmc-info-value">{item.category || "-"}</span>
                </div>

                <div className="dmc-info-box">
                  <span className="dmc-info-label">Order ID</span>
                  <span className="dmc-info-value">{item.orderId || "-"}</span>
                </div>

                <div className="dmc-info-box">
                  <span className="dmc-info-label">Created At</span>
                  <span className="dmc-info-value">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "-"}
                  </span>
                </div>

                <div className="dmc-info-box">
                  <span className="dmc-info-label">Status</span>
                  <select
                    className="dmc-status-select"
                    value={item.status || "Pending"}
                    onChange={(e) =>
                      handleDmcStatusChange(item._id, e.target.value)
                    }
                    disabled={dmcUpdatingStatusId === item._id}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="dmc-section-block">
                <h4 className="dmc-section-title">Complaint</h4>
                <p className="dmc-complaint-text">{item.complaint}</p>
              </div>

              {item.image && (
                <div className="dmc-section-block">
                  <h4 className="dmc-section-title">Attached Image</h4>
                  <img
                    src={`${API_BASE}${item.image}`}
                    alt="Complaint"
                    className="dmc-image-preview"
                  />
                </div>
              )}

              {item.adminReply && (
                <div className="dmc-section-block">
                  <h4 className="dmc-section-title">Previous Reply</h4>
                  <p className="dmc-reply-text">{item.adminReply}</p>
                </div>
              )}

              <div className="dmc-section-block">
                <h4 className="dmc-section-title">Write Reply</h4>
                <textarea
                  className="dmc-reply-textarea"
                  rows="4"
                  placeholder="Type your reply here"
                  value={dmcReplyInputs[item._id] || ""}
                  onChange={(e) =>
                    handleDmcReplyChange(item._id, e.target.value)
                  }
                />

                <div className="dmc-btn-row">
                  <button
                    className="dmc-send-btn"
                    onClick={() => handleDmcSendReply(item._id)}
                    disabled={dmcSendingReplyId === item._id}
                  >
                    {dmcSendingReplyId === item._id
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