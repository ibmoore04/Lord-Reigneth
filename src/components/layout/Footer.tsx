import { Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Music2 } from 'lucide-react';
import { SITE_CONFIG } from '../../config/site';

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'Our Story', href: '/our-story' },
  { label: 'Locations', href: '/locations' },
  { label: 'Catering', href: '/catering' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-900 text-white" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4 focus-visible:outline-none">
              <div>
                <p className="font-display font-bold text-2xl text-white leading-tight">
                  Lord Reigneth
                </p>
                <p className="text-gold-400 font-semibold text-sm tracking-widest uppercase">
                  Foods
                </p>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              {SITE_CONFIG.tagline}
              <br />
              <span className="text-white/40">
                Serving Ijebu Ode with authentic Nigerian meals for over{' '}
                {SITE_CONFIG.yearsOfService} years.
              </span>
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href={SITE_CONFIG.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Lord Reigneth Foods on Instagram"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-gold-500 hover:text-white transition-colors duration-200"
              >
                {/* Instagram icon (inline SVG — not in lucide-react v1.x) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a
                href={SITE_CONFIG.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Lord Reigneth Foods on TikTok"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 text-white hover:bg-gold-500 hover:text-white transition-colors duration-200"
              >
                <Music2 className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-widest uppercase mb-5">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-white/60 hover:text-gold-400 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:text-gold-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-widest uppercase mb-5">
              Contact
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`tel:${SITE_CONFIG.contact.phoneRaw}`}
                  className="flex items-center gap-2.5 text-white/60 hover:text-gold-400 text-sm transition-colors duration-200"
                >
                  <Phone className="w-4 h-4 text-gold-500 shrink-0" aria-hidden="true" />
                  {SITE_CONFIG.contact.phone}
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <address className="text-white/60 text-sm not-italic leading-relaxed">
                    {SITE_CONFIG.address.main}
                  </address>
                </div>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-widest uppercase mb-5">
              Opening Hours
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-gold-500 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-sm">
                  <p className="text-white/80">{SITE_CONFIG.hours.openDays}</p>
                  <p className="text-white/60">
                    {SITE_CONFIG.hours.openTime} – {SITE_CONFIG.hours.closeTime}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 pl-6">
                <p className="text-white/40 text-sm">Sunday: Closed</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-sm text-center">
            &copy; {year} Lord Reigneth Foods. All rights reserved.
          </p>
          <p className="text-white/25 text-xs text-center">
            Built with ❤️ for Ijebu Ode
          </p>
        </div>
      </div>
    </footer>
  );
}
