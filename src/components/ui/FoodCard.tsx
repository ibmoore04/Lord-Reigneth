// ============================================================
// FoodCard — used on the homepage and /menu page.
// Items here come from static data (no prices).
// "Order Now" navigates to /order and pre-filters to this item
// so the customer can add it to cart with the real price.
// ============================================================

import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ImageOff } from 'lucide-react';
import { useState } from 'react';
import type { MenuItem } from '../../types';
import { cn } from '../../lib/utils';

interface FoodCardProps {
  item: MenuItem;
  className?: string;
}

export function FoodCard({ item, className }: FoodCardProps) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  function handleOrderNow() {
    // Navigate to the order page and pass a search query so the item
    // is highlighted/filtered for the customer immediately.
    navigate(`/order?q=${encodeURIComponent(item.name)}`);
  }

  return (
    <article
      className={cn(
        'group bg-white rounded-xl overflow-hidden',
        'shadow-[0_2px_16px_-4px_rgba(0,0,0,0.1)]',
        'hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)]',
        'transition-shadow duration-300',
        'flex flex-col',
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-200 shrink-0">
        {item.image && !imgError ? (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-charcoal-300">
            <ImageOff className="w-10 h-10" aria-hidden="true" />
            <span className="text-xs text-charcoal-400">Photo coming soon</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-display font-semibold text-lg text-charcoal-800 mb-2 leading-snug">
          {item.name}
        </h3>
        <p className="text-sm text-charcoal-500 leading-relaxed flex-1 mb-4">
          {item.description}
        </p>

        <button
          type="button"
          onClick={handleOrderNow}
          className={cn(
            'inline-flex items-center justify-center gap-2',
            'w-full px-4 py-2.5 rounded-md',
            'text-sm font-medium',
            'bg-primary-700 text-white',
            'hover:bg-primary-800 transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
          )}
        >
          <ShoppingBag className="w-4 h-4" aria-hidden="true" />
          Order Now
        </button>
      </div>
    </article>
  );
}
