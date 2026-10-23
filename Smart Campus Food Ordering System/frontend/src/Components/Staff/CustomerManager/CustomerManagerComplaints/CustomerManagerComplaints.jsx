import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaComments,
  FaSearch,
  FaSyncAlt,
  FaReply,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaSpinner,
  FaEnvelope,
  FaUser,
  FaTag,
  FaClipboardList,
  FaImage,
  FaPaperPlane,
} from "react-icons/fa";
import "./CustomerManagerComplaints.css";

const API_BASE = "http://localhost:5000";

export default function CustomerManagerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [replyFilter, setReplyFilter] = useState("ALL");

  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");

  const [statusLoading, setStatusLoading] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setFetchError("");

      const res = await axios.get(`${API_BASE}/complaints`);
      const complaintList = Array.isArray(res?.data?.complaints)
        ? res.data.complaints
        : [];

      setComplaints(complaintList);
      setFilteredComplaints(complaintList);

      if (selectedComplaint) {
        const updatedSelected = complaintList.find(
          (item) => item._id === selectedComplaint._id
        );
        setSelectedComplaint(updatedSelected || null);
        if (updatedSelected?.adminReply) {
          setReplyText(updatedSelected.adminReply);
        }
      }
    } catch (error) {
      console.log("Fetch complaints error:", error);
      setFetchError("Failed to load complaints.");
      setComplaints([]);
      setFilteredComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    let result = [...complaints];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((item) => {
        return (
          item?.fullName?.toLowerCase().includes(term) ||
          item?.email?.toLowerCase().includes(term) ||
          item?.subject?.toLowerCase().includes(term) ||
          item?.category?.toLowerCase().includes(term) ||
          item?.complaint?.toLowerCase().includes(term) ||
          item?.orderId?.toLowerCase().includes(term)
        );
      });
    }

    if (statusFilter !== "ALL") {
      result = result.filter((item) => item?.status === statusFilter);
    }

    if (replyFilter === "REPLIED") {
      result = result.filter((item) => item?.adminReply?.trim());
    } else if (replyFilter === "NOT_REPLIED") {
      result = result.filter((item) => !item?.adminReply?.trim());
    }

    setFilteredComplaints(result);
  }, [complaints, searchTerm, statusFilter, replyFilter]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((item) => item.status === "Pending").length;
    const inProgress = complaints.filter(
      (item) => item.status === "In Progress"
    ).length;
    const resolved = complaints.filter((item) => item.status === "Resolved").length;
    const replied = complaints.filter((item) => item.adminReply?.trim()).length;

    return {
      total,
      pending,
      inProgress,
      resolved,
      replied,
    };
  }, [complaints]);

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "Not available";
    const date = new Date(dateValue);
    return date.toLocaleString();
  };

  const getStatusClass = (status) => {
    if (status === "Pending") return "pending";
    if (status === "In Progress") return "progress";
    if (status === "Resolved") return "resolved";
    if (status === "Rejected") return "rejected";
    return "";
  };

  const openComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setReplyText(complaint?.adminReply || "");
    setReplyMessage("");
  };

  const handleReplySubmit = async () => {
    if (!selectedComplaint?._id) return;
    if (!replyText.trim()) {
      setReplyMessage("Please enter a reply message.");
      return;
    }

    try {
      setReplyLoading(true);
      setReplyMessage("");

      const res = await axios.put(
        `${API_BASE}/complaints/${selectedComplaint._id}/reply`,
        {
          adminReply: replyText,
        }
      );

      const updatedComplaint = res?.data?.complaint;

      const updatedList = complaints.map((item) =>
        item._id === selectedComplaint._id ? updatedComplaint : item
      );

      setComplaints(updatedList);
      setSelectedComplaint(updatedComplaint);
      setReplyMessage("Reply sent successfully.");
    } catch (error) {
      console.log("Reply complaint error:", error);
      setReplyMessage(
        error?.response?.data?.message || "Failed to send reply."
      );
    } finally {
      setReplyLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedComplaint?._id) return;

    try {
      setStatusLoading(true);
      setReplyMessage("");

      const res = await axios.put(
        `${API_BASE}/complaints/${selectedComplaint._id}/status`,
        {
          status: newStatus,
        }
      );

      const updatedComplaint = res?.data?.complaint;

      const updatedList = complaints.map((item) =>
        item._id === selectedComplaint._id ? updatedComplaint : item
      );

      setComplaints(updatedList);
      setSelectedComplaint(updatedComplaint);
      setReplyMessage("Complaint status updated successfully.");
    } catch (error) {
      console.log("Update status error:", error);
      setReplyMessage(
        error?.response?.data?.message || "Failed to update status."
      );
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="cmcomplaints-page">
      <div className="cmcomplaints-header">
        <div>
          <span className="cmcomplaints-badge">Complaint Center</span>
          <h2>Customer Complaints Management</h2>
          <p>
            View all customer complaints, track complaint status, send replies,
            and review already replied complaints from one place.
          </p>
        </div>

        <button className="cmcomplaints-refresh-btn" onClick={fetchComplaints}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      <div className="cmcomplaints-stats-grid">
        <div className="cmcomplaints-stat-card">
          <div className="cmcomplaints-stat-icon green">
            <FaComments />
          </div>
          <div>
            <p>Total Complaints</p>
            <h3>{stats.total}</h3>
          </div>
        </div>

        <div className="cmcomplaints-stat-card">
          <div className="cmcomplaints-stat-icon orange">
            <FaClock />
          </div>
          <div>
            <p>Pending</p>
            <h3>{stats.pending}</h3>
          </div>
        </div>

        <div className="cmcomplaints-stat-card">
          <div className="cmcomplaints-stat-icon green">
            <FaSpinner />
          </div>
          <div>
            <p>In Progress</p>
            <h3>{stats.inProgress}</h3>
          </div>
        </div>

        <div className="cmcomplaints-stat-card">
          <div className="cmcomplaints-stat-icon orange">
            <FaCheckCircle />
          </div>
          <div>
            <p>Resolved</p>
            <h3>{stats.resolved}</h3>
          </div>
        </div>

        <div className="cmcomplaints-stat-card">
          <div className="cmcomplaints-stat-icon green">
            <FaReply />
          </div>
          <div>
            <p>Replied</p>
            <h3>{stats.replied}</h3>
          </div>
        </div>
      </div>

      <div className="cmcomplaints-toolbar">
        <div className="cmcomplaints-search-box">
          <FaSearch className="cmcomplaints-search-icon" />
          <input
            type="text"
            placeholder="Search by customer, email, subject, category, order id"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="cmcomplaints-filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={replyFilter}
            onChange={(e) => setReplyFilter(e.target.value)}
          >
            <option value="ALL">All Replies</option>
            <option value="REPLIED">Replied</option>
            <option value="NOT_REPLIED">Not Replied</option>
          </select>
        </div>
      </div>

      <div className="cmcomplaints-content-grid">
        <div className="cmcomplaints-table-card">
          <div className="cmcomplaints-card-head">
            <h3>Complaint List</h3>
            <span>{filteredComplaints.length} records</span>
          </div>

          {loading ? (
            <div className="cmcomplaints-empty-box">Loading complaints...</div>
          ) : fetchError ? (
            <div className="cmcomplaints-empty-box error">{fetchError}</div>
          ) : filteredComplaints.length === 0 ? (
            <div className="cmcomplaints-empty-box">
              No complaints found for current filters.
            </div>
          ) : (
            <div className="cmcomplaints-table-wrap">
              <table className="cmcomplaints-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Reply</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="cmcomplaints-user-cell">
                          <div className="cmcomplaints-avatar">
                            {item?.fullName?.charAt(0)?.toUpperCase() || "C"}
                          </div>
                          <div>
                            <h4>{item?.fullName}</h4>
                            <p>{item?.email}</p>
                          </div>
                        </div>
                      </td>

                      <td>{item?.category || "-"}</td>

                      <td>
                        <span
                          className={`cmcomplaints-status ${getStatusClass(
                            item?.status
                          )}`}
                        >
                          {item?.status}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            item?.adminReply?.trim()
                              ? "cmcomplaints-reply-tag yes"
                              : "cmcomplaints-reply-tag no"
                          }
                        >
                          {item?.adminReply?.trim() ? "Replied" : "No Reply"}
                        </span>
                      </td>

                      <td>{formatDateTime(item?.createdAt)}</td>

                      <td>
                        <button
                          className="cmcomplaints-view-btn"
                          onClick={() => openComplaint(item)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="cmcomplaints-details-card">
          <div className="cmcomplaints-card-head">
            <h3>Complaint Details</h3>
            <span>Reply panel</span>
          </div>

          {!selectedComplaint ? (
            <div className="cmcomplaints-empty-box">
              Select a complaint to view details and reply.
            </div>
          ) : (
            <div className="cmcomplaints-details-body">
              <div className="cmcomplaints-top">
                <div className="cmcomplaints-avatar large">
                  {selectedComplaint?.fullName?.charAt(0)?.toUpperCase() || "C"}
                </div>

                <div className="cmcomplaints-top-text">
                  <h3>{selectedComplaint?.fullName}</h3>
                  <p>{selectedComplaint?.email}</p>
                  <div className="cmcomplaints-top-badges">
                    <span
                      className={`cmcomplaints-status ${getStatusClass(
                        selectedComplaint?.status
                      )}`}
                    >
                      {selectedComplaint?.status}
                    </span>

                    <span
                      className={
                        selectedComplaint?.adminReply?.trim()
                          ? "cmcomplaints-reply-tag yes"
                          : "cmcomplaints-reply-tag no"
                      }
                    >
                      {selectedComplaint?.adminReply?.trim()
                        ? "Already Replied"
                        : "Awaiting Reply"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="cmcomplaints-detail-grid">
                <div className="cmcomplaints-detail-item">
                  <span className="cmcomplaints-detail-label">
                    <FaUser /> Customer Name
                  </span>
                  <p>{selectedComplaint?.fullName || "Not available"}</p>
                </div>

                <div className="cmcomplaints-detail-item">
                  <span className="cmcomplaints-detail-label">
                    <FaEnvelope /> Email
                  </span>
                  <p>{selectedComplaint?.email || "Not available"}</p>
                </div>

                <div className="cmcomplaints-detail-item">
                  <span className="cmcomplaints-detail-label">
                    <FaTag /> Category
                  </span>
                  <p>{selectedComplaint?.category || "Not available"}</p>
                </div>

                <div className="cmcomplaints-detail-item">
                  <span className="cmcomplaints-detail-label">
                    <FaClipboardList /> Order ID
                  </span>
                  <p>{selectedComplaint?.orderId || "Not provided"}</p>
                </div>

                <div className="cmcomplaints-detail-item full">
                  <span className="cmcomplaints-detail-label">
                    <FaComments /> Subject
                  </span>
                  <p>{selectedComplaint?.subject || "Not available"}</p>
                </div>

                <div className="cmcomplaints-detail-item full">
                  <span className="cmcomplaints-detail-label">
                    <FaComments /> Complaint Message
                  </span>
                  <p>{selectedComplaint?.complaint || "Not available"}</p>
                </div>

                {selectedComplaint?.image && (
                  <div className="cmcomplaints-detail-item full">
                    <span className="cmcomplaints-detail-label">
                      <FaImage /> Complaint Image
                    </span>
                    <img
                      src={`${API_BASE}${selectedComplaint.image}`}
                      alt="Complaint attachment"
                      className="cmcomplaints-preview-image"
                    />
                  </div>
                )}

                <div className="cmcomplaints-detail-item">
                  <span className="cmcomplaints-detail-label">
                    <FaClock /> Created At
                  </span>
                  <p>{formatDateTime(selectedComplaint?.createdAt)}</p>
                </div>

                <div className="cmcomplaints-detail-item">
                  <span className="cmcomplaints-detail-label">
                    <FaReply /> Replied At
                  </span>
                  <p>{formatDateTime(selectedComplaint?.repliedAt)}</p>
                </div>

                {selectedComplaint?.adminReply?.trim() && (
                  <div className="cmcomplaints-detail-item full reply-box">
                    <span className="cmcomplaints-detail-label">
                      <FaReply /> Existing Reply
                    </span>
                    <p>{selectedComplaint?.adminReply}</p>
                  </div>
                )}
              </div>

              <div className="cmcomplaints-status-actions">
                <button
                  className="cmcomplaints-status-btn pending"
                  onClick={() => handleStatusUpdate("Pending")}
                  disabled={statusLoading}
                >
                  Pending
                </button>
                <button
                  className="cmcomplaints-status-btn progress"
                  onClick={() => handleStatusUpdate("In Progress")}
                  disabled={statusLoading}
                >
                  In Progress
                </button>
                <button
                  className="cmcomplaints-status-btn resolved"
                  onClick={() => handleStatusUpdate("Resolved")}
                  disabled={statusLoading}
                >
                  Resolved
                </button>
                <button
                  className="cmcomplaints-status-btn rejected"
                  onClick={() => handleStatusUpdate("Rejected")}
                  disabled={statusLoading}
                >
                  Rejected
                </button>
              </div>

              <div className="cmcomplaints-reply-panel">
                <h4>
                  {selectedComplaint?.adminReply?.trim()
                    ? "Update Reply"
                    : "Send Reply"}
                </h4>

                <textarea
                  placeholder="Type your reply to the customer here..."
                  rows="5"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />

                {replyMessage && (
                  <div className="cmcomplaints-message-box">{replyMessage}</div>
                )}

                <button
                  className="cmcomplaints-send-btn"
                  onClick={handleReplySubmit}
                  disabled={replyLoading}
                >
                  <FaPaperPlane />
                  <span>{replyLoading ? "Sending..." : "Send Reply"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}