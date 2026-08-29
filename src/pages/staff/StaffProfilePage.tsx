import { useState } from 'react';
import { StaffLayout } from './StaffLayout';
import { useStaffOutlet } from '../../hooks/useStaff';
import { useAuthContext } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { updatePassword } from '../../services/authService';
import { CheckCircle, MapPin, Shield, Eye, EyeOff } from 'lucide-react';

export function StaffProfilePage() {
  const { profile, updateProfile } = useAuthContext();
  const { outlet } = useStaffOutlet();

  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    phone:     profile?.phone ?? '',
  });
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [pwForm,   setPwForm]   = useState({ current: '', next: '', confirm: '' });
  const [showPw,   setShowPw]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved,  setPwSaved]  = useState(false);
  const [pwError,  setPwError]  = useState<string | null>(null);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ full_name: form.full_name, phone: form.phone || null });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (pwForm.next.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    setPwSaving(true);
    try {
      await updatePassword(pwForm.next);
      setPwSaved(true);
      setPwForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Unable to change password.');
    } finally {
      setPwSaving(false);
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-charcoal-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <StaffLayout outletName={outlet?.name}>
      <h1 className="font-display font-bold text-2xl text-charcoal-800 mb-6">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-3xl">

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-charcoal-50">
            <h2 className="font-semibold text-charcoal-800">Account Information</h2>
          </div>
          <div className="px-5 py-4 space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
              <span className="text-charcoal-500">Role:</span>
              <span className="font-semibold capitalize text-charcoal-800">{profile?.role}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
              <span className="text-charcoal-500">Outlet:</span>
              <span className="font-semibold text-charcoal-800">{outlet?.name ?? '—'}</span>
            </div>
            <div>
              <span className="text-charcoal-500">Email:</span>
              <span className="font-medium text-charcoal-700 ml-1">{profile?.email}</span>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold inline-block ${
              profile?.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {profile?.is_active ? '● Active' : '● Inactive'}
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-charcoal-50">
            <h2 className="font-semibold text-charcoal-800">Edit Profile</h2>
          </div>
          <div className="px-5 py-4 space-y-4">
            {saved && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" /> Saved successfully.
              </div>
            )}
            <div>
              <label htmlFor="sf-name" className="block text-xs font-medium text-charcoal-600 mb-1">Full Name</label>
              <input id="sf-name" value={form.full_name}
                onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label htmlFor="sf-phone" className="block text-xs font-medium text-charcoal-600 mb-1">Phone</label>
              <input id="sf-phone" type="tel" value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className={inputCls} />
            </div>
            <Button type="submit" loading={saving} size="sm">Save Changes</Button>
          </div>
        </form>

        {/* Change password */}
        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden lg:col-span-2">
          <div className="px-5 py-4 border-b border-charcoal-50">
            <h2 className="font-semibold text-charcoal-800">Change Password</h2>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pwSaved && (
              <div className="sm:col-span-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                <CheckCircle className="w-4 h-4" /> Password updated.
              </div>
            )}
            {pwError && (
              <div className="sm:col-span-3 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg">{pwError}</div>
            )}
            {[
              { id: 'pw-new',     label: 'New Password',     field: 'next' as const },
              { id: 'pw-confirm', label: 'Confirm Password', field: 'confirm' as const },
            ].map(({ id, label, field }) => (
              <div key={id} className="relative">
                <label htmlFor={id} className="block text-xs font-medium text-charcoal-600 mb-1">{label}</label>
                <input id={id} type={showPw ? 'text' : 'password'} value={pwForm[field]}
                  onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))}
                  className={`${inputCls} pr-10`} />
              </div>
            ))}
            <div className="flex items-end gap-2">
              <button type="button" onClick={() => setShowPw((v) => !v)}
                className="p-3 rounded-xl border border-charcoal-200 text-charcoal-500 hover:bg-charcoal-50 transition-colors"
                aria-label={showPw ? 'Hide passwords' : 'Show passwords'}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <Button type="submit" loading={pwSaving} size="sm">Update</Button>
            </div>
          </div>
        </form>
      </div>
    </StaffLayout>
  );
}
