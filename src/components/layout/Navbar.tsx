import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Menu, X, Phone, User, LogOut,
  LayoutDashboard, ChevronDown, ShoppingBag,
} from 'lucide-react';
import { SITE_CONFIG } from '../../config/site';
import { useAuthContext } from '../../context/AuthContext';
import { useCartStore } from '../../store/cartStore';
import { OrderChannelModal } from '../ordering/OrderChannelModal';
import { CartDrawer } from '../ordering/CartDrawer';
import { cn } from '../../lib/utils';

const NAV_LINKS = [
  { label: 'Home',      href: '/' },
  { label: 'Menu',      href: '/menu' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Locations', href: '/locations' },
  { label: 'Catering',  href: '/catering' },
  { label: 'Gallery',   href: '/gallery' },
  { label: 'Contact',   href: '/contact' },
];

export function Navbar() {
  const [isScrolled,   setIsScrolled]   = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [orderModal,   setOrderModal]   = useState(false);

  const { pathname } = useLocation();
  const { isAuthenticated, isAdmin, isStaff, profile, signOut } = useAuthContext();
  const { itemCount, openCart } = useCartStore();

  const menuRef            = useRef<HTMLDivElement>(null);
  const toggleRef          = useRef<HTMLButtonElement>(null);
  const userMenuRefDesktop = useRef<HTMLDivElement>(null);
  const userMenuRefMobile  = useRef<HTMLDivElement>(null);

  // Scroll
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setOrderModal(false);
  }, [pathname]);

  // Close hamburger drawer on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        !toggleRef.current?.contains(e.target as Node)
      ) setMobileOpen(false);
    }
    if (mobileOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen]);

  // Close user dropdown on outside click (both desktop + mobile)
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      const inDesktop = userMenuRefDesktop.current?.contains(target);
      const inMobile = userMenuRefMobile.current?.contains(target);
      if (!inDesktop && !inMobile) setUserMenuOpen(false);
    }
    if (userMenuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenuOpen]);

  // Trap focus in mobile drawer
  useEffect(() => {
    if (mobileOpen) menuRef.current?.querySelector<HTMLElement>('a, button')?.focus();
  }, [mobileOpen]);

  const isHomePage       = pathname === '/';
  const navIsTransparent = isHomePage && !isScrolled;
  const displayName      = profile?.full_name?.split(' ')[0] ?? profile?.email?.split('@')[0] ?? 'Account';
  const cartCount        = itemCount();

  async function handleSignOut() {
    console.log('Nav: Sign Out clicked');
    setUserMenuOpen(false);
    await signOut();
  }

  // Shared desktop nav link class
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
      navIsTransparent
        ? isActive ? 'text-gold-300 font-semibold' : 'text-white/90 hover:text-white hover:bg-white/10'
        : isActive ? 'text-primary-700 font-semibold bg-primary-50' : 'text-charcoal-600 hover:text-primary-700 hover:bg-primary-50',
    );

  // Note: Dropdown content is inlined where it's rendered so it captures
  // the latest `userMenuOpen` / `setUserMenuOpen` closures correctly.

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          navIsTransparent
            ? 'bg-transparent'
            : 'bg-white/95 backdrop-blur-sm shadow-[0_2px_24px_-4px_rgba(0,0,0,0.1)]',
        )}
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-20 flex items-center justify-between"
          aria-label="Main navigation"
        >
          {/* ── Logo ── */}
          <Link
            to="/"
            className="flex items-center gap-2 focus-visible:outline-none shrink-0"
            aria-label="Lord Reigneth Foods — Home"
          >
            <div className="flex flex-col leading-none">
              <span className={cn(
                'font-display font-bold text-xl lg:text-2xl tracking-tight transition-colors duration-300',
                navIsTransparent ? 'text-white' : 'text-primary-700',
              )}>
                Lord Reigneth
              </span>
              <span className={cn(
                'text-xs font-semibold tracking-widest uppercase transition-colors duration-300',
                navIsTransparent ? 'text-gold-300' : 'text-gold-500',
              )}>
                Foods
              </span>
            </div>
          </Link>

          {/* ── Desktop nav links ── */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} to={link.href} end={link.href === '/'} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* ── Desktop right side ── */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Phone */}
            <a
              href={`tel:${SITE_CONFIG.contact.phoneRaw}`}
              aria-label={`Call us at ${SITE_CONFIG.contact.phone}`}
              className={cn(
                'flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 mr-1',
                navIsTransparent ? 'text-white/80 hover:text-white' : 'text-charcoal-600 hover:text-primary-700',
              )}
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span className="hidden xl:inline">{SITE_CONFIG.contact.phone}</span>
            </a>

            {/* Auth */}
              {isAuthenticated ? (
              <div className="relative" ref={userMenuRefDesktop}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    navIsTransparent ? 'text-white/90 hover:bg-white/10' : 'text-charcoal-700 hover:bg-charcoal-100',
                  )}
                >
                  <span className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {displayName[0]?.toUpperCase()}
                  </span>
                  <span className="max-w-[96px] truncate">{displayName}</span>
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', userMenuOpen && 'rotate-180')} aria-hidden="true" />
                </button>
                {userMenuOpen && (
                  <div
                    className={cn(
                      'absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-cream-200 py-1.5 z-50',
                    )}
                  >
                    <div className="px-4 py-2.5 border-b border-cream-100 mb-1">
                      <p className="text-xs font-semibold text-charcoal-800 truncate">
                        {profile?.full_name ?? 'My Account'}
                      </p>
                      <p className="text-xs text-charcoal-400 truncate">{profile?.email}</p>
                    </div>

                    {(isAdmin || isStaff) && (
                      <Link
                        to={isAdmin ? '/admin' : '/staff'}
                        onClick={() => { console.log('Nav: Dashboard clicked'); setUserMenuOpen(false); }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden="true" />
                        {isAdmin ? 'Admin Dashboard' : 'Staff Dashboard'}
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      onClick={() => { console.log('Nav: My Orders clicked'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
                      My Orders
                    </Link>

                    <Link
                      to="/account"
                      onClick={() => { console.log('Nav: My Account clicked'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      <User className="w-4 h-4 shrink-0" aria-hidden="true" />
                      My Account
                    </Link>

                    <div className="border-t border-cream-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className={cn(
                  'px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  navIsTransparent ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-primary-700 hover:bg-primary-50',
                )}>
                  Sign In
                </Link>
                <Link to="/register" className={cn(
                  'px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                  navIsTransparent
                    ? 'bg-white/15 text-white border border-white/30 hover:bg-white/25 focus-visible:ring-white'
                    : 'bg-charcoal-800 text-white hover:bg-charcoal-700 focus-visible:ring-charcoal-500',
                )}>
                  Register
                </Link>
              </div>
            )}

            {/* Cart badge */}
            {cartCount > 0 && (
              <button
                type="button"
                onClick={openCart}
                aria-label={`Open cart — ${cartCount} item${cartCount !== 1 ? 's' : ''}`}
                className={cn(
                  'relative p-2 rounded-md transition-colors',
                  navIsTransparent ? 'text-white hover:bg-white/10' : 'text-charcoal-700 hover:bg-charcoal-100',
                )}
              >
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            )}

            {/* Order Now */}
            <button
              type="button"
              onClick={() => setOrderModal(true)}
              className={cn(
                'px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                navIsTransparent
                  ? 'bg-gold-500 text-white hover:bg-gold-400 focus-visible:ring-gold-400'
                  : 'bg-primary-700 text-white hover:bg-primary-800 focus-visible:ring-primary-500',
              )}
            >
              Order Now
            </button>
          </div>

          {/* ── Mobile icon row ── */}
          <div className="lg:hidden flex items-center gap-1">

            {/* Cart badge */}
            {cartCount > 0 && (
              <button
                type="button"
                onClick={openCart}
                aria-label={`Cart — ${cartCount} items`}
                className={cn(
                  'relative p-2 rounded-md transition-colors',
                  navIsTransparent ? 'text-white hover:bg-white/10' : 'text-charcoal-700 hover:bg-charcoal-100',
                )}
              >
                <ShoppingBag className="w-5 h-5" aria-hidden="true" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gold-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            )}

            {/* Profile icon — tapping opens dropdown (authenticated) or goes to /login (guest) */}
              {isAuthenticated ? (
              <div className="relative" ref={userMenuRefMobile}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                  aria-label="Account menu"
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    navIsTransparent ? 'text-white hover:bg-white/10' : 'text-charcoal-700 hover:bg-charcoal-100',
                  )}
                >
                  <span className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold">
                    {displayName[0]?.toUpperCase()}
                  </span>
                </button>
                {/* Dropdown appears below the icon */}
                {userMenuOpen && (
                  <div
                    className={cn(
                      'absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-cream-200 py-1.5 z-50',
                    )}
                  >
                    <div className="px-4 py-2.5 border-b border-cream-100 mb-1">
                      <p className="text-xs font-semibold text-charcoal-800 truncate">
                        {profile?.full_name ?? 'My Account'}
                      </p>
                      <p className="text-xs text-charcoal-400 truncate">{profile?.email}</p>
                    </div>

                    {(isAdmin || isStaff) && (
                      <Link
                        to={isAdmin ? '/admin' : '/staff'}
                        onClick={() => { console.log('Nav: Dashboard clicked'); setUserMenuOpen(false); }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 shrink-0" aria-hidden="true" />
                        {isAdmin ? 'Admin Dashboard' : 'Staff Dashboard'}
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      onClick={() => { console.log('Nav: My Orders clicked'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
                      My Orders
                    </Link>

                    <Link
                      to="/account"
                      onClick={() => { console.log('Nav: My Account clicked'); setUserMenuOpen(false); }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      <User className="w-4 h-4 shrink-0" aria-hidden="true" />
                      My Account
                    </Link>

                    <div className="border-t border-cream-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                aria-label="Sign in"
                className={cn(
                  'p-2 rounded-md transition-colors',
                  navIsTransparent ? 'text-white hover:bg-white/10' : 'text-charcoal-700 hover:bg-charcoal-100',
                )}
              >
                <User className="w-5 h-5" aria-hidden="true" />
              </Link>
            )}

            {/* Hamburger */}
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                'p-2 rounded-md transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                navIsTransparent ? 'text-white hover:bg-white/10' : 'text-charcoal-700 hover:bg-charcoal-100',
              )}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* ── Mobile Drawer — nav links only ── */}
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={cn(
            'lg:hidden fixed inset-x-0 top-16 bg-white shadow-2xl border-t border-cream-200',
            'transform transition-all duration-300 ease-in-out',
            mobileOpen
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 -translate-y-4 pointer-events-none',
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            {/* Navigation links */}
            <nav aria-label="Mobile navigation" className="space-y-0.5">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === '/'}
                  className={({ isActive }) => cn(
                    'flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    isActive
                      ? 'text-primary-700 bg-primary-50 font-semibold'
                      : 'text-charcoal-700 hover:text-primary-700 hover:bg-primary-50',
                  )}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Divider + bottom actions */}
            <div className="mt-4 pt-4 border-t border-cream-200 space-y-2">
              {/* Phone */}
              <a
                href={`tel:${SITE_CONFIG.contact.phoneRaw}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-charcoal-700 font-medium hover:bg-charcoal-50 transition-colors"
              >
                <Phone className="w-5 h-5 text-primary-600 shrink-0" aria-hidden="true" />
                {SITE_CONFIG.contact.phone}
              </a>

              {/* Order Now */}
              <button
                type="button"
                onClick={() => { setMobileOpen(false); setOrderModal(true); }}
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl text-sm font-semibold bg-primary-700 text-white hover:bg-primary-800 transition-colors"
              >
                Order Now
              </button>

              {/* Guest sign-in shortcut */}
              {!isAuthenticated && (
                <div className="flex gap-2 pt-1">
                  <Link
                    to="/login"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary-300 text-primary-700 text-sm font-semibold hover:bg-primary-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-charcoal-800 text-white text-sm font-semibold hover:bg-charcoal-700 transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Order channel modal */}
      {orderModal && <OrderChannelModal onClose={() => setOrderModal(false)} />}

      {/* Global cart drawer */}
      <CartDrawer />
    </>
  );
}
