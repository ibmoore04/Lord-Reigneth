// ============================================================
// OrderActionPanel — status advance + payment management.
// Used by both StaffOrderDetailPage and AdminOrderDetailPage.
//
// Payment rules (enforced here + DB trigger):
//   • Cannot mark "completed" while payment_status = 'unpaid'
//   • Staff/admin can toggle paid ↔ unpaid to correct mistakes
// ============================================================

import { useState } from 'react';
import { updateOrderStatus, markOrderPaid } from '../../services/orderService';
import { supabase } from '../../lib/supabase';
import type { Order, OrderStatus } from '../../types/database';
import { CheckCircle, CreditCard, RotateCcw, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

const NEXT: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:          'confirmed',
  confirmed:        'preparing',
  preparing:        'ready',
  ready:            'completed',
  out_for_delivery: 'completed',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  pending:          'Accept Order',
  confirmed:        'Start Preparing',
  preparing:        'Mark Ready',
  ready:            'Complete Order',
  out_for_delivery: 'Mark Delivered',
};

interface OrderActionPanelProps {
  order: Order;
  onUpdate: (updated: Order) => void;
}

export function OrderActionPanel({ order, onUpdate }: OrderActionPanelProps) {
  const [updating,  setUpdating]  = useState(false);
  const [toggling,  setToggling]  = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState<string | null>(null);

  const nextStatus   = NEXT[order.status];
  const nextLabel    = NEXT_LABEL[order.status];
  const isCompleting = nextStatus === 'completed';
  const isUnpaid     = order.payment_status === 'unpaid';
  const isPaid       = order.payment_status === 'paid';

  // Block completing if unpaid — enforced both here and in the DB trigger
  const blockComplete = isCompleting && isUnpaid;

  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  }

  // ── Advance order status ──────────────────────────────
  async function handleAdvance() {
    if (!nextStatus || blockComplete) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(order.id, nextStatus);
      onUpdate(updated);
      showSuccess(`Order marked as ${nextStatus.replace('_', ' ')}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed.');
    } finally {
      setUpdating(false);
    }
  }

  // ── Toggle payment status ─────────────────────────────
  async function handleTogglePayment() {
    setToggling(true);
    setError(null);
    try {
      if (isUnpaid) {
        // Mark paid
        const updated = await markOrderPaid(order.id);
        onUpdate(updated);
        showSuccess('Payment recorded — order marked as paid.');
      } else {
        // Mark unpaid (undo / correction)
        const { data, error: err } = await supabase
          .from('orders')
          .update({ payment_status: 'unpaid' })
          .eq('id', order.id)
          .select()
          .single();
        if (err) throw new Error(err.message);
        onUpdate(data as Order);
        showSuccess('Payment status reset to unpaid.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update payment status.');
    } finally {
      setToggling(false);
    }
  }

  // Terminal statuses — nothing left to do
  if (order.status === 'completed' && isPaid) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-green-800">Order complete</p>
          <p className="text-xs text-green-600 mt-0.5">Paid · {order.status}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-charcoal-100 p-5 space-y-3">
      {/* Error */}
      {error && (
        <div role="alert" className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div role="status" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {success}
        </div>
      )}

      {/* Payment warning when trying to complete an unpaid order */}
      {blockComplete && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" aria-hidden="true" />
          <div>
            <p className="font-semibold">Payment required before completing</p>
            <p className="text-xs mt-0.5 text-amber-700">
              This order is still <strong>unpaid</strong>.
              Collect payment and tap "Mark as Paid" first.
            </p>
          </div>
        </div>
      )}

      {/* Payment toggle */}
      {order.status !== 'cancelled' && (
        <button
          type="button"
          disabled={toggling}
          onClick={handleTogglePayment}
          className={cn(
            'w-full py-3 rounded-xl font-semibold text-sm transition-colors',
            'flex items-center justify-center gap-2 border',
            isUnpaid
              ? 'bg-green-600 text-white border-green-700 hover:bg-green-700'
              : 'bg-white text-charcoal-700 border-charcoal-200 hover:bg-charcoal-50',
            'disabled:opacity-60',
          )}
        >
          {toggling ? (
            'Updating…'
          ) : isUnpaid ? (
            <><CreditCard className="w-4 h-4" aria-hidden="true" />Mark as Paid</>
          ) : (
            <><RotateCcw className="w-4 h-4" aria-hidden="true" />Mark as Unpaid</>
          )}
        </button>
      )}

      {/* Advance status button */}
      {nextStatus && (
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
              : 'bg-primary-700 text-white hover:bg-primary-800',
            'disabled:opacity-60',
          )}
        >
          <CheckCircle className="w-4 h-4" aria-hidden="true" />
          {updating ? 'Updating…' : nextLabel}
        </button>
      )}
    </div>
  );
}
