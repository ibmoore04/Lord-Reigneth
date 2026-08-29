// ============================================================
// ResetPasswordPage — handles the password-reset deep link.
// Supabase sends staff here after admin invitation OR when a
// user clicks "Forgot Password".
// URL: /auth/reset-password  (set as redirectTo in both flows)
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../../components/layout/SEO';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, KeyRound, CheckCircle } from 'lucide-react';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [done,      setDone]      = useState(false);

  // Supabase puts the recovery tokens in the URL hash when the user
  // clicks the reset link. The SDK automatically parses them and fires
  // a PASSWORD_RECOVERY session event — we just need the page to exist
  // at this path so the redirect lands here.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        // When the recovery token is parsed the event is PASSWORD_RECOVERY
        if (event === 'PASSWORD_RECOVERY') {
          // Session is now active with the recovery token — user can update password
        }
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.'); return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Clear the needs_password_reset flag from user metadata
    await supabase.auth.updateUser({
      data: { needs_password_reset: false },
    });

    setDone(true);
    setLoading(false);

    // Give them a moment to see the success, then redirect
    setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role ?? 'customer';
      if (role === 'admin') navigate('/admin', { replace: true });
      else if (role === 'staff') navigate('/staff', { replace: true });
      else navigate('/', { replace: true });
    }, 2000);
  }

  const inputCls = 'w-full px-4 py-3 rounded-lg border border-charcoal-200 text-sm text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <>
      <SEO title="Set Your Password" description="Set your Lord Reigneth Foods account password." noIndex />

      <main id="main-content" className="min-h-screen flex items-center justify-center bg-cream-100 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-cream-200">

            {done ? (
              <div className="text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7 text-green-600" aria-hidden="true" />
                </div>
                <h1 className="font-display font-bold text-2xl text-charcoal-800">
                  Password Set!
                </h1>
                <p className="text-charcoal-500 text-sm">
                  Your password has been updated. Redirecting you now…
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                    <KeyRound className="w-6 h-6 text-primary-700" aria-hidden="true" />
                  </div>
                  <h1 className="font-display font-bold text-2xl text-charcoal-800">
                    Set Your Password
                  </h1>
                  <p className="text-charcoal-500 text-sm mt-1">
                    Choose a strong password to secure your account.
                  </p>
                </div>

                {error && (
                  <div role="alert" className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div>
                    <label htmlFor="rp-password" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        id="rp-password"
                        type={showPw ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputCls} pr-11`}
                        placeholder="At least 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        aria-label={showPw ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600"
                      >
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="rp-confirm" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      id="rp-confirm"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className={inputCls}
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-primary-700 text-white font-semibold text-sm hover:bg-primary-800 disabled:opacity-60 transition-colors"
                    >
                      {loading ? 'Saving…' : 'Set Password & Continue'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
