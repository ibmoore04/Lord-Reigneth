import { SEO, BreadcrumbSchema } from '../components/layout/SEO';
import { SectionHeading } from '../components/ui/SectionHeading';
import { motion, type Variants } from 'framer-motion';
import { SITE_CONFIG } from '../config/site';

const TIMELINE = [
  {
    period: 'The Beginning',
    description:
      'Deaconess Comfort Agoro started with a single cooler, selling home-cooked Nigerian meals in Ijebu Ode. What began as a means of livelihood quickly became a community need — neighbours and passersby returning day after day for the taste of home.',
    icon: '🍲',
  },
  {
    period: 'Growing Roots',
    description:
      'Word spread about the quality and consistency of the food. The business grew from a cooler to a proper food-service setup, earning a loyal following in the Ijebu Ode community. Trust was built, one plate at a time.',
    icon: '🌱',
  },
  {
    period: 'Expanding Presence',
    description:
      'Lord Reigneth Foods expanded beyond the main outlet, opening at Lagos Garage to serve travellers and at Ilese to reach students and residents in that area. Each location maintained the same standard of quality and warmth.',
    icon: '📍',
  },
  {
    period: '25+ Years and Counting',
    description:
      'More than two decades later, Lord Reigneth Foods stands as one of the most trusted food brands in the Ijebu Ode axis. The vision remains unchanged — to serve great Nigerian food with consistency, care and community at the heart of everything.',
    icon: '🏆',
  },
];

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: 'easeOut' },
  }),
};

export function OurStoryPage() {
  return (
    <>
      <SEO
        title="Our Story"
        description="The story of Lord Reigneth Foods — founded by Deaconess Comfort Agoro. From a single cooler to a trusted Nigerian restaurant with 25+ years of serving Ijebu Ode."
        canonical="/our-story"
        keywords="Lord Reigneth Foods history, Deaconess Comfort Agoro, Nigerian restaurant Ijebu Ode history, 25 years restaurant"
      />
      <BreadcrumbSchema items={[{ name: 'Our Story', href: '/our-story' }]} />

      <main id="main-content" className="pt-16 lg:pt-20">
        {/* Hero */}
        <div className="bg-primary-800 py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
                <p className="text-gold-400 text-sm font-semibold tracking-widest uppercase mb-4">
                  Our Story
                </p>
                <h1 className="font-display font-bold text-white text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
                  From a Single Cooler
                  <br />
                  to a Trusted Name.
                </h1>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                  The story of Lord Reigneth Foods is a story of faith, hard work and the power of
                  good food to build community.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Founder Feature */}
        <section className="bg-cream-100 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Image placeholder */}
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-primary-50 flex items-center justify-center border-4 border-primary-100">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl" aria-hidden="true">👩‍🍳</span>
                    </div>
                    <p className="text-primary-600 font-semibold text-lg">
                      {SITE_CONFIG.founder}
                    </p>
                    <p className="text-charcoal-400 text-sm mt-1">Founder, Lord Reigneth Foods</p>
                    <p className="text-charcoal-300 text-xs mt-4 italic">
                      (Portrait photograph coming soon)
                    </p>
                  </div>
                </div>
                {/* Decorative element */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-2xl bg-gold-100 -z-10" aria-hidden="true" />
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-gold-500 text-sm font-semibold tracking-widest uppercase mb-4">
                  The Founder
                </p>
                <h2 className="font-display font-bold text-charcoal-800 text-3xl sm:text-4xl mb-6 leading-tight">
                  Deaconess Comfort Agoro
                </h2>
                <div className="space-y-4 text-charcoal-600 leading-relaxed">
                  <p>
                    Lord Reigneth Foods was built on the vision, sacrifice and cooking talent of
                    Deaconess Comfort Agoro — a woman who believed that great food, prepared with
                    love, could make a difference in people's lives.
                  </p>
                  <p>
                    She started small — very small — but her commitment to authentic Nigerian
                    flavours and her genuine warmth towards every customer laid the foundation for
                    what would become one of Ijebu Ode's most loved food businesses.
                  </p>
                  <p>
                    Over {SITE_CONFIG.yearsOfService}+ years later, that same spirit drives
                    everything Lord Reigneth Foods does. The recipes are the same. The care is the
                    same. The community is bigger.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-white py-16 lg:py-24" aria-labelledby="timeline-heading">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              id="timeline-heading"
              label="Our Journey"
              title="The Lord Reigneth Foods Story"
              subtitle="A journey built on faith, food and community."
            />

            <div className="mt-16 relative">
              {/* Vertical line */}
              <div
                className="absolute left-6 top-0 bottom-0 w-px bg-cream-300 hidden sm:block"
                aria-hidden="true"
              />

              <div className="space-y-10">
                {TIMELINE.map((item, i) => (
                  <motion.div
                    key={item.period}
                    custom={i}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-40px' }}
                    variants={FADE_UP}
                    className="relative sm:pl-20"
                  >
                    {/* Icon on line */}
                    <div
                      className="hidden sm:flex absolute left-0 top-1 w-12 h-12 rounded-full bg-primary-50 border-2 border-primary-100 items-center justify-center text-xl"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </div>

                    <div className="bg-cream-50 rounded-xl p-6 border border-cream-200">
                      <h3 className="font-display font-bold text-xl text-charcoal-800 mb-3 flex items-center gap-3">
                        <span className="sm:hidden text-2xl" aria-hidden="true">{item.icon}</span>
                        {item.period}
                      </h3>
                      <p className="text-charcoal-600 leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-primary-700 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <SectionHeading
              label="What We Stand For"
              title="Our Values"
              subtitle="The principles that have guided Lord Reigneth Foods for more than 25 years."
              light
            />
            <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { emoji: '💚', label: 'Quality' },
                { emoji: '🤝', label: 'Community' },
                { emoji: '🍽️', label: 'Hospitality' },
                { emoji: '⏰', label: 'Consistency' },
              ].map((v) => (
                <div key={v.label} className="bg-white/10 rounded-xl p-6 text-white">
                  <div className="text-4xl mb-3" aria-hidden="true">{v.emoji}</div>
                  <p className="font-semibold text-lg">{v.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
