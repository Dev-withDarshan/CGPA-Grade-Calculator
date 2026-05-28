import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser, isLoading } = useAuth();
  const token = localStorage.getItem('token');

  console.log('[ProtectedRoute]', { currentUser, isLoading, hasToken: !!token });

  // Still initializing session from localStorage token on first load
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-main)' }}>
        Loading session...
      </div>
    );
  }

  // No token in localStorage → definitely not authenticated
  // This check is synchronous and immune to React state batching delays.
  // The backend enforces real security on every API call via authMiddleware.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists — allow access. If the token is expired the backend will
  // return 401 on the first API call, which triggers logout in AuthContext.
  return children ? children : <Outlet />;
}
