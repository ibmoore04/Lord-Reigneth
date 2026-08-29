import { SEO } from '../components/layout/SEO';
import { LoadingState, EmptyState } from '../components/ui/States';
import { useAuthContext } from '../context/AuthContext';
import { useMyOrders } from '../hooks/useOrders';
import { Navigate, Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Globe, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import type { OrderStatus, OrderSource } from '../types/database';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:          'bg-yellow-100 text-yellow-800',
  confirmed:        'bg-blue-100   text-blue-800',
  preparing:        'bg-orange-100 text-orange-800',
  ready:            'bg-green-100  text-green-800',
  out_for_delivery: 'bg-purple-100 text-purple-800',
  completed:        'bg-charcoal-100 text-charcoal-700',
  cancelled:        'bg-red-100    text-red-700',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:          'Pending',
  confirmed:        'Confirmed',
  preparing:        'Preparing',
  ready:            'Ready for pickup',
  out_for_delivery: 'Out for delivery',
  completed:        'Completed',
  cancelled:        'Cancelled',
};

function SourceBadge({ source }: { source: OrderSource }) {
  if (source === 'website') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-primary-600 font-medium">
        <Globe className="w-3 h-3" aria-hidden="true" />
        Website
      </span>
    );
  }
  if (source === 'whatsapp') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
        <MessageCircle className="w-3 h-3" aria-hidden="true" />
        WhatsApp
      </span>
    );
  }
  return <span className="text-xs text-charcoal-400 capitalize">{source}</span>;
}

export function OrdersPage() {
  const { isAuthenticated, loading: authLoading } = useAuthContext();
  const { orders, loading, error } = useMyOrders();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <LoadingState message="Loading…" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/orders' }} replace />;

  return (
    <>
      <SEO
        title="My Orders"
        description="Track your Lord Reigneth Foods orders."
        noIndex
      />

      <main id="main-content" className="pt-16 lg:pt-20 min-h-screen bg-cream-100">
        {/* Header */}
        <div className="bg-primary-800 py-12 lg:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-gold-400 text-xs font-semibold tracking-widest uppercase mb-2">
              Order History
            </p>
            <h1 className="font-display font-bold text-white text-2xl sm:text-3xl">
              My Orders
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading ? (
            <LoadingState message="Loading your orders…" />
          ) : error ? (
            <div role="alert" className="px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              Unable to load orders. Please refresh the page.
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="w-12 h-12" />}
              title="No orders yet"
              description="You haven't placed any orders yet. Browse our menu and place your first order."
              action={
                <Link
                  to="/order"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors"
                >
                  Browse Menu
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {/* Header row */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-cream-100 flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="font-mono text-sm font-bold text-primary-700">
                          {order.order_number}
                        </p>
                        <SourceBadge source={order.order_source} />
                      </div>
                      <p className="text-xs text-charcoal-400">
                        {new Date(order.created_at).toLocaleDateString('en-NG', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        STATUS_STYLES[order.status],
                      )}
                    >
                      {STATUS_LABEL[order.status]}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="px-5 py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-xs text-charcoal-400 mb-0.5">Type</p>
                        <p className="font-medium text-charcoal-700 capitalize">{order.order_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-charcoal-400 mb-0.5">Total</p>
                        <p className="font-semibold text-charcoal-800">
                          ₦{order.total.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-charcoal-400 mb-0.5">Payment</p>
                        <p className={cn(
                          'font-medium capitalize',
                          order.payment_status === 'paid' ? 'text-green-600' : 'text-charcoal-600',
                        )}>
                          {order.payment_status}
                        </p>
                      </div>
                      {order.delivery_address && (
                        <div>
                          <p className="text-xs text-charcoal-400 mb-0.5">Delivery to</p>
                          <p className="font-medium text-charcoal-700 text-xs leading-snug line-clamp-2">
                            {order.delivery_address}
                          </p>
                        </div>
                      )}
                    </div>

                    {order.customer_notes && (
                      <p className="mt-2 text-xs text-charcoal-500 bg-cream-50 rounded-lg px-3 py-2">
                        <span className="font-medium">Note:</span> {order.customer_notes}
                      </p>
                    )}

                    {/* Track link — only for non-completed/cancelled */}
                    {!['completed', 'cancelled'].includes(order.status) && (
                      <div className="mt-4">
                        <Link
                          to={`/track/${order.order_number}`}
                          className="inline-flex items-center gap-1.5 text-primary-700 text-xs font-semibold hover:text-primary-800 transition-colors"
                        >
                          Track this order
                          <ArrowRight className="w-3 h-3" aria-hidden="true" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
