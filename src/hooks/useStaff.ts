// ============================================================
// useStaff — staff dashboard hooks.
// All data is automatically scoped to the staff's outlet via RLS.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import type { Location } from '../types/database';
import { getLocations } from '../services/locationService';
import {
  getOutletOrders,
  getOutletStats,
  subscribeToOutletOrders,
} from '../services/staffService';
import type { Order } from '../types/database';

// ── Staff's assigned outlet ────────────────────────────────
export function useStaffOutlet() {
  const { profile } = useAuthContext();
  const [outlet, setOutlet] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.location_id) { setLoading(false); return; }

    let cancelled = false;
    getLocations()
      .then((locs) => {
        if (cancelled) return;
        const found = locs.find((l) => l.id === profile.location_id) ?? null;
        setOutlet(found);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [profile?.location_id]);

  return { outlet, loading };
}

// ── Staff outlet stats ─────────────────────────────────────
export function useOutletStats() {
  const { profile } = useAuthContext();
  const [stats, setStats] = useState({
    total: 0, pending: 0, confirmed: 0,
    preparing: 0, ready: 0, delivery: 0, completed: 0,
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    // RLS ensures staff only get their outlet's data
    getOutletStats(profile?.location_id ?? undefined)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [profile?.location_id]);

  useEffect(() => { load(); }, [load]);

  return { stats, loading, refetch: load };
}

// ── Staff active orders with realtime ─────────────────────
export function useOutletOrders(activeOnly = false) {
  const { profile } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  const locationId = profile?.location_id;

  const load = useCallback(() => {
    setLoading(true);
    getOutletOrders({ locationId: locationId ?? undefined, activeOnly })
      .then((data) => setOrders(data as Order[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [locationId, activeOnly]);

  useEffect(() => { load(); }, [load]);

  // Realtime subscription — filtered to this outlet only
  useEffect(() => {
    if (!locationId) return;

    const unsub = subscribeToOutletOrders(
      locationId,
      (newOrder) => {
        setOrders((prev) => {
          if (prev.some((o) => o.id === (newOrder as Order).id)) return prev;
          return [newOrder as Order, ...prev];
        });
        setNewOrderAlert(true);
        // Auto-dismiss alert after 8 seconds
        setTimeout(() => setNewOrderAlert(false), 8000);
      },
      (updated) => {
        setOrders((prev) =>
          prev.map((o) => o.id === (updated as Order).id ? { ...o, ...(updated as Order) } : o),
        );
      },
    );

    return unsub;
  }, [locationId]);

  return { orders, loading, newOrderAlert, dismissAlert: () => setNewOrderAlert(false), refetch: load };
}
