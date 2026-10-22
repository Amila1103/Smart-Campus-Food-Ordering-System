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
  FaUserShield,
} from "react-icons/fa";
import "./AdminStaffManagement.css";

const API_BASE = "http://localhost:5000";

const VEHICLE_OPTIONS = [
  "Bike",
  "Scooter",
  "Three Wheel",
  "Van",
  "Car",
  "Bicycle",
];

const initialForm = {
  name: "",
  email: "",
  password: "",
  role: "delivery",
  phone: "+94",
  vehicleType: "",
  experience: "",
  isOnline: false,
};

export default function AdminStaffManagement() {
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
    const staffData = getStaffData();
    return staffData?.token || localStorage.getItem("staffToken");
  };

  const isStrongPassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(
      password
    );
  };

  const formatSriLankaPhone = (value) => {
    let cleaned = String(value || "").replace(/[^\d+]/g, "");

    if (!cleaned.startsWith("+94")) {
      const digitsOnly = cleaned.replace(/\D/g, "");

      if (digitsOnly.startsWith("94")) {
        cleaned = `+${digitsOnly}`;
      } else if (digitsOnly.startsWith("0")) {
        cleaned = `+94${digitsOnly.slice(1)}`;
      } else {
        cleaned = `+94${digitsOnly}`;
      }
    }

    const afterPrefix = cleaned.slice(3).replace(/\D/g, "").slice(0, 9);
    return `+94${afterPrefix}`;
  };

  const isValidSriLankaPhone = (phone) => {
    return /^\+94\d{9}$/.test(String(phone || "").trim());
  };

  const fetchAllStaffs = async () => {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        setStaffs([]);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${API_BASE}/staffs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allStaffs = res.data?.staffs || [];
      setStaffs(allStaffs);
    } catch (error) {
      console.log("fetchAllStaffs error:", error);
      console.log("fetchAllStaffs error response:", error.response);

      if (error.response?.status === 403) {
        showMessage("error", "Access denied. Login with an admin account.");
      } else if (error.response?.status === 401) {
        showMessage("error", "Unauthorized. Please login again.");
      } else {
        showMessage(
          "error",
          error.response?.data?.message || "Failed to load staff members"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStaffs();
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
        String(staff.vehicleType || "").toLowerCase().includes(value) ||
        String(staff.experience || "").toLowerCase().includes(value)
      );
    });
  }, [staffs, searchText]);

  const onlineCount = filteredStaffs.filter((staff) => staff.isOnline).length;
  const offlineCount = filteredStaffs.filter((staff) => !staff.isOnline).length;
  const adminCount = filteredStaffs.filter(
    (staff) => String(staff.role || "").toLowerCase().trim() === "admin"
  ).length;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "phone") {
      setFormData((prev) => ({
        ...prev,
        phone: formatSriLankaPhone(value),
      }));
      return;
    }

    if (name === "role") {
      setFormData((prev) => ({
        ...prev,
        role: value,
        vehicleType: value === "delivery" ? prev.vehicleType : "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddModal = () => {
    setEditingStaff(null);
    setFormData(initialForm);
    setShowAddModal(true);
  };

  const openEditModal = (staff) => {
    const normalizedPhone = staff.phone
      ? formatSriLankaPhone(staff.phone)
      : "+94";

    setEditingStaff(staff);
    setFormData({
      name: staff.name || "",
      email: staff.email || "",
      password: "",
      role: staff.role || "delivery",
      phone: normalizedPhone,
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

  const validateCommonFields = () => {
    if (!isValidSriLankaPhone(formData.phone)) {
      showMessage(
        "error",
        "Phone number must be in +94 format and contain 11 characters like +94712345678."
      );
      return false;
    }

    if (formData.role === "delivery" && !formData.vehicleType) {
      showMessage("error", "Please select a vehicle type for delivery staff.");
      return false;
    }

    return true;
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();

    if (!isStrongPassword(formData.password)) {
      showMessage(
        "error",
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    if (!validateCommonFields()) return;

    try {
      setSubmitting(true);

      const token = getToken();
      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        return;
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phone: formData.phone,
        vehicleType: formData.role === "delivery" ? formData.vehicleType : "",
        experience: formData.experience,
        isOnline: formData.isOnline,
      };

      const res = await axios.post(`${API_BASE}/staffs`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showMessage(
        "success",
        res.data?.message || "Staff member added successfully"
      );
      closeModals();
      fetchAllStaffs();
    } catch (error) {
      console.log("handleAddStaff error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to add staff member"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();

    if (!editingStaff?._id) return;

    if (formData.password.trim() && !isStrongPassword(formData.password)) {
      showMessage(
        "error",
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character."
      );
      return;
    }

    if (!validateCommonFields()) return;

    try {
      setSubmitting(true);

      const token = getToken();
      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        return;
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        vehicleType: formData.role === "delivery" ? formData.vehicleType : "",
        experience: formData.experience,
        isOnline: formData.isOnline,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      const res = await axios.put(
        `${API_BASE}/staffs/${editingStaff._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMessage(
        "success",
        res.data?.message || "Staff updated successfully"
      );
      closeModals();
      fetchAllStaffs();
    } catch (error) {
      console.log("handleEditStaff error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to update staff member"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staff) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${staff.name || "this staff member"}?`
    );

    if (!confirmed) return;

    try {
      const token = getToken();
      if (!token) {
        showMessage("error", "Staff token not found. Please login again.");
        return;
      }

      const res = await axios.delete(`${API_BASE}/staffs/${staff._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showMessage(
        "success",
        res.data?.message || "Staff member deleted successfully"
      );
      fetchAllStaffs();
    } catch (error) {
      console.log("handleDeleteStaff error:", error);
      showMessage(
        "error",
        error.response?.data?.message || "Failed to delete staff member"
      );
    }
  };

  const getRoleBadgeClass = (role) => {
    const normalizedRole = String(role || "").toLowerCase().trim();

    if (normalizedRole === "admin") return "adstaff-role-pill admin";
    if (normalizedRole === "vendor") return "adstaff-role-pill vendor";
    if (normalizedRole === "delivery") return "adstaff-role-pill delivery";
    if (normalizedRole === "customer manager")
      return "adstaff-role-pill customer-manager";
    if (normalizedRole === "delivery manager")
      return "adstaff-role-pill delivery-manager";

    return "adstaff-role-pill default";
  };

  return (
    <section className="adstaff-wrapper">
      <div className="adstaff-header">
        <div className="adstaff-header-left">
          <div className="adstaff-header-icon">
            <FaUserShield />
          </div>

          <div>
            <span className="adstaff-badge">Admin Panel</span>
            <h2>Staff Management</h2>
            <p>View, add, edit, and delete all staff members across all roles.</p>
          </div>
        </div>

        <div className="adstaff-header-actions">
          <button className="adstaff-refresh-btn" onClick={fetchAllStaffs}>
            <FaSyncAlt />
            <span>Refresh</span>
          </button>

          <button className="adstaff-add-btn" onClick={openAddModal}>
            <FaPlus />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`adstaff-alert ${message.type}`}>{message.text}</div>
      )}

      <div className="adstaff-stats-grid">
        <div className="adstaff-stat-card">
          <div className="adstaff-stat-icon green-card">
            <FaUsers />
          </div>
          <div>
            <h3>{filteredStaffs.length}</h3>
            <p>Total Staff</p>
          </div>
        </div>

        <div className="adstaff-stat-card">
          <div className="adstaff-stat-icon green-card">
            <FaUserCheck />
          </div>
          <div>
            <h3>{onlineCount}</h3>
            <p>Online Staff</p>
          </div>
        </div>

        <div className="adstaff-stat-card">
          <div className="adstaff-stat-icon orange-card">
            <FaUserTimes />
          </div>
          <div>
            <h3>{offlineCount}</h3>
            <p>Offline Staff</p>
          </div>
        </div>

        <div className="adstaff-stat-card">
          <div className="adstaff-stat-icon orange-card">
            <FaUserShield />
          </div>
          <div>
            <h3>{adminCount}</h3>
            <p>Admins</p>
          </div>
        </div>
      </div>

      <div className="adstaff-toolbar">
        <div className="adstaff-search-box">
          <FaSearch className="adstaff-search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, role, phone, vehicle or experience..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="adstaff-state-card">
          <p>Loading staff members...</p>
        </div>
      ) : filteredStaffs.length === 0 ? (
        <div className="adstaff-state-card">
          <p>No staff members found.</p>
        </div>
      ) : (
        <div className="adstaff-table-wrap">
          <table className="adstaff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Vehicle Type</th>
                <th>Experience</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStaffs.map((staff) => (
                <tr key={staff._id}>
                  <td>{staff.name || "N/A"}</td>
                  <td>{staff.email || "N/A"}</td>
                  <td>
                    <span className={getRoleBadgeClass(staff.role)}>
                      {staff.role || "N/A"}
                    </span>
                  </td>
                  <td>{staff.phone || "N/A"}</td>
                  <td>{staff.role === "delivery" ? staff.vehicleType || "N/A" : "-"}</td>
                  <td>{staff.experience || "N/A"}</td>
                  <td>
                    <span
                      className={`adstaff-status-pill ${
                        staff.isOnline ? "online" : "offline"
                      }`}
                    >
                      {staff.isOnline ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td>
                    {staff.createdAt
                      ? new Date(staff.createdAt).toLocaleString()
                      : "N/A"}
                  </td>
                  <td>
                    <div className="adstaff-action-group">
                      <button
                        className="adstaff-edit-btn"
                        onClick={() => openEditModal(staff)}
                      >
                        <FaEdit />
                        Edit
                      </button>

                      <button
                        className="adstaff-delete-btn"
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
        <div className="adstaff-modal-overlay" onClick={closeModals}>
          <div
            className="adstaff-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adstaff-modal-header">
              <h3>{showAddModal ? "Add Staff Member" : "Edit Staff Member"}</h3>
              <button className="adstaff-close-btn" onClick={closeModals}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={showAddModal ? handleAddStaff : handleEditStaff}>
              <div className="adstaff-form-grid">
                <div className="adstaff-form-group">
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

                <div className="adstaff-form-group">
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

                <div className="adstaff-form-group">
                  <label>
                    {showAddModal ? "Password" : "New Password"}
                    {!showAddModal && (
                      <span> (leave blank to keep current password)</span>
                    )}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={
                      showAddModal
                        ? "Enter strong password"
                        : "Enter new strong password"
                    }
                    required={showAddModal}
                  />
                </div>

                <div className="adstaff-form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="vendor">Vendor</option>
                    <option value="delivery">Delivery</option>
                    <option value="customer manager">Customer Manager</option>
                    <option value="delivery manager">Delivery Manager</option>
                  </select>
                </div>

                <div className="adstaff-form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+94712345678"
                    maxLength={12}
                    required
                  />
                  <small className="adstaff-field-hint">
                    Use +94 format only. Example: +94712345678
                  </small>
                </div>

                {formData.role === "delivery" && (
                  <div className="adstaff-form-group">
                    <label>Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      required={formData.role === "delivery"}
                    >
                      <option value="">Select vehicle type</option>
                      {VEHICLE_OPTIONS.map((vehicle) => (
                        <option key={vehicle} value={vehicle}>
                          {vehicle}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="adstaff-form-group">
                  <label>Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Enter experience"
                  />
                </div>

                <div className="adstaff-form-group adstaff-checkbox-group">
                  <label className="adstaff-checkbox-label">
                    <input
                      type="checkbox"
                      name="isOnline"
                      checked={formData.isOnline}
                      onChange={handleInputChange}
                    />
                    Set staff online status
                  </label>
                </div>
              </div>

              <div className="adstaff-modal-actions">
                <button
                  type="button"
                  className="adstaff-cancel-btn"
                  onClick={closeModals}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="adstaff-save-btn"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : showAddModal
                    ? "Add Staff"
                    : "Update Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}