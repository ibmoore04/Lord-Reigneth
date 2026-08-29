import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getWhatsAppLink } from '../../config/site';

export function CateringCTA() {
  return (
    <section
      className="relative bg-primary-700 py-20 lg:py-28 overflow-hidden"
      aria-labelledby="catering-cta-heading"
    >
      {/* Decorative texture layer */}
      <div
        className="absolute inset-0 opacity-5"
        aria-hidden="true"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
          backgroundSize: '10px 10px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-4">
            Outdoor Catering
          </p>
          <h2
            id="catering-cta-heading"
            className="font-display font-bold text-white text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6"
          >
            Your Event Deserves
            <br />
            Great Food.
          </h2>
          <p className="text-white/75 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            From intimate family celebrations to grand weddings — Lord Reigneth Foods brings
            authentic Nigerian cuisine to your event, wherever you are.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/catering"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md bg-gold-500 text-white font-semibold text-base hover:bg-gold-400 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
            >
              Enquire About Catering
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <a
              href={getWhatsAppLink('Hello Lord Reigneth Foods, I am interested in catering services for my event.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md border border-white/40 text-white font-semibold text-base hover:bg-white/10 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            >
              WhatsApp Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
