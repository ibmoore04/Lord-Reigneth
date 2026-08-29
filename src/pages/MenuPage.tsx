import { useState } from 'react';
import { SEO, BreadcrumbSchema } from '../components/layout/SEO';
import { SectionHeading } from '../components/ui/SectionHeading';
import { FoodCard } from '../components/ui/FoodCard';
import { EmptyState } from '../components/ui/States';
import { Utensils } from 'lucide-react';
import { MENU_CATEGORIES, MENU_ITEMS } from '../data/menu';
import { cn } from '../lib/utils';

export function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredItems =
    activeCategory === 'all'
      ? MENU_ITEMS
      : MENU_ITEMS.filter((item) => item.categoryId === activeCategory);

  return (
    <>
      <SEO
        title="Menu"
        description="Explore the full Lord Reigneth Foods menu — rice dishes, swallows, soups, proteins, sides, snacks and refreshing drinks. Authentic Nigerian food in Ijebu Ode."
        canonical="/menu"
        keywords="Nigerian food menu, jollof rice Ijebu Ode, pounded yam, egusi soup, peppered chicken, Nigerian snacks, zobo drink"
      />
      <BreadcrumbSchema items={[{ name: 'Menu', href: '/menu' }]} />

      <main id="main-content" className="pt-16 lg:pt-20">
        {/* Page Header */}
        <div className="bg-primary-800 py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              label="What We Serve"
              title="Our Menu"
              subtitle="Freshly prepared every day — authentic Nigerian meals made with care and quality ingredients."
              light
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="sticky top-16 lg:top-20 z-30 bg-white border-b border-cream-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none"
              role="tablist"
              aria-label="Menu categories"
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
              {MENU_CATEGORIES.map((cat) => (
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

        {/* Menu Grid */}
        <section className="bg-cream-100 py-12 lg:py-16" aria-live="polite" aria-label="Menu items">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filteredItems.length === 0 ? (
              <EmptyState
                icon={<Utensils className="w-12 h-12" />}
                title="No items found"
                description="We couldn't find any items in this category. Try selecting a different category."
              />
            ) : (
              <>
                <p className="text-charcoal-400 text-sm mb-8">
                  Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredItems.map((item) => (
                    <FoodCard key={item.id} item={item} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Note about prices */}
        <div className="bg-cream-200 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-charcoal-500 text-sm">
              For current pricing and availability, please{' '}
              <a href={`tel:+2347053357203`} className="text-primary-700 font-medium hover:underline">
                call us
              </a>{' '}
              or{' '}
              <a
                href="https://wa.me/2347053357203"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-700 font-medium hover:underline"
              >
                send us a WhatsApp message
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
