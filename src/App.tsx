import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { RouteScrollReset } from './components/layout/RouteScrollReset';
import { WhatsAppButton } from './components/ui/WhatsAppButton';
import { LoadingState } from './components/ui/States';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { StaffGuard } from './pages/staff/StaffGuard';

// ── Public pages ──────────────────────────────────────────
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const MenuPage = lazy(() => import('./pages/MenuPage').then((m) => ({ default: m.MenuPage })));
const OurStoryPage = lazy(() => import('./pages/OurStoryPage').then((m) => ({ default: m.OurStoryPage })));
const LocationsPage = lazy(() => import('./pages/LocationsPage').then((m) => ({ default: m.LocationsPage })));
const CateringPage = lazy(() => import('./pages/CateringPage').then((m) => ({ default: m.CateringPage })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then((m) => ({ default: m.GalleryPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// ── Auth pages ────────────────────────────────────────────
const LoginPage = lazy(() => import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));

// ── Account pages ─────────────────────────────────────────
const AccountPage = lazy(() => import('./pages/AccountPage').then((m) => ({ default: m.AccountPage })));
const OrdersPage  = lazy(() => import('./pages/OrdersPage').then((m) => ({ default: m.OrdersPage })));

// ── Ordering pages ────────────────────────────────────────
const OrderPage         = lazy(() => import('./pages/OrderPage').then((m) => ({ default: m.OrderPage })));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage').then((m) => ({ default: m.OrderTrackingPage })));

// ── Admin pages ───────────────────────────────────────────
const AdminDashboardPage    = lazy(() => import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminOrdersPage       = lazy(() => import('./pages/admin/AdminOrdersPage').then((m) => ({ default: m.AdminOrdersPage })));
const AdminMenuPage         = lazy(() => import('./pages/admin/AdminMenuPage').then((m) => ({ default: m.AdminMenuPage })));
const AdminCateringPage     = lazy(() => import('./pages/admin/AdminCateringPage').then((m) => ({ default: m.AdminCateringPage })));
const AdminCustomersPage    = lazy(() => import('./pages/admin/AdminCustomersPage').then((m) => ({ default: m.AdminCustomersPage })));
const AdminMessagesPage     = lazy(() => import('./pages/admin/AdminMessagesPage').then((m) => ({ default: m.AdminMessagesPage })));
const AdminGalleryPage      = lazy(() => import('./pages/admin/AdminGalleryPage').then((m) => ({ default: m.AdminGalleryPage })));
const AdminTestimonialsPage = lazy(() => import('./pages/admin/AdminTestimonialsPage').then((m) => ({ default: m.AdminTestimonialsPage })));
const AdminLocationsPage    = lazy(() => import('./pages/admin/AdminLocationsPage').then((m) => ({ default: m.AdminLocationsPage })));
const AdminSettingsPage     = lazy(() => import('./pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })));
const AdminStaffPage        = lazy(() => import('./pages/admin/AdminStaffPage').then((m) => ({ default: m.AdminStaffPage })));
const AdminOrderDetailPage  = lazy(() => import('./pages/admin/AdminOrderDetailPage').then((m) => ({ default: m.AdminOrderDetailPage })));

// ── Staff pages ───────────────────────────────────────────
const StaffDashboardPage      = lazy(() => import('./pages/staff/StaffDashboardPage').then((m) => ({ default: m.StaffDashboardPage })));
const StaffOrdersPage         = lazy(() => import('./pages/staff/StaffOrdersPage').then((m) => ({ default: m.StaffOrdersPage })));
const StaffOrderDetailPage    = lazy(() => import('./pages/staff/StaffOrderDetailPage').then((m) => ({ default: m.StaffOrderDetailPage })));
const StaffWhatsAppOrderPage  = lazy(() => import('./pages/staff/StaffWhatsAppOrderPage').then((m) => ({ default: m.StaffWhatsAppOrderPage })));
const StaffMenuPage           = lazy(() => import('./pages/staff/StaffMenuPage').then((m) => ({ default: m.StaffMenuPage })));
const StaffProfilePage        = lazy(() => import('./pages/staff/StaffProfilePage').then((m) => ({ default: m.StaffProfilePage })));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message="Loading…" />
    </div>
  );
}

// Layout wrapper for public pages (with Navbar + Footer)
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton variant="floating" />
      <ScrollToTop />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-700 focus:text-white focus:rounded-md focus:font-medium"
      >
        Skip to main content
      </a>

      <Suspense fallback={<PageLoader />}>
        <RouteScrollReset />
        <Routes>
          {/* ── Public routes ── */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/menu" element={<PublicLayout><MenuPage /></PublicLayout>} />
          <Route path="/our-story" element={<PublicLayout><OurStoryPage /></PublicLayout>} />
          <Route path="/locations" element={<PublicLayout><LocationsPage /></PublicLayout>} />
          <Route path="/catering" element={<PublicLayout><CateringPage /></PublicLayout>} />
          <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />

          {/* ── Auth routes ── */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ── Account routes (any authenticated user) ── */}
          <Route path="/account" element={<PublicLayout><AccountPage /></PublicLayout>} />
          <Route path="/orders"  element={<PublicLayout><OrdersPage /></PublicLayout>} />

          {/* ── Ordering routes (public) ── */}
          <Route path="/order"          element={<PublicLayout><OrderPage /></PublicLayout>} />
          <Route path="/track"          element={<PublicLayout><OrderTrackingPage /></PublicLayout>} />
          <Route path="/track/:orderNumber" element={<PublicLayout><OrderTrackingPage /></PublicLayout>} />

          {/* ── Admin routes ── */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/orders"       element={<ProtectedRoute requiredRole="staff"><AdminOrdersPage /></ProtectedRoute>} />
          <Route path="/admin/menu"         element={<ProtectedRoute requiredRole="staff"><AdminMenuPage /></ProtectedRoute>} />
          <Route path="/admin/catering"     element={<ProtectedRoute requiredRole="staff"><AdminCateringPage /></ProtectedRoute>} />
          <Route path="/admin/customers"    element={<ProtectedRoute requiredRole="admin"><AdminCustomersPage /></ProtectedRoute>} />
          <Route path="/admin/messages"     element={<ProtectedRoute requiredRole="staff"><AdminMessagesPage /></ProtectedRoute>} />
          <Route path="/admin/gallery"      element={<ProtectedRoute requiredRole="staff"><AdminGalleryPage /></ProtectedRoute>} />
          <Route path="/admin/testimonials" element={<ProtectedRoute requiredRole="admin"><AdminTestimonialsPage /></ProtectedRoute>} />
          <Route path="/admin/locations"    element={<ProtectedRoute requiredRole="admin"><AdminLocationsPage /></ProtectedRoute>} />
          <Route path="/admin/settings"     element={<ProtectedRoute requiredRole="admin"><AdminSettingsPage /></ProtectedRoute>} />
          <Route path="/admin/staff"        element={<ProtectedRoute requiredRole="admin"><AdminStaffPage /></ProtectedRoute>} />
          <Route path="/admin/orders/:orderNumber" element={<ProtectedRoute requiredRole="staff"><AdminOrderDetailPage /></ProtectedRoute>} />

          {/* ── Staff routes ── */}
          <Route path="/staff" element={<StaffGuard><StaffDashboardPage /></StaffGuard>} />
          <Route path="/staff/orders" element={<StaffGuard><StaffOrdersPage /></StaffGuard>} />
          <Route path="/staff/orders/:orderNumber" element={<StaffGuard><StaffOrderDetailPage /></StaffGuard>} />
          <Route path="/staff/whatsapp-order" element={<StaffGuard><StaffWhatsAppOrderPage /></StaffGuard>} />
          <Route path="/staff/menu" element={<StaffGuard><StaffMenuPage /></StaffGuard>} />
          <Route path="/staff/profile" element={<StaffGuard><StaffProfilePage /></StaffGuard>} />

          {/* ── 404 ── */}
          <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
