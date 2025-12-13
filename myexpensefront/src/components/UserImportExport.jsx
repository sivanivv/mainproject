import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { saveAs } from "file-saver";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";

const UserExport = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [loading, setLoading] = useState(false);

  const handleExport = async (format) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("❌ You are not logged in!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/app/export-expenses/?format=${format}`,
        {
          headers: { Authorization: `Token ${token}` },
          responseType: "blob",
        }
      );

      // Determine filename
      const contentDisposition = res.headers["content-disposition"];
      let fileName = format === "pdf" ? "MyExpense_Report.pdf" : "MyExpense_Report.xlsx";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match && match[1]) fileName = match[1];
      }

      // Use file-saver to save the file
      saveAs(res.data, fileName);

      toast.success("✅ Export successful!");
    } catch (err) {
      console.error("Export error:", err.response ? err.response.data : err.message);
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(`❌ ${err.response.data.error}`);
      } else {
        toast.error("❌ Failed to export expenses.");
      }
    } finally {
      setLoading(false);
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
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Navbar */}
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
            style={{ color: "#8A6B46", fontSize: "1.8rem", letterSpacing: "0.4px" }}
          >
            Smart<span style={{ color: "#C2A66A" }}>Expense+</span>
          </a>

          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/expenses" style={{ color: "#7B6545" }}>Expenses</a>
            </li>
            <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/budget" style={{ color: "#7B6545" }}>Budget</a>
            </li>
            <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/datavis" style={{ color: "#7B6545" }}>Charts</a>
            </li>
            <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/export" style={{ color: "#7B6545" }}>Export</a>
            </li>

            {/* Notification Bell */}
            <li className="nav-item mx-3">
              <button
                className="btn position-relative p-0"
                onClick={() => navigate("/notifications")}
                style={{ width: "30px", height: "30px" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#7B6545" width="24" height="24">
                  <path d="M12 2C10.343 2 9 3.343 9 5v1.07C6.163 6.563 4 9.06 4 12v5l-1 1v1h18v-1l-1-1v-5c0-2.94-2.163-5.437-5-5.93V5c0-1.657-1.343-3-3-3zM6 12c0-2.21 1.79-4 4-4s4 1.79 4 4v5H6v-5zM12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2z" />
                </svg>
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                    style={{ backgroundColor: "#7B6545", color: "#fff", fontSize: "0.65rem", padding: "0.25em 0.4em" }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </li>

            <li className="nav-item mx-3">
              <button
                onClick={handleLogout}
                className="btn btn-outline-secondary px-3 py-1 fw-semibold"
                style={{ borderColor: "#CBBE9A", color: "#7B6545", borderRadius: "25px" }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Content */}
      <div className="container py-5 text-center">
        <h2 className="fw-bold mb-4" style={{ color: "#4A3B2A" }}>Export Your Expenses</h2>
        {loading && <p style={{ color: "#7B6545" }}>⏳ Exporting...</p>}

        <div className="card shadow-sm border-0 p-4 mb-5"
          style={{ background: "linear-gradient(135deg, #FFFDF8 0%, #F8F1E5 100%)", borderRadius: "20px", maxWidth: "600px", margin: "auto" }}>
          <h5 className="mb-3">📤 Export Your Expenses</h5>
          <button onClick={() => handleExport("excel")} className="btn mx-2"
            style={{ background: "linear-gradient(135deg, #C2A66A, #A9844F)", color: "#fff", borderRadius: "25px" }}>
            Export as Excel
          </button>
          <button onClick={() => handleExport("pdf")} className="btn mx-2"
            style={{ background: "linear-gradient(135deg, #D97D6B, #B35A40)", color: "#fff", borderRadius: "25px" }}>
            Export as PDF
          </button>
        </div>
      </div>

      <footer className="text-center py-4 mt-5" style={{ background: "#E6DAC3", color: "#5C4A33", fontSize: "0.9rem" }}>
        <p className="mb-0">© {new Date().getFullYear()} SmartExpense+ | Export Tools</p>
      </footer>
    </div>
  );
};

export default UserExport;
