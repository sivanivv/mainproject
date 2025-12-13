import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const API_BASE = "http://127.0.0.1:8000/app";

  const handleChange = (e) => {
    setCreds({ ...creds, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      console.log("🧾 Sending credentials:", creds); // debug
      const res = await axios.post(`${API_BASE}/login/`, creds, {
        headers: { "Content-Type": "application/json" },
      });

      const token = res.data.token;
      const user = res.data.user;

      // ✅ Save token & user
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Token ${token}`;

      setMessage("✅ Login successful!");
      setIsError(false);

      setTimeout(() => {
        if (user.user_type === "admin") {
          window.location.href = "/adminhome";
        } else {
          window.location.href = "/userhome";
        }
      }, 800);
    } catch (error) {
      console.error("❌ Login error:", error);
      const errMsg =
        error.response?.data?.error || "Invalid credentials or server issue";
      setMessage(`❌ ${errMsg}`);
      setIsError(true);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        background: "linear-gradient(180deg, #F5F0E6 0%, #E8DFD2 100%)",
        fontFamily: "'Poppins', 'Playfair Display', serif",
      }}
    >
      <div
        className="card shadow-lg border-0 p-4 rounded-4"
        style={{
          backgroundColor: "#FAF8F4",
          maxWidth: "340px",
          width: "100%",
          borderTop: "4px solid #B9975B",
        }}
      >
        <h4
          className="text-center mb-1 fw-bold"
          style={{
            color: "#4A3B2A",
            fontFamily: "'Playfair Display', serif",
            fontSize: "1.4rem",
          }}
        >
          Welcome Back
        </h4>
        <p className="text-center mb-3" style={{ color: "#6E5C43", fontSize: "0.85rem" }}>
          Sign in to manage your expenses wisely
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-floating mb-3">
            <input
              type="text"
              name="username"
              id="username"
              value={creds.username}
              onChange={handleChange}
              className="form-control border-0 border-bottom bg-transparent"
              placeholder="Username or Email"
              required
              style={{
                borderBottom: "2px solid #D1C7B7",
                color: "#4A3B2A",
                fontSize: "0.9rem",
              }}
            />
            <label htmlFor="username" style={{ color: "#7C6B55" }}>
              Username or Email
            </label>
          </div>

          <div className="form-floating mb-3">
            <input
              type="password"
              name="password"
              id="password"
              value={creds.password}
              onChange={handleChange}
              className="form-control border-0 border-bottom bg-transparent"
              placeholder="Password"
              required
              style={{
                borderBottom: "2px solid #D1C7B7",
                color: "#4A3B2A",
                fontSize: "0.9rem",
              }}
            />
            <label htmlFor="password" style={{ color: "#7C6B55" }}>
              Password
            </label>
          </div>

          <button
            type="submit"
            className="btn w-100 fw-semibold"
            style={{
              background: "linear-gradient(135deg, #BFA26B, #9E7E4E)",
              color: "#FFF",
              borderRadius: "25px",
              padding: "8px",
              fontSize: "0.9rem",
            }}
          >
            Sign In
          </button>
        </form>

        {message && (
          <div
            className={`alert mt-3 text-center ${
              isError ? "alert-danger" : "alert-success"
            }`}
            style={{
              background: isError
                ? "#F3E6E6"
                : "linear-gradient(135deg, #EEE6D9, #E5DAC5)",
              color: "#4A3B2A",
              border: "none",
              borderRadius: "10px",
              fontSize: "0.85rem",
              padding: "8px",
            }}
          >
            {message}
          </div>
        )}

        <div className="text-center mt-2">
          <p style={{ fontSize: "0.8rem", color: "#6E5C43" }}>
            Don't have an account?{" "}
            <a href="/register" style={{ color: "#BFA26B", fontWeight: "600" }}>
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
