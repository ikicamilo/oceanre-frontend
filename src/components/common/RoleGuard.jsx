import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

/**
 * Role-based visibility guard.
 * Props:
 * - roles: array of allowed roles (e.g., ['ADMIN', 'ACCOUNTANT'])
 * - children: content to render if user has access
 */
export default function RoleGuard({ roles = [], children }) {
  const { user } = useContext(AuthContext);

  if (!user) return null;
  if (roles.includes(user.role)) return children;

  return null; // or show fallback message/component if desired
}