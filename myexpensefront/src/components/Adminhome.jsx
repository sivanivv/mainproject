import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminHome = () => {
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setAdminName(user.first_name || user.username);
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
          background: "rgba(255,255,255,0.95)",
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
            href="/adminhome"
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
              <a className="nav-link fw-medium" href="/usersmanage" style={{ color: "#7B6545" }}>
                Users
              </a>
            </li>
            <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/admincategories" style={{ color: "#7B6545" }}>
                Categories
              </a>
            </li>
            {/* <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/reports" style={{ color: "#7B6545" }}>
                Reports
              </a>
            </li> */}
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

      {/* 💼 Admin Header */}
      <div
        className="container py-5 text-center"
        style={{
          backgroundImage: "url('/images/admin-home.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "18px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          marginTop: "40px",
          color: "#fff",
          position: "relative",
        }}
      >
        <div
          style={{
            background: "rgba(0, 0, 0, 0.35)", // ✨ lighter transparency
            borderRadius: "18px",
            padding: "60px 20px",
          }}
        >
          <h2
            className="fw-bold mb-3"
            style={{
              fontSize: "2.2rem",
              letterSpacing: "0.5px",
            }}
          >
            Welcome back, {adminName || "Admin"}
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: "#EEE6CC",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Manage users, categories, and track financial insights — keep the system running smoothly.
          </p>
        </div>
      </div>

      {/* 📊 Dashboard Overview */}
      {/* <div className="container mt-5">
        <h4 className="fw-bold mb-4" style={{ color: "#4A3B2A" }}>
          System Overview
        </h4>
        <div className="row g-4">
          {[
            { title: "Total Users", value: "142", note: "Active Accounts" },
            { title: "Total Expenses", value: "₹2,34,560", note: "Recorded This Month" },
            { title: "Groups Created", value: "36", note: "Ongoing Collaborations" },
            { title: "Reports Generated", value: "120", note: "Last 30 Days" },
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
          Quick Actions
        </h5>
        <div className="d-flex justify-content-center flex-wrap gap-3">
          <a
            href="/usersmanage"
            className="btn px-4 py-2 rounded-pill"
            style={{
              background: "linear-gradient(135deg, #C8B37A, #A07D50)",
              color: "#FFF",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(159,127,77,0.25)",
            }}
          >
            Manage Users
          </a>
          <a
            href="/admincategories"
            className="btn btn-outline-dark px-4 py-2 rounded-pill"
            style={{
              borderColor: "#CBBE9A",
              color: "#7B6545",
              fontWeight: "600",
            }}
          >
            Manage Categories
          </a>
          {/* <a
            href="/reports"
            className="btn btn-outline-dark px-4 py-2 rounded-pill"
            style={{
              borderColor: "#CBBE9A",
              color: "#7B6545",
              fontWeight: "600",
            }}
          >
            View Reports
          </a>
          <a
            href="/admin/logs"
            className="btn btn-outline-dark px-4 py-2 rounded-pill"
            style={{
              borderColor: "#CBBE9A",
              color: "#7B6545",
              fontWeight: "600",
            }}
          >
            Audit Logs
          </a> */}
        </div>
      </div>

      {/* 📆 Footer */}
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
          © {new Date().getFullYear()} SmartExpense+ | Admin Dashboard
        </p>
      </footer>
    </div>
  );
};

export default AdminHome;
