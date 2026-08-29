import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useStaffOutlet, useOutletStats, useOutletOrders } from '../../hooks/useStaff';
import { StaffLayout } from './StaffLayout';
import { LoadingState } from '../../components/ui/States';
import { ShoppingBag, Clock, ChefHat, PackageCheck, Truck, CheckCircle, Bell, ArrowRight } from 'lucide-react';
import { updateOrderStatus } from '../../services/orderService';
import type { Order, OrderStatus } from '../../types/database';
import { cn } from '../../lib/utils';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:          'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed:        'bg-blue-100 text-blue-800 border-blue-200',
  preparing:        'bg-orange-100 text-orange-800 border-orange-200',
  ready:            'bg-green-100 text-green-800 border-green-200',
  out_for_delivery: 'bg-purple-100 text-purple-800 border-purple-200',
  completed:        'bg-charcoal-100 text-charcoal-700 border-charcoal-200',
  cancelled:        'bg-red-100 text-red-700 border-red-200',
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:          'confirmed',
  confirmed:        'preparing',
  preparing:        'ready',
  ready:            'completed',
  out_for_delivery: 'completed',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending:   'Accept',
  confirmed: 'Start Preparing',
  preparing: 'Mark Ready',
  ready:     'Complete',
  out_for_delivery: 'Delivered',
};

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-charcoal-100">
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-3', color)}>
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>
      <p className="text-3xl font-bold text-charcoal-800">{value}</p>
      <p className="text-sm text-charcoal-500 mt-0.5">{label}</p>
    </div>
  );
}

function OrderCard({ order, onStatusUpdate }: {
  order: Order;
  onStatusUpdate: (id: string, status: OrderStatus) => void;
}) {
  const next = NEXT_STATUS[order.status];
  const nextLabel = NEXT_LABEL[order.status];

  async function handleAdvance() {
    if (!next) return;
    try {
      await updateOrderStatus(order.id, next);
      onStatusUpdate(order.id, next);
    } catch (err) {
      console.error('Status update failed:', err);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-charcoal-100 p-5 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-mono font-bold text-primary-700 text-sm">{order.order_number}</p>
          <p className="text-xs text-charcoal-400 mt-0.5">
            {new Date(order.created_at).toLocaleTimeString('en-NG', {
              hour: '2-digit', minute: '2-digit',
            })}
            {' · '}
            <span className="capitalize">{order.order_type}</span>
            {' · '}
            <span className={cn(
              'inline-flex items-center gap-1',
              order.order_source === 'website' ? 'text-primary-600' : 'text-green-600',
            )}>
              {order.order_source === 'website' ? '🌐 Website' : '💬 WhatsApp'}
            </span>
          </p>
        </div>
        <span className={cn(
          'px-2.5 py-1 rounded-full text-xs font-semibold capitalize border',
          STATUS_COLORS[order.status],
        )}>
          {order.status.replace('_', ' ')}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-charcoal-800 text-sm">{order.customer_name}</p>
          <p className="text-xs text-charcoal-500">{order.customer_phone}</p>
          {order.delivery_address && (
            <p className="text-xs text-charcoal-400 mt-0.5 truncate max-w-[200px]">
              📍 {order.delivery_address}
            </p>
          )}
        </div>
        <p className="font-bold text-charcoal-800">₦{order.total.toLocaleString()}</p>
      </div>

      {next && (
        <button
          type="button"
          onClick={handleAdvance}
          className={cn(
            'w-full py-3 rounded-xl text-sm font-bold transition-colors',
            order.status === 'pending'
              ? 'bg-primary-700 text-white hover:bg-primary-800'
              : 'bg-charcoal-800 text-white hover:bg-charcoal-700',
          )}
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}

export function StaffDashboardPage() {
  const { profile } = useAuthContext();
  const { outlet, loading: outletLoading } = useStaffOutlet();
  const { stats, loading: statsLoading } = useOutletStats();
  const {
    orders,
    loading: ordersLoading,
    newOrderAlert,
    dismissAlert,
  } = useOutletOrders(true);

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Staff';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  function handleStatusUpdate(id: string, status: OrderStatus) {
    // Optimistic update handled by the realtime subscription in the hook
    // but we also update locally for instant feedback
    void status; void id;
  }

  const activeOrders = orders.filter((o) =>
    !['completed', 'cancelled'].includes(o.status),
  );

  if (outletLoading) return <LoadingState message="Loading dashboard…" />;

  return (
    <StaffLayout outletName={outlet?.name}>
      {/* New order alert */}
      {newOrderAlert && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 bg-primary-700 text-white rounded-2xl shadow-lg">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 animate-pulse" aria-hidden="true" />
            <span className="font-semibold text-sm">New order received!</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/staff/orders" className="text-gold-300 text-xs font-semibold hover:text-gold-200 transition-colors">
              View Orders
            </Link>
            <button type="button" onClick={dismissAlert} className="text-white/60 hover:text-white text-xs">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Greeting */}
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-charcoal-800">
          {greeting}, {firstName} 👋
        </h1>
        {outlet && (
          <p className="text-charcoal-500 text-sm mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" aria-hidden="true" />
            {outlet.name}
            {outlet.address && ` — ${outlet.address}`}
          </p>
        )}
      </div>

      {/* Stats */}
      {statsLoading ? (
        <LoadingState message="Loading stats…" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          <StatCard icon={ShoppingBag}   label="New Orders"  value={stats.pending}   color="bg-yellow-50 text-yellow-600" />
          <StatCard icon={ChefHat}       label="Preparing"   value={stats.preparing} color="bg-orange-50 text-orange-600" />
          <StatCard icon={PackageCheck}  label="Ready"       value={stats.ready}     color="bg-green-50 text-green-600" />
          <StatCard icon={Truck}         label="Delivery"    value={stats.delivery}  color="bg-purple-50 text-purple-600" />
          <StatCard icon={CheckCircle}   label="Completed Today" value={stats.completed} color="bg-charcoal-50 text-charcoal-500" />
          <StatCard icon={Clock}         label="Total Today" value={stats.total}     color="bg-primary-50 text-primary-700" />
        </div>
      )}

      {/* Active orders */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-charcoal-800">Active Orders</h2>
        <Link
          to="/staff/orders"
          className="flex items-center gap-1 text-primary-700 text-sm font-semibold hover:text-primary-800 transition-colors"
        >
          View all <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      {ordersLoading ? (
        <LoadingState message="Loading orders…" />
      ) : activeOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal-100 p-10 text-center">
          <CheckCircle className="w-12 h-12 text-charcoal-200 mx-auto mb-3" aria-hidden="true" />
          <p className="font-semibold text-charcoal-600">All clear!</p>
          <p className="text-sm text-charcoal-400 mt-1">No active orders right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeOrders.slice(0, 6).map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </StaffLayout>
  );
}
