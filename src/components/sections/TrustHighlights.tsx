import { Award, Utensils, Tent, MapPin } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { SITE_CONFIG } from '../../config/site';

const HIGHLIGHTS = [
  {
    icon: Award,
    title: `${SITE_CONFIG.yearsOfService}+ Years`,
    description: 'Serving the Ijebu Ode community with passion, pride and consistency.',
  },
  {
    icon: Utensils,
    title: 'Authentic Nigerian Meals',
    description:
      'Freshly prepared local favourites — from smoky jollof rice to rich, hearty soups.',
  },
  {
    icon: Tent,
    title: 'Outdoor Catering',
    description:
      'We bring great food to your celebrations, events and special occasions.',
  },
  {
    icon: MapPin,
    title: 'Multiple Locations',
    description:
      'Serving customers at our main outlet, Lagos Garage and Ilese — all across the Ijebu axis.',
  },
];

const ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

export function TrustHighlights() {
  return (
    <section
      className="bg-white py-16 lg:py-20"
      aria-labelledby="trust-highlights-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="trust-highlights-heading" className="sr-only">
          Why Choose Lord Reigneth Foods
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {HIGHLIGHTS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
                variants={ITEM_VARIANTS}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors duration-300">
                  <Icon className="w-8 h-8 text-primary-700" aria-hidden="true" />
                </div>
                <h3 className="font-display font-bold text-xl text-charcoal-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-charcoal-500 text-sm leading-relaxed">{item.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
