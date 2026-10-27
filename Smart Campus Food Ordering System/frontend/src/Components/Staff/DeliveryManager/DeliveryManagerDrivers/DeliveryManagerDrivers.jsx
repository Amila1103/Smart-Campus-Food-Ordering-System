import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaUserCheck,
  FaUserTimes,
  FaTimes,
} from "react-icons/fa";
import "./DeliveryManagerDrivers.css";

const API_BASE = "http://localhost:5000";

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "delivery",
  phone: "",
  vehicleType: "",
  experience: "",
  isOnline: false,
};

export default function DeliveryManagerDrivers() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState(initialForm);
  const [editingStaff, setEditingStaff] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 3000);
  };

  const getStaffData = () => {
    try {
      return JSON.parse(localStorage.getItem("staff") || "{}");
    } catch {
      return {};
    }
  };

  const getToken = () => {
    return localStorage.getItem("staffToken") || getStaffData()?.token || "";
  };

  const fetchDeliveryStaffs = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        setStaffs([]);
        return;
      }

      const res = await axios.get(`${API_BASE}/staffs/delivery-team/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStaffs(res.data?.staffs || []);
    } catch (error) {
      console.log("fetchDeliveryStaffs error:", error);
      console.log("fetchDeliveryStaffs error response:", error.response);

      if (error.response?.status === 403) {
        showMessage(
          "error",
          "Access denied. Login with a delivery manager account."
        );
      } else if (error.response?.status === 401) {
        showMessage("error", "Unauthorized. Please login again.");
      } else {
        showMessage(
          "error",
          error.response?.data?.message || "Failed to load delivery staff"
        );
      }
      setStaffs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryStaffs();
  }, []);

  const filteredStaffs = useMemo(() => {
    const value = searchText.trim().toLowerCase();

    return staffs.filter((staff) => {
      if (!value) return true;

      return (
        String(staff.name || "").toLowerCase().includes(value) ||
        String(staff.email || "").toLowerCase().includes(value) ||
        String(staff.role || "").toLowerCase().includes(value) ||
        String(staff.phone || "").toLowerCase().includes(value) ||
        String(staff.vehicleType || "").toLowerCase().includes(value)
      );
    });
  }, [staffs, searchText]);

  const onlineCount = filteredStaffs.filter((staff) => staff.isOnline).length;
  const offlineCount = filteredStaffs.filter((staff) => !staff.isOnline).length;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddModal = () => {
    setFormData(initialForm);
    setShowAddModal(true);
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name || "",
      email: staff.email || "",
      password: "",
      role: "delivery",
      phone: staff.phone || "",
      vehicleType: staff.vehicleType || "",
      experience: staff.experience || "",
      isOnline: !!staff.isOnline,
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingStaff(null);
    setFormData(initialForm);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const token = getToken();
      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        vehicleType: formData.vehicleType.trim(),
        experience: formData.experience.trim(),
      };

      const res = await axios.post(`${API_BASE}/staffs/delivery-team`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showMessage(
        "success",
        res.data?.message || "Delivery staff added successfully"
      );
      closeModals();
      fetchDeliveryStaffs();
    } catch (error) {
      console.log("handleAddStaff error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to add delivery staff"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();

    if (!editingStaff?._id) return;

    try {
      setSubmitting(true);

      const token = getToken();
      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        vehicleType: formData.vehicleType.trim(),
        experience: formData.experience.trim(),
        isOnline: formData.isOnline,
      };

      if (formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      const res = await axios.put(
        `${API_BASE}/staffs/delivery-team/${editingStaff._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMessage(
        "success",
        res.data?.message || "Delivery staff updated successfully"
      );
      closeModals();
      fetchDeliveryStaffs();
    } catch (error) {
      console.log("handleEditStaff error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to update delivery staff"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staff) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${staff.name || "this staff"}?`
    );

    if (!confirmed) return;

    try {
      const token = getToken();
      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        return;
      }

      const res = await axios.delete(
        `${API_BASE}/staffs/delivery-team/${staff._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMessage(
        "success",
        res.data?.message || "Delivery staff deleted successfully"
      );
      fetchDeliveryStaffs();
    } catch (error) {
      console.log("handleDeleteStaff error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to delete delivery staff"
      );
    }
  };

  return (
    <section className="dmdrivers-wrapper">
      <div className="dmdrivers-header">
        <div className="dmdrivers-header-left">
          <div className="dmdrivers-header-icon">
            <FaUsers />
          </div>

          <div>
            <span className="dmdrivers-badge">Driver Management</span>
            <h2>Delivery Staff Management</h2>
            <p>View, add, edit, and delete all delivery staff members.</p>
          </div>
        </div>

        <div className="dmdrivers-header-actions">
          <button className="dmdrivers-refresh-btn" onClick={fetchDeliveryStaffs}>
            <FaSyncAlt />
            <span>Refresh</span>
          </button>

          <button className="dmdrivers-add-btn" onClick={openAddModal}>
            <FaPlus />
            <span>Add Driver</span>
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`dmdrivers-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="dmdrivers-stats-grid">
        <div className="dmdrivers-stat-card">
          <div className="dmdrivers-stat-icon green">
            <FaUsers />
          </div>
          <div>
            <h3>{filteredStaffs.length}</h3>
            <p>Total Drivers</p>
          </div>
        </div>

        <div className="dmdrivers-stat-card">
          <div className="dmdrivers-stat-icon green">
            <FaUserCheck />
          </div>
          <div>
            <h3>{onlineCount}</h3>
            <p>Online Drivers</p>
          </div>
        </div>

        <div className="dmdrivers-stat-card">
          <div className="dmdrivers-stat-icon orange">
            <FaUserTimes />
          </div>
          <div>
            <h3>{offlineCount}</h3>
            <p>Offline Drivers</p>
          </div>
        </div>
      </div>

      <div className="dmdrivers-toolbar">
        <div className="dmdrivers-search-box">
          <FaSearch className="dmdrivers-search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, role, phone or vehicle..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="dmdrivers-state-card">
          <p>Loading delivery staff...</p>
        </div>
      ) : filteredStaffs.length === 0 ? (
        <div className="dmdrivers-state-card">
          <p>No delivery staff found.</p>
        </div>
      ) : (
        <div className="dmdrivers-table-wrap">
          <table className="dmdrivers-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>Experience</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStaffs.map((staff) => (
                <tr key={staff._id}>
                  <td>
                    <div className="dmdrivers-name-cell">
                      <div className="dmdrivers-name-avatar">
                        {String(staff.name || "D").charAt(0).toUpperCase()}
                      </div>
                      <div className="dmdrivers-name-text">
                        <strong>{staff.name || "N/A"}</strong>
                        <span>{staff.email || "N/A"}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="dmdrivers-email-text">
                      {staff.email || "N/A"}
                    </span>
                  </td>

                  <td>{staff.phone || "N/A"}</td>

                  <td>
                    <span className="dmdrivers-vehicle-pill">
                      {staff.vehicleType || "N/A"}
                    </span>
                  </td>

                  <td>{staff.experience || "N/A"}</td>

                  <td>
                    <span className="dmdrivers-role-pill">
                      {staff.role || "delivery"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`dmdrivers-status-pill ${
                        staff.isOnline ? "online" : "offline"
                      }`}
                    >
                      {staff.isOnline ? "Online" : "Offline"}
                    </span>
                  </td>

                  <td>
                    <span className="dmdrivers-date-text">
                      {staff.createdAt
                        ? new Date(staff.createdAt).toLocaleString()
                        : "N/A"}
                    </span>
                  </td>

                  <td>
                    <div className="dmdrivers-action-group">
                      <button
                        className="dmdrivers-edit-btn"
                        onClick={() => openEditModal(staff)}
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        className="dmdrivers-delete-btn"
                        onClick={() => handleDeleteStaff(staff)}
                      >
                        <FaTrash />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(showAddModal || showEditModal) && (
        <div className="dmdrivers-modal-overlay" onClick={closeModals}>
          <div
            className="dmdrivers-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dmdrivers-modal-header">
              <h3>{showAddModal ? "Add Delivery Staff" : "Edit Delivery Staff"}</h3>
              <button className="dmdrivers-close-btn" onClick={closeModals}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleAddStaff : handleEditStaff}>
              <div className="dmdrivers-form-grid">
                <div className="dmdrivers-form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="dmdrivers-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="dmdrivers-form-group">
                  <label>
                    Password {showEditModal && <span>(leave blank to keep current)</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    required={showAddModal}
                  />
                </div>

                <div className="dmdrivers-form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="dmdrivers-form-group">
                  <label>Vehicle Type</label>
                  <input
                    type="text"
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleInputChange}
                    placeholder="Bike / Three Wheel / Van"
                  />
                </div>

                <div className="dmdrivers-form-group">
                  <label>Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Enter experience"
                  />
                </div>

                <div className="dmdrivers-form-group">
                  <label>Role</label>
                  <input type="text" value="delivery" disabled />
                </div>

                {showEditModal && (
                  <div className="dmdrivers-form-group dmdrivers-checkbox-group">
                    <label className="dmdrivers-checkbox-label">
                      <input
                        type="checkbox"
                        name="isOnline"
                        checked={formData.isOnline}
                        onChange={handleInputChange}
                      />
                      Set Online Status
                    </label>
                  </div>
                )}
              </div>

              <div className="dmdrivers-modal-actions">
                <button
                  type="button"
                  className="dmdrivers-cancel-btn"
                  onClick={closeModals}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="dmdrivers-save-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : showAddModal
                    ? "Add Driver"
                    : "Update Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}