import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { SEO } from '../../components/layout/SEO';
import { Button } from '../../components/ui/Button';
import { useAuthContext } from '../../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const { signIn } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO title="Sign In" description="Sign in to your Lord Reigneth Foods account." noIndex />
      <main id="main-content" className="pt-16 lg:pt-20 min-h-screen flex items-center justify-center bg-cream-100 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-cream-200">
            <div className="text-center mb-8">
              <h1 className="font-display font-bold text-3xl text-charcoal-800 mb-2">Welcome Back</h1>
              <p className="text-charcoal-500 text-sm">Sign in to your Lord Reigneth Foods account</p>
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
                <input
                  id="email" type="email" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-cream-300 text-charcoal-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password" type={showPw ? 'text' : 'password'}
                    autoComplete="current-password" required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-md border border-cream-300 text-charcoal-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" fullWidth loading={loading}>
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-charcoal-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-700 font-medium hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
