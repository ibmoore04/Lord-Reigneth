import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '../../components/layout/SEO';
import { Button } from '../../components/ui/Button';
import { useAuthContext } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export function RegisterPage() {
  const { signUp } = useAuthContext();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    try {
      await signUp(form.email, form.password, form.fullName, form.phone || undefined);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main id="main-content" className="pt-20 min-h-screen flex items-center justify-center bg-cream-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 text-center border border-cream-200 shadow-sm">
          <div className="text-5xl mb-4" aria-hidden="true">✉️</div>
          <h1 className="font-display font-bold text-2xl text-charcoal-800 mb-3">Check Your Email</h1>
          <p className="text-charcoal-500 text-sm leading-relaxed mb-6">
            We sent a confirmation link to <strong>{form.email}</strong>. Please confirm your email to activate your account.
          </p>
          <Button variant="secondary" onClick={() => navigate('/login')}>Go to Sign In</Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <SEO title="Create Account" description="Create a Lord Reigneth Foods account to track orders and more." noIndex />
      <main id="main-content" className="pt-16 lg:pt-20 min-h-screen flex items-center justify-center bg-cream-100 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-cream-200">
            <div className="text-center mb-8">
              <h1 className="font-display font-bold text-3xl text-charcoal-800 mb-2">Create Account</h1>
              <p className="text-charcoal-500 text-sm">Join Lord Reigneth Foods</p>
            </div>

            {error && (
              <div role="alert" className="mb-5 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {[
                { id: 'fullName', label: 'Full Name', type: 'text', autoComplete: 'name' },
                { id: 'email', label: 'Email Address', type: 'email', autoComplete: 'email' },
                { id: 'phone', label: 'Phone Number (optional)', type: 'tel', autoComplete: 'tel' },
              ].map(({ id, label, type, autoComplete }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium text-charcoal-700 mb-1.5">{label}</label>
                  <input id={id} name={id} type={type} autoComplete={autoComplete}
                    value={form[id as keyof typeof form]}
                    onChange={update(id as keyof typeof form)}
                    required={id !== 'phone'}
                    className="w-full px-4 py-3 rounded-md border border-cream-300 text-charcoal-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              ))}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 mb-1.5">Password</label>
                <div className="relative">
                  <input id="password" type={showPw ? 'text' : 'password'} autoComplete="new-password"
                    value={form.password} onChange={update('password')} required minLength={8}
                    className="w-full px-4 py-3 pr-12 rounded-md border border-cream-300 text-charcoal-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-charcoal-700 mb-1.5">Confirm Password</label>
                <input id="confirm" type="password" autoComplete="new-password"
                  value={form.confirm} onChange={update('confirm')} required
                  className="w-full px-4 py-3 rounded-md border border-cream-300 text-charcoal-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <div className="pt-2">
                <Button type="submit" fullWidth loading={loading}>Create Account</Button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-charcoal-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-700 font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
