import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import type { Location } from '../../types';
import { getTelLink } from '../../config/site';
import { cn } from '../../lib/utils';

interface LocationCardProps {
  location: Location;
  className?: string;
}

export function LocationCard({ location, className }: LocationCardProps) {
  return (
    <article
      className={cn(
        'bg-white rounded-xl p-6 lg:p-8',
        'shadow-[0_2px_16px_-4px_rgba(0,0,0,0.1)]',
        'hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.15)]',
        'transition-shadow duration-300',
        'border border-cream-200',
        location.isPrimary && 'border-primary-200 ring-1 ring-primary-100',
        className,
      )}
    >
      {location.isPrimary && (
        <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-primary-50 text-primary-700 rounded-full">
          Main Outlet
        </span>
      )}

      <h3 className="font-display font-bold text-2xl text-charcoal-800 mb-3">
        {location.name}
      </h3>

      <p className="text-charcoal-500 mb-5 leading-relaxed">{location.description}</p>

      <div className="space-y-3 mb-6">
        {location.address && (
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" aria-hidden="true" />
            <span className="text-charcoal-700 text-sm">{location.address}</span>
          </div>
        )}

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary-600 mt-0.5 shrink-0" aria-hidden="true" />
          <span className="text-charcoal-700 text-sm">{location.hours}</span>
        </div>

        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-primary-600 shrink-0" aria-hidden="true" />
          <a
            href={getTelLink()}
            className="text-primary-700 text-sm font-medium hover:underline"
          >
            {location.phone}
          </a>
        </div>
      </div>

      <a
        href={location.directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-2 px-5 py-2.5 rounded-md',
          'text-sm font-medium',
          'bg-primary-700 text-white',
          'hover:bg-primary-800 transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1',
        )}
      >
        <Navigation className="w-4 h-4" aria-hidden="true" />
        Get Directions
      </a>
    </article>
  );
}
