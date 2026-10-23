import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaSearch,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaVenusMars,
  FaCircle,
  FaUtensils,
  FaExclamationTriangle,
  FaBullseye,
  FaStickyNote,
  FaSyncAlt,
  FaEdit,
  FaTrashAlt,
  FaTimes,
  FaSave,
} from "react-icons/fa";
import "./CustomerManagerCustomers.css";

const API_BASE = "http://localhost:5000";

export default function CustomerManagerCustomers() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    gender: "",
    gmail: "",
    password: "",
    isOnline: false,
    dietaryPreferences: "",
    allergies: "",
    otherAllergy: "",
    calorieGoal: "",
    notes: "",
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setFetchError("");

      const res = await axios.get(`${API_BASE}/Customers`);
      const customerList = Array.isArray(res?.data?.Customers)
        ? res.data.Customers
        : [];

      setCustomers(customerList);
      setFilteredCustomers(customerList);

      if (selectedCustomer) {
        const updatedSelected = customerList.find(
          (item) => item._id === selectedCustomer._id
        );
        setSelectedCustomer(updatedSelected || null);
      }
    } catch (error) {
      console.log("Fetch customers error:", error);
      setFetchError("Failed to load customers.");
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    let result = [...customers];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((customer) => {
        return (
          customer?.name?.toLowerCase().includes(term) ||
          customer?.gmail?.toLowerCase().includes(term) ||
          String(customer?.phoneNumber || "").includes(term) ||
          customer?.address?.toLowerCase().includes(term)
        );
      });
    }

    if (genderFilter !== "ALL") {
      result = result.filter(
        (customer) =>
          (customer?.gender || "").toLowerCase() === genderFilter.toLowerCase()
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter((customer) =>
        statusFilter === "ONLINE" ? customer?.isOnline : !customer?.isOnline
      );
    }

    setFilteredCustomers(result);
  }, [customers, searchTerm, genderFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const onlineCustomers = customers.filter((item) => item.isOnline).length;
    const offlineCustomers = totalCustomers - onlineCustomers;
    const withDietary = customers.filter(
      (item) =>
        (Array.isArray(item.dietaryPreferences) &&
          item.dietaryPreferences.length > 0) ||
        (Array.isArray(item.allergies) && item.allergies.length > 0) ||
        item.otherAllergy ||
        item.calorieGoal ||
        item.notes
    ).length;

    return {
      totalCustomers,
      onlineCustomers,
      offlineCustomers,
      withDietary,
    };
  }, [customers]);

  const formatTextList = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return "Not specified";
    return arr.join(", ");
  };

  const convertTextToArray = (text) => {
    if (!text || !text.trim()) return [];
    return text
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const openEditMode = (customer) => {
    setActionMessage("");
    setSelectedCustomer(customer);
    setEditForm({
      name: customer?.name || "",
      phoneNumber: customer?.phoneNumber || "",
      address: customer?.address || "",
      gender: customer?.gender || "",
      gmail: customer?.gmail || "",
      password: "",
      isOnline: !!customer?.isOnline,
      dietaryPreferences: Array.isArray(customer?.dietaryPreferences)
        ? customer.dietaryPreferences.join(", ")
        : "",
      allergies: Array.isArray(customer?.allergies)
        ? customer.allergies.join(", ")
        : "",
      otherAllergy: customer?.otherAllergy || "",
      calorieGoal: customer?.calorieGoal || "",
      notes: customer?.notes || "",
    });
    setIsEditMode(true);
  };

  const closeEditMode = () => {
    setIsEditMode(false);
    setActionMessage("");
  };

  const openDeleteModal = (customer) => {
    setSelectedCustomer(customer);
    setActionMessage("");
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
    setActionMessage("");
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();

    if (!selectedCustomer?._id) return;

    try {
      setActionLoading(true);
      setActionMessage("");

      const payload = {
        name: editForm.name,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
        gender: editForm.gender,
        gmail: editForm.gmail,
        isOnline: editForm.isOnline,
        dietaryPreferences: convertTextToArray(editForm.dietaryPreferences),
        allergies: convertTextToArray(editForm.allergies),
        otherAllergy: editForm.otherAllergy,
        calorieGoal: editForm.calorieGoal,
        notes: editForm.notes,
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }

      const res = await axios.put(
        `${API_BASE}/Customers/${selectedCustomer._id}`,
        payload
      );

      const updatedCustomer = res?.data?.Customers;

      const updatedList = customers.map((item) =>
        item._id === selectedCustomer._id ? updatedCustomer : item
      );

      setCustomers(updatedList);
      setSelectedCustomer(updatedCustomer);
      setActionMessage("Customer updated successfully.");

      setTimeout(() => {
        setIsEditMode(false);
        setActionMessage("");
      }, 800);
    } catch (error) {
      console.log("Update customer error:", error);
      setActionMessage(
        error?.response?.data?.message || "Failed to update customer."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!selectedCustomer?._id) return;

    try {
      setActionLoading(true);
      setActionMessage("");

      await axios.delete(`${API_BASE}/Customers/${selectedCustomer._id}`);

      const updatedList = customers.filter(
        (item) => item._id !== selectedCustomer._id
      );

      setCustomers(updatedList);
      setFilteredCustomers(updatedList);
      setIsEditMode(false);
      setSelectedCustomer(null);
      setActionMessage("Customer deleted successfully.");

      setTimeout(() => {
        setIsDeleteOpen(false);
        setActionMessage("");
      }, 800);
    } catch (error) {
      console.log("Delete customer error:", error);
      setActionMessage(
        error?.response?.data?.message || "Failed to delete customer."
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="cmcustomers-page">
      <div className="cmcustomers-header">
        <div>
          <span className="cmcustomers-mini-badge">Customer Directory</span>
          <h2>Customer Management</h2>
          <p>
            View all registered customers, track online status, review dietary
            information, and manage records from one place.
          </p>
        </div>

        <button className="cmcustomers-refresh-btn" onClick={fetchCustomers}>
          <FaSyncAlt />
          <span>Refresh</span>
        </button>
      </div>

      <div className="cmcustomers-stats-grid">
        <div className="cmcustomers-stat-card">
          <div className="cmcustomers-stat-icon green">
            <FaUsers />
          </div>
          <div>
            <p>Total Customers</p>
            <h3>{stats.totalCustomers}</h3>
          </div>
        </div>

        <div className="cmcustomers-stat-card">
          <div className="cmcustomers-stat-icon orange">
            <FaCircle />
          </div>
          <div>
            <p>Online Customers</p>
            <h3>{stats.onlineCustomers}</h3>
          </div>
        </div>

        <div className="cmcustomers-stat-card">
          <div className="cmcustomers-stat-icon green">
            <FaCircle />
          </div>
          <div>
            <p>Offline Customers</p>
            <h3>{stats.offlineCustomers}</h3>
          </div>
        </div>

        <div className="cmcustomers-stat-card">
          <div className="cmcustomers-stat-icon orange">
            <FaUtensils />
          </div>
          <div>
            <p>Dietary Records</p>
            <h3>{stats.withDietary}</h3>
          </div>
        </div>
      </div>

      <div className="cmcustomers-toolbar">
        <div className="cmcustomers-search-box">
          <FaSearch className="cmcustomers-search-icon" />
          <input
            type="text"
            placeholder="Search by name, gmail, phone, or address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="cmcustomers-filter-group">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="ALL">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
          </select>
        </div>
      </div>

      <div className="cmcustomers-content-grid">
        <div className="cmcustomers-table-card">
          <div className="cmcustomers-card-head">
            <h3>Registered Customers</h3>
            <span>{filteredCustomers.length} records</span>
          </div>

          {loading ? (
            <div className="cmcustomers-empty-box">Loading customers...</div>
          ) : fetchError ? (
            <div className="cmcustomers-empty-box error">{fetchError}</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="cmcustomers-empty-box">
              No customers found for current filters.
            </div>
          ) : (
            <div className="cmcustomers-table-wrap">
              <table className="cmcustomers-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>Status</th>
                    <th>Dietary</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => {
                    const hasDietary =
                      (Array.isArray(customer?.dietaryPreferences) &&
                        customer.dietaryPreferences.length > 0) ||
                      (Array.isArray(customer?.allergies) &&
                        customer.allergies.length > 0) ||
                      customer?.otherAllergy ||
                      customer?.calorieGoal ||
                      customer?.notes;

                    return (
                      <tr key={customer._id}>
                        <td>
                          <div className="cmcustomers-user-cell">
                            <div className="cmcustomers-avatar">
                              {customer?.name?.charAt(0)?.toUpperCase() || "C"}
                            </div>
                            <div>
                              <h4>{customer?.name || "No name"}</h4>
                              <p>{customer?.gmail || "No gmail"}</p>
                            </div>
                          </div>
                        </td>

                        <td>{customer?.phoneNumber || "-"}</td>
                        <td>{customer?.gender || "-"}</td>
                        <td>
                          <span
                            className={
                              customer?.isOnline
                                ? "cmcustomers-status online"
                                : "cmcustomers-status offline"
                            }
                          >
                            {customer?.isOnline ? "Online" : "Offline"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              hasDietary
                                ? "cmcustomers-dietary yes"
                                : "cmcustomers-dietary no"
                            }
                          >
                            {hasDietary ? "Available" : "Empty"}
                          </span>
                        </td>
                        <td>
                          <div className="cmcustomers-action-group">
                            <button
                              className="cmcustomers-view-btn"
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setIsEditMode(false);
                              }}
                            >
                              View
                            </button>

                            <button
                              className="cmcustomers-edit-btn"
                              onClick={() => openEditMode(customer)}
                            >
                              <FaEdit />
                            </button>

                            <button
                              className="cmcustomers-delete-btn"
                              onClick={() => openDeleteModal(customer)}
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="cmcustomers-details-card">
          <div className="cmcustomers-card-head">
            <h3>{isEditMode ? "Edit Customer" : "Customer Details"}</h3>
            <span>{isEditMode ? "Update mode" : "Profile view"}</span>
          </div>

          {!selectedCustomer ? (
            <div className="cmcustomers-empty-box">
              Select a customer to view full details.
            </div>
          ) : !isEditMode ? (
            <div className="cmcustomers-details-body">
              <div className="cmcustomers-details-top">
                <div className="cmcustomers-details-avatar">
                  {selectedCustomer?.name?.charAt(0)?.toUpperCase() || "C"}
                </div>

                <div>
                  <h3>{selectedCustomer?.name}</h3>
                  <p>{selectedCustomer?.gmail}</p>
                  <span
                    className={
                      selectedCustomer?.isOnline
                        ? "cmcustomers-status online"
                        : "cmcustomers-status offline"
                    }
                  >
                    {selectedCustomer?.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              <div className="cmcustomers-detail-list">
                <div className="cmcustomers-detail-item">
                  <span className="cmcustomers-detail-label">
                    <FaPhoneAlt /> Phone
                  </span>
                  <p>{selectedCustomer?.phoneNumber || "Not available"}</p>
                </div>

                <div className="cmcustomers-detail-item">
                  <span className="cmcustomers-detail-label">
                    <FaEnvelope /> Gmail
                  </span>
                  <p>{selectedCustomer?.gmail || "Not available"}</p>
                </div>

                <div className="cmcustomers-detail-item">
                  <span className="cmcustomers-detail-label">
                    <FaMapMarkerAlt /> Address
                  </span>
                  <p>{selectedCustomer?.address || "Not available"}</p>
                </div>

                <div className="cmcustomers-detail-item">
                  <span className="cmcustomers-detail-label">
                    <FaVenusMars /> Gender
                  </span>
                  <p>{selectedCustomer?.gender || "Not available"}</p>
                </div>

                <div className="cmcustomers-detail-item">
                  <span className="cmcustomers-detail-label">
                    <FaUtensils /> Dietary Preferences
                  </span>
                  <p>{formatTextList(selectedCustomer?.dietaryPreferences)}</p>
                </div>

                <div className="cmcustomers-detail-item">
                  <span className="cmcustomers-detail-label">
                    <FaExclamationTriangle /> Allergies
                  </span>
                  <p>{formatTextList(selectedCustomer?.allergies)}</p>
                </div>

                <div className="cmcustomers-detail-item">
                  <span className="cmcustomers-detail-label">
                    <FaExclamationTriangle /> Other Allergy
                  </span>
                  <p>{selectedCustomer?.otherAllergy || "Not specified"}</p>
                </div>

                <div className="cmcustomers-detail-item">
                  <span className="cmcustomers-detail-label">
                    <FaBullseye /> Calorie Goal
                  </span>
                  <p>{selectedCustomer?.calorieGoal || "Not specified"}</p>
                </div>

                <div className="cmcustomers-detail-item full">
                  <span className="cmcustomers-detail-label">
                    <FaStickyNote /> Notes
                  </span>
                  <p>{selectedCustomer?.notes || "No notes available"}</p>
                </div>
              </div>

              <div className="cmcustomers-detail-actions">
                <button
                  className="cmcustomers-edit-main-btn"
                  onClick={() => openEditMode(selectedCustomer)}
                >
                  <FaEdit />
                  <span>Edit Customer</span>
                </button>

                <button
                  className="cmcustomers-delete-main-btn"
                  onClick={() => openDeleteModal(selectedCustomer)}
                >
                  <FaTrashAlt />
                  <span>Delete Customer</span>
                </button>
              </div>
            </div>
          ) : (
            <form className="cmcustomers-inline-form" onSubmit={handleUpdateCustomer}>
              <div className="cmcustomers-inline-grid">
                <div className="cmcustomers-form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="cmcustomers-form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={editForm.phoneNumber}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="cmcustomers-form-group">
                  <label>Gmail</label>
                  <input
                    type="email"
                    name="gmail"
                    value={editForm.gmail}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="cmcustomers-form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={editForm.gender}
                    onChange={handleEditChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="cmcustomers-form-group full">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={editForm.address}
                    onChange={handleEditChange}
                    rows="2"
                    required
                  />
                </div>

                <div className="cmcustomers-form-group full">
                  <label>Dietary Preferences</label>
                  <input
                    type="text"
                    name="dietaryPreferences"
                    value={editForm.dietaryPreferences}
                    onChange={handleEditChange}
                    placeholder="Vegetarian, Low Sugar"
                  />
                </div>

                <div className="cmcustomers-form-group full">
                  <label>Allergies</label>
                  <input
                    type="text"
                    name="allergies"
                    value={editForm.allergies}
                    onChange={handleEditChange}
                    placeholder="Milk, Peanuts"
                  />
                </div>

                <div className="cmcustomers-form-group">
                  <label>Other Allergy</label>
                  <input
                    type="text"
                    name="otherAllergy"
                    value={editForm.otherAllergy}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="cmcustomers-form-group">
                  <label>Calorie Goal</label>
                  <input
                    type="text"
                    name="calorieGoal"
                    value={editForm.calorieGoal}
                    onChange={handleEditChange}
                  />
                </div>

                <div className="cmcustomers-form-group full">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={editForm.notes}
                    onChange={handleEditChange}
                    rows="3"
                  />
                </div>

                <div className="cmcustomers-form-group full">
                  <label>New Password</label>
                  <input
                    type="text"
                    name="password"
                    value={editForm.password}
                    onChange={handleEditChange}
                    placeholder="Leave empty to keep current password"
                  />
                </div>

                <div className="cmcustomers-form-group full">
                  <label className="cmcustomers-checkbox-row">
                    <input
                      type="checkbox"
                      name="isOnline"
                      checked={editForm.isOnline}
                      onChange={handleEditChange}
                    />
                    <span>Mark customer as online</span>
                  </label>
                </div>
              </div>

              {actionMessage && (
                <div className="cmcustomers-form-message inline">{actionMessage}</div>
              )}

              <div className="cmcustomers-detail-actions">
                <button
                  type="button"
                  className="cmcustomers-cancel-btn"
                  onClick={closeEditMode}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="cmcustomers-save-btn"
                  disabled={actionLoading}
                >
                  <FaSave />
                  <span>{actionLoading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {isDeleteOpen && (
        <div className="cmcustomers-modal-overlay">
          <div className="cmcustomers-modal-card small">
            <div className="cmcustomers-modal-head">
              <h3>Delete Customer</h3>
              <button
                className="cmcustomers-modal-close"
                onClick={closeDeleteModal}
              >
                <FaTimes />
              </button>
            </div>

            <div className="cmcustomers-delete-body">
              <p>
                Are you sure you want to delete{" "}
                <strong>{selectedCustomer?.name}</strong>?
              </p>
              <p className="cmcustomers-delete-warning">
                This action cannot be undone.
              </p>

              {actionMessage && (
                <div className="cmcustomers-form-message">{actionMessage}</div>
              )}

              <div className="cmcustomers-modal-actions">
                <button
                  type="button"
                  className="cmcustomers-cancel-btn"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="cmcustomers-confirm-delete-btn"
                  onClick={handleDeleteCustomer}
                  disabled={actionLoading}
                >
                  <FaTrashAlt />
                  <span>{actionLoading ? "Deleting..." : "Delete"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}