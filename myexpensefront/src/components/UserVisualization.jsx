import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useNotifications from "../hooks/useNotifications";
import Notifications from "./Notifications";
import { toast } from "react-toastify";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "bootstrap/dist/css/bootstrap.min.css";

const COLORS = ["#C2A66A", "#8A6B46", "#A9844F", "#E1C699", "#EDE1CF"];

const UserVisualization = () => {
  const [summary, setSummary] = useState(null);
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const API_URL = "http://127.0.0.1:8000/app/expense-summary/";
  

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Token ${token}` },
      });
      setSummary(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!summary) {
    return <p className="text-center mt-5">Loading charts...</p>;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div
      style={{
        fontFamily: "'Playfair Display', serif",
        background: "linear-gradient(180deg, #F4E9D5 0%, #E7DCC3 100%)",
        color: "#3E3423",
        minHeight: "100vh",
        overflowX: "hidden",
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

      {/* ☕ Header Section */}
      <div className="text-center py-5" style={{ background: "#E7DCC3" }}>
        <h1 className="fw-bold mb-2" style={{ color: "#5B472C", fontSize: "2.8rem" }}>
          Expense Insights at a Glance
        </h1>
        <p style={{ color: "#7B6545", fontSize: "1.1rem" }}>
          Visualize your spending habits beautifully with SmartExpense+
        </p>
      </div>

      {/* 📊 Summary Cards */}
      <div className="container py-5">
        <div className="row g-4 text-center">
          {[{
            title: "Total Expenses",
            value: `₹${summary.total_expense}`,
          }, {
            title: "This Month",
            value: `₹${summary.this_month_total}`,
          }, {
            title: "Top Category",
            value: summary.top_category,
          }].map((card, index) => (
            <div key={index} className="col-md-4">
              <div
                className="card border-0 shadow-sm p-4"
                style={{
                  borderRadius: "18px",
                  background: "linear-gradient(180deg, #FFFDF9 0%, #F5EFE5 100%)",
                }}
              >
                <h6 className="text-muted mb-2">{card.title}</h6>
                <h3 className="fw-bold" style={{ color: "#4A3B2A" }}>{card.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* 📈 Charts Section */}
        <div className="row mt-5 justify-content-center">
          <div className="col-lg-5 col-md-6 mb-5">
            <h5 className="text-center fw-semibold mb-4" style={{ color: "#4A3B2A" }}>Category-wise Expenses</h5>
            <div
              className="p-4 shadow-sm"
              style={{ borderRadius: "20px", background: "#FFFDF8" }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={summary.category_data}
                    dataKey="total"
                    nameKey="category__category_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {summary.category_data.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-lg-6 col-md-6">
            <h5 className="text-center fw-semibold mb-4" style={{ color: "#4A3B2A" }}>Monthly Spending Trend</h5>
            <div
              className="p-4 shadow-sm"
              style={{ borderRadius: "20px", background: "#FFFDF8" }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={summary.monthly_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date__month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#C2A66A" barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 🌸 Footer */}
      <footer
        className="text-center py-4 mt-5"
        style={{ background: "#E7DCC3", color: "#5C4A33", fontSize: "0.9rem" }}
      >
        <p className="mb-0">© {new Date().getFullYear()} SmartExpense+ | Elegant Analytics</p>
      </footer>
    </div>
  );
};

export default UserVisualization;
