import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { SITE_CONFIG, getWhatsAppLink } from '../../config/site';
import { motion, type Variants } from 'framer-motion';

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' },
  }),
};

export function HeroSection() {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleMute() {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  }

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* ── Video background ── */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src="/assets/food/video-preview.mp4"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="w-full h-full object-cover object-center"
          // Poster = first frame feel while video loads
          poster="/assets/food/jollof-rice.jpg"
        />
        {/* Dark gradient overlay — readable text over any frame */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/80 via-charcoal-900/60 to-charcoal-900/85" />
      </div>

      {/* ── Mute / unmute control ── */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? 'Unmute hero video' : 'Mute hero video'}
        className="absolute bottom-8 right-6 z-20 p-2.5 rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">

        {/* Overline */}
        <motion.p
          custom={0}
          initial="hidden"
          animate="show"
          variants={FADE_UP}
          className="text-gold-400 text-sm sm:text-base font-semibold tracking-widest uppercase mb-5"
        >
          Ijebu Ode's Favourite Restaurant
        </motion.p>

        {/* Headline */}
        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={FADE_UP}
          className="font-display font-bold text-white text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-none mb-5"
        >
          {SITE_CONFIG.tagline}
        </motion.h1>

        {/* Subheading */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="show"
          variants={FADE_UP}
          className="text-white/80 text-lg sm:text-xl lg:text-2xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Over {SITE_CONFIG.yearsOfService}+ Years of Serving Ijebu Ode with Great Food &amp;
          Great Memories.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="show"
          variants={FADE_UP}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md bg-gold-500 text-white font-semibold text-base hover:bg-gold-400 transition-all duration-200 shadow-lg hover:shadow-gold-500/30 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2"
          >
            Explore Our Menu
          </Link>
          <a
            href={getWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md bg-white/10 backdrop-blur-sm text-white font-semibold text-base border border-white/30 hover:bg-white/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          >
            Order Now
          </a>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        aria-hidden="true"
      >
        <ChevronDown className="w-6 h-6 text-white/50 animate-bounce" />
      </motion.div>
    </section>
  );
}
