import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { Users, Plus, Pencil, UserCheck, UserX } from 'lucide-react';
import { getAllStaff, updateStaffProfile, deactivateStaff, reactivateStaff } from '../../services/staffService';
import { getAllLocations } from '../../services/locationService';
import type { Profile, Location } from '../../types/database';
import { cn } from '../../lib/utils';

type StaffWithLocation = Profile & { locations: { name: string } | null };

const ROLE_COLORS = {
  customer: 'bg-charcoal-100 text-charcoal-600',
  staff:    'bg-blue-100 text-blue-700',
  admin:    'bg-primary-100 text-primary-700',
};

export function AdminStaffPage() {
  const [staff,     setStaff]     = useState<StaffWithLocation[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState<StaffWithLocation | null>(null);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState({
    full_name:   '',
    phone:       '',
    location_id: '',
    is_active:   true,
    role: 'staff' as 'staff' | 'customer',
  });

  useEffect(() => {
    Promise.all([getAllStaff(), getAllLocations()])
      .then(([s, l]) => { setStaff(s); setLocations(l); })
      .finally(() => setLoading(false));
  }, []);

  function openEdit(s: StaffWithLocation) {
    setEditing(s);
    setForm({
      full_name:   s.full_name ?? '',
      phone:       s.phone ?? '',
      location_id: s.location_id ?? '',
      is_active:   s.is_active,
      role:        s.role === 'staff' ? 'staff' : 'customer',
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await updateStaffProfile(editing.id, {
        full_name:   form.full_name || null,
        phone:       form.phone || null,
        location_id: form.location_id || null,
        is_active:   form.is_active,
        role:        form.role,
      });
      setStaff((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...updated } : s));
      setShowForm(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(s: StaffWithLocation) {
    if (s.is_active) {
      await deactivateStaff(s.id);
    } else {
      await reactivateStaff(s.id);
    }
    setStaff((prev) => prev.map((p) => p.id === s.id ? { ...p, is_active: !s.is_active } : p));
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal-800">Staff</h1>
          <p className="text-charcoal-500 text-sm mt-0.5">{staff.length} staff members</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => alert('Staff invitation requires email configuration.\nSee supabase/README.md for setup.')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary-300 text-primary-700 text-sm font-medium hover:bg-primary-50 transition-colors"
          >
            <Plus className="w-4 h-4" />Invite Staff
          </button>
        </div>
      </div>

      <div className="mb-4 px-4 py-3 bg-gold-50 border border-gold-200 rounded-xl text-sm text-gold-800">
        <strong>Note:</strong> To add a new staff member, have them sign up normally at <code>/register</code>,
        then use the Edit button below to assign their role and outlet.
        Full invitation flow requires email configuration — see <code>supabase/README.md</code>.
      </div>

      {/* Edit form */}
      {showForm && editing && (
        <div className="fixed inset-0 z-50 bg-charcoal-900/50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h2 className="font-display font-bold text-xl text-charcoal-800">Edit Staff Member</h2>
            <div className="text-sm text-charcoal-500 bg-cream-50 rounded-xl p-3">
              <p className="font-medium text-charcoal-700">{editing.email}</p>
            </div>

            {[
              { id: 'sf-name', label: 'Full Name', field: 'full_name' as const, type: 'text' },
              { id: 'sf-phone', label: 'Phone', field: 'phone' as const, type: 'tel' },
            ].map(({ id, label, field, type }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium text-charcoal-700 mb-1">{label}</label>
                <input id={id} type={type} value={form[field] as string}
                  onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                  className={inputCls} />
              </div>
            ))}

            <div>
              <label htmlFor="sf-loc" className="block text-sm font-medium text-charcoal-700 mb-1">Assigned Outlet</label>
              <select id="sf-loc" value={form.location_id}
                onChange={(e) => setForm((p) => ({ ...p, location_id: e.target.value }))}
                className={inputCls}>
                <option value="">— No outlet assigned —</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="sf-role" className="block text-sm font-medium text-charcoal-700 mb-1">Role</label>
              <select id="sf-role" value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as 'staff' | 'customer' }))}
                className={inputCls}>
                <option value="staff">Staff</option>
                <option value="customer">Customer (demote)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_active}
                onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                className="w-4 h-4 accent-primary-700" />
              Account active
            </label>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-primary-700 text-white text-sm font-medium hover:bg-primary-800 disabled:opacity-60 transition-colors">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                className="flex-1 py-2.5 rounded-xl border border-charcoal-200 text-charcoal-600 text-sm font-medium hover:bg-charcoal-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading staff…" />
      ) : staff.length === 0 ? (
        <EmptyState icon={<Users className="w-10 h-10" />} title="No staff members yet"
          description="Invite staff using the button above, or assign a role to an existing user." />
      ) : (
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-charcoal-50 border-b border-charcoal-100">
                <tr>
                  {['Name', 'Email', 'Outlet', 'Role', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-charcoal-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {(s.full_name ?? s.email)[0].toUpperCase()}
                        </span>
                        <span className="font-medium text-charcoal-800">{s.full_name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-charcoal-600">{s.email}</td>
                    <td className="px-4 py-3 text-charcoal-600">
                      {s.locations?.name ?? <span className="text-charcoal-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', ROLE_COLORS[s.role])}>
                        {s.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium',
                        s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex items-center gap-1.5">
                      <button type="button" onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg border border-charcoal-200 text-charcoal-500 hover:bg-charcoal-50 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => toggleActive(s)}
                        title={s.is_active ? 'Deactivate' : 'Reactivate'}
                        className={cn('p-1.5 rounded-lg border transition-colors',
                          s.is_active
                            ? 'border-red-200 text-red-500 hover:bg-red-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50')}>
                        {s.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
