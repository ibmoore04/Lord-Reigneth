import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { MapPin, Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  getAllLocations,
  updateLocation,
  createLocation,
  getBusinessHours,
} from '../../services/locationService';
import type { Location, BusinessHours, LocationInsert } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const EMPTY_FORM: LocationInsert = {
  name: '', slug: '', address: null, description: null,
  phone: null, latitude: null, longitude: null,
  opening_time: null, closing_time: null, is_open: true, display_order: 0,
};

function HoursPanel({ locationId }: { locationId: string }) {
  const [hours, setHours] = useState<BusinessHours[]>([]);

  useEffect(() => {
    getBusinessHours(locationId).then(setHours);
  }, [locationId]);

  async function toggleDay(bh: BusinessHours) {
    const updated = { is_closed: !bh.is_closed };
    await supabase.from('business_hours').update(updated).eq('id', bh.id);
    setHours((prev) => prev.map((h) => h.id === bh.id ? { ...h, ...updated } : h));
  }

  async function updateTime(bh: BusinessHours, field: 'opening_time' | 'closing_time', val: string) {
    await supabase.from('business_hours').update({ [field]: val || null }).eq('id', bh.id);
    setHours((prev) => prev.map((h) => h.id === bh.id ? { ...h, [field]: val } : h));
  }

  if (!hours.length) return <p className="text-xs text-charcoal-400 mt-2">Loading hours…</p>;

  return (
    <div className="mt-3 space-y-1.5">
      {hours.map((bh) => (
        <div key={bh.id} className="flex items-center gap-3 flex-wrap">
          <span className="w-24 text-xs text-charcoal-600 shrink-0">{DAYS[bh.day_of_week]}</span>
          {bh.is_closed ? (
            <span className="text-xs text-charcoal-400 italic">Closed</span>
          ) : (
            <>
              <input type="time" value={bh.opening_time ?? ''} aria-label={`${DAYS[bh.day_of_week]} opening time`}
                onChange={(e) => updateTime(bh, 'opening_time', e.target.value)}
                className="text-xs border border-charcoal-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500" />
              <span className="text-xs text-charcoal-400">to</span>
              <input type="time" value={bh.closing_time ?? ''} aria-label={`${DAYS[bh.day_of_week]} closing time`}
                onChange={(e) => updateTime(bh, 'closing_time', e.target.value)}
                className="text-xs border border-charcoal-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </>
          )}
          <button type="button" onClick={() => toggleDay(bh)}
            className="ml-auto text-xs text-charcoal-400 hover:text-primary-600 transition-colors">
            {bh.is_closed ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4 text-primary-600" />}
          </button>
        </div>
      ))}
    </div>
  );
}

export function AdminLocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<Location | null>(null);
  const [form,      setForm]      = useState<LocationInsert>(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    getAllLocations()
      .then(setLocations)
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleOpen(loc: Location) {
    await updateLocation(loc.id, { is_open: !loc.is_open });
    setLocations((prev) => prev.map((l) => l.id === loc.id ? { ...l, is_open: !loc.is_open } : l));
  }

  function openEdit(loc: Location) {
    setEditing(loc);
    setForm({ name: loc.name, slug: loc.slug, address: loc.address, description: loc.description, phone: loc.phone, latitude: loc.latitude, longitude: loc.longitude, opening_time: loc.opening_time, closing_time: loc.closing_time, is_open: loc.is_open, display_order: loc.display_order });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateLocation(editing.id, form);
        setLocations((prev) => prev.map((l) => l.id === editing.id ? updated : l));
      } else {
        const slug = form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const created = await createLocation({ ...form, slug });
        setLocations((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full px-3 py-2 rounded-md border border-cream-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display font-bold text-2xl text-charcoal-800">Locations</h1>
        <button type="button" onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary-700 text-white text-sm font-medium hover:bg-primary-800">
          <Plus className="w-4 h-4" />Add Location
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-display font-bold text-xl text-charcoal-800">{editing ? 'Edit' : 'New'} Location</h2>
            {[
              { id: 'name', label: 'Name *', type: 'text', required: true },
              { id: 'address', label: 'Address', type: 'text' },
              { id: 'description', label: 'Description', type: 'text' },
              { id: 'phone', label: 'Phone', type: 'tel' },
            ].map(({ id, label, type, required }) => (
              <div key={id}>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">{label}</label>
                <input type={type} required={required}
                  value={(form[id as keyof LocationInsert] as string | null) ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, [id]: e.target.value || null }))}
                  className={inputCls} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Order</label>
                <input type="number" min="0" value={form.display_order ?? 0}
                  onChange={(e) => setForm((p) => ({ ...p, display_order: Number(e.target.value) }))}
                  className={inputCls} />
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_open}
                    onChange={(e) => setForm((p) => ({ ...p, is_open: e.target.checked }))}
                    className="w-4 h-4 accent-primary-700" />
                  Location is open
                </label>
              </div>
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
        <LoadingState message="Loading locations…" />
      ) : locations.length === 0 ? (
        <EmptyState icon={<MapPin className="w-10 h-10" />} title="No locations" description="Add your first location using the button above." />
      ) : (
        <div className="space-y-3">
          {locations.map((loc) => (
            <div key={loc.id} className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-charcoal-800">{loc.name}</h3>
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', loc.is_open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                      {loc.is_open ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  {loc.address && <p className="text-sm text-charcoal-500 mt-0.5">{loc.address}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" onClick={() => openEdit(loc)}
                    className="p-1.5 rounded-md border border-charcoal-200 text-charcoal-500 hover:bg-charcoal-50 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => handleToggleOpen(loc)}
                    className={cn('px-3 py-1.5 rounded-md text-xs font-medium transition-colors', loc.is_open ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100')}>
                    {loc.is_open ? 'Close' : 'Open'}
                  </button>
                  <button type="button" onClick={() => setExpanded(expanded === loc.id ? null : loc.id)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium border border-charcoal-200 text-charcoal-600 hover:bg-charcoal-50 transition-colors">
                    {expanded === loc.id ? 'Hide Hours' : 'Edit Hours'}
                  </button>
                </div>
              </div>
              {expanded === loc.id && (
                <div className="px-5 pb-5 border-t border-charcoal-50">
                  <p className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mt-4 mb-2">Business Hours</p>
                  <HoursPanel locationId={loc.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
