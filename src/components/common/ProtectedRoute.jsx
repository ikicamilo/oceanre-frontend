import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Restricts route access to authenticated users.
 * Redirects to /login if user is not authenticated.
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}