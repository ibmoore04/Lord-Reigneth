import { useState } from 'react';
import { StaffLayout } from './StaffLayout';
import { useStaffOutlet } from '../../hooks/useStaff';
import { useMenu } from '../../hooks/useMenu';
import { createStaffWhatsAppOrder } from '../../services/staffService';
import { LoadingState } from '../../components/ui/States';
import type { OrderType, PaymentMethod, MenuItem } from '../../types/database';
import { Plus, Minus, Trash2, CheckCircle, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LineItem { item: MenuItem; qty: number; note: string; }

export function StaffWhatsAppOrderPage() {
  const { outlet, loading: outletLoading } = useStaffOutlet();
  const { items: menuItems, categories, loading: menuLoading } = useMenu();

  const [lines,     setLines]     = useState<LineItem[]>([]);
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    orderType: 'pickup' as OrderType,
    payment: 'unpaid' as PaymentMethod,
    address: '', landmark: '', notes: '',
  });
  const [catFilter, setCatFilter] = useState<string>('all');
  const [placing,   setPlacing]   = useState(false);
  const [result,    setResult]    = useState<{ order_number: string; total: number } | null>(null);
  const [error,     setError]     = useState<string | null>(null);

  const up = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  function addItem(item: MenuItem) {
    setLines((prev) => {
      const ex = prev.find((l) => l.item.id === item.id);
      if (ex) return prev.map((l) => l.item.id === item.id ? { ...l, qty: l.qty + 1 } : l);
      return [...prev, { item, qty: 1, note: '' }];
    });
  }

  function removeItem(id: string) {
    setLines((prev) => prev.filter((l) => l.item.id !== id));
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) { removeItem(id); return; }
    setLines((prev) => prev.map((l) => l.item.id === id ? { ...l, qty } : l));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Customer name and phone are required.'); return;
    }
    if (lines.length === 0) {
      setError('Add at least one item.'); return;
    }
    setError(null);
    setPlacing(true);

    try {
      const res = await createStaffWhatsAppOrder({
        orderType:       form.orderType,
        paymentMethod:   form.payment,
        customerName:    form.name,
        customerPhone:   form.phone,
        customerEmail:   form.email || null,
        deliveryAddress: form.orderType === 'delivery' ? form.address || null : null,
        deliveryLandmark:form.orderType === 'delivery' ? form.landmark || null : null,
        customerNotes:   form.notes || null,
        items: lines.map((l) => ({
          menu_item_id: l.item.id,
          name:         l.item.name,
          price:        l.item.price ?? 0,
          image_url:    l.item.image_url,
          quantity:     l.qty,
          special_request: l.note || undefined,
        })),
      });
      setResult({ order_number: res.order_number, total: res.total });
      setLines([]);
      setForm({ name:'', phone:'', email:'', orderType:'pickup', payment:'unpaid', address:'', landmark:'', notes:'' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create order. Try again.');
    } finally {
      setPlacing(false);
    }
  }

  const displayItems = catFilter === 'all'
    ? menuItems
    : menuItems.filter((i) => i.category_id === catFilter);

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  if (outletLoading) return <LoadingState message="Loading…" />;

  return (
    <StaffLayout outletName={outlet?.name}>
      <div className="mb-5">
        <h1 className="font-display font-bold text-2xl text-charcoal-800 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-[#25D366]" aria-hidden="true" />
          Record WhatsApp Order
        </h1>
        <p className="text-charcoal-500 text-sm mt-0.5">
          Order will be assigned to <span className="font-semibold">{outlet?.name}</span> automatically.
        </p>
      </div>

      {/* Success */}
      {result && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-2" aria-hidden="true" />
          <p className="font-bold text-charcoal-800 text-lg">{result.order_number}</p>
          <p className="text-charcoal-600 text-sm mt-1">
            WhatsApp order recorded · ₦{result.total.toLocaleString()}
          </p>
          <button type="button" onClick={() => setResult(null)}
            className="mt-3 px-5 py-2 rounded-xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors">
            Record Another
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT: Menu */}
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button type="button" onClick={() => setCatFilter('all')}
              className={cn('shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                catFilter === 'all' ? 'bg-primary-700 text-white' : 'bg-white border border-charcoal-200 text-charcoal-600')}>
              All
            </button>
            {categories.map((c) => (
              <button key={c.id} type="button" onClick={() => setCatFilter(c.id)}
                className={cn('shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  catFilter === c.id ? 'bg-primary-700 text-white' : 'bg-white border border-charcoal-200 text-charcoal-600')}>
                {c.name}
              </button>
            ))}
          </div>

          {menuLoading ? <LoadingState /> : (
            <div className="grid grid-cols-2 gap-2 max-h-[480px] overflow-y-auto pr-1">
              {displayItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addItem(item)}
                  disabled={!item.is_available || item.price === null}
                  className={cn(
                    'text-left p-3 rounded-xl border transition-all',
                    item.is_available && item.price !== null
                      ? 'bg-white border-charcoal-200 hover:border-primary-400 hover:shadow-sm'
                      : 'bg-charcoal-50 border-charcoal-100 opacity-50 cursor-not-allowed',
                  )}
                >
                  <p className="font-medium text-charcoal-800 text-xs leading-snug line-clamp-2">{item.name}</p>
                  <p className="text-primary-700 font-bold text-sm mt-1">
                    {item.price != null ? `₦${item.price.toLocaleString()}` : 'No price'}
                  </p>
                  {!item.is_available && <p className="text-xs text-red-500 mt-0.5">Unavailable</p>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Order form */}
        <div>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <div role="alert" className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Selected items */}
            {lines.length > 0 && (
              <div className="bg-white rounded-2xl border border-charcoal-100 p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-charcoal-500 mb-2">Order Items</p>
                {lines.map((l) => (
                  <div key={l.item.id} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-charcoal-50 rounded-lg p-0.5">
                      <button type="button" onClick={() => updateQty(l.item.id, l.qty - 1)}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-charcoal-200 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold">{l.qty}</span>
                      <button type="button" onClick={() => updateQty(l.item.id, l.qty + 1)}
                        className="w-6 h-6 rounded flex items-center justify-center hover:bg-charcoal-200 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="flex-1 text-xs text-charcoal-700 truncate">{l.item.name}</span>
                    {l.item.price != null && (
                      <span className="text-xs font-semibold text-primary-700 shrink-0">
                        ₦{(l.item.price * l.qty).toLocaleString()}
                      </span>
                    )}
                    <button type="button" onClick={() => removeItem(l.item.id)}
                      className="p-1 text-charcoal-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Customer details */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-charcoal-500">Customer</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="wa-name" className="block text-xs font-medium text-charcoal-600 mb-1">Name *</label>
                  <input id="wa-name" value={form.name} onChange={up('name')} required className={inputCls} />
                </div>
                <div>
                  <label htmlFor="wa-phone" className="block text-xs font-medium text-charcoal-600 mb-1">Phone *</label>
                  <input id="wa-phone" type="tel" value={form.phone} onChange={up('phone')} required className={inputCls} />
                </div>
              </div>
            </div>

            {/* Order type + payment */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="wa-type" className="block text-xs font-medium text-charcoal-600 mb-1">Type</label>
                <select id="wa-type" value={form.orderType} onChange={up('orderType')} className={inputCls}>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
              <div>
                <label htmlFor="wa-pay" className="block text-xs font-medium text-charcoal-600 mb-1">Payment</label>
                <select id="wa-pay" value={form.payment} onChange={up('payment')} className={inputCls}>
                  <option value="unpaid">Unpaid</option>
                  <option value="cash_on_pickup">Cash on Pickup</option>
                  <option value="cash_on_delivery">Cash on Delivery</option>
                  <option value="whatsapp">Paid via WhatsApp</option>
                </select>
              </div>
            </div>

            {form.orderType === 'delivery' && (
              <div className="space-y-2">
                <label htmlFor="wa-addr" className="block text-xs font-medium text-charcoal-600">Address</label>
                <input id="wa-addr" value={form.address} onChange={up('address')} placeholder="Delivery address" className={inputCls} />
                <input value={form.landmark} onChange={up('landmark')} placeholder="Landmark (optional)" className={inputCls} />
              </div>
            )}

            <div>
              <label htmlFor="wa-notes" className="block text-xs font-medium text-charcoal-600 mb-1">Notes</label>
              <textarea id="wa-notes" rows={2} value={form.notes} onChange={up('notes')}
                placeholder="Special instructions…" className={cn(inputCls, 'resize-none')} />
            </div>

            <button type="submit" disabled={placing || lines.length === 0}
              className="w-full py-4 rounded-2xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#1ebe5e] disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              {placing ? 'Recording Order…' : 'Record WhatsApp Order'}
            </button>
          </form>
        </div>
      </div>
    </StaffLayout>
  );
}
