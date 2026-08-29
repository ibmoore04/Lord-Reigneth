import { SEO } from '../components/layout/SEO';
import { SectionHeading } from '../components/ui/SectionHeading';
import { LocationCard } from '../components/ui/LocationCard';
import { LOCATIONS } from '../data/locations';
import { SITE_CONFIG, getWhatsAppLink } from '../config/site';
import { Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export function LocationsPage() {
  return (
    <>
      <SEO
        title="Our Locations"
        description="Find Lord Reigneth Foods near you — Main Outlet at 13 Old Ondo Benin Road, Lagos Garage, and Ilese. Open Monday–Saturday 7:00 AM–9:00 PM."
        canonical="/locations"
      />

      <main id="main-content" className="pt-16 lg:pt-20">
        {/* Header */}
        <div className="bg-primary-800 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              label="Find Us"
              title="Our Locations"
              subtitle="Three outlets serving the Ijebu Ode community — great Nigerian food always nearby."
              light
            />
          </div>
        </div>

        {/* Locations Grid */}
        <section className="bg-cream-100 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {LOCATIONS.map((location, i) => (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <LocationCard location={location} className="h-full" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Opening Hours */}
        <section className="bg-white py-16 lg:py-20" aria-labelledby="hours-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">
                  When to Visit
                </p>
                <h2
                  id="hours-heading"
                  className="font-display font-bold text-charcoal-800 text-3xl sm:text-4xl mb-6"
                >
                  Opening Hours
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-cream-200">
                    <span className="text-charcoal-700 font-medium">Monday – Saturday</span>
                    <span className="text-primary-700 font-semibold">
                      {SITE_CONFIG.hours.openTime} – {SITE_CONFIG.hours.closeTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-cream-200">
                    <span className="text-charcoal-700 font-medium">Sunday</span>
                    <span className="text-charcoal-400">Closed</span>
                  </div>
                </div>
                <p className="mt-5 text-charcoal-500 text-sm">
                  Hours may vary on public holidays. Call us to confirm.
                </p>
              </div>

              <div className="bg-primary-50 rounded-2xl p-8 lg:p-10">
                <p className="text-charcoal-600 mb-6 text-base">
                  Have a question about our locations or opening hours? Give us a call or reach
                  out on WhatsApp — we're happy to help.
                </p>
                <div className="flex flex-col gap-3">
                  <a
                    href={`tel:${SITE_CONFIG.contact.phoneRaw}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary-700 text-white font-semibold hover:bg-primary-800 transition-colors duration-200"
                  >
                    <Phone className="w-5 h-5" aria-hidden="true" />
                    {SITE_CONFIG.contact.phone}
                  </a>
                  <a
                    href={getWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-primary-300 text-primary-700 font-semibold hover:bg-primary-50 transition-colors duration-200"
                  >
                    WhatsApp Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
