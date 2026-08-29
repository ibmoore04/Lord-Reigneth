import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { Star, Plus, Eye, EyeOff } from 'lucide-react';
import {
  getAllTestimonials,
  updateTestimonial,
  createTestimonial,
} from '../../services/adminService';
import type { Testimonial, TestimonialInsert } from '../../types/database';
import { cn } from '../../lib/utils';

const EMPTY_FORM: TestimonialInsert = {
  customer_name: '',
  content: '',
  rating: 5,
  image_url: null,
  is_featured: false,
  is_published: false,
};

function StarRating({ rating }: { rating: number | null }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating ?? 0} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={cn('w-3.5 h-3.5', n <= (rating ?? 0) ? 'text-gold-500 fill-gold-500' : 'text-charcoal-200')} aria-hidden="true" />
      ))}
    </div>
  );
}

export function AdminTestimonialsPage() {
  const [items,     setItems]     = useState<Testimonial[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState<TestimonialInsert>(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    getAllTestimonials()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(id: string, field: 'is_published' | 'is_featured', val: boolean) {
    await updateTestimonial(id, { [field]: val });
    setItems((prev) => prev.map((t) => t.id === id ? { ...t, [field]: val } : t));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await createTestimonial(form);
      setItems((prev) => [created, ...prev]);
      setShowForm(false);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal-800">Testimonials</h1>
          <p className="text-charcoal-500 text-sm mt-0.5">
            {items.filter((t) => t.is_published).length} published · {items.length} total
          </p>
        </div>
        <button type="button" onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary-700 text-white text-sm font-medium hover:bg-primary-800">
          <Plus className="w-4 h-4" />Add Testimonial
        </button>
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl">
            <h2 className="font-display font-bold text-xl text-charcoal-800">New Testimonial</h2>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Customer Name *</label>
              <input required value={form.customer_name}
                onChange={(e) => setForm((p) => ({ ...p, customer_name: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Message *</label>
              <textarea required rows={3} value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                className="w-full px-3 py-2 rounded-md border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Rating</label>
              <select value={form.rating ?? 5}
                onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-md border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="flex gap-4">
              {[{ key: 'is_published', label: 'Publish immediately' }, { key: 'is_featured', label: 'Feature on homepage' }].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox"
                    checked={Boolean(form[key as keyof TestimonialInsert])}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.checked }))}
                    className="w-4 h-4 accent-primary-700" />
                  {label}
                </label>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-md bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-md border border-charcoal-200 text-charcoal-600 text-sm font-medium hover:bg-charcoal-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading testimonials…" />
      ) : items.length === 0 ? (
        <EmptyState icon={<Star className="w-10 h-10" />} title="No testimonials yet" description="Add the first testimonial using the button above." />
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className={cn('bg-white rounded-xl border p-5 transition-colors', t.is_published ? 'border-charcoal-100' : 'border-charcoal-100 opacity-70')}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-semibold text-charcoal-800">{t.customer_name}</p>
                    <StarRating rating={t.rating} />
                    {t.is_featured && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-gold-100 text-gold-700 font-semibold">Featured</span>
                    )}
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', t.is_published ? 'bg-green-100 text-green-700' : 'bg-charcoal-100 text-charcoal-500')}>
                      {t.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-charcoal-600 leading-relaxed">{t.content}</p>
                  <p className="text-xs text-charcoal-400 mt-2">
                    {new Date(t.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button"
                    onClick={() => handleToggle(t.id, 'is_published', !t.is_published)}
                    title={t.is_published ? 'Unpublish' : 'Publish'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-charcoal-200 text-xs font-medium text-charcoal-600 hover:bg-charcoal-50 transition-colors">
                    {t.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {t.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button type="button"
                    onClick={() => handleToggle(t.id, 'is_featured', !t.is_featured)}
                    title={t.is_featured ? 'Remove from featured' : 'Feature'}
                    className={cn('p-1.5 rounded-md border transition-colors',
                      t.is_featured ? 'border-gold-300 bg-gold-50 text-gold-600 hover:bg-gold-100' : 'border-charcoal-200 text-charcoal-400 hover:bg-charcoal-50')}>
                    <Star className={cn('w-3.5 h-3.5', t.is_featured && 'fill-gold-500')} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
