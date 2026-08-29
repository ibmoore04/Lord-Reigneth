// ============================================================
// CartDrawer — slide-in cart panel (mobile + desktop).
// ============================================================

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingCart, MessageCircle, ImageOff } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { openWhatsApp, generateWhatsAppOrderMessage } from '../../services/whatsappService';
import { cn } from '../../lib/utils';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, itemCount, subtotal } = useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeCart();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, closeCart]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  function handleWhatsAppOrder() {
    const msg = generateWhatsAppOrderMessage({ items, orderType: 'pickup' });
    openWhatsApp(msg);
    closeCart();
  }

  const sub = subtotal();
  const count = itemCount();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-[80] bg-charcoal-900/50 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={cn(
          'fixed top-0 right-0 h-full z-[90] w-full sm:w-96',
          'bg-white shadow-2xl flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cream-200 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary-700" aria-hidden="true" />
            <h2 className="font-display font-bold text-lg text-charcoal-800">
              Your Cart
            </h2>
            {count > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary-700 text-white text-xs font-bold">
                {count}
              </span>
            )}
          </div>
          <button type="button" onClick={closeCart} aria-label="Close cart"
            className="p-1.5 rounded-full hover:bg-charcoal-100 text-charcoal-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingCart className="w-16 h-16 text-charcoal-200" aria-hidden="true" />
              <div>
                <p className="font-semibold text-charcoal-600">Your cart is empty</p>
                <p className="text-sm text-charcoal-400 mt-1">Add items from the menu to get started.</p>
              </div>
              <Link
                to="/order"
                onClick={closeCart}
                className="px-5 py-2.5 rounded-md bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors"
              >
                Browse Menu
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.menu_item_id} className="flex gap-3 bg-cream-50 rounded-xl p-3">
                  {/* Image */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-cream-200 shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name}
                        className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="w-5 h-5 text-charcoal-300" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal-800 text-sm truncate">{item.name}</p>
                    {item.price > 0 && (
                      <p className="text-xs text-charcoal-500 mt-0.5">
                        ₦{item.price.toLocaleString()} each
                      </p>
                    )}
                    {item.special_request && (
                      <p className="text-xs text-charcoal-400 mt-0.5 italic truncate">
                        "{item.special_request}"
                      </p>
                    )}

                    {/* Qty controls + remove */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 bg-white rounded-lg border border-cream-300 p-0.5">
                        <button type="button"
                          onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="w-6 h-6 flex items-center justify-center rounded text-charcoal-600 hover:bg-charcoal-100 transition-colors">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="min-w-[1.5rem] text-center text-sm font-semibold text-charcoal-800">
                          {item.quantity}
                        </span>
                        <button type="button"
                          onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-6 h-6 flex items-center justify-center rounded text-charcoal-600 hover:bg-charcoal-100 transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button type="button"
                        onClick={() => removeItem(item.menu_item_id)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="p-1 rounded text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {item.price > 0 && (
                        <span className="ml-auto text-sm font-semibold text-charcoal-800">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 pb-6 pt-3 border-t border-cream-200 shrink-0 space-y-3">
            {sub > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-charcoal-600">Subtotal (estimate)</span>
                <span className="font-bold text-charcoal-800">₦{sub.toLocaleString()}</span>
              </div>
            )}
            <p className="text-xs text-charcoal-400">
              Final total is confirmed by the restaurant.
            </p>

            <Link
              to="/order"
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-primary-700 text-white font-semibold text-sm hover:bg-primary-800 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
              Checkout Online
            </Link>

            <button
              type="button"
              onClick={handleWhatsAppOrder}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1ebe5e] transition-colors"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              Order via WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}
