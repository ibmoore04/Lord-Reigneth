import { type ReactNode, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, MessageCircle,
  UtensilsCrossed, Bell, User, LogOut, Menu, X, ChefHat,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV = [
  { label: 'Dashboard',    href: '/staff',               icon: LayoutDashboard, exact: true },
  { label: 'Orders',       href: '/staff/orders',         icon: ShoppingBag },
  { label: 'WhatsApp Orders', href: '/staff/whatsapp-order', icon: MessageCircle },
  { label: 'Menu',         href: '/staff/menu',           icon: UtensilsCrossed },
  { label: 'Notifications', href: '/staff/notifications', icon: Bell },
  { label: 'My Profile',   href: '/staff/profile',        icon: User },
];

interface StaffLayoutProps {
  children: ReactNode;
  /** Pass the outlet name to display in the header badge. */
  outletName?: string | null;
}

export function StaffLayout({ children, outletName }: StaffLayoutProps) {
  const { signOut, profile } = useAuthContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const displayName = profile?.full_name?.split(' ')[0] ?? 'Staff';

  const Sidebar = (
    <nav className="flex flex-col h-full" aria-label="Staff navigation">
      {/* Brand + outlet badge */}
      <div className="px-5 py-5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <ChefHat className="w-5 h-5 text-gold-400 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-display font-bold text-white text-sm leading-tight truncate">
              Lord Reigneth Foods
            </p>
            <p className="text-gold-400 text-[10px] font-semibold tracking-widest uppercase">
              Staff Dashboard
            </p>
          </div>
        </div>
        {outletName && (
          <div className="mt-2 px-2.5 py-1 rounded-full bg-white/15 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" aria-hidden="true" />
            <span className="text-white text-xs font-semibold truncate">{outletName}</span>
          </div>
        )}
      </div>

      {/* Links */}
      <ul className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon, exact }) => (
          <li key={href}>
            <NavLink
              to={href}
              end={exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Back to Website */}
      <div className="px-2 pt-2 pb-4 border-t border-white/10">
        <Link
          to="/"
          aria-label="Back to Website"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
            'text-white/60 hover:bg-white/10 hover:text-gold-300',
          )}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          Back to Website
        </Link>
      </div>

      {/* User */}
      <div className="px-2 pb-4 border-t border-white/10 pt-3 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 mb-1">
          <span className="w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
            {displayName[0]?.toUpperCase()}
          </span>
          <p className="text-white/60 text-xs truncate">{profile?.email}</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors duration-150"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="h-screen overflow-hidden flex bg-charcoal-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-56 xl:w-64 shrink-0 bg-primary-900 flex-col h-full">
        {Sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-charcoal-900/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-primary-900 flex flex-col h-full">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {Sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden shrink-0 bg-white border-b border-charcoal-100 px-4 h-14 flex items-center gap-3 z-40">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
            className="p-1.5 rounded-md text-charcoal-600 hover:bg-charcoal-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="font-display font-bold text-primary-700 text-sm">Staff Dashboard</span>
            {outletName && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold">
                {outletName}
              </span>
            )}
          </div>
          <span className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
            {displayName[0]?.toUpperCase()}
          </span>
        </header>

        {/* Scrollable content */}
        <main id="staff-main" className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
