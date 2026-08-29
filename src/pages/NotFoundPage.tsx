import { Link } from 'react-router-dom';
import { SEO } from '../components/layout/SEO';
import { Home, Utensils, ArrowRight } from 'lucide-react';

export function NotFoundPage() {
  return (
    <>
      <SEO
        title="Page Not Found"
        description="The page you're looking for doesn't exist. Return to Lord Reigneth Foods."
        noIndex
      />

      <main
        id="main-content"
        className="pt-16 lg:pt-20 min-h-[80vh] flex items-center justify-center"
      >
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center py-20">
          {/* Visual */}
          <div
            className="text-8xl mb-6 select-none"
            aria-hidden="true"
          >
            🍽️
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold text-charcoal-800 text-4xl sm:text-5xl mb-4">
            Page Not Found
          </h1>

          <p className="text-charcoal-500 text-base sm:text-lg leading-relaxed mb-10">
            Looks like this page stepped out. Let us guide you back to something
            delicious.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-primary-700 text-white font-semibold hover:bg-primary-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              Go Home
            </Link>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md border border-primary-300 text-primary-700 font-semibold hover:bg-primary-50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <Utensils className="w-4 h-4" aria-hidden="true" />
              View Our Menu
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
