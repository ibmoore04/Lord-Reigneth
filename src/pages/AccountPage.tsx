import { useState } from 'react';
import { SEO } from '../components/layout/SEO';
import { Button } from '../components/ui/Button';
import { LoadingState } from '../components/ui/States';
import { useAuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { User, Phone, Mail, Save, CheckCircle } from 'lucide-react';

export function AccountPage() {
  const { isAuthenticated, loading, profile, updateProfile } = useAuthContext();

  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
  });
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Keep form in sync if profile loads after mount
  if (
    profile &&
    form.full_name === '' &&
    form.phone === '' &&
    (profile.full_name || profile.phone)
  ) {
    setForm({ full_name: profile.full_name ?? '', phone: profile.phone ?? '' });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <LoadingState message="Loading account…" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await updateProfile({ full_name: form.full_name, phone: form.phone || null });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-md border border-cream-300 text-charcoal-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-primary-300 transition-colors';

  return (
    <>
      <SEO title="My Account" description="Manage your Lord Reigneth Foods account." noIndex />

      <main id="main-content" className="pt-16 lg:pt-20 min-h-screen bg-cream-100">
        {/* Header */}
        <div className="bg-primary-800 py-12 lg:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">
                {(profile?.full_name ?? profile?.email ?? 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className="text-gold-400 text-xs font-semibold tracking-widest uppercase mb-1">
                  My Account
                </p>
                <h1 className="font-display font-bold text-white text-2xl sm:text-3xl leading-tight">
                  {profile?.full_name || 'Welcome back'}
                </h1>
                <p className="text-white/60 text-sm mt-0.5">{profile?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Profile form */}
          <div className="bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-cream-100">
              <h2 className="font-semibold text-charcoal-800 text-lg">Profile Details</h2>
              <p className="text-charcoal-500 text-sm mt-0.5">Update your name and phone number.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="px-6 py-6 space-y-5">
              {error && (
                <div role="alert" className="px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {saved && (
                <div role="status" className="flex items-center gap-2 px-4 py-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
                  <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  Profile saved successfully.
                </div>
              )}

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" aria-hidden="true" />
                  <input
                    type="email"
                    value={profile?.email ?? ''}
                    disabled
                    className="w-full pl-10 pr-4 py-3 rounded-md border border-cream-200 bg-cream-50 text-charcoal-400 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-charcoal-400">Email cannot be changed here.</p>
              </div>

              {/* Full name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" aria-hidden="true" />
                  <input
                    id="full_name"
                    type="text"
                    autoComplete="name"
                    value={form.full_name}
                    onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-300" aria-hidden="true" />
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" loading={saving} size="md">
                  <Save className="w-4 h-4" aria-hidden="true" />
                  {saving ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>

          {/* Account info */}
          <div className="mt-6 bg-white rounded-2xl border border-cream-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-cream-100">
              <h2 className="font-semibold text-charcoal-800 text-lg">Account Information</h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-cream-100">
                <span className="text-sm text-charcoal-500">Role</span>
                <span className="text-sm font-medium text-charcoal-800 capitalize">{profile?.role ?? 'customer'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-cream-100">
                <span className="text-sm text-charcoal-500">Member since</span>
                <span className="text-sm font-medium text-charcoal-800">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
