import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminReports = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [filters, setFilters] = useState({
    user: "",
    startDate: "",
    endDate: "",
  });
  const [message, setMessage] = useState("");

  const USERS_URL = "http://127.0.0.1:8000/app/admin/users/";
  const REPORT_URL = "http://127.0.0.1:8000/app/admin/reports/";

  // Fetch all users for dropdown
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(USERS_URL, {
        headers: { Authorization: `Token ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  };

  // Fetch report data
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(REPORT_URL, {
        headers: { Authorization: `Token ${token}` },
        params: filters,
      });
      setReports(res.data);
      if (res.data.length === 0) setMessage("No records found for selected filters.");
      else setMessage("");
    } catch (err) {
      console.error("Error fetching reports:", err);
      setMessage("Failed to fetch reports.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <div className="container py-5">
      <h2 className="fw-bold mb-4 text-center">Admin Report Generation</h2>

      {/* Filters */}
      <div
        className="card shadow-sm p-4 mb-4"
        style={{ borderRadius: "15px", maxWidth: "800px", margin: "auto" }}
      >
        <form onSubmit={handleGenerateReport}>
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <select
                className="form-select"
                name="user"
                value={filters.user}
                onChange={handleFilterChange}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-3">
              <input
                type="date"
                className="form-control"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2 text-end">
              <button
                type="submit"
                className="btn btn-primary"
                style={{ borderRadius: "25px" }}
              >
                Generate
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Report Table */}
      <div className="table-responsive shadow-sm rounded">
        {message && <p className="text-center text-muted">{message}</p>}
        {reports.length > 0 && (
          <table className="table table-hover align-middle text-center">
            <thead className="table-secondary">
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Category</th>
                <th>Amount (₹)</th>
                <th>Date</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((rep, index) => (
                <tr key={rep.id}>
                  <td>{index + 1}</td>
                  <td>{rep.username}</td>
                  <td>{rep.category_name}</td>
                  <td>{rep.amount}</td>
                  <td>{new Date(rep.date).toLocaleDateString()}</td>
                  <td>{rep.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
