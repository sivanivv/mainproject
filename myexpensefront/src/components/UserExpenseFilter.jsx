import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";
import "bootstrap/dist/css/bootstrap.min.css";

const UserExpenseFilter = () => {
  const [filters, setFilters] = useState({
    category: "",
    min_amount: "",
    max_amount: "",
    start_date: "",
    end_date: "",
  });
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const FILTER_URL = "http://127.0.0.1:8000/app/expenses/filter/";
  const CAT_URL = "http://127.0.0.1:8000/app/categories/";

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const handleFilter = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(FILTER_URL, {
        headers: { Authorization: `Token ${token}` },
        params: filters,
      });
      setExpenses(res.data.filtered_expenses);
      setTotal(res.data.total_expense);
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to fetch filtered results.");
    }
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      min_amount: "",
      max_amount: "",
      start_date: "",
      end_date: "",
    });
    setExpenses([]);
    setTotal(0);
  };

    const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };


  return (
    <div
      style={{
        fontFamily: "'Playfair Display', 'Poppins', serif",
        background: "linear-gradient(180deg, #f5efe6 0%, #e8dfd0 100%)",
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


      {/* Header */}
      <header
        className="py-5 text-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(204,180,136,0.3) 0%, rgba(240,230,210,0.6) 100%)",
        }}
      >
        <h1 className="fw-bold mb-2" style={{ color: "#5A4732", fontSize: "2.2rem" }}>
          Advanced Expense Filters
        </h1>
        <p
          style={{
            color: "#7B6545",
            fontSize: "1.05rem",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Refine your spending insights with detailed filters and instant results 
        </p>
      </header>

      <div className="container py-5">
        {message && (
          <div
            className="alert alert-danger text-center shadow-sm"
            style={{
              borderRadius: "12px",
              background: "#fdf6f3",
              border: "1px solid #e6c9b1",
              color: "#7B3F2A",
              fontWeight: "500",
            }}
          >
            {message}
          </div>
        )}

        {/* Filter Form */}
        <form
          className="row g-3 p-4 shadow-sm border-0 rounded-4 mb-5"
          style={{
            background: "linear-gradient(135deg, #fffaf2 0%, #f3eadb 100%)",
          }}
          onSubmit={handleFilter}
        >
          <div className="col-md-3">
            <label className="form-label fw-semibold">Category</label>
            <select
              className="form-select rounded-3"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              style={{
                border: "1px solid #d9c7a8",
                color: "#4A3B2A",
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label fw-semibold">Min ₹</label>
            <input
              type="number"
              className="form-control rounded-3"
              style={{ border: "1px solid #d9c7a8" }}
              value={filters.min_amount}
              onChange={(e) => setFilters({ ...filters, min_amount: e.target.value })}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label fw-semibold">Max ₹</label>
            <input
              type="number"
              className="form-control rounded-3"
              style={{ border: "1px solid #d9c7a8" }}
              value={filters.max_amount}
              onChange={(e) => setFilters({ ...filters, max_amount: e.target.value })}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label fw-semibold">From</label>
            <input
              type="date"
              className="form-control rounded-3"
              style={{ border: "1px solid #d9c7a8" }}
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            />
          </div>

          <div className="col-md-2">
            <label className="form-label fw-semibold">To</label>
            <input
              type="date"
              className="form-control rounded-3"
              style={{ border: "1px solid #d9c7a8" }}
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            />
          </div>

          <div className="col-md-1 d-flex align-items-end">
            <button
              className="btn w-100"
              style={{
                background: "linear-gradient(135deg, #C2A66A, #A9844F)",
                color: "#fff",
                borderRadius: "25px",
                fontWeight: "600",
              }}
            >
              Go
            </button>
          </div>
        </form>

        <div className="text-end mb-3">
          <button
            className="btn btn-outline-secondary rounded-pill px-4"
            onClick={clearFilters}
            style={{
              borderColor: "#CBBE9A",
              color: "#7B6545",
              fontWeight: "500",
            }}
          >
            Reset Filters
          </button>
        </div>

        {/* Results Table */}
        <div
          className="table-responsive shadow-sm rounded-4 p-3"
          style={{
            background: "linear-gradient(135deg, #fffdf9 0%, #f8f3e8 100%)",
          }}
        >
          <table className="table text-center align-middle">
            <thead
              style={{
                background: "#E9DCC5",
                color: "#4A3B2A",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((exp, i) => (
                  <tr key={exp.id}>
                    <td>{i + 1}</td>
                    <td>{exp.date}</td>
                    <td>{exp.category_name}</td>
                    <td style={{ color: "#8A6B46", fontWeight: "600" }}>₹{exp.amount}</td>
                    <td>{exp.description || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-muted py-3">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total Display */}
        {expenses.length > 0 && (
          <div
            className="text-end mt-4 fw-bold fs-5"
            style={{
              fontFamily: "'Poppins', sans-serif",
              color: "#5A4732",
            }}
          >
            Total: <span style={{ color: "#8A6B46" }}>₹{total}</span>
          </div>
        )}
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
          © {new Date().getFullYear()} SmartExpense+ | Advanced Filter Module
        </p>
      </footer>
    </div>
  );
};

export default UserExpenseFilter;
