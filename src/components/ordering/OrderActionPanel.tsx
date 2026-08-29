// ============================================================
// OrderActionPanel — status advance + payment guard.
// Shared between StaffOrderDetailPage and AdminOrderDetailPage.
//
// Rules enforced here (also enforced by DB trigger):
//   • "Complete" is blocked when payment_status = 'unpaid'
//   • Staff/admin must first mark as paid, then complete
// ============================================================

import { useState } from 'react';
import { updateOrderStatus, markOrderPaid } from '../../services/orderService';
import type { Order, OrderStatus, PaymentStatus } from '../../types/database';
import { CheckCircle, CreditCard, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

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
  ready:     'Complete Order',
  out_for_delivery: 'Mark Delivered',
};

interface OrderActionPanelProps {
  order: Order;
  onUpdate: (updated: Order) => void;
}

const UNPAID_STATUSES: PaymentStatus[] = ['unpaid'];

export function OrderActionPanel({ order, onUpdate }: OrderActionPanelProps) {
  const [updating,   setUpdating]   = useState(false);
  const [paying,     setPaying]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const nextStatus   = NEXT[order.status];
  const nextLabel    = NEXT_LABEL[order.status];
  const isCompleting = nextStatus === 'completed';
  const isUnpaid     = UNPAID_STATUSES.includes(order.payment_status);

  // Block completing if unpaid
  const blockComplete = isCompleting && isUnpaid;

  async function handleAdvance() {
    if (!nextStatus || blockComplete) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(order.id, nextStatus);
      onUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed.');
    } finally {
      setUpdating(false);
    }
  }

  async function handleMarkPaid() {
    setPaying(true);
    setError(null);
    try {
      const updated = await markOrderPaid(order.id);
      onUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update payment status.');
    } finally {
      setPaying(false);
    }
  }

  // Nothing to do if terminal status
  if (!nextStatus) return null;

  return (
    <div className="bg-white rounded-2xl border border-charcoal-100 p-5 space-y-3">
      {error && (
        <div role="alert" className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Payment warning when trying to complete an unpaid order */}
      {blockComplete && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-gold-50 border border-gold-200 text-gold-800 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-gold-500" aria-hidden="true" />
          <div>
            <p className="font-semibold">Payment required before completing</p>
            <p className="text-xs mt-0.5 text-gold-700">
              This order is still <strong>unpaid</strong>. Collect payment first, then mark it paid to complete the order.
            </p>
          </div>
        </div>
      )}

      {/* Mark Paid button — shown when payment is unpaid */}
      {isUnpaid && (
        <button
          type="button"
          disabled={paying}
          onClick={handleMarkPaid}
          className={cn(
            'w-full py-3.5 rounded-xl font-semibold text-sm transition-colors',
            'flex items-center justify-center gap-2',
            'bg-green-600 text-white hover:bg-green-700 disabled:opacity-60',
          )}
        >
          <CreditCard className="w-4 h-4" aria-hidden="true" />
          {paying ? 'Recording Payment…' : 'Mark as Paid'}
        </button>
      )}

      {/* Advance status button */}
      <button
        type="button"
        disabled={updating || blockComplete}
        onClick={handleAdvance}
        title={blockComplete ? 'Collect payment before completing this order' : undefined}
        className={cn(
          'w-full py-3.5 rounded-xl font-bold text-sm transition-colors',
          'flex items-center justify-center gap-2',
          blockComplete
            ? 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
            : 'bg-primary-700 text-white hover:bg-primary-800 disabled:opacity-60',
        )}
      >
        <CheckCircle className="w-4 h-4" aria-hidden="true" />
        {updating ? 'Updating…' : nextLabel}
      </button>
    </div>
  );
}
