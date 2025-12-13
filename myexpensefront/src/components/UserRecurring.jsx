import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";

const UserRecurring = () => {
  const [recurrings, setRecurrings] = useState([]);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    start_date: "",
    recurrence: "monthly",
  });
  const [message, setMessage] = useState("");

  const API_URL = "http://127.0.0.1:8000/app/recurring/";
  const CAT_URL = "http://127.0.0.1:8000/app/categories/";

  // Fetch recurring data
  const fetchRecurrings = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Token ${token}` },
      });
      setRecurrings(res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to fetch recurring expenses.");
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(CAT_URL, {
        headers: { Authorization: `Token ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRecurrings();
    fetchCategories();
  }, []);

  // Add recurring
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      await axios.post(API_URL, formData, {
        headers: { Authorization: `Token ${token}` },
      });
      setMessage("✅ Recurring expense added successfully!");
      setFormData({ category: "", amount: "", start_date: "", recurrence: "monthly" });
      fetchRecurrings();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to add recurring expense.");
    }
  };

  // Delete recurring
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recurring expense?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${API_URL}${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setMessage("✅ Recurring expense deleted successfully!");
      fetchRecurrings();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to delete recurring expense.");
    }
  };

  // Activate/Deactivate
  const toggleActive = async (recurring) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${API_URL}${recurring.id}/`,
        { ...recurring, active: !recurring.active },
        { headers: { Authorization: `Token ${token}` } }
      );
      setMessage(`🔁 Recurring expense ${recurring.active ? "deactivated" : "activated"}.`);
      fetchRecurrings();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update status.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div
      style={{
        fontFamily: "'Poppins', serif",
        background: "linear-gradient(180deg, #F6F1E6 0%, #EDE1CF 100%)",
        minHeight: "100vh",
        color: "#3E3423",
      }}
    >
       {/* 🧭 Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-light py-3 shadow-sm"
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderBottom: "1px solid #DCCFB3",
          backdropFilter: "blur(6px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div className="container">
          <a
            className="navbar-brand fw-bold"
            href="/userhome"
            style={{
              color: "#8A6B46",
              fontSize: "1.8rem",
              letterSpacing: "0.4px",
            }}
          >
            Smart<span style={{ color: "#C2A66A" }}>Expense+</span>
          </a>

          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/expenses" style={{ color: "#7B6545" }}>
                Expenses
              </a>
            </li>
            <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/budget" style={{ color: "#7B6545" }}>
                Budget
              </a>
            </li>
            <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/datavis" style={{ color: "#7B6545" }}>
                Charts
              </a>
            </li>
            <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/recurring" style={{ color: "#7B6545" }}>
                Recurring Bills
              </a>
            </li>
            {/* <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/export" style={{ color: "#7B6545" }}>
                Export
              </a>
            </li> */}
            <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/filter" style={{ color: "#7B6545" }}>
                Track
              </a>
            </li>
            <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/groupmanage" style={{ color: "#7B6545" }}>
                Split
              </a>
            </li>

            <li className="nav-item mx-3">
              <button
                className="btn position-relative p-0"
                onClick={() => navigate("/notifications")}
                style={{ width: "30px", height: "30px" }}
              >
                {/* Minimalistic bell icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#7B6545"
                  width="24"
                  height="24"
                >
                  <path d="M12 2C10.343 2 9 3.343 9 5v1.07C6.163 6.563 4 9.06 4 12v5l-1 1v1h18v-1l-1-1v-5c0-2.94-2.163-5.437-5-5.93V5c0-1.657-1.343-3-3-3zM6 12c0-2.21 1.79-4 4-4s4 1.79 4 4v5H6v-5zM12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2z" />
                </svg>

                {unreadCount > 0 && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                    style={{
                      backgroundColor: "#7B6545",
                      color: "#fff",
                      fontSize: "0.65rem",
                      padding: "0.25em 0.4em",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            </li>

            <li className="nav-item mx-3">
              <button
                onClick={handleLogout}
                className="btn btn-outline-secondary px-3 py-1 fw-semibold"
                style={{
                  borderColor: "#CBBE9A",
                  color: "#7B6545",
                  borderRadius: "25px",
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>
      {/* Recurring Section */}
      <div className="container py-5">
        <h2 className="fw-bold text-center mb-4" style={{ color: "#4A3B2A" }}>
          Recurring Expenses
        </h2>

        {message && (
          <div
            className={`alert text-center ${message.includes("❌") ? "alert-danger" : "alert-success"}`}
            style={{ borderRadius: "10px", fontWeight: "500" }}
          >
            {message}
          </div>
        )}

        {/* Add Form */}
        <div
          className="card shadow-sm border-0 p-4 mb-5"
          style={{
            background: "linear-gradient(135deg, #FFFDF8 0%, #F8F1E5 100%)",
            borderRadius: "20px",
            maxWidth: "800px",
            margin: "auto",
          }}
        >
          <form className="row g-3 align-items-center" onSubmit={handleSubmit}>
            <div className="col-md-3">
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <input
                type="number"
                className="form-control"
                placeholder="Amount ₹"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>
            <div className="col-md-2">
              <select
                className="form-select"
                value={formData.recurrence}
                onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="col-md-2">
              <button
                type="submit"
                className="btn px-4 w-100"
                style={{
                  background: "linear-gradient(135deg, #C2A66A, #A9844F)",
                  color: "#FFF",
                  borderRadius: "25px",
                  fontWeight: "600",
                }}
              >
                Add
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover text-center align-middle">
            <thead style={{ background: "#E9DCC5", color: "#4A3B2A" }}>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Start Date</th>
                <th>Recurrence</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recurrings.length ? (
                recurrings.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>{r.category_name}</td>
                    <td>₹{r.amount}</td>
                    <td>{r.start_date}</td>
                    <td>{r.recurrence}</td>
                    <td>
                      <span style={{ fontWeight: "600", color: r.active ? "#5CB85C" : "#D9534F" }}>
                        {r.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleActive(r)}
                        className="btn btn-sm btn-outline-primary me-2 rounded-pill"
                      >
                        {r.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="btn btn-sm btn-outline-danger rounded-pill"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-muted py-3">
                    No recurring expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-center py-4 mt-5"
        style={{
          background: "#E6DAC3",
          color: "#5C4A33",
          fontSize: "0.9rem",
        }}
      >
        <p className="mb-0">© {new Date().getFullYear()} SmartExpense+ | Recurring Planner</p>
      </footer>
    </div>
  );
};

export default UserRecurring;
