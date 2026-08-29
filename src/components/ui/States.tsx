import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading…', className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-label={message}
      className={cn('flex flex-col items-center justify-center gap-3 py-16', className)}
    >
      <Loader2 className="w-8 h-8 text-primary-600 animate-spin" aria-hidden="true" />
      <p className="text-charcoal-500 text-sm">{message}</p>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}
    >
      {icon && <div className="text-charcoal-300 mb-2">{icon}</div>}
      <h3 className="font-display font-semibold text-xl text-charcoal-700">{title}</h3>
      {description && <p className="text-charcoal-500 text-sm max-w-md">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again or contact us if the problem persists.',
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className,
      )}
    >
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <span className="text-red-500 text-2xl" aria-hidden="true">!</span>
      </div>
      <h3 className="font-display font-semibold text-xl text-charcoal-700">{title}</h3>
      <p className="text-charcoal-500 text-sm max-w-md">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
