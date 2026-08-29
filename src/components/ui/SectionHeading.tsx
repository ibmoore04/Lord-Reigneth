import { cn } from '../../lib/utils';

interface SectionHeadingProps {
  id?: string;            // for aria-labelledby references
  label?: string;         // small overline label
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;        // for dark backgrounds
  className?: string;
}

export function SectionHeading({
  id,
  label,
  title,
  subtitle,
  align = 'center',
  light = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {label && (
        <p
          className={cn(
            'text-sm font-semibold tracking-widest uppercase mb-3',
            light ? 'text-gold-400' : 'text-gold-500',
          )}
        >
          {label}
        </p>
      )}
      <h2
        id={id}
        className={cn(
          'font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4',
          light ? 'text-white' : 'text-charcoal-800',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'text-base sm:text-lg leading-relaxed',
            light ? 'text-white/75' : 'text-charcoal-500',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
