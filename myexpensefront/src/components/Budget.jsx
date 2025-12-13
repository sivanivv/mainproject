import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const UserBudget = () => {
    const navigate = useNavigate();
    const { unreadCount } = useNotifications();
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [budgetData, setBudgetData] = useState({
        category: "",
        limit_amount: "",
        duration: "Monthly",
    });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");

    const BUDGET_URL = "http://127.0.0.1:8000/app/budgets/";
    const CATEGORY_URL = "http://127.0.0.1:8000/app/categories/";

    // 🟢 Fetch categories
    const fetchCategories = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(CATEGORY_URL, {
                headers: { Authorization: `Token ${token}` },
            });
            setCategories(res.data);
        } catch (err) {
            console.error("Category error:", err);
        }
    };

    // 🟢 Fetch budgets
    const fetchBudgets = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get(BUDGET_URL, {
                headers: { Authorization: `Token ${token}` },
            });
            setBudgets(res.data);
        } catch (err) {
            console.error("Budget error:", err);
            setMessage("❌ Failed to fetch budgets.");
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchBudgets();
    }, []);

    // ➕ Add / Update Budget
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            if (editingId) {
                await axios.put(`${BUDGET_URL}${editingId}/`, budgetData, {
                    headers: { Authorization: `Token ${token}` },
                });
                setMessage("✅ Budget updated successfully!");
            } else {
                await axios.post(BUDGET_URL, budgetData, {
                    headers: { Authorization: `Token ${token}` },
                });
                setMessage("✅ Budget added successfully!");
            }

            setBudgetData({ category: "", limit_amount: "", duration: "Monthly" });
            setEditingId(null);
            fetchBudgets();
        } catch (err) {
            console.error(err);
            setMessage("❌ Failed to save budget.");
        }
    };

    // ✏️ Edit
    const startEditing = (budget) => {
        setEditingId(budget.id);
        setBudgetData({
            category: budget.category,
            limit_amount: budget.limit_amount,
            duration: budget.duration,
        });
    };

    // ❌ Delete
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this budget?")) return;
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`${BUDGET_URL}${id}/`, {
                headers: { Authorization: `Token ${token}` },
            });
            setMessage("✅ Budget deleted successfully!");
            fetchBudgets();
        } catch (err) {
            console.error("Delete error:", err);
            setMessage("❌ Failed to delete budget.");
        }
    };

    // 🔙 Logout
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    return (
        <div
            style={{
                fontFamily: "'Poppins', 'Playfair Display', serif",
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

            {/* 🌿 Budget Section */}
            <div className="container py-5">
                <h2 className="fw-bold mb-4 text-center" style={{ color: "#4A3B2A" }}>
                    Budget Planning
                </h2>

                {message && (
                    <div
                        className={`alert text-center ${message.includes("❌") ? "alert-danger" : "alert-success"}`}
                        style={{ borderRadius: "10px", fontWeight: "500" }}
                    >
                        {message}
                    </div>
                )}

                {/* ➕ Add Budget */}
                <div
                    className="card shadow-sm p-4 mb-5 border-0"
                    style={{
                        background: "linear-gradient(135deg, #FFFDF8 0%, #F8F1E5 100%)",
                        borderRadius: "20px",
                        maxWidth: "700px",
                        margin: "auto",
                    }}
                >
                    <form onSubmit={handleSubmit} className="row g-3 align-items-center">
                        <div className="col-md-4">
                            <select
                                className="form-select"
                                value={budgetData.category}
                                onChange={(e) => setBudgetData({ ...budgetData, category: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.category_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Limit ₹"
                                value={budgetData.limit_amount}
                                onChange={(e) => setBudgetData({ ...budgetData, limit_amount: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={budgetData.duration}
                                onChange={(e) => setBudgetData({ ...budgetData, duration: e.target.value })}
                            >
                                <option>Monthly</option>
                                <option>Yearly</option>
                            </select>
                        </div>
                        <div className="col-md-2 text-end">
                            <button
                                type="submit"
                                className="btn px-4"
                                style={{
                                    background: "linear-gradient(135deg, #C2A66A, #A9844F)",
                                    color: "#FFF",
                                    borderRadius: "25px",
                                    fontWeight: "600",
                                }}
                            >
                                {editingId ? "Update" : "Add"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* 🧾 Budgets Table */}
                <div className="table-responsive shadow-sm rounded">
                    <table className="table table-hover text-center">
                        <thead style={{ background: "#E9DCC5", color: "#4A3B2A" }}>
                            <tr>
                                <th>#</th>
                                <th>Category</th>
                                <th>Limit (₹)</th>
                                <th>Duration</th>
                                <th>Alert</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.length > 0 ? (
                                budgets.map((b, index) => (
                                    <tr key={b.id}>
                                        <td>{index + 1}</td>
                                        <td>{b.category_name}</td>
                                        <td>{b.limit_amount}</td>
                                        <td>{b.duration}</td>
                                        <td>
                                            {b.alert_status ? (
                                                <span style={{ color: "#D9534F", fontWeight: "600" }}>Exceeded 🔴</span>
                                            ) : (
                                                <span style={{ color: "#5CB85C", fontWeight: "600" }}>Normal 🟢</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => startEditing(b)}
                                                className="btn btn-outline-primary btn-sm me-2 rounded-pill"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(b.id)}
                                                className="btn btn-outline-danger btn-sm rounded-pill"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-muted py-3">
                                        No budgets found.
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
                <p className="mb-0">
                    © {new Date().getFullYear()} SmartExpense+ | Budget Planner
                </p>
            </footer>
        </div>
    );
};

export default UserBudget;
