import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'analyst') return <Navigate to="/analyst" replace />;
    return <Navigate to="/viewer" replace />;
  }

  return children;
};

export default ProtectedRoute;
