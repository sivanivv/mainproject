import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:8000/app/register/", formData);

      setMessage("🍃 Account created successfully!");
      setIsError(false);

      // Clear fields
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        username: "",
        password: "",
      });

      // Redirect after 1 sec
      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (error) {
      setMessage("❌ Registration failed! Please try again.");
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
        className="card shadow-lg border-0 p-3 rounded-4"
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
          Smart Expense+
        </h4>

        <form onSubmit={handleSubmit}>
          {["first_name", "last_name", "email", "username", "password"].map((field) => (
            <div className="form-floating mb-2" key={field}>
              <input
                type={field === "email" ? "email" : field === "password" ? "password" : "text"}
                className="form-control border-0 border-bottom bg-transparent"
                id={field}
                name={field}
                placeholder={field.replace("_", " ")}
                value={formData[field]}
                onChange={handleChange}
                required
                style={{
                  borderRadius: "0",
                  borderBottom: "2px solid #D1C7B7",
                  color: "#4A3B2A",
                  fontSize: "0.9rem",
                  padding: "6px 10px",
                }}
              />
              <label
                htmlFor={field}
                style={{ color: "#7C6B55", fontSize: "0.85rem" }}
              >
                {field.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </label>
            </div>
          ))}

          <button
            type="submit"
            className="btn w-100 fw-semibold mt-2"
            style={{
              background: "linear-gradient(135deg, #BFA26B, #9E7E4E)",
              color: "#FFF",
              borderRadius: "25px",
              padding: "8px",
              fontSize: "0.9rem",
              boxShadow: "0 3px 8px rgba(159, 127, 77, 0.25)",
            }}
          >
            Create Account
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
          <p style={styles.loginText}>
            Already have an account?{" "}
            <a href="/login" style={styles.loginLink}>
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  loginText: {
    marginTop: "10px",
    fontSize: "0.8rem",
    color: "#6E5C43",
  },
  loginLink: {
    color: "#BFA26B",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Register;
