import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, TrendingUp, Clock, CheckCircle, CalendarHeart, MessageSquare, Users, ArrowRight } from 'lucide-react';
import type { DashboardStats } from '../../services/adminService';
import { getDashboardStats } from '../../services/adminService';
import { LoadingState } from '../../components/ui/States';
import { AdminLayout } from './AdminLayout';

function StatCard({ icon: Icon, label, value, sub, href, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
  color: string;
}) {
  const inner = (
    <div className={`bg-white rounded-xl p-5 border border-charcoal-100 hover:shadow-md transition-shadow duration-200 ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
        {href && <ArrowRight className="w-4 h-4 text-charcoal-300" aria-hidden="true" />}
      </div>
      <p className="text-2xl font-bold text-charcoal-800 mb-0.5">{value}</p>
      <p className="text-sm font-medium text-charcoal-600">{label}</p>
      {sub && <p className="text-xs text-charcoal-400 mt-0.5">{sub}</p>}
    </div>
  );

  return href ? <Link to={href}>{inner}</Link> : inner;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-charcoal-800">Dashboard</h1>
        <p className="text-charcoal-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading stats…" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={ShoppingBag} label="Today's Orders"
            value={stats?.todayOrders ?? 0}
            color="bg-primary-50 text-primary-700"
            href="/admin/orders"
          />
          <StatCard
            icon={TrendingUp} label="Today's Revenue"
            value={`₦${(stats?.todayRevenue ?? 0).toLocaleString()}`}
            color="bg-gold-50 text-gold-600"
          />
          <StatCard
            icon={Clock} label="Pending Orders"
            value={stats?.pendingOrders ?? 0}
            color="bg-orange-50 text-orange-600"
            href="/admin/orders"
          />
          <StatCard
            icon={CheckCircle} label="Completed"
            value={stats?.completedOrders ?? 0}
            color="bg-green-50 text-green-600"
          />
          <StatCard
            icon={CalendarHeart} label="New Catering Requests"
            value={stats?.newCateringRequests ?? 0}
            color="bg-purple-50 text-purple-600"
            href="/admin/catering"
          />
          <StatCard
            icon={MessageSquare} label="Unread Messages"
            value={stats?.unreadMessages ?? 0}
            color="bg-blue-50 text-blue-600"
            href="/admin/messages"
          />
          <StatCard
            icon={Users} label="Total Customers"
            value={stats?.totalCustomers ?? 0}
            color="bg-charcoal-50 text-charcoal-600"
            href="/admin/customers"
          />
        </div>
      )}

      {/* Quick links */}
      <div className="mt-10">
        <h2 className="font-semibold text-charcoal-700 text-sm uppercase tracking-widest mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Manage Menu',    href: '/admin/menu' },
            { label: 'View Orders',    href: '/admin/orders' },
            { label: 'Catering',       href: '/admin/catering' },
            { label: 'Upload Gallery', href: '/admin/gallery' },
            { label: 'Settings',       href: '/admin/settings' },
          ].map(({ label, href }) => (
            <Link key={href} to={href}
              className="block px-4 py-3 bg-white rounded-xl text-sm font-medium text-primary-700 border border-cream-200 hover:border-primary-300 hover:shadow-sm transition-all duration-200 text-center">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
