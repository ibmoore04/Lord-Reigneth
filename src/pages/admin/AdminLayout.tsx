import { type ReactNode, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, CalendarHeart,
  MessageSquare, Images, Star, MapPin, Settings, LogOut, Menu, X, ChefHat,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV = [
  { label: 'Dashboard',    href: '/admin',               icon: LayoutDashboard, exact: true },
  { label: 'Orders',       href: '/admin/orders',         icon: ShoppingBag },
  { label: 'Menu',         href: '/admin/menu',           icon: UtensilsCrossed },
  { label: 'Staff',        href: '/admin/staff',          icon: Users },
  { label: 'Customers',    href: '/admin/customers',      icon: Users },
  { label: 'Catering',     href: '/admin/catering',       icon: CalendarHeart },
  { label: 'Messages',     href: '/admin/messages',       icon: MessageSquare },
  { label: 'Gallery',      href: '/admin/gallery',        icon: Images },
  { label: 'Testimonials', href: '/admin/testimonials',   icon: Star },
  { label: 'Locations',    href: '/admin/locations',      icon: MapPin },
  { label: 'Settings',     href: '/admin/settings',       icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { signOut, profile } = useAuthContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const Sidebar = (
    <nav className="flex flex-col h-full" aria-label="Admin navigation">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-gold-400" aria-hidden="true" />
          <div>
            <p className="font-display font-bold text-white text-sm leading-tight">Lord Reigneth</p>
            <p className="text-gold-400 text-xs font-semibold tracking-widest uppercase">Admin</p>
          </div>
        </div>
      </div>

      {/* Links */}
      <ul className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon, exact }) => (
          <li key={href}>
            <NavLink
              to={href}
              end={exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
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
      <div className="px-3 pt-2 pb-4 border-t border-white/10">
        <Link
          to="/"
          aria-label="Back to Website"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
            'text-white/60 hover:bg-white/10 hover:text-gold-300',
          )}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
          Back to Website
        </Link>
      </div>

      {/* User + sign out */}
      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <p className="px-3 text-xs text-white/40 mb-2 truncate">{profile?.email}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors duration-150"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          Sign Out
        </button>
      </div>
    </nav>
  );

  return (
    // h-screen + overflow-hidden on the shell locks the layout to the viewport.
    // The sidebar stays fixed; only the main content column scrolls.
    <div className="h-screen overflow-hidden flex bg-charcoal-50">

      {/* Desktop sidebar — full height, never scrolls with content */}
      <aside className="hidden lg:flex lg:w-56 xl:w-64 shrink-0 bg-primary-900 flex-col h-full">
        {Sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-charcoal-900/50" onClick={() => setSidebarOpen(false)} />
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

      {/* Main column — this is the only thing that scrolls */}
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
          <span className="font-display font-bold text-primary-700 text-sm">Lord Reigneth Admin</span>
        </header>

        {/* Scrollable content area */}
        <main id="admin-main" className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
