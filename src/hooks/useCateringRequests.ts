// ============================================================
// useCateringRequests — admin hook for catering requests.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type { CateringRequest, CateringRequestUpdate } from '../types/database';
import * as cateringService from '../services/cateringService';

export function useCateringRequests() {
  const [requests, setRequests] = useState<CateringRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    cateringService.getCateringRequests()
      .then(setRequests)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = useCallback(
    async (id: string, updates: CateringRequestUpdate) => {
      const updated = await cateringService.updateCateringRequest(id, updates);
      setRequests((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return updated;
    },
    [],
  );

  return { requests, loading, error, update, refetch: load };
}
