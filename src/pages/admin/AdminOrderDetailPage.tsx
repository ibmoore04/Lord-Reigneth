import { useParams, Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useOrderTracking } from '../../hooks/useOrders';
import { updateOrderStatus } from '../../services/orderService';
import { LoadingState } from '../../components/ui/States';
import { OrderStatusTracker } from '../../components/ordering/OrderStatusTracker';
import { useState } from 'react';
import type { OrderStatus } from '../../types/database';
import {
  ArrowLeft, Phone, MapPin, Printer,
  Globe, MessageCircle, Package, Truck,
} from 'lucide-react';
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

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:          'confirmed',
  confirmed:        'preparing',
  preparing:        'ready',
  ready:            'completed',
  out_for_delivery: 'completed',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending:   'Accept Order',
  confirmed: 'Start Preparing',
  preparing: 'Mark Ready',
  ready:     'Mark Completed',
  out_for_delivery: 'Mark Delivered',
};

export function AdminOrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { order, loading, error } = useOrderTracking(orderNumber ?? null);
  const [updating,     setUpdating]     = useState(false);
  const [statusError,  setStatusError]  = useState<string | null>(null);

  async function handleAdvance() {
    if (!order) return;
    const next = NEXT[order.status];
    if (!next) return;
    setUpdating(true);
    setStatusError(null);
    try {
      await updateOrderStatus(order.id, next);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Status update failed.');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-5">
        <Link
          to="/admin/orders"
          className="inline-flex items-center gap-1.5 text-charcoal-500 hover:text-charcoal-700 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to Orders
        </Link>
      </div>

      {loading ? (
        <LoadingState message="Loading order…" />
      ) : error || !order ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-red-700 font-medium mb-2">Order not found</p>
          <p className="text-red-500 text-sm">{error ?? `No order found with number "${orderNumber}".`}</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">

          {/* Header */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
              <div>
                <p className="font-mono font-bold text-2xl text-primary-700">{order.order_number}</p>
                <p className="text-xs text-charcoal-400 mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('en-NG', {
                    weekday: 'long', day: 'numeric', month: 'long',
                    year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border capitalize', STATUS_COLORS[order.status])}>
                  {order.status.replace('_', ' ')}
                </span>
                <button type="button" onClick={() => window.print()} aria-label="Print"
                  className="p-2 rounded-lg border border-charcoal-200 text-charcoal-500 hover:bg-charcoal-50 transition-colors">
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                order.order_source === 'website' ? 'bg-primary-50 text-primary-700' : 'bg-green-50 text-green-700')}>
                {order.order_source === 'website'
                  ? <><Globe className="w-3 h-3" />Website</>
                  : <><MessageCircle className="w-3 h-3" />WhatsApp</>}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-charcoal-50 text-charcoal-600">
                {order.order_type === 'pickup'
                  ? <><Package className="w-3 h-3" />Pickup</>
                  : <><Truck className="w-3 h-3" />Delivery</>}
              </span>
            </div>
          </div>

          {/* Status tracker */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
            <h2 className="font-semibold text-charcoal-700 text-sm mb-4">Order Progress</h2>
            <OrderStatusTracker status={order.status} orderType={order.order_type} />
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
            <h2 className="font-semibold text-charcoal-800 mb-4">Items</h2>
            <ul className="space-y-3">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 py-2 border-b border-cream-50 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-charcoal-800 text-sm">{item.item_name}</p>
                    {item.special_request && (
                      <p className="text-xs text-charcoal-400 italic mt-0.5">Note: {item.special_request}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-charcoal-700">×{item.quantity}</p>
                    <p className="text-xs text-charcoal-400">₦{item.subtotal.toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-3 border-t border-cream-100 space-y-1.5">
              <div className="flex justify-between text-sm text-charcoal-600">
                <span>Subtotal</span><span>₦{order.subtotal.toLocaleString()}</span>
              </div>
              {order.delivery_fee > 0 && (
                <div className="flex justify-between text-sm text-charcoal-600">
                  <span>Delivery</span><span>₦{order.delivery_fee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-charcoal-800 text-base pt-1">
                <span>Total</span><span>₦{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
            <h2 className="font-semibold text-charcoal-800 mb-4">Customer</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <span className="text-primary-700 font-bold text-xs">{order.customer_name[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-charcoal-800">{order.customer_name}</p>
                  <a href={`tel:${order.customer_phone}`}
                    className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700">
                    <Phone className="w-3 h-3" />{order.customer_phone}
                  </a>
                  {order.customer_email && (
                    <p className="text-xs text-charcoal-400 mt-0.5">{order.customer_email}</p>
                  )}
                </div>
              </div>
              {order.delivery_address && (
                <div className="flex items-start gap-2 pt-2 border-t border-cream-50">
                  <MapPin className="w-4 h-4 text-charcoal-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-charcoal-400 mb-0.5">Delivery address</p>
                    <p className="text-charcoal-700">{order.delivery_address}</p>
                    {order.delivery_landmark && (
                      <p className="text-xs text-charcoal-500 mt-0.5">Landmark: {order.delivery_landmark}</p>
                    )}
                  </div>
                </div>
              )}
              {order.customer_notes && (
                <div className="pt-2 border-t border-cream-50">
                  <p className="text-xs text-charcoal-400 mb-0.5">Notes</p>
                  <p className="text-charcoal-600 italic">{order.customer_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
            <h2 className="font-semibold text-charcoal-800 mb-3">Payment</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-charcoal-400 mb-0.5">Method</p>
                <p className="font-medium text-charcoal-700 capitalize">{order.payment_method.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal-400 mb-0.5">Status</p>
                <p className={cn('font-semibold capitalize', order.payment_status === 'paid' ? 'text-green-600' : 'text-charcoal-700')}>
                  {order.payment_status}
                </p>
              </div>
            </div>
          </div>

          {/* Status action */}
          {NEXT[order.status] && (
            <div className="bg-white rounded-2xl border border-charcoal-100 p-5">
              {statusError && <p className="text-red-600 text-sm mb-3">{statusError}</p>}
              <button type="button" disabled={updating} onClick={handleAdvance}
                className="w-full py-4 rounded-xl bg-primary-700 text-white font-bold text-sm hover:bg-primary-800 disabled:opacity-60 transition-colors">
                {updating ? 'Updating…' : NEXT_LABEL[order.status]}
              </button>
            </div>
          )}

        </div>
      )}
    </AdminLayout>
  );
}
