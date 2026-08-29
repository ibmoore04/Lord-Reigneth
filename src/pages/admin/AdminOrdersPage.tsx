import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useAdminOrders } from '../../hooks/useOrders';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { cn } from '../../lib/utils';
import type { OrderStatus } from '../../types/database';
import { ShoppingBag, RefreshCw } from 'lucide-react';

const STATUS_TABS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all',           label: 'All' },
  { value: 'pending',       label: 'Pending' },
  { value: 'confirmed',     label: 'Confirmed' },
  { value: 'preparing',     label: 'Preparing' },
  { value: 'ready',         label: 'Ready' },
  { value: 'completed',     label: 'Completed' },
  { value: 'cancelled',     label: 'Cancelled' },
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

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:          'confirmed',
  confirmed:        'preparing',
  preparing:        'ready',
  ready:            'completed',
  out_for_delivery: 'completed',
};

export function AdminOrdersPage() {
  const [tab, setTab] = useState<OrderStatus | 'all'>('all');
  const { orders, loading, updateStatus, refetch } = useAdminOrders(
    tab === 'all' ? undefined : tab,
  );

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-charcoal-800">Orders</h1>
        <button type="button" onClick={refetch} aria-label="Refresh orders"
          className="p-2 rounded-md hover:bg-charcoal-100 text-charcoal-500 hover:text-charcoal-700">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {STATUS_TABS.map(({ value, label }) => (
          <button key={value} type="button" onClick={() => setTab(value)}
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              tab === value ? 'bg-primary-700 text-white' : 'bg-white border border-charcoal-200 text-charcoal-600 hover:border-primary-300',
            )}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading orders…" />
      ) : orders.length === 0 ? (
        <EmptyState icon={<ShoppingBag className="w-10 h-10" />} title="No orders" description="No orders match the selected filter." />
      ) : (
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-charcoal-50 border-b border-charcoal-100">
                <tr>
                  {['Order #', 'Customer', 'Type', 'Items', 'Total', 'Status', 'Date', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {orders.map((order) => (
                  <>
                  <tr key={order.id} className="hover:bg-charcoal-50/50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-primary-700">{order.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-charcoal-800 truncate max-w-[120px]">{order.customer_name}</p>
                      <p className="text-charcoal-400 text-xs">{order.customer_phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-charcoal-600">{order.order_type}</span>
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">—</td>
                    <td className="px-4 py-3 font-semibold text-charcoal-800">₦{order.total.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', STATUS_COLORS[order.status])}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-charcoal-400 text-xs whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/orders/${order.order_number}`}
                          className="px-3 py-1 rounded-md border border-charcoal-200 text-charcoal-600 text-xs font-medium hover:bg-charcoal-50 transition-colors whitespace-nowrap"
                        >
                          View
                        </Link>
                        {NEXT_STATUS[order.status] && (
                          <button type="button"
                            onClick={() => updateStatus(order.id, NEXT_STATUS[order.status]!)}
                            className="px-3 py-1 rounded-md bg-primary-700 text-white text-xs font-medium hover:bg-primary-800 transition-colors capitalize whitespace-nowrap">
                            Mark {NEXT_STATUS[order.status]?.replace('_', ' ')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Mobile: stacked action row for easy access on small screens */}
                  <tr key={`${order.id}-mobile-actions`} className="sm:hidden">
                    <td colSpan={8} className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/admin/orders/${order.order_number}`}
                          className="w-full text-center px-3 py-2 rounded-md border border-charcoal-200 text-charcoal-600 text-sm font-medium hover:bg-charcoal-50 transition-colors"
                        >
                          View Details
                        </Link>
                        {NEXT_STATUS[order.status] && (
                          <button
                            type="button"
                            onClick={() => updateStatus(order.id, NEXT_STATUS[order.status]!)}
                            className="w-full px-3 py-2 rounded-md bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors"
                          >
                            Mark {NEXT_STATUS[order.status]?.replace('_', ' ')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
