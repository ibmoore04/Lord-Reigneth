import { SEO, RestaurantSchema } from '../components/layout/SEO';
import { HeroSection } from '../components/sections/HeroSection';
import { TrustHighlights } from '../components/sections/TrustHighlights';
import { PopularMeals } from '../components/sections/PopularMeals';
import { CateringCTA } from '../components/sections/CateringCTA';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function HomePage() {
  return (
    <>
      <SEO
        description="Lord Reigneth Foods — Over 25 years of serving Ijebu Ode with authentic Nigerian meals, snacks, drinks, and outdoor catering. Visit us at 13, Old Ondo Benin Road, Ijebu Ode."
        canonical="/"
      />
      <RestaurantSchema />

      <main id="main-content">
        {/* Hero */}
        <HeroSection />

        {/* Trust Highlights */}
        <TrustHighlights />

        {/* Our Story Teaser */}
        <section className="bg-primary-800 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-4">
                  Our Story
                </p>
                <h2 className="font-display font-bold text-white text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
                  From a Single Cooler
                  <br />
                  to a Trusted Name.
                </h2>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-8">
                  Lord Reigneth Foods began as a humble dream — a single woman, Deaconess Comfort
                  Agoro, selling food from one cooler in Ijebu Ode. Through dedication, hard work
                  and a commitment to quality food, that dream has grown into a recognized
                  multi-location food business serving our community for over 25 years.
                </p>
                <Link
                  to="/our-story"
                  className="inline-flex items-center gap-2 text-gold-400 font-semibold hover:text-gold-300 transition-colors duration-200 focus-visible:outline-none focus-visible:underline"
                >
                  Read Our Full Story
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Popular Meals */}
        <PopularMeals />

        {/* Catering CTA */}
        <CateringCTA />

        {/* Locations Teaser */}
        <section className="bg-white py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-3">
                Find Us
              </p>
              <h2 className="font-display font-bold text-charcoal-800 text-3xl sm:text-4xl mb-4">
                We're Close to You
              </h2>
              <p className="text-charcoal-500 text-base sm:text-lg max-w-xl mx-auto mb-8">
                With outlets at our Main Location, Lagos Garage and Ilese, great Nigerian food is
                always nearby.
              </p>
              <Link
                to="/locations"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-md bg-primary-700 text-white font-semibold hover:bg-primary-800 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                View All Locations
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
