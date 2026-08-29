import { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { UtensilsCrossed, Plus, Pencil, EyeOff, Eye } from 'lucide-react';
import { getAllMenuItems, updateMenuItem, createMenuItem } from '../../services/menuService';
import { getMenuCategories } from '../../services/menuService';
import type { MenuItem, MenuCategory, MenuItemInsert } from '../../types/database';
import { cn } from '../../lib/utils';

function ItemRow({ item, onToggle, onEdit }: {
  item: MenuItem;
  onToggle: (id: string, available: boolean) => void;
  onEdit: (item: MenuItem) => void;
}) {
  return (
    <tr className="hover:bg-charcoal-50/50">
      <td className="px-4 py-3">
        {item.image_url ? (
          <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-cream-100" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-cream-200 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-charcoal-300" />
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <p className="font-medium text-charcoal-800 text-sm">{item.name}</p>
        <p className="text-xs text-charcoal-400 truncate max-w-[200px]">{item.description}</p>
      </td>
      <td className="px-4 py-3 text-sm text-charcoal-600">
        {item.price != null ? `₦${item.price.toLocaleString()}` : <span className="text-charcoal-300 italic">No price</span>}
      </td>
      <td className="px-4 py-3">
        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
          item.is_featured ? 'bg-gold-100 text-gold-700' : 'bg-charcoal-100 text-charcoal-500')}>
          {item.is_featured ? 'Featured' : 'Normal'}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
          item.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
          {item.is_available ? 'Available' : 'Unavailable'}
        </span>
      </td>
      <td className="px-4 py-3 flex items-center gap-2">
        <button type="button" onClick={() => onEdit(item)} aria-label={`Edit ${item.name}`}
          className="p-1.5 rounded-md hover:bg-charcoal-100 text-charcoal-500">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button type="button" onClick={() => onToggle(item.id, !item.is_available)}
          aria-label={item.is_available ? `Disable ${item.name}` : `Enable ${item.name}`}
          className="p-1.5 rounded-md hover:bg-charcoal-100 text-charcoal-500">
          {item.is_available ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </td>
    </tr>
  );
}

export function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<Partial<MenuItemInsert>>({});

  useEffect(() => {
    Promise.all([getAllMenuItems(), getMenuCategories()])
      .then(([its, cats]) => { setItems(its); setCategories(cats); })
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (id: string, available: boolean) => {
    await updateMenuItem(id, { is_available: available });
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, is_available: available } : i));
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({ name: item.name, description: item.description ?? '', price: item.price ?? undefined, category_id: item.category_id, is_featured: item.is_featured, is_available: item.is_available });
    setShowForm(true);
  };

  const openNew = () => { setEditing(null); setForm({ is_available: true, is_featured: false, display_order: 0 }); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const updated = await updateMenuItem(editing.id, form);
      setItems((prev) => prev.map((i) => i.id === editing.id ? updated : i));
    } else {
      const slug = (form.name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const created = await createMenuItem({ ...form, slug } as MenuItemInsert);
      setItems((prev) => [created, ...prev]);
    }
    setShowForm(false);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-charcoal-800">Menu</h1>
        <button type="button" onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary-700 text-white text-sm font-medium hover:bg-primary-800">
          <Plus className="w-4 h-4" />Add Item
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl">
            <h2 className="font-display font-bold text-xl text-charcoal-800">{editing ? 'Edit' : 'New'} Menu Item</h2>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Name *</label>
              <input required value={form.name ?? ''} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Description</label>
              <textarea rows={2} value={form.description ?? ''} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Price (₦)</label>
                <input type="number" min="0" step="50" value={form.price ?? ''} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value ? Number(e.target.value) : undefined }))}
                  placeholder="Leave blank if TBD"
                  className="w-full px-3 py-2 rounded-md border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Category *</label>
                <select required value={form.category_id ?? ''} onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                  className="w-full px-3 py-2 rounded-md border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Select…</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              {[{ key: 'is_featured', label: 'Featured' }, { key: 'is_available', label: 'Available' }].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={Boolean(form[key as keyof typeof form])}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
                    className="w-4 h-4 accent-primary-700" />
                  {label}
                </label>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 py-2.5 rounded-md bg-primary-700 text-white text-sm font-medium hover:bg-primary-800">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-md border border-charcoal-200 text-charcoal-600 text-sm font-medium hover:bg-charcoal-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading menu…" />
      ) : items.length === 0 ? (
        <EmptyState icon={<UtensilsCrossed className="w-10 h-10" />} title="No menu items" description="Add your first item using the button above." />
      ) : (
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-charcoal-50 border-b border-charcoal-100">
                <tr>
                  {['', 'Item', 'Price', 'Badge', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {items.map((item) => (
                  <ItemRow key={item.id} item={item} onToggle={toggle} onEdit={openEdit} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
