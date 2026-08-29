import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '../../config/site';
import { cn } from '../../lib/utils';

interface WhatsAppButtonProps {
  message?: string;
  label?: string;
  variant?: 'floating' | 'inline';
  className?: string;
}

export function WhatsAppButton({
  message,
  label = 'Order on WhatsApp',
  variant = 'floating',
  className,
}: WhatsAppButtonProps) {
  const href = getWhatsAppLink(message);

  if (variant === 'floating') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'flex items-center justify-center',
          'w-14 h-14 rounded-full',
          'bg-[#25D366] text-white shadow-lg',
          'hover:bg-[#1ebe5e] hover:scale-110',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2',
          className,
        )}
      >
        <MessageCircle className="w-7 h-7" aria-hidden="true" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-2.5 px-6 py-3 rounded-md font-medium',
        'bg-[#25D366] text-white',
        'hover:bg-[#1ebe5e] transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2',
        className,
      )}
    >
      <MessageCircle className="w-5 h-5" aria-hidden="true" />
      {label}
    </a>
  );
}
