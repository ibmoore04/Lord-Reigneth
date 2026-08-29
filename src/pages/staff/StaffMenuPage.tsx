import { useState, useEffect } from 'react';
import { StaffLayout } from './StaffLayout';
import { useStaffOutlet } from '../../hooks/useStaff';
import { useAuthContext } from '../../context/AuthContext';
import { getMenuWithOutletAvailability, setOutletItemAvailability } from '../../services/staffService';
import { LoadingState, EmptyState } from '../../components/ui/States';
import type { MenuItem } from '../../types/database';
import { UtensilsCrossed, ToggleLeft, ToggleRight } from 'lucide-react';
import { cn } from '../../lib/utils';

type MenuItemWithOutlet = MenuItem & { outlet_available: boolean };

export function StaffMenuPage() {
  const { profile } = useAuthContext();
  const { outlet } = useStaffOutlet();
  const [items,    setItems]    = useState<MenuItemWithOutlet[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const locationId = profile?.location_id;

  useEffect(() => {
    if (!locationId) { setLoading(false); return; }
    setLoading(true);
    getMenuWithOutletAvailability(locationId)
      .then((data) => setItems(data as MenuItemWithOutlet[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [locationId]);

  async function toggle(item: MenuItemWithOutlet) {
    if (!locationId || !profile?.id) return;
    setUpdating(item.id);
    try {
      const newAvail = !item.outlet_available;
      await setOutletItemAvailability(locationId, item.id, newAvail, profile.id);
      setItems((prev) =>
        prev.map((i) => i.id === item.id ? { ...i, outlet_available: newAvail } : i),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  }

  return (
    <StaffLayout outletName={outlet?.name}>
      <div className="mb-5">
        <h1 className="font-display font-bold text-2xl text-charcoal-800">Menu Availability</h1>
        <p className="text-charcoal-500 text-sm mt-0.5">
          Changes apply to <span className="font-semibold">{outlet?.name ?? 'your outlet'}</span> only.
        </p>
      </div>

      {loading ? (
        <LoadingState message="Loading menu…" />
      ) : items.length === 0 ? (
        <EmptyState icon={<UtensilsCrossed className="w-10 h-10" />} title="No menu items" />
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const isUpdating = updating === item.id;
            const available  = item.outlet_available;

            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center justify-between gap-4 bg-white rounded-xl border px-4 py-4 transition-colors',
                  available ? 'border-charcoal-100' : 'border-red-100 bg-red-50/30',
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className={cn('font-medium text-sm', available ? 'text-charcoal-800' : 'text-charcoal-500')}>
                    {item.name}
                  </p>
                  {!available && (
                    <span className="inline-block mt-0.5 text-xs text-red-600 font-semibold">
                      SOLD OUT
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => toggle(item)}
                  aria-label={available ? `Mark ${item.name} unavailable` : `Mark ${item.name} available`}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                    isUpdating && 'opacity-50 cursor-not-allowed',
                    available
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                      : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200',
                  )}
                >
                  {isUpdating ? (
                    '…'
                  ) : available ? (
                    <><ToggleRight className="w-4 h-4" /> Mark Unavailable</>
                  ) : (
                    <><ToggleLeft className="w-4 h-4" /> Mark Available</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </StaffLayout>
  );
}
