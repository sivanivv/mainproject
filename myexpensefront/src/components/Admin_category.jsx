import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminCategory = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const API_URL = "http://127.0.0.1:8000/app/categories/";

  // 🟢 Fetch Categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Token ${token}` },
      });
      setCategories(res.data);
      setMessage("");
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("❌ Failed to load categories. Check admin access.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ➕ Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        API_URL,
        { category_name: categoryName },
        { headers: { Authorization: `Token ${token}` } }
      );
      setMessage("✅ Category added successfully!");
      setCategoryName("");
      fetchCategories();
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to add category.");
    }
  };

  // 🟡 Edit Category
  const startEditing = (id, name) => {
    setEditingId(id);
    setEditName(name);
  };

  // ✏️ Update Category
  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}${id}/`,
        { category_name: editName },
        { headers: { Authorization: `Token ${token}` } }
      );
      setMessage("✅ Category updated successfully!");
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      console.error("Update error:", error);
      setMessage("❌ Failed to update category.");
    }
  };

  // ❌ Delete Category
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setCategories(categories.filter((c) => c.id !== id));
      setMessage("✅ Category deleted.");
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("❌ Failed to delete category.");
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
      {/* 🧭 Navbar (same as AdminUsers) */}
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
            <li className="nav-item mx-3">
              <a className="nav-link fw-medium" href="/admin/reports" style={{ color: "#7B6545" }}>
                Reports
              </a>
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

      {/* 🌿 Category Section */}
      <div className="container mt-5 mb-5">
        <h2 className="fw-bold text-center mb-4" style={{ color: "#4A3B2A" }}>
          Manage Expense Categories
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

        {/* ➕ Add Category */}
        <form
          onSubmit={handleAddCategory}
          className="d-flex justify-content-center align-items-center mb-5"
          style={{ maxWidth: "500px", margin: "auto" }}
        >
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter new category"
            className="form-control me-3"
            required
            style={{
              borderRadius: "30px",
              border: "1px solid #D1C4A5",
              padding: "10px 15px",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
            }}
          />
          <button
            type="submit"
            className="btn px-4"
            style={{
              background: "linear-gradient(135deg, #C2A66A, #A9844F)",
              color: "#FFF",
              borderRadius: "25px",
              fontWeight: "600",
              boxShadow: "0 3px 10px rgba(191,162,107,0.4)",
            }}
          >
            Add
          </button>
        </form>

        {/* 🌸 Card Layout */}
        <div className="row justify-content-center">
          {categories.length > 0 ? (
            categories.map((cat, index) => (
              <div key={cat.id} className="col-md-5 col-lg-4 col-sm-10 mb-4">
                <div
                  className="card shadow-sm border-0 h-100 hover-card text-center"
                  style={{
                    background: "linear-gradient(180deg, #FFFDF9 0%, #F5EFE5 100%)",
                    borderRadius: "18px",
                    transition: "all 0.3s ease",
                    padding: "25px 15px",
                  }}
                >
                  {editingId === cat.id ? (
                    <>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="form-control mb-3 text-center"
                        style={{
                          borderRadius: "12px",
                          fontWeight: "500",
                        }}
                      />
                      <div>
                        <button
                          onClick={() => handleUpdate(cat.id)}
                          className="btn btn-success btn-sm rounded-pill me-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn btn-outline-secondary btn-sm rounded-pill"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h5
                        className="fw-bold mb-3"
                        style={{ color: "#4A3B2A", letterSpacing: "0.5px" }}
                      >
                        {cat.category_name}
                      </h5>
                      <div>
                        <button
                          onClick={() => startEditing(cat.id, cat.category_name)}
                          className="btn btn-sm btn-outline-primary rounded-pill me-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="btn btn-sm btn-outline-danger rounded-pill"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted mt-5">No categories added yet.</div>
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

      {/* 🌸 Hover Animation */}
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

export default AdminCategory;
