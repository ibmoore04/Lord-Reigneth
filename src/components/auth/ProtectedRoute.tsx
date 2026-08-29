// ============================================================
// ProtectedRoute — redirects unauthenticated or unauthorised
// users. Frontend guard only; backend RLS enforces real access.
// ============================================================

import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { LoadingState } from '../ui/States';
import type { UserRole } from '../../types/database';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Minimum role required. Defaults to any authenticated user. */
  requiredRole?: UserRole;
  /** Where to redirect unauthenticated users. Defaults to /login */
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { loading, isAuthenticated, role } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Checking access…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  if (requiredRole) {
    const roleOrder: UserRole[] = ['customer', 'staff', 'admin'];
    const userLevel = roleOrder.indexOf(role);
    const requiredLevel = roleOrder.indexOf(requiredRole);

    if (userLevel < requiredLevel) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
