import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label="Scroll back to top"
      className={cn(
        'fixed bottom-24 right-6 z-40',
        'flex items-center justify-center',
        'w-10 h-10 rounded-full',
        'bg-primary-700 text-white shadow-md',
        'hover:bg-primary-800 transition-all duration-300',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
      )}
    >
      <ChevronUp className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}
