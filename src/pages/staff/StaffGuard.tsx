// ============================================================
// StaffGuard — protects all /staff routes.
// Checks: authenticated + role=staff|admin + is_active.
// Redirects appropriately. RLS is the real security boundary.
// ============================================================

import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { LoadingState } from '../../components/ui/States';

interface StaffGuardProps {
  children: ReactNode;
}

export function StaffGuard({ children }: StaffGuardProps) {
  const { loading, isAuthenticated, isStaff, role, profile, user } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState message="Checking access…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Force password reset if the flag is set on the user metadata
  const needsReset = user?.user_metadata?.needs_password_reset === true;
  if (needsReset) {
    return <Navigate to="/auth/reset-password" replace />;
  }

  // Admins → redirect to admin panel
  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  if (!isStaff) {
    return <Navigate to="/" replace />;
  }

  // Deactivated staff: show clear message
  if (profile && !profile.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-cream-200 p-8 text-center shadow-sm">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl" aria-hidden="true">⚠</span>
          </div>
          <h1 className="font-display font-bold text-xl text-charcoal-800 mb-2">
            Account Deactivated
          </h1>
          <p className="text-charcoal-500 text-sm leading-relaxed mb-6">
            Your staff account has been deactivated. Please contact your administrator
            to restore access.
          </p>
          <p className="text-xs text-charcoal-400">
            Lord Reigneth Foods — {SITE_CONFIG.contact.phone}
          </p>
        </div>
      </div>
    );
  }

  // Staff without an outlet: show clear message
  if (profile && !profile.location_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-cream-200 p-8 text-center shadow-sm">
          <div className="w-14 h-14 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gold-500 text-2xl" aria-hidden="true">📍</span>
          </div>
          <h1 className="font-display font-bold text-xl text-charcoal-800 mb-2">
            No Outlet Assigned
          </h1>
          <p className="text-charcoal-500 text-sm leading-relaxed mb-6">
            Your account has not been assigned to an outlet yet. Please contact your
            administrator to complete your setup.
          </p>
          <p className="text-xs text-charcoal-400">
            Lord Reigneth Foods — {SITE_CONFIG.contact.phone}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Import needs to be here to avoid circular deps
import { SITE_CONFIG } from '../../config/site';
