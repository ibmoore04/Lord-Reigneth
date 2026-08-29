import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { Users, Plus, Pencil, UserCheck, UserX, X, CheckCircle, Mail } from 'lucide-react';
import { getAllStaff, updateStaffProfile, deactivateStaff, reactivateStaff } from '../../services/staffService';
import { inviteStaff } from '../../services/authService';
import { getAllLocations } from '../../services/locationService';
import type { Profile, Location } from '../../types/database';
import { cn } from '../../lib/utils';

type StaffWithLocation = Profile & { locations: { name: string } | null };

const ROLE_COLORS = {
  customer: 'bg-charcoal-100 text-charcoal-600',
  staff:    'bg-blue-100 text-blue-700',
  admin:    'bg-primary-100 text-primary-700',
};

const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

// ─────────────────── Invite modal ────────────────────────
function InviteModal({
  locations,
  onClose,
  onInvited,
}: {
  locations: Location[];
  onClose: () => void;
  onInvited: (email: string) => void;
}) {
  const [form, setForm]       = useState({ fullName: '', email: '', phone: '', locationId: '' });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [done, setDone]       = useState(false);

  const up = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) { setError('Full name is required.'); return; }
    if (!form.email.trim())    { setError('Email is required.'); return; }
    if (!form.locationId)      { setError('Please select an outlet.'); return; }

    setSaving(true);
    setError(null);
    try {
      await inviteStaff({
        email:      form.email.trim().toLowerCase(),
        fullName:   form.fullName.trim(),
        phone:      form.phone.trim() || undefined,
        locationId: form.locationId,
      });
      setDone(true);
      onInvited(form.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create staff account.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-charcoal-900/50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-charcoal-800">
            {done ? 'Invitation Sent' : 'Add Staff Member'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close"
            className="p-1.5 rounded-full hover:bg-charcoal-100 text-charcoal-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          /* ── Success state ── */
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-green-600" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-charcoal-800">Account created!</p>
              <p className="text-sm text-charcoal-500 mt-1">
                A password-reset email has been sent to{' '}
                <strong>{form.email}</strong>.
                They can follow the link to set their password and log in.
              </p>
            </div>
            <p className="text-xs text-charcoal-400 bg-cream-50 rounded-xl p-3 text-left">
              If they don't receive the email, ask them to use{' '}
              <strong>Forgot Password</strong> at the login page with their email address.
            </p>
            <button type="button" onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors">
              Done
            </button>
          </div>
        ) : (
          /* ── Invite form ── */
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <div role="alert" className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sm text-primary-800">
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <p>
                  A staff account will be created and a <strong>password-reset email</strong> sent
                  to the address below. The staff member uses that link to set their own password.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="inv-name" className="block text-sm font-medium text-charcoal-700 mb-1">
                Full Name *
              </label>
              <input id="inv-name" type="text" autoComplete="name" required
                value={form.fullName} onChange={up('fullName')} className={inputCls} />
            </div>

            <div>
              <label htmlFor="inv-email" className="block text-sm font-medium text-charcoal-700 mb-1">
                Email Address *
              </label>
              <input id="inv-email" type="email" autoComplete="email" required
                value={form.email} onChange={up('email')} className={inputCls} />
            </div>

            <div>
              <label htmlFor="inv-phone" className="block text-sm font-medium text-charcoal-700 mb-1">
                Phone Number <span className="text-charcoal-400 font-normal">(optional)</span>
              </label>
              <input id="inv-phone" type="tel" autoComplete="tel"
                value={form.phone} onChange={up('phone')} className={inputCls} />
            </div>

            <div>
              <label htmlFor="inv-loc" className="block text-sm font-medium text-charcoal-700 mb-1">
                Assigned Outlet *
              </label>
              <select id="inv-loc" required value={form.locationId} onChange={up('locationId')} className={inputCls}>
                <option value="">Select an outlet…</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 disabled:opacity-60 transition-colors">
                {saving ? 'Creating Account…' : 'Add Staff Member'}
              </button>
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-charcoal-200 text-charcoal-600 text-sm font-medium hover:bg-charcoal-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─────────────────── Edit modal ──────────────────────────
function EditModal({
  staff: s,
  locations,
  onClose,
  onSaved,
}: {
  staff: StaffWithLocation;
  locations: Location[];
  onClose: () => void;
  onSaved: (updated: Profile) => void;
}) {
  const [form, setForm] = useState({
    full_name:   s.full_name ?? '',
    phone:       s.phone ?? '',
    location_id: s.location_id ?? '',
    is_active:   s.is_active,
    role:        (s.role === 'staff' ? 'staff' : 'customer') as 'staff' | 'customer',
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const up = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const updated = await updateStaffProfile(s.id, {
        full_name:   form.full_name || undefined,
        phone:       form.phone || undefined,
        location_id: form.location_id || null,
        is_active:   form.is_active,
        role:        form.role,
      });
      onSaved(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-charcoal-900/50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-charcoal-800">Edit Staff Member</h2>
          <button type="button" onClick={onClose} aria-label="Close"
            className="p-1.5 rounded-full hover:bg-charcoal-100 text-charcoal-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-cream-50 rounded-xl px-4 py-2.5 text-sm text-charcoal-600">
          {s.email}
        </div>

        {error && (
          <div role="alert" className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {[
          { id: 'sf-name',  label: 'Full Name', field: 'full_name' as const, type: 'text' },
          { id: 'sf-phone', label: 'Phone',     field: 'phone' as const,     type: 'tel'  },
        ].map(({ id, label, field, type }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-sm font-medium text-charcoal-700 mb-1">{label}</label>
            <input id={id} type={type} value={form[field] as string} onChange={up(field)} className={inputCls} />
          </div>
        ))}

        <div>
          <label htmlFor="sf-loc" className="block text-sm font-medium text-charcoal-700 mb-1">Assigned Outlet</label>
          <select id="sf-loc" value={form.location_id} onChange={up('location_id')} className={inputCls}>
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

        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={form.is_active}
            onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
            className="w-4 h-4 accent-primary-700" />
          Account active
        </label>

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 disabled:opacity-60 transition-colors">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-charcoal-200 text-charcoal-600 text-sm font-medium hover:bg-charcoal-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─────────────────── Main page ───────────────────────────
export function AdminStaffPage() {
  const [staff,       setStaff]       = useState<StaffWithLocation[]>([]);
  const [locations,   setLocations]   = useState<Location[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showInvite,  setShowInvite]  = useState(false);
  const [editTarget,  setEditTarget]  = useState<StaffWithLocation | null>(null);

  useEffect(() => {
    Promise.all([getAllStaff(), getAllLocations()])
      .then(([s, l]) => { setStaff(s); setLocations(l); })
      .finally(() => setLoading(false));
  }, []);

  function handleInvited(email: string) {
    // Optimistically add a placeholder row; real data loads on next visit
    const placeholder: StaffWithLocation = {
      id:          crypto.randomUUID(),
      email,
      full_name:   null,
      phone:       null,
      avatar_url:  null,
      role:        'staff',
      location_id: null,
      is_active:   true,
      created_at:  new Date().toISOString(),
      updated_at:  new Date().toISOString(),
      locations:   null,
    };
    setStaff((prev) => [placeholder, ...prev]);
  }

  async function toggleActive(s: StaffWithLocation) {
    if (s.is_active) {
      await deactivateStaff(s.id);
    } else {
      await reactivateStaff(s.id);
    }
    setStaff((prev) => prev.map((p) => p.id === s.id ? { ...p, is_active: !s.is_active } : p));
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-charcoal-800">Staff</h1>
          <p className="text-charcoal-500 text-sm mt-0.5">{staff.length} staff member{staff.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Staff Member
        </button>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <InviteModal
          locations={locations}
          onClose={() => setShowInvite(false)}
          onInvited={handleInvited}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <EditModal
          staff={editTarget}
          locations={locations}
          onClose={() => setEditTarget(null)}
          onSaved={(updated) => {
            setStaff((prev) => prev.map((s) => s.id === updated.id ? { ...s, ...updated } : s));
          }}
        />
      )}

      {/* Table */}
      {loading ? (
        <LoadingState message="Loading staff…" />
      ) : staff.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10" />}
          title="No staff members yet"
          description='Tap "Add Staff Member" to create the first staff account.'
          action={
            <button type="button" onClick={() => setShowInvite(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors">
              <Plus className="w-4 h-4" />Add Staff Member
            </button>
          }
        />
      ) : (
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-charcoal-50 border-b border-charcoal-100">
                <tr>
                  {['Name', 'Email', 'Outlet', 'Role', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-charcoal-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
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
                        <span className="font-medium text-charcoal-800">{s.full_name ?? <span className="text-charcoal-400 italic">—</span>}</span>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => setEditTarget(s)}
                          aria-label={`Edit ${s.full_name ?? s.email}`}
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
                      </div>
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
