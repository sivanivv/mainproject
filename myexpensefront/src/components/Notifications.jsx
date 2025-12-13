import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE = "http://127.0.0.1:8000/app/";

export default function Notifications() {
  const [notes, setNotes] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const lastCountRef = useRef(0);

  const getHeaders = () => ({
    headers: { Authorization: `Token ${localStorage.getItem("token")}` }
  });

  const load = async () => {
    const res = await axios.get(API_BASE + "notifications/", getHeaders());
    setNotes(res.data);

    const unread = res.data.filter(n => n.status === "unread").length;
    setUnreadCount(unread);
    lastCountRef.current = unread;
  };

  const checkNew = async () => {
    const res = await axios.get(API_BASE + "notifications/", getHeaders());
    const data = res.data;

    const unread = data.filter(n => n.status === "unread").length;

    if (unread > lastCountRef.current) {
      toast.success("New notification received");
    }

    lastCountRef.current = unread;
    setUnreadCount(unread);
    setNotes(data);
  };

  useEffect(() => {
    load();
    const interval = setInterval(checkNew, 10000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    await axios.post(API_BASE + `notifications/${id}/read/`, {}, getHeaders());
    load();
  };

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

      <div
        className="p-4 mb-4 rounded"
        style={{

          color: "#4b3621",
          boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
        }}
      >
        <h2 className="text-center mb-0" style={{ fontWeight: 600 }}>
          Notifications
        </h2>
        {unreadCount > 0 && (
          <p className="text-center mt-2" style={{ fontSize: "14px" }}>
            🔔 You have {unreadCount} unread notifications
          </p>
        )}
      </div>

      {notes.length === 0 && (
        <p
          className="text-center mt-5"
          style={{ color: "#6a5d4d", fontSize: "18px" }}
        >
          No notifications found.
        </p>
      )}

      {notes.map((n) => (
        <div
          key={n.id}
          className="card mb-3 border-0"
          style={{
            background: "#fff9f2",
            borderRadius: "18px",
            padding: "18px",
            boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
          }}
        >
          <div>
            <strong
              style={{
                color: "#4b3621",
                fontSize: "17px",
                letterSpacing: "0.3px",
              }}
            >
              {n.message}
            </strong>

            <div
              className="small mt-1"
              style={{ color: "#7c6e63", fontSize: "13px" }}
            >
              {new Date(n.timestamp).toLocaleString()}
            </div>
          </div>

          {n.status === "unread" && (
            <button
              className="btn btn-sm mt-3"
              style={{
                background: "#b88352",
                border: "none",
                color: "white",
                borderRadius: "20px",
                padding: "6px 16px",
              }}
              onClick={() => markRead(n.id)}
            >
              Mark Read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}