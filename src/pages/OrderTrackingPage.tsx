import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '../components/layout/SEO';
import { OrderStatusTracker } from '../components/ordering/OrderStatusTracker';
import { LoadingState } from '../components/ui/States';
import { useOrderTracking } from '../hooks/useOrders';
import { supabase } from '../lib/supabase';
import type { OrderWithItems } from '../services/orderService';
import { MapPin, Phone, ArrowLeft, Search, Printer } from 'lucide-react';
import { SITE_CONFIG } from '../config/site';
import { cn } from '../lib/utils';

// ── Guest lookup — uses the server-side phone-verified RPC ──
function GuestLookup({ onFound }: { onFound: (num: string) => void }) {
  const [num,     setNum]     = useState('');
  const [phone,   setPhone]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!num.trim() || !phone.trim()) {
      setError('Both order number and phone are required.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      // Uses the track_order_by_number() Postgres function
      // which verifies phone server-side — never exposes other orders.
      const { error: rpcError } = await supabase.rpc(
        'track_order_by_number',
        { p_order_number: num.trim().toUpperCase(), p_phone: phone.trim() },
      );

      if (rpcError) {
        setError('Order not found or phone number does not match.');
        return;
      }

      // Phone verified — hand the order number to the parent
      onFound(num.trim().toUpperCase());
    } catch {
      setError('Unable to find your order. Please check the details and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-primary-700" aria-hidden="true" />
          </div>
          <h2 className="font-display font-bold text-xl text-charcoal-800">Track Your Order</h2>
          <p className="text-charcoal-500 text-sm mt-1">
            Enter your order number and the phone number you used to order.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="track-num" className="block text-sm font-medium text-charcoal-700 mb-1.5">
              Order Number
            </label>
            <input
              id="track-num"
              type="text"
              placeholder="e.g. LRF-20260828-001"
              value={num}
              onChange={(e) => setNum(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-lg border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono uppercase"
            />
          </div>
          <div>
            <label htmlFor="track-phone" className="block text-sm font-medium text-charcoal-700 mb-1.5">
              Phone Number
            </label>
            <input
              id="track-phone"
              type="tel"
              placeholder="e.g. 08050240544"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary-700 text-white font-semibold text-sm hover:bg-primary-800 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Searching…' : 'Track Order'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Order detail view ─────────────────────────────────────
function OrderDetail({ order }: { order: OrderWithItems }) {
  return (
    <div className="space-y-5">
      {/* Header + status */}
      <div className="bg-white rounded-2xl border border-cream-200 p-5 sm:p-6">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
          <div>
            <p className="text-xs text-charcoal-500 mb-1">Order Number</p>
            <p className="font-mono font-bold text-2xl text-primary-700">{order.order_number}</p>
            <p className="text-xs text-charcoal-400 mt-1">
              {new Date(order.created_at).toLocaleDateString('en-NG', {
                weekday: 'long', day: 'numeric', month: 'long',
                year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 rounded-lg border border-charcoal-200 text-charcoal-500 hover:bg-charcoal-50 transition-colors"
            aria-label="Print receipt"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <OrderStatusTracker status={order.status} orderType={order.order_type} />
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-cream-200 p-5 sm:p-6">
        <h2 className="font-semibold text-charcoal-800 mb-4">Order Items</h2>
        <ul className="space-y-3">
          {order.order_items.map((oi) => (
            <li key={oi.id} className="flex items-start justify-between gap-3 text-sm">
              <div className="flex-1">
                <span className="font-medium text-charcoal-800">{oi.item_name}</span>
                {oi.special_request && (
                  <p className="text-xs text-charcoal-400 italic mt-0.5">
                    "{oi.special_request}"
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 shrink-0 text-right">
                <span className="text-charcoal-500 text-xs">×{oi.quantity}</span>
                <span className="font-semibold text-charcoal-700">
                  ₦{oi.subtotal.toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Totals */}
        <div className="mt-4 pt-4 border-t border-cream-100 space-y-1.5">
          <div className="flex justify-between text-sm text-charcoal-600">
            <span>Subtotal</span>
            <span>₦{order.subtotal.toLocaleString()}</span>
          </div>
          {order.delivery_fee > 0 && (
            <div className="flex justify-between text-sm text-charcoal-600">
              <span>Delivery</span>
              <span>₦{order.delivery_fee.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-charcoal-800 text-base pt-1">
            <span>Total</span>
            <span>₦{order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Order details */}
      <div className="bg-white rounded-2xl border border-cream-200 p-5 sm:p-6">
        <h2 className="font-semibold text-charcoal-800 mb-4">Order Details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-xs text-charcoal-400 mb-0.5">Customer</p>
            <p className="font-medium text-charcoal-700">{order.customer_name}</p>
          </div>
          <div>
            <p className="text-xs text-charcoal-400 mb-0.5">Order Type</p>
            <p className="font-medium text-charcoal-700 capitalize">{order.order_type}</p>
          </div>
          <div>
            <p className="text-xs text-charcoal-400 mb-0.5">Payment</p>
            <p className={cn(
              'font-medium capitalize',
              order.payment_status === 'paid' ? 'text-green-600' : 'text-charcoal-700',
            )}>
              {order.payment_status}
            </p>
          </div>
          {order.delivery_address && (
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs text-charcoal-400 mb-0.5">Delivery Address</p>
              <p className="font-medium text-charcoal-700">
                {order.delivery_address}
                {order.delivery_landmark ? ` · ${order.delivery_landmark}` : ''}
              </p>
            </div>
          )}
          {order.customer_notes && (
            <div className="col-span-2 sm:col-span-3">
              <p className="text-xs text-charcoal-400 mb-0.5">Notes</p>
              <p className="text-charcoal-600 italic">{order.customer_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Contact strip */}
      <div className="bg-primary-50 rounded-2xl border border-primary-100 p-5 flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="font-medium text-charcoal-800 text-sm">Need help with your order?</p>
          <p className="text-xs text-charcoal-500 mt-0.5">Call or WhatsApp us directly.</p>
        </div>
        <div className="flex gap-3">
          <a
            href={`tel:${SITE_CONFIG.contact.phoneRaw}`}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-primary-200 text-primary-700 text-sm font-semibold hover:bg-primary-50 transition-colors"
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            Call
          </a>
          <a
            href={`https://wa.me/${SITE_CONFIG.contact.whatsapp}?text=${encodeURIComponent(
              `Hi, I need help with order ${order.order_number}.`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5e] transition-colors"
          >
            <MapPin className="w-4 h-4" aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
export function OrderTrackingPage() {
  const { orderNumber: paramNum } = useParams<{ orderNumber?: string }>();
  const [trackingNum, setTrackingNum] = useState<string | null>(
    paramNum ? paramNum.toUpperCase() : null,
  );
  const { order, loading, error } = useOrderTracking(trackingNum);

  return (
    <>
      <SEO
        title="Track Order"
        description="Track your Lord Reigneth Foods order status in real-time."
        noIndex
      />

      <main id="main-content" className="pt-16 lg:pt-20 min-h-screen bg-cream-100">
        {/* Header */}
        <div className="bg-primary-800 py-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/order"
              className="inline-flex items-center gap-1.5 text-white/60 text-sm hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              Back to menu
            </Link>
            <h1 className="font-display font-bold text-white text-2xl sm:text-3xl">
              Order Tracking
            </h1>
            {trackingNum && (
              <button
                type="button"
                onClick={() => setTrackingNum(null)}
                className="mt-2 text-white/50 hover:text-white text-xs underline underline-offset-2 transition-colors"
              >
                Track a different order
              </button>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!trackingNum ? (
            <GuestLookup onFound={setTrackingNum} />
          ) : loading ? (
            <LoadingState message="Loading your order…" />
          ) : error || !order ? (
            <div className="max-w-md mx-auto text-center py-10 space-y-4">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 text-red-400" aria-hidden="true" />
              </div>
              <p className="text-charcoal-600 font-medium">
                {error ?? 'Order not found.'}
              </p>
              <p className="text-charcoal-400 text-sm">
                Check your order number and try again. Your order number was sent
                with your order confirmation.
              </p>
              <button
                type="button"
                onClick={() => setTrackingNum(null)}
                className="px-6 py-2.5 rounded-xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <OrderDetail order={order} />
          )}
        </div>
      </main>
    </>
  );
}
