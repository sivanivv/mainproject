import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";

const UserExpenses = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expenseData, setExpenseData] = useState({
    category: "",
    amount: "",
    date: "",
    description: "",
    recurring: false,
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [totals, setTotals] = useState({
    total: 0,
    monthly: 0,
    yearly: 0,
  });

  const EXPENSE_URL = "http://127.0.0.1:8000/app/expenses/";
  const CATEGORY_URL = "http://127.0.0.1:8000/app/categories/";

  // 🟢 Fetch Categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(CATEGORY_URL, {
        headers: { Authorization: `Token ${token}` },
      });
      setCategories(res.data);
    } catch (err) {
      console.error("Category fetch error:", err);
      setCategories([]);
    }
  };

  // 🟢 Fetch Expenses
  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(EXPENSE_URL, {
        headers: { Authorization: `Token ${token}` },
      });
      setExpenses(res.data);
      calculateTotals(res.data);
    } catch (err) {
      console.error("Expense fetch error:", err);
      setMessage("❌ Failed to load expenses.");
    }
  };

  // 🧮 Calculate Totals
  const calculateTotals = (data) => {
    let total = 0,
      monthly = 0,
      yearly = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    data.forEach((exp) => {
      const date = new Date(exp.date);
      const amount = parseFloat(exp.amount);
      total += amount;
      if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
        monthly += amount;
      }
      if (date.getFullYear() === currentYear) {
        yearly += amount;
      }
    });

    setTotals({
      total: total.toFixed(2),
      monthly: monthly.toFixed(2),
      yearly: yearly.toFixed(2),
    });
  };

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, []);

  // ➕ Add or Update Expense
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      if (editingId) {
        await axios.put(`${EXPENSE_URL}${editingId}/`, expenseData, {
          headers: { Authorization: `Token ${token}` },
        });
        setMessage("✅ Expense updated successfully!");
      } else {
        await axios.post(EXPENSE_URL, expenseData, {
          headers: { Authorization: `Token ${token}` },
        });
        setMessage("✅ Expense added successfully!");
      }

      setExpenseData({
        category: "",
        amount: "",
        date: "",
        description: "",
        recurring: false,
      });
      setEditingId(null);
      fetchExpenses();
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("❌ Failed to save expense.");
    }
  };

  // ✏️ Edit
  const startEditing = (exp) => {
    setEditingId(exp.id);
    setExpenseData({
      category: exp.category,
      amount: exp.amount,
      date: exp.date,
      description: exp.description,
      recurring: exp.recurring,
    });
  };

  // ❌ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${EXPENSE_URL}${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setMessage("✅ Expense deleted successfully!");
      fetchExpenses();
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("❌ Failed to delete expense.");
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
            {/* </li>
            <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/export" style={{ color: "#7B6545" }}>
                Export
              </a> */}
            </li>
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
      {/* 🌿 Expense Section */}
      <div className="container py-5">
        <h2 className="fw-bold mb-3 text-center" style={{ color: "#4A3B2A" }}>
          Expense Dashboard
        </h2>

        {/* 💰 Summary Cards */}
        <div className="row text-center mb-5">
          <div className="col-md-4 mb-3">
            <div
              className="p-4 shadow-sm rounded-4"
              style={{
                background: "linear-gradient(135deg, #EDE2C9, #F6F1E6)",
              }}
            >
              <h6 className="fw-semibold text-muted mb-1">This Month</h6>
              <h4 className="fw-bold text-dark">₹{totals.monthly}</h4>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div
              className="p-4 shadow-sm rounded-4"
              style={{
                background: "linear-gradient(135deg, #E7D6B8, #F1E3CB)",
              }}
            >
              <h6 className="fw-semibold text-muted mb-1">This Year</h6>
              <h4 className="fw-bold text-dark">₹{totals.yearly}</h4>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div
              className="p-4 shadow-sm rounded-4"
              style={{
                background: "linear-gradient(135deg, #E3CFA9, #F1E9D7)",
              }}
            >
              <h6 className="fw-semibold text-muted mb-1">Total Expense</h6>
              <h4 className="fw-bold text-dark">₹{totals.total}</h4>
            </div>
          </div>
        </div>

        {/* 🧾 Add/Update Form */}
        <div
          className="card shadow-sm p-4 mb-5 border-0"
          style={{
            background: "linear-gradient(135deg, #FFFDF8 0%, #F8F1E5 100%)",
            borderRadius: "20px",
            maxWidth: "750px",
            margin: "auto",
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="row g-3 align-items-center">
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={expenseData.category}
                  onChange={(e) =>
                    setExpenseData({ ...expenseData, category: e.target.value })
                  }
                  required
                >
                  <option value="">Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={expenseData.amount}
                  onChange={(e) =>
                    setExpenseData({ ...expenseData, amount: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control"
                  value={expenseData.date}
                  onChange={(e) =>
                    setExpenseData({ ...expenseData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-md-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Description"
                  value={expenseData.description}
                  onChange={(e) =>
                    setExpenseData({ ...expenseData, description: e.target.value })
                  }
                />
              </div>

              <div className="col-md-1 text-end">
                <button
                  type="submit"
                  className="btn btn-sm px-3"
                  style={{
                    background: "linear-gradient(135deg, #C2A66A, #A9844F)",
                    color: "#FFF",
                    borderRadius: "25px",
                    fontWeight: "600",
                  }}
                >
                  {editingId ? "Save" : "Add"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* 📊 Expense Table */}
        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover align-middle text-center">
            <thead
              style={{
                background: "#E9DCC5",
                color: "#4A3B2A",
              }}
            >
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Amount (₹)</th>
                <th>Date</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((exp, index) => (
                  <tr key={exp.id}>
                    <td>{index + 1}</td>
                    <td>{exp.category_name || "Uncategorized"}</td>
                    <td>{exp.amount}</td>
                    <td>{new Date(exp.date).toLocaleDateString()}</td>
                    <td>{exp.description || "-"}</td>
                    <td>
                      <button
                        onClick={() => startEditing(exp)}
                        className="btn btn-outline-primary btn-sm me-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
                        className="btn btn-outline-danger btn-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-muted">
                    No expenses found.
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
          boxShadow: "0 -3px 8px rgba(0,0,0,0.05)",
        }}
      >
        <p className="mb-0">
          © {new Date().getFullYear()} SmartExpense+ | My Expenses
        </p>
      </footer>
    </div>
  );
};

export default UserExpenses;
