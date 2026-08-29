import { useState, useCallback } from 'react';
import { SEO } from '../components/layout/SEO';
import { useMenu } from '../hooks/useMenu';
import { useLocations } from '../hooks/useLocations';
import { useCartStore } from '../store/cartStore';
import { useAuthContext } from '../context/AuthContext';
import { AddToCartButton } from '../components/ordering/AddToCartButton';
import { LoadingState, EmptyState } from '../components/ui/States';
import { createOrder } from '../services/orderService';
import { openWhatsApp, generateWhatsAppOrderMessage } from '../services/whatsappService';
import type { MenuCategory, MenuItem, Location, OrderType, PaymentMethod, CreateOrderResult } from '../types/database';
import { Search, ShoppingCart, MessageCircle, ImageOff, MapPin, Truck, Package,
         CheckCircle, Printer, ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { OrderStatusTracker } from '../components/ordering/OrderStatusTracker';
// Static image lookup — maps slug → local image path
// Used as a fallback when Supabase image_url is not yet populated
import { MENU_ITEMS as STATIC_ITEMS } from '../data/menu';

const STATIC_IMAGE_MAP: Record<string, string> = {};
for (const s of STATIC_ITEMS) {
  if (s.image) STATIC_IMAGE_MAP[s.id] = s.image;
}

/** Resolve the best available image for a DB menu item */
function resolveImage(item: MenuItem): string | null {
  if (item.image_url) return item.image_url;
  // Fall back to static map keyed by DB slug matching static id
  return STATIC_IMAGE_MAP[item.slug] ?? STATIC_IMAGE_MAP[item.id] ?? null;
}

// ─────────────────── Menu food card (horizontal row) ─────
function OrderFoodCard({ item }: { item: MenuItem }) {
  const [imgErr, setImgErr] = useState(false);
  const { openCart } = useCartStore();
  const imageSrc = resolveImage(item);

  return (
    <article className={cn(
      'group bg-white rounded-2xl border transition-all duration-200',
      'flex flex-row gap-0 overflow-hidden',
      'hover:shadow-lg hover:border-primary-200',
      item.is_available ? 'border-cream-200' : 'border-cream-200 opacity-75',
    )}>
      {/* Image — fixed square */}
      <div className="relative w-28 sm:w-32 shrink-0 bg-cream-200 overflow-hidden">
        {imageSrc && !imgErr ? (
          <img
            src={imageSrc}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center min-h-[112px]">
            <ImageOff className="w-7 h-7 text-charcoal-300" aria-hidden="true" />
          </div>
        )}

        {/* Unavailable overlay */}
        {!item.is_available && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="text-[10px] font-bold text-charcoal-500 text-center px-1 leading-tight">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 min-w-0 p-3 sm:p-4 justify-between gap-2">
        <div>
          <h3 className="font-display font-semibold text-charcoal-800 text-sm sm:text-base leading-snug">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs text-charcoal-500 leading-relaxed mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          {item.price != null ? (
            <span className="text-sm sm:text-base font-bold text-primary-700">
              ₦{item.price.toLocaleString()}
            </span>
          ) : (
            <span className="text-xs text-charcoal-400 italic">Price on request</span>
          )}

          <div className="shrink-0">
            <AddToCartButton item={item} size="sm" onAdded={openCart} />
          </div>
        </div>
      </div>
    </article>
  );
}

// ─────────────────── Checkout form ───────────────────────
interface CheckoutFormProps {
  locations: Location[];
  onSuccess: (result: CreateOrderResult) => void;
  onCancel: () => void;
}

function CheckoutForm({ locations, onSuccess, onCancel }: CheckoutFormProps) {
  const { user, profile } = useAuthContext();
  const { items, clearCart } = useCartStore();

  const [form, setForm] = useState({
    name:      profile?.full_name ?? '',
    phone:     profile?.phone ?? '',
    email:     profile?.email ?? '',
    orderType: 'pickup' as OrderType,
    locationId: locations[0]?.id ?? '',
    address:   '',
    landmark:  '',
    notes:     '',
    payment:   'cash_on_pickup' as PaymentMethod,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const up = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.name.trim())  errs.name  = 'Name is required.';
    if (!form.phone.trim()) errs.phone = 'Phone is required.';
    if (!form.locationId)   errs.location = 'Please select a location.';
    if (form.orderType === 'delivery' && !form.address.trim())
      errs.address = 'Delivery address is required.';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setPlacing(true);
    setServerError(null);
    try {
      const result = await createOrder({
        customerId:       user?.id ?? null,
        locationId:       form.locationId,
        orderType:        form.orderType,
        orderSource:      'website',
        paymentMethod:    form.payment,
        customerName:     form.name,
        customerPhone:    form.phone,
        customerEmail:    form.email || null,
        deliveryAddress:  form.orderType === 'delivery' ? form.address : null,
        deliveryLandmark: form.orderType === 'delivery' ? form.landmark || null : null,
        customerNotes:    form.notes || null,
        items,
      });
      clearCart();
      onSuccess(result);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unable to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  }

  const inputCls = (field: string) =>
    cn('w-full px-3 py-2.5 rounded-lg border text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors',
       errors[field] ? 'border-red-400' : 'border-charcoal-200 hover:border-primary-300');

  return (
    <div className="bg-white rounded-2xl border border-cream-200 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-xl text-charcoal-800">Checkout</h2>
        <button type="button" onClick={onCancel} className="text-charcoal-400 hover:text-charcoal-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      {serverError && (
        <div role="alert" className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Customer info */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-charcoal-500">Your Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="co-name" className="block text-sm font-medium text-charcoal-700 mb-1">Full Name *</label>
              <input id="co-name" value={form.name} onChange={up('name')} required className={inputCls('name')} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="co-phone" className="block text-sm font-medium text-charcoal-700 mb-1">Phone *</label>
              <input id="co-phone" type="tel" value={form.phone} onChange={up('phone')} required className={inputCls('phone')} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="co-email" className="block text-sm font-medium text-charcoal-700 mb-1">Email <span className="text-charcoal-400 font-normal">(optional)</span></label>
            <input id="co-email" type="email" value={form.email} onChange={up('email')} className={inputCls('email')} />
          </div>
        </div>

        {/* Order type */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-charcoal-500">Order Type</p>
          <div className="grid grid-cols-2 gap-3">
            {(['pickup', 'delivery'] as const).map((t) => (
              <button key={t} type="button"
                onClick={() => setForm((p) => ({ ...p, orderType: t }))}
                className={cn('flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition-all',
                  form.orderType === t ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-charcoal-200 text-charcoal-600 hover:border-primary-300')}>
                {t === 'pickup' ? <Package className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                {t === 'pickup' ? 'Pickup' : 'Delivery'}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="co-loc" className="block text-sm font-medium text-charcoal-700 mb-1">
            <MapPin className="w-3.5 h-3.5 inline mr-1" />Restaurant Location *
          </label>
          <select id="co-loc" value={form.locationId} onChange={up('locationId')} className={inputCls('location')}>
            {locations.map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
          </select>
          {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
        </div>

        {/* Delivery address */}
        {form.orderType === 'delivery' && (
          <div className="space-y-3 p-4 bg-cream-50 rounded-xl border border-cream-200">
            <p className="text-xs font-semibold uppercase tracking-widest text-charcoal-500">Delivery Details</p>
            <div>
              <label htmlFor="co-addr" className="block text-sm font-medium text-charcoal-700 mb-1">Delivery Address *</label>
              <input id="co-addr" value={form.address} onChange={up('address')} placeholder="Street address" className={inputCls('address')} />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>
            <div>
              <label htmlFor="co-land" className="block text-sm font-medium text-charcoal-700 mb-1">Landmark <span className="text-charcoal-400 font-normal">(optional)</span></label>
              <input id="co-land" value={form.landmark} onChange={up('landmark')} placeholder="Nearest landmark" className={inputCls('landmark')} />
            </div>
          </div>
        )}

        {/* Payment method */}
        <div>
          <label htmlFor="co-pay" className="block text-sm font-medium text-charcoal-700 mb-1">Payment Method</label>
          <select id="co-pay" value={form.payment} onChange={up('payment')} className={inputCls('payment')}>
            <option value="cash_on_pickup">Cash on Pickup</option>
            <option value="cash_on_delivery">Cash on Delivery</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="co-notes" className="block text-sm font-medium text-charcoal-700 mb-1">Order Notes <span className="text-charcoal-400 font-normal">(optional)</span></label>
          <textarea id="co-notes" rows={2} value={form.notes} onChange={up('notes')}
            placeholder="Any special instructions for the restaurant…"
            className={cn(inputCls('notes'), 'resize-none')} />
        </div>

        <button type="submit" disabled={placing}
          className="w-full py-3.5 rounded-xl bg-primary-700 text-white font-semibold text-sm hover:bg-primary-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
          {placing ? 'Placing Order…' : (
            <><CheckCircle className="w-4 h-4" aria-hidden="true" />Place Order</>
          )}
        </button>

        <p className="text-xs text-charcoal-400 text-center">
          Guest checkout — no account required. Order total calculated by restaurant.
        </p>
      </form>
    </div>
  );
}

// ─────────────────── Order Confirmation ──────────────────
function OrderConfirmation({ result, location }: { result: CreateOrderResult; location?: Location | null }) {
  return (
    <div className="bg-white rounded-2xl border border-green-200 p-6 sm:p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" aria-hidden="true" />
      </div>
      <h2 className="font-display font-bold text-2xl text-charcoal-800 mb-2">Order Confirmed!</h2>
      <p className="text-charcoal-500 text-sm mb-4">Your order has been received by Lord Reigneth Foods.</p>

      <div className="bg-primary-50 rounded-xl px-5 py-4 mb-5 inline-block">
        <p className="text-xs text-charcoal-500 mb-1">Order Number</p>
        <p className="font-mono font-bold text-2xl text-primary-700">{result.order_number}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-6">
        <div className="bg-cream-50 rounded-lg px-3 py-2 text-left">
          <p className="text-xs text-charcoal-400">Subtotal</p>
          <p className="font-semibold text-charcoal-700">₦{result.subtotal.toLocaleString()}</p>
        </div>
        {result.delivery_fee > 0 && (
          <div className="bg-cream-50 rounded-lg px-3 py-2 text-left">
            <p className="text-xs text-charcoal-400">Delivery</p>
            <p className="font-semibold text-charcoal-700">₦{result.delivery_fee.toLocaleString()}</p>
          </div>
        )}
        <div className="bg-primary-50 rounded-lg px-3 py-2 text-left col-span-2">
          <p className="text-xs text-charcoal-500">Total</p>
          <p className="font-bold text-lg text-primary-700">₦{result.total.toLocaleString()}</p>
        </div>
      </div>

      {location && (
        <p className="text-sm text-charcoal-600 mb-6">
          <MapPin className="w-3.5 h-3.5 inline mr-1 text-primary-600" aria-hidden="true" />
          {location.name}{location.address ? ` — ${location.address}` : ''}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to={`/track/${result.order_number}`}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-700 text-white font-semibold text-sm hover:bg-primary-800 transition-colors">
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
          Track Order
        </Link>
        <button type="button" onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-charcoal-200 text-charcoal-600 font-semibold text-sm hover:bg-charcoal-50 transition-colors">
          <Printer className="w-4 h-4" aria-hidden="true" />
          Print Receipt
        </button>
        <Link to="/"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-charcoal-200 text-charcoal-600 font-semibold text-sm hover:bg-charcoal-50 transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

// ─────────────────── Main Order Page ─────────────────────
export function OrderPage() {
  const { categories, items: allItems, loading, error } = useMenu();
  const { locations, loading: locLoading } = useLocations();
  const { items: cartItems, itemCount, openCart } = useCartStore();

  const [activeCat,    setActiveCat]    = useState<string>('all');
  const [search,       setSearch]       = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [confirmed,    setConfirmed]    = useState<CreateOrderResult | null>(null);
  const [confirmedLoc, setConfirmedLoc] = useState<Location | null>(null);

  const filtered = allItems.filter((item) => {
    const catMatch  = activeCat === 'all' || item.category_id === activeCat;
    const txtMatch  = !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description ?? '').toLowerCase().includes(search.toLowerCase());
    return catMatch && txtMatch;
  });

  const count = itemCount();

  const handleSuccess = useCallback((result: CreateOrderResult) => {
    setConfirmed(result);
    setShowCheckout(false);
    const loc = locations.find((l) => l.id === result.order_id) ?? null;
    setConfirmedLoc(loc);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [locations]);

  function handleWhatsApp() {
    const msg = cartItems.length > 0
      ? generateWhatsAppOrderMessage({ items: cartItems, orderType: 'pickup' })
      : 'Hello Lord Reigneth Foods 👋\nI would like to place an order.';
    openWhatsApp(msg);
  }

  return (
    <>
      <SEO
        title="Order Online"
        description="Order authentic Nigerian food from Lord Reigneth Foods online. Browse our menu, add to cart, and checkout — or order via WhatsApp."
        canonical="/order"
      />
      {/* CartDrawer is already mounted globally in Navbar — do NOT mount it here again */}

      <main id="main-content" className="pt-16 lg:pt-20 min-h-screen bg-cream-100">
        {/* Header */}
        <div className="bg-primary-800 py-10 lg:py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-gold-400 text-xs font-semibold tracking-widest uppercase mb-2">
              Order Online
            </p>
            <h1 className="font-display font-bold text-white text-3xl sm:text-4xl mb-2">
              Build Your Order
            </h1>
            <p className="text-white/60 text-sm">
              Browse our menu, add items to your cart, then checkout — or send via WhatsApp.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Confirmation view */}
          {confirmed && (
            <div className="mb-8">
              <OrderConfirmation result={confirmed} location={confirmedLoc} />
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── LEFT: Menu ── */}
            <div className="flex-1 min-w-0">
              {/* Search + WhatsApp CTA */}
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" aria-hidden="true" />
                  <input
                    type="search"
                    placeholder="Search menu…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-charcoal-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button type="button" onClick={handleWhatsApp}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#1ebe5e] transition-colors shrink-0">
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </button>
              </div>

              {/* Category filter */}
              <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                <button type="button" onClick={() => setActiveCat('all')}
                  className={cn('shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    activeCat === 'all' ? 'bg-primary-700 text-white' : 'bg-white border border-charcoal-200 text-charcoal-600 hover:border-primary-300')}>
                  All
                </button>
                {categories.map((cat: MenuCategory) => (
                  <button key={cat.id} type="button" onClick={() => setActiveCat(cat.id)}
                    className={cn('shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                      activeCat === cat.id ? 'bg-primary-700 text-white' : 'bg-white border border-charcoal-200 text-charcoal-600 hover:border-primary-300')}>
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Grid */}
              {loading ? (
                <LoadingState message="Loading menu…" />
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                  Unable to load menu. Please refresh the page.
                </div>
              ) : filtered.length === 0 ? (
                <EmptyState title="No items found" description="Try adjusting your search or category filter." />
              ) : (
                <div className="space-y-3">
                  {filtered.map((item: MenuItem) => (
                    <OrderFoodCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* ── RIGHT: Sticky cart (desktop) ── */}
            <div className="hidden lg:block w-80 xl:w-96 shrink-0 self-start sticky top-24">
              <div className="space-y-4">
                {showCheckout ? (
                  <CheckoutForm
                    locations={locations}
                    onSuccess={handleSuccess}
                    onCancel={() => setShowCheckout(false)}
                  />
                ) : (
                  <DesktopCartPanel
                    items={cartItems}
                    count={count}
                    locations={locations}
                    locLoading={locLoading}
                    onCheckout={() => setShowCheckout(true)}
                    onWhatsApp={handleWhatsApp}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: floating cart button */}
        {count > 0 && !showCheckout && (
          <div className="lg:hidden fixed bottom-24 inset-x-4 z-40">
            <button type="button" onClick={openCart}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-primary-700 text-white shadow-xl font-semibold text-sm">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                View Cart
              </div>
              <span className="bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
                {count} item{count !== 1 ? 's' : ''}
              </span>
            </button>
          </div>
        )}

        {/* Mobile checkout button */}
        {count > 0 && !showCheckout && (
          <div className="lg:hidden fixed bottom-6 inset-x-4 z-40">
            <button type="button" onClick={() => setShowCheckout(true)}
              className="w-full py-4 rounded-2xl bg-gold-500 text-white font-bold text-sm shadow-xl hover:bg-gold-400 transition-colors">
              Checkout Online →
            </button>
          </div>
        )}

        {/* Mobile checkout overlay */}
        {showCheckout && (
          <div className="lg:hidden fixed inset-0 z-[70] bg-cream-100 overflow-y-auto pt-4 pb-24 px-4">
            <CheckoutForm
              locations={locations}
              onSuccess={handleSuccess}
              onCancel={() => setShowCheckout(false)}
            />
          </div>
        )}
      </main>
    </>
  );
}

// ─────────────────── Desktop cart panel ──────────────────
function DesktopCartPanel({ items, count, locations, locLoading, onCheckout, onWhatsApp }: {
  items: ReturnType<typeof useCartStore>['items'];
  count: number;
  locations: Location[];
  locLoading: boolean;
  onCheckout: () => void;
  onWhatsApp: () => void;
}) {
  const { removeItem, updateQuantity, subtotal } = useCartStore();
  const sub = subtotal();

  return (
    <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-cream-100 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 text-primary-700" aria-hidden="true" />
        <h2 className="font-semibold text-charcoal-800">Your Cart</h2>
        {count > 0 && (
          <span className="ml-auto text-xs bg-primary-700 text-white px-2 py-0.5 rounded-full font-bold">
            {count}
          </span>
        )}
      </div>

      <div className="px-4 py-3 max-h-80 overflow-y-auto">
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <ShoppingCart className="w-10 h-10 text-charcoal-200 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm text-charcoal-400">Your cart is empty.</p>
            <p className="text-xs text-charcoal-400 mt-1">Add items from the menu.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.menu_item_id} className="flex items-center gap-2 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal-700 truncate text-xs">{item.name}</p>
                  {item.price > 0 && (
                    <p className="text-xs text-charcoal-400">₦{(item.price * item.quantity).toLocaleString()}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                    className="w-5 h-5 rounded bg-charcoal-100 hover:bg-charcoal-200 flex items-center justify-center text-xs font-bold">−</button>
                  <span className="w-5 text-center text-xs font-semibold">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                    className="w-5 h-5 rounded bg-charcoal-100 hover:bg-charcoal-200 flex items-center justify-center text-xs font-bold">+</button>
                  <button type="button" onClick={() => removeItem(item.menu_item_id)}
                    className="w-5 h-5 rounded hover:bg-red-50 text-charcoal-400 hover:text-red-500 flex items-center justify-center text-xs">✕</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 0 && (
        <div className="px-4 pb-4 border-t border-cream-100 pt-3 space-y-2">
          {sub > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-charcoal-500">Subtotal</span>
              <span className="font-bold text-charcoal-800">₦{sub.toLocaleString()}</span>
            </div>
          )}
          <p className="text-xs text-charcoal-400">Final total set by restaurant.</p>
          <button type="button" onClick={onCheckout} disabled={locLoading}
            className="w-full py-3 rounded-xl bg-primary-700 text-white font-semibold text-sm hover:bg-primary-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
            Checkout Online
          </button>
          <button type="button" onClick={onWhatsApp}
            className="w-full py-3 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#1ebe5e] transition-colors flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
            Order via WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}
