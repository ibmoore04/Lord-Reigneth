import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StaffLayout } from './StaffLayout';
import { useStaffOutlet, useOutletOrders } from '../../hooks/useStaff';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { updateOrderStatus } from '../../services/orderService';
import type { Order, OrderStatus } from '../../types/database';
import { ShoppingBag, Search, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

const STATUS_TABS: { value: OrderStatus | 'active' | 'all'; label: string }[] = [
  { value: 'active',          label: 'Active' },
  { value: 'all',             label: 'All Today' },
  { value: 'pending',         label: 'Pending' },
  { value: 'confirmed',       label: 'Confirmed' },
  { value: 'preparing',       label: 'Preparing' },
  { value: 'ready',           label: 'Ready' },
  { value: 'out_for_delivery',label: 'Delivery' },
  { value: 'completed',       label: 'Completed' },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:          'bg-yellow-100 text-yellow-800',
  confirmed:        'bg-blue-100 text-blue-800',
  preparing:        'bg-orange-100 text-orange-800',
  ready:            'bg-green-100 text-green-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  completed:        'bg-charcoal-100 text-charcoal-700',
  cancelled:        'bg-red-100 text-red-700',
};

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:          'confirmed',
  confirmed:        'preparing',
  preparing:        'ready',
  ready:            'completed',
  out_for_delivery: 'completed',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending:   'Accept',
  confirmed: 'Preparing',
  preparing: 'Ready',
  ready:     'Complete',
  out_for_delivery: 'Delivered',
};

export function StaffOrdersPage() {
  const { outlet } = useStaffOutlet();
  const { orders, loading, newOrderAlert, dismissAlert, refetch } = useOutletOrders(false);
  const [tab,    setTab]    = useState<typeof STATUS_TABS[number]['value']>('active');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    if (tab === 'active')
      return !['completed', 'cancelled'].includes(o.status);
    if (tab !== 'all')
      return o.status === tab;

    const q = search.toLowerCase();
    if (!q) return true;
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q)
    );
  }).filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.customer_phone.includes(q)
    );
  });

  async function advanceStatus(order: Order) {
    const next = NEXT[order.status];
    if (!next) return;
    setUpdatingId(order.id);
    try {
      await updateOrderStatus(order.id, next);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <StaffLayout outletName={outlet?.name}>
      {newOrderAlert && (
        <div className="mb-4 flex items-center justify-between gap-3 px-4 py-3 bg-primary-700 text-white rounded-2xl">
          <span className="font-semibold text-sm">🔔 New order received!</span>
          <button type="button" onClick={dismissAlert} className="text-white/70 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl text-charcoal-800">Orders</h1>
        <button type="button" onClick={refetch} aria-label="Refresh"
          className="p-2 rounded-xl hover:bg-charcoal-100 text-charcoal-500 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search order #, customer name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-charcoal-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
        {STATUS_TABS.map(({ value, label }) => (
          <button key={value} type="button" onClick={() => setTab(value)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              tab === value
                ? 'bg-primary-700 text-white'
                : 'bg-white border border-charcoal-200 text-charcoal-600 hover:border-primary-300',
            )}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading orders…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-10 h-10" />}
          title="No orders"
          description={search ? 'No orders match your search.' : 'No orders in this category.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const next = NEXT[order.status];
            const nextLabel = NEXT_LABEL[order.status];
            const isUpdating = updatingId === order.id;

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-charcoal-100 p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-primary-700 text-sm">{order.order_number}</span>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', STATUS_COLORS[order.status])}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <span className={cn(
                        'text-xs font-medium',
                        order.order_source === 'website' ? 'text-primary-600' : 'text-green-600',
                      )}>
                        {order.order_source === 'website' ? '🌐 Website' : '💬 WhatsApp'}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-400 mt-1">
                      {new Date(order.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}
                      {' · '}
                      <span className="capitalize">{order.order_type}</span>
                    </p>
                  </div>
                  <p className="font-bold text-charcoal-800">₦{order.total.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div>
                    <p className="text-xs text-charcoal-400">Customer</p>
                    <p className="font-medium text-charcoal-700 truncate">{order.customer_name}</p>
                    <p className="text-xs text-charcoal-500">{order.customer_phone}</p>
                  </div>
                  {order.delivery_address && (
                    <div>
                      <p className="text-xs text-charcoal-400">Delivery to</p>
                      <p className="text-xs text-charcoal-600 line-clamp-2">{order.delivery_address}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/staff/orders/${order.order_number}`}
                    className="flex-1 py-2.5 rounded-xl border border-charcoal-200 text-charcoal-700 text-sm font-medium text-center hover:bg-charcoal-50 transition-colors"
                  >
                    View Details
                  </Link>
                  {next && (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => advanceStatus(order)}
                      className="flex-1 py-2.5 rounded-xl bg-primary-700 text-white text-sm font-bold hover:bg-primary-800 disabled:opacity-60 transition-colors"
                    >
                      {isUpdating ? '…' : nextLabel}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StaffLayout>
  );
}
