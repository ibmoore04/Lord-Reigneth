import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../../components/layout/SEO';
import { Button } from '../../components/ui/Button';
import * as authService from '../../services/authService';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO title="Reset Password" description="Reset your Lord Reigneth Foods account password." noIndex />
      <main id="main-content" className="pt-16 lg:pt-20 min-h-screen flex items-center justify-center bg-cream-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-cream-200">
            {sent ? (
              <div className="text-center">
                <div className="text-5xl mb-4" aria-hidden="true">📧</div>
                <h1 className="font-display font-bold text-2xl text-charcoal-800 mb-3">Check Your Email</h1>
                <p className="text-charcoal-500 text-sm leading-relaxed mb-6">
                  If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                </p>
                <Link to="/login" className="text-primary-700 font-medium hover:underline text-sm">
                  Return to Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="font-display font-bold text-3xl text-charcoal-800 mb-2">Reset Password</h1>
                  <p className="text-charcoal-500 text-sm">Enter your email and we'll send a reset link.</p>
                </div>

                {error && (
                  <div role="alert" className="mb-5 px-4 py-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      Email Address
                    </label>
                    <input id="email" type="email" autoComplete="email" required
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-md border border-cream-300 text-charcoal-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  </div>
                  <Button type="submit" fullWidth loading={loading}>Send Reset Link</Button>
                </form>

                <p className="mt-6 text-center text-sm text-charcoal-500">
                  <Link to="/login" className="text-primary-700 font-medium hover:underline">Back to Sign In</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
