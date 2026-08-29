// ============================================================
// useLocations — fetches restaurant locations from Supabase.
// ============================================================

import { useState, useEffect } from 'react';
import type { Location } from '../types/database';
import * as locationService from '../services/locationService';

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    locationService.getLocations()
      .then((data) => { if (!cancelled) setLocations(data); })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { locations, loading, error };
}
