// src/components/UserGroupExpenses.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";
import "bootstrap/dist/css/bootstrap.min.css";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API_BASE = "http://127.0.0.1:8000/app/groups/";

const pageStyle = {
  fontFamily: "'Cormorant Garamond', serif",
  background: "linear-gradient(180deg, #F5EEDC 0%, #E8D9BF 100%)",
  minHeight: "100vh",
  color: "#4a3b2f",
};

const cardStyle = {
  background: "rgba(255,255,255,0.85)",
  border: "1px solid #dccdb5",
  borderRadius: "18px",
  padding: "18px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.07)",
};

const softButton = {
  background: "#C7A772",
  border: "none",
  color: "white",
  borderRadius: "12px",
};

const UserGroupExpenses = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [groups, setGroups] = useState([]);
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [newGroupName, setNewGroupName] = useState("");
  const [memberInput, setMemberInput] = useState("");

  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    date: "",
    description: "",
    split_type: "equal",
  });

  const [splitsInput, setSplitsInput] = useState([]);
  const [summaryData, setSummaryData] = useState(null);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"))?.username || null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selected?.members_full) {
      setSplitsInput(selected.members_full.map(m => ({
        user_id: m.id,
        username: m.username,
        value: "",
      })));
    }

    if (selected) fetchSummary(selected.id);
    else setSummaryData(null);
  }, [selected]);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Token ${localStorage.getItem("token")}` },
  });

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE, getAuthHeaders());
      setGroups(res.data || []);
      setMessage("");
    } catch (err) {
      setMessage("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async (group_id) => {
    try {
      const res = await axios.get(`${API_BASE}${group_id}/summary/`, getAuthHeaders());
      setSummaryData(res.data);
    } catch {
      setSummaryData(null);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      await axios.post(API_BASE, { group_name: newGroupName }, getAuthHeaders());
      setMessage("Group created");
      setNewGroupName("");
      await fetchGroups();
    } catch {
      setMessage("Failed to create group");
    }
  };

  const handleSelectGroup = async (g) => {
    setSelected(g);
    setMessage("");
    fetchSummary(g.id);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberInput.trim()) return setMessage("Enter username or ID");

    const payload = {};
    if (/^\d+$/.test(memberInput.trim()))
      payload.user_id = parseInt(memberInput.trim(), 10);
    else payload.username = memberInput.trim();

    try {
      const res = await axios.post(`${API_BASE}${selected.id}/add-member/`, payload, getAuthHeaders());
      setMessage(res.data.message || "Member added");

      if (res.data.group) setSelected(res.data.group);
      await fetchGroups();
      setMemberInput("");
    } catch (err) {
      setMessage(err?.response?.data?.error || "Failed to add member");
    }
  };

  const handleRemoveMember = async (user_id) => {
    if (!window.confirm("Remove member?")) return;

    try {
      const res = await axios.post(
        `${API_BASE}${selected.id}/remove-member/`,
        { user_id },
        getAuthHeaders()
      );
      setMessage(res.data.message || "Member removed");

      if (res.data.group) setSelected(res.data.group);
      else {
        await fetchGroups();
        const fresh = (await axios.get(API_BASE, getAuthHeaders())).data.find(
          g => g.id === selected.id
        );
        if (fresh) setSelected(fresh);
      }
    } catch {
      setMessage("Failed to remove member");
    }
  };

  const handleChangeExpenseField = (k, v) => {
    setExpenseForm(prev => ({ ...prev, [k]: v }));

    if (k === "split_type") {
      setSplitsInput(prev => prev.map(p => ({ ...p, value: "" })));
    }
  };


  const handleSplitValueChange = (user_id, value) => {
    setSplitsInput(prev =>
      prev.map(p => (p.user_id === user_id ? { ...p, value } : p))
    );
  };

  const buildSplitPayload = () => {
    if (expenseForm.split_type === "equal") return null;

    if (expenseForm.split_type === "percentage") {
      return splitsInput.map(s => ({
        user_id: s.user_id,
        percent: parseFloat(s.value || 0),
      }));
    }

    return splitsInput.map(s => ({
      user_id: s.user_id,
      amount: parseFloat(s.value || 0),
    }));
  };

  const previewShares = () => {
    const amount = parseFloat(expenseForm.amount || 0);
    if (!amount || !selected?.members_full) return [];

    const membersCount = selected.members_full.length;

    if (expenseForm.split_type === "equal") {
      const per = amount / membersCount;
      const fixed = Math.floor(per * 100) / 100;
      const remainder = parseFloat((amount - fixed * membersCount).toFixed(2));

      return selected.members_full.map((m, idx) => ({
        user_id: m.id,
        username: m.username,
        share: parseFloat((fixed + (idx === 0 ? remainder : 0)).toFixed(2)),
      }));
    }

    if (expenseForm.split_type === "percentage") {
      const totalPct = splitsInput.reduce(
        (s, p) => s + (parseFloat(p.value || 0) || 0),
        0
      );
      if (Math.abs(totalPct - 100) > 0.1) return null;

      return splitsInput.map(p => ({
        user_id: p.user_id,
        username: p.username,
        share: parseFloat(
          (((parseFloat(p.value || 0) || 0) / 100) * amount).toFixed(2)
        ),
      }));
    }

    const total = splitsInput.reduce(
      (s, p) => s + (parseFloat(p.value || 0) || 0),
      0
    );
    if (Math.abs(total - amount) > 0.1) return null;

    return splitsInput.map(p => ({
      user_id: p.user_id,
      username: p.username,
      share: parseFloat((parseFloat(p.value || 0) || 0).toFixed(2)),
    }));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();

    if (!expenseForm.amount || !expenseForm.date)
      return setMessage("Enter amount & date");

    const payload = {
      amount: expenseForm.amount,
      date: expenseForm.date,
      description: expenseForm.description || "",
      split_type: expenseForm.split_type,
    };

    const build = buildSplitPayload();
    if (build) payload.splits = build;

    try {
      const res = await axios.post(
        `${API_BASE}${selected.id}/expense/add/`,
        payload,
        getAuthHeaders()
      );
      setMessage(res.data.message || "Expense added");

      if (res.data.group) setSelected(res.data.group);

      setExpenseForm({
        amount: "",
        date: "",
        description: "",
        split_type: "equal",
      });

      await fetchGroups();
      const fresh = (await axios.get(API_BASE, getAuthHeaders())).data.find(
        g => g.id === selected.id
      );
      if (fresh) setSelected(fresh);
      fetchSummary(selected.id);
    } catch (err) {
      setMessage(err?.response?.data?.error || "Failed to add expense");
    }
  };

  const toggleMyStatus = async (expense, statusRecord) => {
    if (!statusRecord || statusRecord.user?.username !== currentUser) return;

    const newStatus =
      statusRecord.status === "Paid" ? "Pending" : "Paid";

    try {
      await axios.post(
        `${API_BASE}expense/${expense.id}/update-status/`,
        { status: newStatus },
        getAuthHeaders()
      );
      await fetchGroups();
      const fresh = (await axios.get(API_BASE, getAuthHeaders())).data.find(
        g => g.id === selected.id
      );
      if (fresh) setSelected(fresh);
      fetchSummary(selected.id);
    } catch {
      setMessage("Failed to update status");
    }
  };

  const creatorMark = async (expense, statusRecord, newStatus) => {
    try {
      await axios.post(
        `${API_BASE}expense/${expense.id}/update-status-by-creator/`,
        { user_id: statusRecord.user.id, status: newStatus },
        getAuthHeaders()
      );

      await fetchGroups();
      const fresh = (await axios.get(API_BASE, getAuthHeaders())).data.find(
        g => g.id === selected.id
      );
      if (fresh) setSelected(fresh);
      fetchSummary(selected.id);
    } catch {
      setMessage("Creator update failed");
    }
  };

  const handleDeleteExpense = async (expense_id) => {
    if (!window.confirm("Delete this shared expense?")) return;

    try {
      await axios.delete(
        `${API_BASE}expense/${expense_id}/delete/`,
        getAuthHeaders()
      );
      setMessage("Expense deleted");

      await fetchGroups();
      const fresh = (await axios.get(API_BASE, getAuthHeaders())).data.find(
        g => g.id === selected.id
      );
      if (fresh) setSelected(fresh);
      fetchSummary(selected.id);
    } catch {
      setMessage("Failed to delete expense");
    }
  };

  const preview = previewShares();
  // CHART DATA
  const pieData = () => {
    if (!summaryData) return null;
    return {
      labels: summaryData.per_member_totals.map(p => p.username),
      datasets: [
        {
          data: summaryData.per_member_totals.map(p => p.total),
          backgroundColor: summaryData.per_member_totals.map(
            (_, i) => `hsl(${(i * 60) % 360} 50% 55%)`
          ),
          borderWidth: 0,
        },
      ],
    };
  };

  const barData = () => {
    if (!summaryData) return null;
    return {
      labels: summaryData.monthly_data.map(m => m.month),
      datasets: [
        {
          label: "",
          data: summaryData.monthly_data.map(m => m.total),
          backgroundColor: "rgba(160,120,80,0.5)",
          borderRadius: 8,
        },
      ],
    };
  };
  
    const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };
  return (
    <div
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        background: "linear-gradient(180deg,#F4EEE2,#E7D9C3,#DBC9AD)",
        minHeight: "100vh",
        color: "#4A3B2D",
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


      {/* BODY */}
      <div className="container py-5">
        <h2
          className="text-center mb-4"
          style={{
            fontSize: "2.4rem",
            fontWeight: 600,
            color: "#5A432E",
          }}
        >
          Group Expenses & Split  
        </h2>

        {message && (
          <div
            className="alert text-center"
            style={{
              background: "#FFF7E6",
              border: "1px solid #D8C7A3",
              color: "#8A6D46",
              borderRadius: "12px",
            }}
          >
            {message}
          </div>
        )}

        <div className="row">
          {/* LEFT PANEL */}
          <div className="col-lg-4">
            {/* GROUP LIST */}
            <div
              className="p-3 mb-3"
              style={{
                background: "#FBF6EF",
                borderRadius: "14px",
                border: "1px solid #DDCBB1",
              }}
            >
              <h5 className="mb-3" style={{ color: "#7B6043" }}>
                Your Groups
              </h5>

              <div className="list-group">
                {groups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => handleSelectGroup(g)}
                    className={`list-group-item list-group-item-action mb-2 ${
                      selected?.id === g.id ? "active" : ""
                    }`}
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #D7C3A2",
                      background:
                        selected?.id === g.id ? "#D7C3A2" : "#FFFDF9",
                      color: selected?.id === g.id ? "#4A3B2D" : "#7B6043",
                    }}
                  >
                    <strong>{g.group_name}</strong>
                    <div className="small text-muted">
                      {g.members?.length || 0} members
                    </div>
                  </button>
                ))}
              </div>

              {/* CREATE GROUP */}
              <form onSubmit={handleCreateGroup} className="mt-3 d-flex gap-2">
                <input
                  className="form-control"
                  placeholder="New group name"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #D1B894",
                    background: "#FFF9F2",
                  }}
                />
                <button
                  className="btn"
                  style={{
                    background: "#C29A63",
                    color: "white",
                    borderRadius: "10px",
                  }}
                >
                  Create
                </button>
              </form>

                {/* ADD MEMBER UI */}
              <hr />
              <h6 className="mt-2">Add Member</h6>
              <form onSubmit={handleAddMember} className="d-flex gap-2">
                <input className="form-control form-control-sm" placeholder="username or user id" value={memberInput} onChange={(e) => setMemberInput(e.target.value)} />
                <button className="btn btn-sm btn-outline-success" type="submit">Add</button>
              </form>

              {/* show members of selected group */}
              <div className="mt-3">
                <h6 className="small">Members</h6>
                {selected?.members_full?.length ? selected.members_full.map(m => (
                  <div key={m.id} className="d-flex justify-content-between align-items-center mb-1">
                    <div>
                      <strong>{m.username}</strong><div className="small text-muted">{m.email}</div>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveMember(m.id)}>Remove</button>
                    </div>
                  </div>
                )) : <div className="small text-muted">Select group to view members</div>}
              </div>
            </div>
           

            {/* SUMMARY CARD */}
            <div
              className="p-3"
              style={{
                background: "#FBF6EF",
                borderRadius: "14px",
                border: "1px solid #DDCBB1",
              }}
            >
              <h6 style={{ color: "#7B6043" }}>Member Summary</h6>
              {summaryData?.summary ? (
                summaryData.summary.map(s => (
                  <div
                    key={s.user_id}
                    className="d-flex justify-content-between mb-2 p-2"
                    style={{
                      borderBottom: "1px dashed #D8C4A4",
                    }}
                  >
                    <strong>{s.username}</strong>
                    <div>
                      <div
                        style={{ fontSize: "0.9rem", color: "#7B6043" }}
                      >
                        Paid: ₹{s.paid.toFixed(2)}
                      </div>
                      <div className="text-danger">
                        Pending: ₹{s.pending.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="small text-muted">Select a group</p>
              )}
            </div>
          </div>

          {/* RIGHT SIDE CONTENT */}
          <div className="col-lg-8">
            {!selected ? (
              <div
                className="p-4 text-center"
                style={{
                  background: "#FBF6EF",
                  borderRadius: "14px",
                  border: "1px solid #DDCBB1",
                }}
              >
                Select a group to manage expenses
              </div>
            ) : (
              <>
                {/* ADD EXPENSE CARD */}
                <div
                  className="p-4 mb-4"
                  style={{
                    background: "#FFF9F2",
                    borderRadius: "16px",
                    border: "1px solid #D8C4A4",
                  }}
                >
                  <h5 className="mb-3" style={{ color: "#7B6043" }}>
                    Add Shared Expense
                  </h5>

                  <form onSubmit={handleAddExpense} className="row g-3">
                    <div className="col-md-4">
                      <label className="small">Amount</label>
                      <input
                        type="number"
                        className="form-control"
                        value={expenseForm.amount}
                        onChange={e =>
                          handleChangeExpenseField("amount", e.target.value)
                        }
                        style={{
                          borderRadius: "10px",
                          background: "#FDF7EF",
                          border: "1px solid #D3BFA1",
                        }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="small">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={expenseForm.date}
                        onChange={e =>
                          handleChangeExpenseField("date", e.target.value)
                        }
                        style={{
                          borderRadius: "10px",
                          background: "#FDF7EF",
                          border: "1px solid #D3BFA1",
                        }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="small">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        value={expenseForm.description}
                        onChange={e =>
                          handleChangeExpenseField("description", e.target.value)
                        }
                        style={{
                          borderRadius: "10px",
                          background: "#FDF7EF",
                          border: "1px solid #D3BFA1",
                        }}
                      />
                    </div>

                    {/* Split Mode */}
                    <div className="col-md-4">
                      <label className="small">Split Mode</label>
                      <select
                        className="form-select"
                        value={expenseForm.split_type}
                        onChange={e =>
                          handleChangeExpenseField("split_type", e.target.value)
                        }
                        style={{
                          borderRadius: "10px",
                          background: "#FDF7EF",
                          border: "1px solid #D3BFA1",
                        }}
                      >
                        <option value="equal">Equal</option>
                        <option value="percentage">Percentage</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>

                    {/* Preview + Custom Inputs */}
                    <div className="col-12">
                      {selected.members_full?.length > 0 && (
                        <div
                          className="p-3 mt-2"
                          style={{
                            background: "#FAF2E6",
                            borderRadius: "16px",
                            border: "1px solid #D8C4A4",
                          }}
                        >
                          <strong style={{ color: "#7B6043" }}>
                            Split Details
                          </strong>

                          <div className="row mt-2">
                            {selected.members_full.map(m => (
                              <div className="col-md-4 mb-2" key={m.id}>
                                <label className="small">{m.username}</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={
                                    splitsInput.find(
                                      s => s.user_id === m.id
                                    )?.value || ""
                                  }
                                  onChange={e =>
                                    handleSplitValueChange(m.id, e.target.value)
                                  }
                                  style={{
                                    borderRadius: "10px",
                                    background: "#FFF9F2",
                                    border: "1px solid #D2BDA0",
                                  }}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Preview */}
                          <div className="mt-3">
                            <strong style={{ color: "#7B6043" }}>
                              Preview Shares
                            </strong>

                            {preview === null ? (
                              <div className="text-danger small">
                                Invalid split
                              </div>
                            ) : (
                              preview.map(s => (
                                <div
                                  key={s.user_id}
                                  className="d-flex justify-content-between"
                                >
                                  <span>{s.username}</span>
                                  <span>₹{s.share.toFixed(2)}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-12 text-end">
                      <button
                        className="btn"
                        style={{
                          background: "#7E5C3F",
                          color: "white",
                          borderRadius: "12px",
                          padding: "8px 20px",
                        }}
                      >
                        Add Expense
                      </button>
                    </div>
                  </form>
                </div>

                {/* EXPENSE LIST */}
                <div
                  className="p-4"
                  style={{
                    background: "#FFF9F2",
                    borderRadius: "16px",
                    border: "1px solid #D8C4A4",
                  }}
                >
                  <h5 className="mb-3" style={{ color: "#7B6043" }}>
                    Group Expenses
                  </h5>

                  {selected.expenses?.map(exp => (
                    <div
                      key={exp.id}
                      className="p-3 mb-3"
                      style={{
                        background: "#FAF2E6",
                        borderRadius: "14px",
                        border: "1px solid #E4D0B3",
                      }}
                    >
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>{exp.description}</strong>
                          <div className="small text-muted">
                            Added by {exp.added_by.username}
                          </div>
                        </div>

                        <strong style={{ color: "#6F4E37" }}>
                          ₹{exp.amount}
                        </strong>
                      </div>

                      {/* Member statuses */}
                      <div className="mt-3 d-flex flex-wrap gap-2">
                        {exp.statuses.map(s => (
                          <div
                            key={s.id}
                            className="p-2"
                            style={{
                              background: "#FFF",
                              borderRadius: "10px",
                              border: "1px solid #D8C4A4",
                              minWidth: "150px",
                            }}
                          >
                            <strong>{s.user.username}</strong>
                            <div className="small text-muted">
                              ₹{s.amount_share}
                            </div>

                            {/* Creator controls */}
                            {exp.added_by.username === currentUser &&
                              s.user.username !== currentUser && (
                                <div className="mt-2">
                                  <button
                                    className="btn btn-sm btn-success me-1"
                                    onClick={() =>
                                      creatorMark(exp, s, "Paid")
                                    }
                                    style={{
                                      borderRadius: "8px",
                                    }}
                                  >
                                    ✓ Paid
                                  </button>
                                  <button
                                    className="btn btn-sm btn-warning"
                                    onClick={() =>
                                      creatorMark(exp, s, "Pending")
                                    }
                                    style={{
                                      borderRadius: "8px",
                                    }}
                                  >
                                    Pending
                                  </button>
                                </div>
                              )}

                            {/* Non-creators → read-only */}
                            {exp.added_by.username !== currentUser && (
                              <span
                                className={`badge mt-2 ${
                                  s.status === "Paid"
                                    ? "bg-success"
                                    : "bg-secondary"
                                }`}
                              >
                                {s.status}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Delete */}
                      {exp.added_by.username === currentUser && (
                        <div className="text-end mt-2">
                          <button
                            className="btn btn-sm btn-danger"
                            style={{ borderRadius: "10px" }}
                            onClick={() => handleDeleteExpense(exp.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* CHARTS */}
                <div className="row mt-4">
                  <div className="col-md-6">
                    <div
                      className="p-3"
                      style={{
                        background: "#FFF9F2",
                        borderRadius: "16px",
                        border: "1px solid #D8C4A4",
                      }}
                    >
                      <h6 style={{ color: "#7B6043" }}>Member Breakdown</h6>
                      {summaryData ? <Pie data={pieData()} /> : "No data"}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div
                      className="p-3"
                      style={{
                        background: "#FFF9F2",
                        borderRadius: "16px",
                        border: "1px solid #D8C4A4",
                      }}
                    >
                      <h6 style={{ color: "#7B6043" }}>
                        Monthly Group Expenses
                      </h6>
                      {summaryData ? (
                        <Bar
                          data={barData()}
                          options={{
                            plugins: { legend: { display: false } },
                          }}
                        />
                      ) : (
                        "No data"
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGroupExpenses;
