import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ViewerDashboard from "./pages/ViewerDashboard";
import ViewerTransactions from "./pages/ViewerTransactions";
import CreateTransaction from "./pages/CreateTransaction";
import AnalystDashboard from "./pages/AnalystDashboard";
import AnalystAccounts from "./pages/AnalystAccounts";
import AdminUsers from "./pages/AdminUsers";
import AdminTransactions from "./pages/AdminTransactions";

const AppRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) return null; 

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to={`/${user.role}`} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={`/${user.role}`} />} />
      <Route path="/" element={<Navigate to={user ? `/${user.role}` : "/login"} />} />

      
      <Route path="/viewer" element={<ProtectedRoute allowedRoles={['viewer', 'admin']}><Layout><ViewerDashboard /></Layout></ProtectedRoute>} />
      <Route path="/viewer/transactions" element={<ProtectedRoute allowedRoles={['viewer', 'admin']}><Layout><ViewerTransactions /></Layout></ProtectedRoute>} />
      <Route path="/viewer/create" element={<ProtectedRoute allowedRoles={['viewer', 'admin']}><Layout><CreateTransaction /></Layout></ProtectedRoute>} />

      
      <Route path="/analyst" element={<ProtectedRoute allowedRoles={['analyst', 'admin']}><Layout><AnalystDashboard /></Layout></ProtectedRoute>} />
      <Route path="/analyst/accounts" element={<ProtectedRoute allowedRoles={['analyst', 'admin']}><Layout><AnalystAccounts /></Layout></ProtectedRoute>} />

      
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AnalystDashboard /></Layout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminUsers /></Layout></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={['admin']}><Layout><AdminTransactions /></Layout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Toaster position="top-right" />
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;