import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const API_URL = "http://127.0.0.1:8000/app/users/";

  // 🟢 Fetch Users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Token ${token}` },
      });
      setUsers(res.data);
      setMessage("");
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("❌ Failed to fetch users. Please check your admin rights.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔴 Delete User
  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in as admin to delete users.");
        return;
      }

      const response = await axios.delete(`${API_URL}${userId}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setMessage(response.data.message || "✅ User deleted successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Delete error:", error);
      setMessage(error.response?.data?.error || "❌ Failed to delete user.");
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
              <a className="nav-link fw-medium" href="/admin/reports" style={{ color: "#7B6545" }}>
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
      {/* 👥 User Section */}
      <div className="container mt-5 mb-5">
        <h2 className="fw-bold text-center mb-4" style={{ color: "#4A3B2A" }}>
          Registered Users
        </h2>

        {message && (
          <div
            className={`alert ${
              message.includes("❌") ? "alert-danger" : "alert-success"
            }`}
            style={{
              borderRadius: "12px",
              fontWeight: "500",
              background: message.includes("❌")
                ? "#FCECEC"
                : "linear-gradient(135deg, #EEE6D9, #E5DAC5)",
              color: "#4A3B2A",
              textAlign: "center",
            }}
          >
            {message}
          </div>
        )}

        {/* 🌸 Card Layout */}
        <div className="row justify-content-center">
          {users.length > 0 ? (
            users.map((user, index) => (
              <div key={user.id} className="col-md-5 col-lg-4 col-sm-10 mb-4">
                <div
                  className="card shadow-sm border-0 h-100 hover-card"
                  style={{
                    background: "linear-gradient(180deg, #FFFDF9 0%, #F5EFE5 100%)",
                    borderRadius: "18px",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                  }}
                >
                  <div className="card-body text-center py-4">
                    <div
                      className="rounded-circle mx-auto mb-3"
                      style={{
                        width: "70px",
                        height: "70px",
                        background: "#EADFC2",
                        color: "#4A3B2A",
                        fontSize: "1.5rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                        boxShadow: "inset 0 2px 6px rgba(0,0,0,0.1)",
                      }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <h5 className="fw-bold mb-1" style={{ color: "#4A3B2A" }}>
                      {user.username}
                    </h5>
                    <p className="text-muted mb-1" style={{ fontSize: "0.95rem" }}>
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-muted small mb-3">{user.email}</p>

                    <button
                      onClick={() => handleDelete(user.id)}
                      className="btn btn-sm px-4 py-2"
                      style={{
                        background: "linear-gradient(135deg, #E6D3B3, #CBB189)",
                        color: "#4A3B2A",
                        borderRadius: "30px",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 10px rgba(180,150,100,0.25)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background =
                          "linear-gradient(135deg, #F2E3C9, #D6BE94)";
                        e.target.style.boxShadow =
                          "0 6px 15px rgba(160,130,80,0.35)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background =
                          "linear-gradient(135deg, #E6D3B3, #CBB189)";
                        e.target.style.boxShadow =
                          "0 4px 10px rgba(180,150,100,0.25)";
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted mt-5">No users found.</div>
          )}
        </div>
      </div>

      {/* 🌿 Footer */}
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
          © {new Date().getFullYear()} SmartExpense+ | Admin Dashboard
        </p>
      </footer>

      {/* 🌸 Hover Effect */}
      <style>
        {`
          .hover-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
        `}
      </style>
    </div>
  );
};

export default AdminUsers;
