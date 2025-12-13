import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from './components/Register.jsx';
import Login from "./components/Login.jsx";
import Index from "./components/Index.jsx";
import UserHome from "./components/Userhome.jsx";
import ExpensePage from "./components/expense.jsx";
import AdminHome from "./components/Adminhome.jsx";
import AdminUsers from "./components/Admin_Users.jsx";
import AdminCategory from "./components/Admin_category.jsx";
import UserBudget from "./components/Budget.jsx";
import UserVisualization from "./components/UserVisualization.jsx";
import UserRecurring from "./components/UserRecurring.jsx";
import UserImportExport from "./components/UserImportExport.jsx";
import UserExpenseFilter from "./components/UserExpenseFilter.jsx";
import UserGroupManagement from "./components/UserGroupManage.jsx";
import Notifications from "./components/Notifications.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminReports from "./components/AdminReport.jsx";




function App() {
  return (
  <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/adminhome" element={<AdminHome />} />
        <Route path="/usersmanage" element={<AdminUsers />} />
        <Route path="/admincategories" element={<AdminCategory />} />
        <Route path="/reports" element={<AdminReports />} />





        <Route path="/userhome" element={<UserHome />} />
        <Route path="/expenses" element={<ExpensePage />} />
        <Route path="/budget" element={<UserBudget />} />
        <Route path="/datavis" element={<UserVisualization />} />
        <Route path="/recurring" element={<UserRecurring />} />

        <Route path="/export" element={<UserImportExport />} />

        <Route path="/filter" element={<UserExpenseFilter />} />
        <Route path="/groupmanage" element={<UserGroupManagement />} />

        <Route path="/notifications" element={<Notifications />} />







      </Routes>
    </Router>
  );
}
export default App;
