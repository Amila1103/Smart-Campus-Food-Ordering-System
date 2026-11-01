import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiMail,
  FiSave,
  FiRefreshCw,
  FiHeart,
  FiAlertCircle,
  FiTarget,
  FiFileText,
  FiEye,
  FiEyeOff,
  FiLock,
  FiShoppingBag,
  FiCreditCard,
  FiClock,
  FiList,
  FiPackage,
  FiMessageSquare,
  FiTag,
} from "react-icons/fi";
import RegisterNavbar from "../../Website/Navbar/RegisterNavbar/RegisterNavbar";
import Footer from "../../Website/Footer/Footer";
import "./CustomerProfile.css";

const API_BASE = "http://localhost:5000";

export default function CustomerProfile() {
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingBasic, setSavingBasic] = useState(false);
  const [savingDietary, setSavingDietary] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [savingRatingOrderId, setSavingRatingOrderId] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [ratings, setRatings] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    address: "",
    gender: "",
    gmail: "",
    password: "",
    confirmPassword: "",
    dietaryPreferences: [],
    allergies: [],
    otherAllergy: "",
    calorieGoal: "",
    notes: "",
  });

  const dietaryOptions = [
    "Vegetarian",
    "Vegan",
    "High Protein",
    "Low Carb",
    "Halal",
    "Gluten Free",
    "Dairy Free",
  ];

  const allergyOptions = [
    "Peanuts",
    "Milk",
    "Eggs",
    "Seafood",
    "Soy",
    "Wheat",
    "Nuts",
  ];

  useEffect(() => {
    const customer = JSON.parse(localStorage.getItem("customer")) || {};
    const id = customer?._id || customer?.id || "";

    if (!id) {
      setError("Customer not found in local storage.");
      setLoading(false);
      return;
    }

    setCustomerId(id);
    fetchCustomer(id);
    fetchOrders(id);
    fetchPayments(id);
    fetchComplaints(id);
    fetchRatings(id);
  }, []);

  const extractPhoneDigits = (value) => {
    const raw = String(value || "").replace(/\D/g, "");

    if (raw.startsWith("94")) {
      return raw.slice(2, 11);
    }

    if (raw.startsWith("0")) {
      return raw.slice(1, 10);
    }

    return raw.slice(0, 9);
  };

  const fetchCustomer = async (id) => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(`${API_BASE}/Customers/${id}`);
      const customer = res.data?.Customers;

      if (!customer) {
        setError("Customer data not found.");
        setLoading(false);
        return;
      }

      const phoneDigits = extractPhoneDigits(customer.phoneNumber);

      setFormData({
        name: customer.name || "",
        phoneNumber: phoneDigits || "",
        address: customer.address || "",
        gender: customer.gender || "",
        gmail: customer.gmail || "",
        password: customer.password || "",
        confirmPassword: customer.password || "",
        dietaryPreferences: customer.dietaryPreferences || [],
        allergies: customer.allergies || [],
        otherAllergy: customer.otherAllergy || "",
        calorieGoal: customer.calorieGoal || "",
        notes: customer.notes || "",
      });

      const existingLocalCustomer =
        JSON.parse(localStorage.getItem("customer")) || {};

      localStorage.setItem(
        "customer",
        JSON.stringify({
          ...existingLocalCustomer,
          _id: customer._id,
          id: customer._id,
          name: customer.name || "",
          gmail: customer.gmail || "",
          email: customer.gmail || "",
          address: customer.address || "",
          phoneNumber: customer.phoneNumber || "",
          gender: customer.gender || "",
          dietaryPreferences: customer.dietaryPreferences || [],
          allergies: customer.allergies || [],
          otherAllergy: customer.otherAllergy || "",
          calorieGoal: customer.calorieGoal || "",
          notes: customer.notes || "",
        })
      );
    } catch (err) {
      console.log("Fetch customer error:", err);
      setError("Failed to load customer profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/order-ratings/customer/${id}`);
      const list = res.data?.ratings || [];

      const mapped = {};
      list.forEach((item) => {
        mapped[item.orderId] = {
          rating: item.rating || 0,
          comment: item.comment || "",
          _id: item._id,
        };
      });

      setRatings(mapped);
    } catch (err) {
      console.log("Fetch ratings error:", err);
      setRatings({});
    }
  };

  const normalizeOrderRecord = (order, sourceTable = "Order") => {
    return {
      ...order,
      sourceTable,
      historyStatus:
        order.finalDeliveryStatus || order.orderStatus || "Completed",
      historyDate:
        order.finishedAt ||
        order.deliveredAt ||
        order.completedAt ||
        order.createdAt,
      rating: ratings[order.orderId]?.rating || 0,
      comment: ratings[order.orderId]?.comment || "",
    };
  };

  const fetchOrders = async (id) => {
    try {
      setLoadingOrders(true);

      const [ordersRes, completedRes, finishedDeliveryRes] = await Promise.all([
        axios.get(`${API_BASE}/orders`),
        axios.get(`${API_BASE}/completed-orders/customer/${id}/history`),
        axios.get(`${API_BASE}/delivery-fenish/customer/${id}/history`),
      ]);

      const allOrders = ordersRes.data?.orders || [];
      const currentCustomerOrders = allOrders.filter(
        (order) => String(order.customerId) === String(id)
      );

      const finishedCompletedOrders = (
        completedRes.data?.completedOrders || []
      ).map((item) => normalizeOrderRecord(item, "CompletedOrder"));

      const finishedDeliveryOrders = (
        finishedDeliveryRes.data?.finishedOrders || []
      ).map((item) => normalizeOrderRecord(item, "DeliveryFenish"));

      const mergedMap = new Map();

      currentCustomerOrders.forEach((order) => {
        mergedMap.set(order.orderId, normalizeOrderRecord(order, "Order"));
      });

      finishedCompletedOrders.forEach((order) => {
        mergedMap.set(order.orderId, order);
      });

      finishedDeliveryOrders.forEach((order) => {
        mergedMap.set(order.orderId, order);
      });

      const mergedOrders = Array.from(mergedMap.values()).sort((a, b) => {
        const dateA = new Date(
          a.historyDate || a.createdAt || a.updatedAt || 0
        ).getTime();
        const dateB = new Date(
          b.historyDate || b.createdAt || b.updatedAt || 0
        ).getTime();
        return dateB - dateA;
      });

      setOrders(mergedOrders);
    } catch (err) {
      console.log("Fetch orders error:", err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchPayments = async (id) => {
    try {
      setLoadingPayments(true);
      const res = await axios.get(`${API_BASE}/payment`);
      const allPayments = res.data?.payments || [];
      const customerPayments = allPayments.filter(
        (payment) => String(payment.customerId) === String(id)
      );
      setPayments(customerPayments);
    } catch (err) {
      console.log("Fetch payments error:", err);
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchComplaints = async (id) => {
    try {
      setLoadingComplaints(true);
      const res = await axios.get(`${API_BASE}/complaints/customer/${id}`);
      setComplaints(res.data?.complaints || []);
    } catch (err) {
      console.log("Fetch complaints error:", err);
      setComplaints([]);
    } finally {
      setLoadingComplaints(false);
    }
  };

  const validatePassword = (password) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(
      password
    );
  };

  const validateBasicForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!/^\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Enter only 9 digits after +94.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!formData.gender.trim()) {
      newErrors.gender = "Please select gender.";
    }

    if (!formData.gmail.trim()) {
      newErrors.gmail = "Gmail is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.gmail)) {
      newErrors.gmail = "Enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (!validatePassword(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number, symbol and at least 8 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm the password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 9);

      setFormData((prev) => ({
        ...prev,
        phoneNumber: digitsOnly,
      }));

      setFieldErrors((prev) => ({
        ...prev,
        phoneNumber: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleCheckboxChange = (fieldName, value) => {
    setFormData((prev) => {
      const currentValues = prev[fieldName] || [];
      const alreadyExists = currentValues.includes(value);

      return {
        ...prev,
        [fieldName]: alreadyExists
          ? currentValues.filter((item) => item !== value)
          : [...currentValues, value],
      };
    });
  };

  const handleBasicUpdate = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!validateBasicForm()) {
      setError("Please fix the highlighted fields before saving.");
      return;
    }

    try {
      setSavingBasic(true);

      const fullPhoneNumber = Number(`94${formData.phoneNumber}`);

      const payload = {
        name: formData.name.trim(),
        phoneNumber: fullPhoneNumber,
        address: formData.address.trim(),
        gender: formData.gender,
        gmail: formData.gmail.trim().toLowerCase(),
        password: formData.password,
      };

      const res = await axios.put(`${API_BASE}/Customers/${customerId}`, payload);
      const updatedCustomer = res.data?.Customers;

      const existingLocalCustomer =
        JSON.parse(localStorage.getItem("customer")) || {};

      localStorage.setItem(
        "customer",
        JSON.stringify({
          ...existingLocalCustomer,
          _id: updatedCustomer?._id || customerId,
          id: updatedCustomer?._id || customerId,
          name: updatedCustomer?.name || formData.name,
          gmail: updatedCustomer?.gmail || formData.gmail,
          email: updatedCustomer?.gmail || formData.gmail,
          address: updatedCustomer?.address || formData.address,
          phoneNumber: updatedCustomer?.phoneNumber || fullPhoneNumber,
          gender: updatedCustomer?.gender || formData.gender,
          dietaryPreferences:
            updatedCustomer?.dietaryPreferences || formData.dietaryPreferences,
          allergies: updatedCustomer?.allergies || formData.allergies,
          otherAllergy: updatedCustomer?.otherAllergy || formData.otherAllergy,
          calorieGoal: updatedCustomer?.calorieGoal || formData.calorieGoal,
          notes: updatedCustomer?.notes || formData.notes,
        })
      );

      setMessage("Basic profile updated successfully.");
    } catch (err) {
      console.log("Basic update error:", err);
      setError("Failed to update basic profile.");
    } finally {
      setSavingBasic(false);
    }
  };

  const handleDietaryUpdate = async (e) => {
    e.preventDefault();

    try {
      setSavingDietary(true);
      setMessage("");
      setError("");

      const payload = {
        dietaryPreferences: formData.dietaryPreferences,
        allergies: formData.allergies,
        otherAllergy: formData.otherAllergy,
        calorieGoal: formData.calorieGoal,
        notes: formData.notes,
      };

      const res = await axios.put(
        `${API_BASE}/Customers/${customerId}/dietary`,
        payload
      );

      const updatedCustomer = res.data?.Customers;

      const existingLocalCustomer =
        JSON.parse(localStorage.getItem("customer")) || {};

      localStorage.setItem(
        "customer",
        JSON.stringify({
          ...existingLocalCustomer,
          _id: updatedCustomer?._id || customerId,
          id: updatedCustomer?._id || customerId,
          name: updatedCustomer?.name || formData.name,
          gmail: updatedCustomer?.gmail || formData.gmail,
          email: updatedCustomer?.gmail || formData.gmail,
          address: updatedCustomer?.address || formData.address,
          phoneNumber:
            updatedCustomer?.phoneNumber || Number(`94${formData.phoneNumber}`),
          gender: updatedCustomer?.gender || formData.gender,
          dietaryPreferences:
            updatedCustomer?.dietaryPreferences || formData.dietaryPreferences,
          allergies: updatedCustomer?.allergies || formData.allergies,
          otherAllergy: updatedCustomer?.otherAllergy || formData.otherAllergy,
          calorieGoal: updatedCustomer?.calorieGoal || formData.calorieGoal,
          notes: updatedCustomer?.notes || formData.notes,
        })
      );

      setMessage("Dietary preferences updated successfully.");
    } catch (err) {
      console.log("Dietary update error:", err);
      setError("Failed to update dietary details.");
    } finally {
      setSavingDietary(false);
    }
  };

  const handleRefresh = () => {
    if (customerId) {
      fetchCustomer(customerId);
      fetchOrders(customerId);
      fetchPayments(customerId);
      fetchComplaints(customerId);
      fetchRatings(customerId);
      setFieldErrors({});
      setMessage("");
      setError("");
    }
  };

  const handleRatingChange = (orderId, value) => {
    setRatings((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        rating: value,
        comment: prev[orderId]?.comment || "",
      },
    }));
  };

  const handleCommentChange = (orderId, value) => {
    setRatings((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {}),
        rating: prev[orderId]?.rating || 0,
        comment: value,
      },
    }));
  };

  const saveOrderRating = async (order) => {
    try {
      const ratingData = ratings[order.orderId] || {};
      const selectedRating = Number(ratingData.rating || 0);

      if (!selectedRating) {
        setError("Please select a star rating before saving.");
        return;
      }

      setSavingRatingOrderId(order.orderId);
      setError("");
      setMessage("");

      await axios.post(`${API_BASE}/order-ratings`, {
        orderId: order.orderId,
        customerId,
        customerName: formData.name,
        gmail: formData.gmail,
        rating: selectedRating,
        comment: ratingData.comment || "",
        sourceTable: order.sourceTable || "Order",
      });

      setMessage(`Rating saved for order ${order.orderId}`);
      fetchRatings(customerId);
    } catch (err) {
      console.log("Save rating error:", err);
      setError("Failed to save rating.");
    } finally {
      setSavingRatingOrderId("");
    }
  };

  const currentOrders = useMemo(() => {
    return orders.filter((order) =>
      ["Pending", "Confirmed", "Preparing", "Out for Delivery"].includes(
        order.orderStatus
      )
    );
  }, [orders]);

  const orderHistory = useMemo(() => {
    return orders.filter((order) => {
      const status = String(
        order.finalDeliveryStatus || order.orderStatus || ""
      ).toLowerCase();

      return (
        status.includes("delivered") ||
        status.includes("cancelled") ||
        status.includes("completed") ||
        status.includes("finished")
      );
    });
  }, [orders]);

  const totalOrders = orders.length;
  const totalPayments = payments.length;
  const totalComplaints = complaints.length;
  const currentOrdersCount = currentOrders.length;

  const getOrderStatusClass = (status) => {
    const safe = String(status || "").toLowerCase();
    if (
      safe.includes("delivered") ||
      safe.includes("completed") ||
      safe.includes("finished")
    ) {
      return "cp-status-badge delivered";
    }
    if (safe.includes("pending")) {
      return "cp-status-badge pending";
    }
    if (safe.includes("confirmed") || safe.includes("preparing")) {
      return "cp-status-badge confirmed";
    }
    if (safe.includes("cancel")) {
      return "cp-status-badge cancelled";
    }
    if (safe.includes("out for delivery")) {
      return "cp-status-badge shipping";
    }
    return "cp-status-badge";
  };

  const getPaymentStatusClass = (status) => {
    const safe = String(status || "").toLowerCase();
    if (safe.includes("paid")) return "cp-status-badge delivered";
    return "cp-status-badge";
  };

  const getComplaintStatusClass = (status) => {
    const safe = String(status || "").toLowerCase();

    if (safe.includes("resolved")) return "cp-status-badge delivered";
    if (safe.includes("pending")) return "cp-status-badge pending";
    if (safe.includes("progress")) return "cp-status-badge confirmed";
    if (safe.includes("reject")) return "cp-status-badge cancelled";

    return "cp-status-badge";
  };

  const renderStars = (orderId) => {
    const selected = Number(ratings[orderId]?.rating || 0);

    return (
      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleRatingChange(orderId, star)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "26px",
              color: star <= selected ? "#f59e0b" : "#cbd5e1",
              padding: 0,
              lineHeight: 1,
            }}
            title={`${star} Star`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <RegisterNavbar />
        <div className="cp-page">
          <div className="cp-loading-card">
            <FiRefreshCw className="cp-spin" />
            <h2>Loading profile...</h2>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <RegisterNavbar />

      <div className="cp-page">
        <section className="cp-hero">
          <div className="cp-hero-card">
            <div className="cp-hero-badge">Customer Profile</div>
            <h1>Manage your account details</h1>
            <p>
              Update your personal information, dietary preferences, allergies,
              payment history, order details, and complaint history from one place.
            </p>

            <button
              className="cp-refresh-btn"
              onClick={handleRefresh}
              type="button"
            >
              <FiRefreshCw />
              Refresh Profile
            </button>
          </div>
        </section>

        <section className="cp-stats-grid">
          <div className="cp-stat-card">
            <div className="cp-stat-icon">
              <FiPackage />
            </div>
            <div>
              <h3>{currentOrdersCount}</h3>
              <p>Current Orders</p>
            </div>
          </div>

          <div className="cp-stat-card">
            <div className="cp-stat-icon cp-stat-orange">
              <FiCreditCard />
            </div>
            <div>
              <h3>{totalPayments}</h3>
              <p>Completed Payments</p>
            </div>
          </div>

          <div className="cp-stat-card">
            <div className="cp-stat-icon">
              <FiShoppingBag />
            </div>
            <div>
              <h3>{totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>

          <div className="cp-stat-card">
            <div className="cp-stat-icon cp-stat-orange">
              <FiMessageSquare />
            </div>
            <div>
              <h3>{totalComplaints}</h3>
              <p>Total Complaints</p>
            </div>
          </div>
        </section>

        <section className="cp-tab-bar">
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
            type="button"
          >
            <FiUser />
            Overview
          </button>

          <button
            className={activeTab === "currentOrders" ? "active" : ""}
            onClick={() => setActiveTab("currentOrders")}
            type="button"
          >
            <FiClock />
            Current Orders
          </button>

          <button
            className={activeTab === "payments" ? "active" : ""}
            onClick={() => setActiveTab("payments")}
            type="button"
          >
            <FiCreditCard />
            Payment History
          </button>

          <button
            className={activeTab === "orderHistory" ? "active" : ""}
            onClick={() => setActiveTab("orderHistory")}
            type="button"
          >
            <FiList />
            Order History
          </button>

          <button
            className={activeTab === "complaints" ? "active" : ""}
            onClick={() => setActiveTab("complaints")}
            type="button"
          >
            <FiMessageSquare />
            Complaints
          </button>
        </section>

        {(message || error) && (
          <div className="cp-alert-wrap">
            {message && <div className="cp-success-msg">{message}</div>}
            {error && <div className="cp-error-msg">{error}</div>}
          </div>
        )}

        {activeTab === "overview" && (
          <section className="cp-main-grid">
            <div className="cp-left-col">
              <form className="cp-card" onSubmit={handleBasicUpdate}>
                <div className="cp-card-header">
                  <div className="cp-card-icon">
                    <FiUser />
                  </div>
                  <div>
                    <h2>Basic Information</h2>
                    <p>Edit your personal account details.</p>
                  </div>
                </div>

                <div className="cp-form-grid">
                  <div className="cp-field">
                    <label>Full Name</label>
                    <div className="cp-input-wrap">
                      <FiUser />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {fieldErrors.name && (
                      <span className="cp-field-error">{fieldErrors.name}</span>
                    )}
                  </div>

                  <div className="cp-field">
                    <label>Phone Number</label>
                    <div className="cp-input-wrap cp-phone-wrap">
                      <FiPhone />
                      <span className="cp-phone-prefix">+94</span>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="781234567"
                        inputMode="numeric"
                        maxLength={9}
                      />
                    </div>
                    {fieldErrors.phoneNumber && (
                      <span className="cp-field-error">
                        {fieldErrors.phoneNumber}
                      </span>
                    )}
                  </div>

                  <div className="cp-field cp-full">
                    <label>Address</label>
                    <div className="cp-input-wrap">
                      <FiMapPin />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter address"
                      />
                    </div>
                    {fieldErrors.address && (
                      <span className="cp-field-error">
                        {fieldErrors.address}
                      </span>
                    )}
                  </div>

                  <div className="cp-field">
                    <label>Gender</label>
                    <div className="cp-input-wrap">
                      <FiUser />
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {fieldErrors.gender && (
                      <span className="cp-field-error">
                        {fieldErrors.gender}
                      </span>
                    )}
                  </div>

                  <div className="cp-field">
                    <label>Gmail</label>
                    <div className="cp-input-wrap">
                      <FiMail />
                      <input
                        type="email"
                        name="gmail"
                        value={formData.gmail}
                        onChange={handleChange}
                        placeholder="Enter gmail address"
                      />
                    </div>
                    {fieldErrors.gmail && (
                      <span className="cp-field-error">{fieldErrors.gmail}</span>
                    )}
                  </div>

                  <div className="cp-field cp-full">
                    <label>Password</label>
                    <div className="cp-input-wrap cp-password-wrap">
                      <FiLock />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        className="cp-password-toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <span className="cp-field-error">
                        {fieldErrors.password}
                      </span>
                    )}
                    <span className="cp-password-hint">
                      Must include uppercase, lowercase, number, symbol and at
                      least 8 characters.
                    </span>
                  </div>

                  <div className="cp-field cp-full">
                    <label>Confirm Password</label>
                    <div className="cp-input-wrap cp-password-wrap">
                      <FiLock />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter password"
                      />
                      <button
                        type="button"
                        className="cp-password-toggle"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <span className="cp-field-error">
                        {fieldErrors.confirmPassword}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="cp-primary-btn"
                  type="submit"
                  disabled={savingBasic}
                >
                  <FiSave />
                  {savingBasic ? "Saving..." : "Save Basic Details"}
                </button>
              </form>
            </div>

            <div className="cp-right-col">
              <form onSubmit={handleDietaryUpdate} className="cp-right-stack">
                <div className="cp-card">
                  <div className="cp-card-header">
                    <div className="cp-card-icon cp-orange">
                      <FiHeart />
                    </div>
                    <div>
                      <h2>Dietary Preferences</h2>
                      <p>Customize food options according to your needs.</p>
                    </div>
                  </div>

                  <div className="cp-section-block">
                    <h3>Dietary Preferences</h3>
                    <div className="cp-check-grid">
                      {dietaryOptions.map((item) => (
                        <label key={item} className="cp-check-item">
                          <input
                            type="checkbox"
                            checked={formData.dietaryPreferences.includes(item)}
                            onChange={() =>
                              handleCheckboxChange("dietaryPreferences", item)
                            }
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="cp-section-block cp-section-block-last">
                    <h3>Allergies</h3>
                    <div className="cp-check-grid">
                      {allergyOptions.map((item) => (
                        <label key={item} className="cp-check-item">
                          <input
                            type="checkbox"
                            checked={formData.allergies.includes(item)}
                            onChange={() =>
                              handleCheckboxChange("allergies", item)
                            }
                          />
                          <span>{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="cp-card">
                  <div className="cp-card-header">
                    <div className="cp-card-icon cp-orange">
                      <FiFileText />
                    </div>
                    <div>
                      <h2>Nutrition Notes</h2>
                      <p>Add extra health and food preference details.</p>
                    </div>
                  </div>

                  <div className="cp-field">
                    <label>Other Allergy</label>
                    <div className="cp-input-wrap">
                      <FiAlertCircle />
                      <input
                        type="text"
                        name="otherAllergy"
                        value={formData.otherAllergy}
                        onChange={handleChange}
                        placeholder="Enter other allergy details"
                      />
                    </div>
                  </div>

                  <div className="cp-field">
                    <label>Calorie Goal</label>
                    <div className="cp-input-wrap">
                      <FiTarget />
                      <input
                        type="text"
                        name="calorieGoal"
                        value={formData.calorieGoal}
                        onChange={handleChange}
                        placeholder="Example: 1800 kcal/day"
                      />
                    </div>
                  </div>

                  <div className="cp-field">
                    <label>Notes</label>
                    <div className="cp-textarea-wrap">
                      <FiFileText />
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="5"
                        placeholder="Add any extra food notes here"
                      />
                    </div>
                  </div>

                  <button
                    className="cp-primary-btn cp-orange-btn"
                    type="submit"
                    disabled={savingDietary}
                  >
                    <FiSave />
                    {savingDietary ? "Saving..." : "Save Dietary Details"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        )}

        {activeTab === "currentOrders" && (
          <section className="cp-history-section">
            <div className="cp-history-card">
              <div className="cp-card-header">
                <div className="cp-card-icon">
                  <FiClock />
                </div>
                <div>
                  <h2>Current Orders</h2>
                  <p>Track your active and ongoing orders.</p>
                </div>
              </div>

              {loadingOrders ? (
                <div className="cp-empty-history">Loading current orders...</div>
              ) : currentOrders.length === 0 ? (
                <div className="cp-empty-history">No current orders found.</div>
              ) : (
                <div className="cp-history-list">
                  {currentOrders.map((order) => (
                    <div className="cp-history-item" key={order._id || order.orderId}>
                      <div className="cp-history-top">
                        <div>
                          <h3>{order.orderId}</h3>
                          <p>
                            {order.items?.length || 0} item(s) • Rs.{" "}
                            {order.grandTotal || 0}
                          </p>
                        </div>
                        <div className="cp-history-badges">
                          <span className={getOrderStatusClass(order.orderStatus)}>
                            {order.orderStatus || "Pending"}
                          </span>

                          {order.paymentStatus && (
                            <span className={getPaymentStatusClass(order.paymentStatus)}>
                              {order.paymentStatus}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="cp-history-meta">
                        <span>{order.orderType || "Delivery"}</span>
                        <span>{new Date(order.createdAt).toLocaleString()}</span>
                        <span>
                          {order.deliveryLocation ||
                            order.selectedDeliveryLocation ||
                            "No location"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "payments" && (
          <section className="cp-history-section">
            <div className="cp-history-card">
              <div className="cp-card-header">
                <div className="cp-card-icon cp-orange">
                  <FiCreditCard />
                </div>
                <div>
                  <h2>Payment History</h2>
                  <p>View your payment records.</p>
                </div>
              </div>

              {loadingPayments ? (
                <div className="cp-empty-history">Loading payments...</div>
              ) : payments.length === 0 ? (
                <div className="cp-empty-history">No payment history found.</div>
              ) : (
                <div className="cp-history-list">
                  {payments.map((payment) => (
                    <div
                      className="cp-history-item"
                      key={payment._id || payment.paymentId}
                    >
                      <div className="cp-history-top">
                        <div>
                          <h3>{payment.paymentId || "Payment ID"}</h3>
                          <p>
                            Order: {payment.orderId || "N/A"} • Rs.{" "}
                            {payment.grandTotal || 0}
                          </p>
                        </div>
                        <div className="cp-history-badges">
                          {payment.paymentStatus && (
                            <span className={getPaymentStatusClass(payment.paymentStatus)}>
                              {payment.paymentStatus}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="cp-history-meta">
                        <span>{payment.paymentMethod || "Cash on Delivery"}</span>
                        <span>{payment.invoiceNo || "No invoice"}</span>
                        <span>
                          {payment.invoiceDate
                            ? payment.invoiceDate
                            : payment.createdAt
                            ? new Date(payment.createdAt).toLocaleString()
                            : "No date"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "orderHistory" && (
          <section className="cp-history-section">
            <div className="cp-history-card">
              <div className="cp-card-header">
                <div className="cp-card-icon">
                  <FiList />
                </div>
                <div>
                  <h2>Order History</h2>
                  <p>
                    Review your finished/completed orders and add your rating.
                  </p>
                </div>
              </div>

              {loadingOrders ? (
                <div className="cp-empty-history">Loading order history...</div>
              ) : orderHistory.length === 0 ? (
                <div className="cp-empty-history">No past orders found.</div>
              ) : (
                <div className="cp-history-list">
                  {orderHistory.map((order) => (
                    <div className="cp-history-item" key={order._id || order.orderId}>
                      <div className="cp-history-top">
                        <div>
                          <h3>{order.orderId}</h3>
                          <p>
                            {order.items?.length || 0} item(s) • Rs.{" "}
                            {order.grandTotal || 0}
                          </p>
                        </div>
                        <div className="cp-history-badges">
                          <span
                            className={getOrderStatusClass(
                              order.finalDeliveryStatus || order.orderStatus
                            )}
                          >
                            {order.finalDeliveryStatus ||
                              order.orderStatus ||
                              "Completed"}
                          </span>

                          {order.paymentStatus && (
                            <span className={getPaymentStatusClass(order.paymentStatus)}>
                              {order.paymentStatus}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="cp-history-meta">
                        <span>{order.orderType || "Delivery"}</span>
                        <span>
                          {order.historyDate
                            ? new Date(order.historyDate).toLocaleString()
                            : "No date"}
                        </span>
                        <span>{order.paymentMethod || "Cash on Delivery"}</span>
                      </div>

                      <div
                        style={{
                          marginTop: "16px",
                          padding: "14px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                        }}
                      >
                        <strong style={{ display: "block", marginBottom: "8px" }}>
                          Rate this order
                        </strong>

                        {renderStars(order.orderId)}

                        <textarea
                          value={ratings[order.orderId]?.comment || ""}
                          onChange={(e) =>
                            handleCommentChange(order.orderId, e.target.value)
                          }
                          rows="3"
                          placeholder="Write your comment about this order"
                          style={{
                            width: "100%",
                            marginTop: "12px",
                            borderRadius: "10px",
                            border: "1px solid #cbd5e1",
                            padding: "10px 12px",
                            resize: "vertical",
                            outline: "none",
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => saveOrderRating(order)}
                          disabled={savingRatingOrderId === order.orderId}
                          style={{
                            marginTop: "12px",
                            border: "none",
                            borderRadius: "10px",
                            background: "#16a34a",
                            color: "#fff",
                            padding: "10px 16px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {savingRatingOrderId === order.orderId
                            ? "Saving..."
                            : "Save Rating"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === "complaints" && (
          <section className="cp-history-section">
            <div className="cp-history-card">
              <div className="cp-card-header">
                <div className="cp-card-icon cp-orange">
                  <FiMessageSquare />
                </div>
                <div>
                  <h2>My Complaints</h2>
                  <p>View all complaints you have submitted.</p>
                </div>
              </div>

              {loadingComplaints ? (
                <div className="cp-empty-history">Loading complaints...</div>
              ) : complaints.length === 0 ? (
                <div className="cp-empty-history">No complaints found.</div>
              ) : (
                <div className="cp-history-list">
                  {complaints.map((item) => (
                    <div className="cp-history-item" key={item._id}>
                      <div className="cp-history-top">
                        <div>
                          <h3>{item.subject || "Complaint"}</h3>
                          <p>
                            {item.category || "General"}{" "}
                            {item.orderId ? `• Order: ${item.orderId}` : ""}
                          </p>
                        </div>
                        <div className="cp-history-badges">
                          <span className={getComplaintStatusClass(item.status)}>
                            {item.status || "Pending"}
                          </span>
                        </div>
                      </div>

                      <div className="cp-history-meta">
                        <span>
                          <FiTag style={{ marginRight: "6px" }} />
                          {item.category || "Uncategorized"}
                        </span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>

                      <div style={{ marginTop: "12px" }}>
                        <p style={{ marginBottom: "10px", color: "#475569" }}>
                          {item.complaint}
                        </p>

                        {item.image && (
                          <div style={{ marginBottom: "12px" }}>
                            <img
                              src={`${API_BASE}${item.image}`}
                              alt="Complaint"
                              style={{
                                width: "120px",
                                height: "120px",
                                objectFit: "cover",
                                borderRadius: "12px",
                                border: "1px solid #e2e8f0",
                              }}
                            />
                          </div>
                        )}

                        {item.adminReply && (
                          <div
                            style={{
                              marginTop: "10px",
                              padding: "12px",
                              borderRadius: "12px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <strong style={{ display: "block", marginBottom: "6px" }}>
                              Admin Reply
                            </strong>
                            <p style={{ margin: 0, color: "#334155" }}>
                              {item.adminReply}
                            </p>
                            {item.repliedAt && (
                              <small style={{ color: "#64748b" }}>
                                Replied on: {new Date(item.repliedAt).toLocaleString()}
                              </small>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}