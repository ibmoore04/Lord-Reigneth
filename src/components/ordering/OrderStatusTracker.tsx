// ============================================================
// OrderStatusTracker — visual step-progress for order status.
// ============================================================

import { Check, Clock, ChefHat, PackageCheck, Truck, Star } from 'lucide-react';
import type { OrderStatus, OrderType } from '../../types/database';
import { cn } from '../../lib/utils';

interface Step {
  status: OrderStatus;
  label: string;
  icon: React.ElementType;
  deliveryOnly?: boolean;
}

const ALL_STEPS: Step[] = [
  { status: 'pending',          label: 'Order Received',    icon: Clock },
  { status: 'confirmed',        label: 'Confirmed',         icon: Check },
  { status: 'preparing',        label: 'Preparing',         icon: ChefHat },
  { status: 'ready',            label: 'Ready',             icon: PackageCheck },
  { status: 'out_for_delivery', label: 'Out for Delivery',  icon: Truck, deliveryOnly: true },
  { status: 'completed',        label: 'Completed',         icon: Star },
];

const STATUS_ORDER: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed',
];

function getStepIndex(status: OrderStatus) {
  return STATUS_ORDER.indexOf(status);
}

interface OrderStatusTrackerProps {
  status: OrderStatus;
  orderType: OrderType;
}

export function OrderStatusTracker({ status, orderType }: OrderStatusTrackerProps) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center justify-center gap-3 py-6 px-5 bg-red-50 rounded-2xl border border-red-200">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-500 text-lg font-bold">✕</span>
        </div>
        <div>
          <p className="font-semibold text-red-700">Order Cancelled</p>
          <p className="text-sm text-red-500">Please contact us if you have questions.</p>
        </div>
      </div>
    );
  }

  const steps = ALL_STEPS.filter((s) => orderType === 'pickup' ? !s.deliveryOnly : true);
  const currentIdx = getStepIndex(status);

  return (
    <div className="py-4">
      {/* Desktop horizontal tracker */}
      <div className="hidden sm:flex items-center">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const stepIdx = getStepIndex(step.status);
          const done    = stepIdx < currentIdx;
          const active  = stepIdx === currentIdx;
          const last    = i === steps.length - 1;

          return (
            <div key={step.status} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                  done    ? 'bg-primary-700 border-primary-700 text-white' :
                  active  ? 'bg-white border-primary-700 text-primary-700 shadow-md shadow-primary-200 scale-110' :
                            'bg-white border-charcoal-200 text-charcoal-300',
                )}>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  done || active ? 'text-primary-700' : 'text-charcoal-400',
                )}>
                  {step.label}
                </span>
              </div>
              {!last && (
                <div className={cn(
                  'flex-1 h-0.5 mx-1 mb-5 transition-colors',
                  stepIdx < currentIdx ? 'bg-primary-700' : 'bg-charcoal-200',
                )} aria-hidden="true" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile vertical tracker */}
      <div className="flex sm:hidden flex-col gap-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const stepIdx = getStepIndex(step.status);
          const done    = stepIdx < currentIdx;
          const active  = stepIdx === currentIdx;
          const last    = i === steps.length - 1;

          return (
            <div key={step.status} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0',
                  done    ? 'bg-primary-700 border-primary-700 text-white' :
                  active  ? 'bg-white border-primary-700 text-primary-700 shadow-sm' :
                            'bg-white border-charcoal-200 text-charcoal-300',
                )}>
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </div>
                {!last && (
                  <div className={cn(
                    'w-0.5 h-6 my-0.5',
                    stepIdx < currentIdx ? 'bg-primary-700' : 'bg-charcoal-200',
                  )} aria-hidden="true" />
                )}
              </div>
              <div className="pt-1.5 pb-4">
                <p className={cn(
                  'text-sm font-medium',
                  done || active ? 'text-primary-700' : 'text-charcoal-400',
                )}>
                  {step.label}
                </p>
                {active && (
                  <p className="text-xs text-charcoal-500 mt-0.5">Current status</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
