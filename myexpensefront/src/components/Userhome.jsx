import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import Notifications from "./Notifications";
import useNotifications from "../hooks/useNotifications";
const UserHome = () => {
  const [username, setUsername] = useState("");
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUsername(user.first_name || user.username);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div
      style={{
        fontFamily: "'Poppins', 'Playfair Display', serif",
        background: "linear-gradient(180deg, #E7DCC3 0%, #F4E9D5 45%, #F9F5EE 100%)",
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

      {/* 💰 Dashboard Header */}
      <div
        className="container py-5"
        style={{
          background: "url('/images/finance-dashboard.jpeg') center/cover no-repeat",
          borderRadius: "18px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          marginTop: "40px",
          padding: "70px 40px",
          color: "#FFF",
          position: "relative",
        }}
      >
        <div
          style={{
            background: "rgba(0, 0, 0, 0.15)", // ☀️ much lighter overlay — subtle and elegant
            borderRadius: "18px",
            padding: "50px",
          }}
        >
          <h2
            className="fw-bold mb-3"
            style={{
              fontSize: "2.2rem",
              letterSpacing: "0.5px",
              textShadow: "0 1px 4px rgba(0,0,0,0.2)", // ✨ gentle contrast
            }}
          >
            Welcome back, {username || "User"}
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: "#FDF8EC",
              maxWidth: "600px",
              textShadow: "0 1px 3px rgba(0,0,0,0.25)",
            }}
          >
            Take a moment to review your financial progress — every smart move counts.
          </p>
        </div>
      </div>

      {/* 📊 Overview Cards */}
      {/* <div className="container mt-5">
        <div className="row g-4">
          {[
            { title: "Total Expenses", value: "₹18,520", note: "This Month" },
            { title: "Remaining Budget", value: "₹7,480", note: "Under Limit" },
            { title: "Recurring Bills", value: "4 Active", note: "2 Due Soon" },
            { title: "Savings Progress", value: "82%", note: "On Track" },
          ].map((item, i) => (
            <div key={i} className="col-md-3">
              <div
                className="p-4 rounded-4 shadow-sm text-center"
                style={{
                  background: "linear-gradient(180deg, #FFF 0%, #F8F3EA 100%)",
                  border: "1px solid #E1D6BF",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                }}
              >
                <h6 className="fw-semibold text-muted">{item.title}</h6>
                <h3 className="fw-bold mt-2" style={{ color: "#BFA26B" }}>
                  {item.value}
                </h3>
                <p className="text-muted small mb-0">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* ⚙️ Quick Access Section */}
      <div className="container mt-5 mb-5 text-center">
        <h5 className="fw-bold mb-4" style={{ color: "#4A3B2A" }}>
          Quick Access
        </h5>
        <div className="d-flex justify-content-center flex-wrap gap-3">
          <a
            href="/expenses"
            className="btn px-4 py-2 rounded-pill"
            style={{
              background: "linear-gradient(135deg, #C8B37A, #A07D50)",
              color: "#FFF",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(159,127,77,0.25)",
            }}
          >
            Add Expense
          </a>
          <a
            href="/budget"
            className="btn btn-outline-dark px-4 py-2 rounded-pill"
            style={{
              borderColor: "#CBBE9A",
              color: "#7B6545",
              fontWeight: "600",
            }}
          >
            Set Budget
          </a>
          <a
            href="/datavis"
            className="btn btn-outline-dark px-4 py-2 rounded-pill"
            style={{
              borderColor: "#CBBE9A",
              color: "#7B6545",
              fontWeight: "600",
            }}
          >
            View Analytics
          </a>
          <a
            href="/recurring"
            className="btn btn-outline-dark px-4 py-2 rounded-pill"
            style={{
              borderColor: "#CBBE9A",
              color: "#7B6545",
              fontWeight: "600",
            }}
          >
            Manage Recurring
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-center py-4"
        style={{
          background: "#E6DAC3",
          color: "#5C4A33",
          fontSize: "0.9rem",
          letterSpacing: "0.3px",
          boxShadow: "0 -3px 8px rgba(0,0,0,0.05)",
        }}
      >
        <p className="mb-0">
          © {new Date().getFullYear()} SmartExpense+ | Balance. Track. Grow.
        </p>
      </footer>
    </div>
  );
};

export default UserHome;
