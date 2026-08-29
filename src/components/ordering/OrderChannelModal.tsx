// ============================================================
// OrderChannelModal — shown when customer clicks "Order Now".
// Presents two equal choices: Website ordering or WhatsApp.
// ============================================================

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingCart, MessageCircle, ArrowRight } from 'lucide-react';
import { openWhatsApp, generateWhatsAppOrderMessage } from '../../services/whatsappService';
import { useCartStore } from '../../store/cartStore';

interface OrderChannelModalProps {
  onClose: () => void;
}

export function OrderChannelModal({ onClose }: OrderChannelModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const { items } = useCartStore();

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleWhatsApp() {
    const msg = items.length > 0
      ? generateWhatsAppOrderMessage({ items, orderType: 'pickup' })
      : 'Hello Lord Reigneth Foods 👋\nI would like to place an order. Please share the menu and prices.';
    openWhatsApp(msg);
    onClose();
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-charcoal-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-100">
          <div>
            <h2 id="order-modal-title" className="font-display font-bold text-xl text-charcoal-800">
              How would you like to order?
            </h2>
            <p className="text-sm text-charcoal-500 mt-0.5">Choose your preferred ordering method</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close"
            className="p-2 rounded-full hover:bg-charcoal-100 text-charcoal-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {/* Website ordering */}
          <Link
            to="/order"
            onClick={onClose}
            className="flex items-center gap-4 p-5 rounded-xl border-2 border-primary-200 bg-primary-50 hover:border-primary-400 hover:bg-primary-100 transition-all duration-200 group"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-700 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-charcoal-800 text-base">Order on Website</p>
              <p className="text-sm text-charcoal-500 mt-0.5">
                Browse menu, build your cart, pay online
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary-600 shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>

          {/* WhatsApp ordering */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center gap-4 p-5 w-full rounded-xl border-2 border-[#25D366]/40 bg-[#f0fdf4] hover:border-[#25D366] hover:bg-[#dcfce7] transition-all duration-200 group text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-charcoal-800 text-base">Order on WhatsApp</p>
              <p className="text-sm text-charcoal-500 mt-0.5">
                Chat with us — fast & personal
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-[#25D366] shrink-0 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </button>
        </div>

        <p className="text-center text-xs text-charcoal-400 pb-5 px-5">
          Both options are available 7 days a week during opening hours.
        </p>
      </div>
    </div>
  );
}
