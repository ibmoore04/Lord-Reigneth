import { AdminLayout } from './AdminLayout';
import { useCateringRequests } from '../../hooks/useCateringRequests';
import { LoadingState, EmptyState } from '../../components/ui/States';
import { CalendarHeart } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CateringStatus } from '../../types/database';

const STATUS_COLORS: Record<CateringStatus, string> = {
  new:       'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  quoted:    'bg-purple-100 text-purple-800',
  confirmed: 'bg-green-100 text-green-800',
  completed: 'bg-charcoal-100 text-charcoal-700',
  cancelled: 'bg-red-100 text-red-700',
};

const NEXT: Partial<Record<CateringStatus, CateringStatus>> = {
  new: 'contacted', contacted: 'quoted', quoted: 'confirmed', confirmed: 'completed',
};

export function AdminCateringPage() {
  const { requests, loading, update } = useCateringRequests();

  return (
    <AdminLayout>
      <h1 className="font-display font-bold text-2xl text-charcoal-800 mb-6">Catering Requests</h1>

      {loading ? (
        <LoadingState message="Loading requests…" />
      ) : requests.length === 0 ? (
        <EmptyState icon={<CalendarHeart className="w-10 h-10" />} title="No catering requests yet" />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl border border-charcoal-100 p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-semibold text-charcoal-800">{req.name}</h3>
                  <p className="text-sm text-charcoal-500">{req.email} · {req.phone}</p>
                </div>
                <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', STATUS_COLORS[req.status])}>
                  {req.status}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div><span className="text-charcoal-400 text-xs block">Event</span>{req.event_type}</div>
                <div><span className="text-charcoal-400 text-xs block">Date</span>{new Date(req.event_date).toLocaleDateString('en-NG')}</div>
                <div><span className="text-charcoal-400 text-xs block">Guests</span>{req.guest_count}</div>
                <div><span className="text-charcoal-400 text-xs block">Location</span>{req.event_location}</div>
              </div>
              {req.message && (
                <p className="mt-3 text-sm text-charcoal-600 bg-cream-50 rounded-lg p-3">{req.message}</p>
              )}
              {NEXT[req.status] && (
                <button type="button"
                  onClick={() => update(req.id, { status: NEXT[req.status] })}
                  className="mt-3 px-4 py-1.5 rounded-md bg-primary-700 text-white text-xs font-medium hover:bg-primary-800 capitalize">
                  Mark as {NEXT[req.status]}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
