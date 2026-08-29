// ============================================================
// AddToCartButton — reusable add-to-cart control.
// Shows a simple "+ Add" when quantity is 0,
// shows quantity stepper when already in cart.
// ============================================================

import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import type { MenuItem } from '../../types/database';
import { cn } from '../../lib/utils';

interface AddToCartButtonProps {
  item: MenuItem;
  size?: 'sm' | 'md';
  className?: string;
  onAdded?: () => void;
}

export function AddToCartButton({ item, size = 'md', className, onAdded }: AddToCartButtonProps) {
  const { items, addItem, updateQuantity, openCart } = useCartStore();
  const [showRequest, setShowRequest] = useState(false);
  const [request, setRequest] = useState('');

  const cartItem = items.find((i) => i.menu_item_id === item.id);
  const qty = cartItem?.quantity ?? 0;

  function handleAdd() {
    if (!item.is_available) return;
    if (item.price === null) {
      // No price yet — fall back to enquiry
      return;
    }
    if (showRequest) {
      addItem({
        menu_item_id: item.id,
        name: item.name,
        price: item.price ?? 0,
        image_url: item.image_url,
        special_request: request || undefined,
      });
      setShowRequest(false);
      setRequest('');
      openCart();
      onAdded?.();
    } else {
      addItem({
        menu_item_id: item.id,
        name: item.name,
        price: item.price ?? 0,
        image_url: item.image_url,
      });
      openCart();
      onAdded?.();
    }
  }

  if (!item.is_available) {
    return (
      <div className={cn('flex items-center justify-center w-full px-4 py-2.5 rounded-md bg-charcoal-100 text-charcoal-400 text-sm font-medium cursor-not-allowed', className)}>
        Currently Unavailable
      </div>
    );
  }

  if (item.price === null) {
    return (
      <div className={cn('flex items-center justify-center w-full px-4 py-2.5 rounded-md bg-charcoal-100 text-charcoal-500 text-sm font-medium', className)}>
        Price not set
      </div>
    );
  }

  if (qty > 0) {
    return (
      <div className={cn('flex items-center justify-between w-full gap-2', className)}>
        <button type="button"
          onClick={() => updateQuantity(item.id, qty - 1)}
          aria-label={`Remove one ${item.name}`}
          className={cn(
            'flex items-center justify-center rounded-md bg-primary-700 text-white hover:bg-primary-800 transition-colors',
            size === 'sm' ? 'w-7 h-7' : 'w-9 h-9',
          )}>
          <Minus className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        </button>
        <button type="button"
          onClick={openCart}
          className="flex items-center gap-1.5 text-primary-700 font-bold text-sm">
          <ShoppingCart className="w-3.5 h-3.5" aria-hidden="true" />
          {qty}
        </button>
        <button type="button"
          onClick={() => { addItem({ menu_item_id: item.id, name: item.name, price: item.price!, image_url: item.image_url }); }}
          aria-label={`Add another ${item.name}`}
          className={cn(
            'flex items-center justify-center rounded-md bg-primary-700 text-white hover:bg-primary-800 transition-colors',
            size === 'sm' ? 'w-7 h-7' : 'w-9 h-9',
          )}>
          <Plus className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {showRequest && (
        <div className="mb-2">
          <input
            type="text"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Special request? (optional)"
            className="w-full px-3 py-2 text-xs rounded-md border border-cream-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            autoFocus
          />
        </div>
      )}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={handleAdd}
          className={cn(
            'flex-1 inline-flex items-center justify-center gap-1.5 rounded-md font-medium',
            'bg-primary-700 text-white hover:bg-primary-800 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
            size === 'sm' ? 'px-3 py-2 text-xs' : 'px-4 py-2.5 text-sm',
          )}
        >
          <Plus className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} aria-hidden="true" />
          Add {item.price > 0 ? `· ₦${item.price.toLocaleString()}` : ''}
        </button>
        {!showRequest && (
          <button type="button"
            onClick={() => setShowRequest(true)}
            title="Add special request"
            className="px-2.5 py-2 rounded-md border border-cream-300 text-charcoal-500 hover:bg-cream-100 text-xs transition-colors">
            ✎
          </button>
        )}
      </div>
    </div>
  );
}
