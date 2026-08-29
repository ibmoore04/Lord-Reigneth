import { useState } from 'react';
import { SEO, BreadcrumbSchema } from '../components/layout/SEO';
import { SectionHeading } from '../components/ui/SectionHeading';
import { GALLERY_ITEMS, GALLERY_CATEGORIES } from '../data/gallery';
import { EmptyState } from '../components/ui/States';
import { ImageOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

function GalleryImage({ item }: { item: (typeof GALLERY_ITEMS)[number] }) {
  const [errored, setErrored] = useState(false);

  return (
    <article className="relative overflow-hidden rounded-xl bg-cream-200 group">
      {!errored ? (
        <img
          src={item.src}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          className={cn(
            'w-full h-full object-cover',
            'transition-transform duration-500 group-hover:scale-105',
            item.aspectRatio === 'portrait' ? 'aspect-[3/4]' : item.aspectRatio === 'landscape' ? 'aspect-[4/3]' : 'aspect-square',
          )}
          onError={() => setErrored(true)}
        />
      ) : (
        <div className={cn(
          'w-full flex flex-col items-center justify-center gap-2 text-charcoal-300 bg-cream-100',
          item.aspectRatio === 'portrait' ? 'aspect-[3/4]' : item.aspectRatio === 'landscape' ? 'aspect-[4/3]' : 'aspect-square',
        )}>
          <ImageOff className="w-8 h-8" aria-hidden="true" />
          <span className="text-xs text-charcoal-400">Photo coming soon</span>
        </div>
      )}
      {item.caption && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-charcoal-900/70 to-transparent px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-sm font-medium">{item.caption}</p>
        </div>
      )}
    </article>
  );
}

export function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered =
    activeCategory === 'all'
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.categoryId === activeCategory);

  return (
    <>
      <SEO
        title="Gallery"
        description="Browse photos of Lord Reigneth Foods — our food, restaurant, catering events and behind the scenes. Authentic Nigerian cuisine in Ijebu Ode."
        canonical="/gallery"
      />
      <BreadcrumbSchema items={[{ name: 'Gallery', href: '/gallery' }]} />

      <main id="main-content" className="pt-16 lg:pt-20">
        {/* Header */}
        <div className="bg-primary-800 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              label="Our Visual Story"
              title="Gallery"
              subtitle="A glimpse into the food, the people and the moments that make Lord Reigneth Foods special."
              light
            />
          </div>
        </div>

        {/* Filter */}
        <div className="sticky top-16 lg:top-20 z-30 bg-white border-b border-cream-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none"
              role="tablist"
              aria-label="Gallery categories"
            >
              <button
                role="tab"
                aria-selected={activeCategory === 'all'}
                onClick={() => setActiveCategory('all')}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                  activeCategory === 'all'
                    ? 'bg-primary-700 text-white'
                    : 'bg-cream-100 text-charcoal-600 hover:bg-cream-200',
                )}
              >
                All
              </button>
              {GALLERY_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    activeCategory === cat.id
                      ? 'bg-primary-700 text-white'
                      : 'bg-cream-100 text-charcoal-600 hover:bg-cream-200',
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <section className="bg-cream-100 py-12 lg:py-16" aria-live="polite" aria-label="Gallery images">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              {filtered.length === 0 ? (
                <EmptyState
                  icon={<ImageOff className="w-12 h-12" />}
                  title="No photos in this category"
                  description="Try selecting a different category to browse more images."
                />
              ) : (
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
                >
                  {filtered.map((item) => (
                    <GalleryImage key={item.id} item={item} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <p className="mt-10 text-center text-charcoal-400 text-sm">
              Real photographs from Lord Reigneth Foods will replace these images as they become available.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
