// ============================================================
// Catering Service
// ============================================================

import { supabase } from '../lib/supabase';
import type {
  CateringRequest,
  CateringRequestInsert,
  CateringRequestUpdate,
} from '../types/database';

// ── Submit catering enquiry (public) ─────────────────────
export async function submitCateringRequest(
  data: CateringRequestInsert,
): Promise<CateringRequest> {
  const { data: result, error } = await supabase
    .from('catering_requests')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return result;
}

// ── Admin: fetch all catering requests ────────────────────
export async function getCateringRequests(): Promise<CateringRequest[]> {
  const { data, error } = await supabase
    .from('catering_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Admin: update catering request status ─────────────────
export async function updateCateringRequest(
  id: string,
  updates: CateringRequestUpdate,
): Promise<CateringRequest> {
  const { data, error } = await supabase
    .from('catering_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Admin: get count of new requests ─────────────────────
export async function getNewCateringCount(): Promise<number> {
  const { count, error } = await supabase
    .from('catering_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new');

  if (error) throw new Error(error.message);
  return count ?? 0;
}
