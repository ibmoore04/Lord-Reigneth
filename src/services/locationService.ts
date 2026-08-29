// ============================================================
// Location Service
// ============================================================

import { supabase } from '../lib/supabase';
import type {
  Location,
  BusinessHours,
  LocationInsert,
  LocationUpdate,
} from '../types/database';

export interface LocationWithHours extends Location {
  business_hours: BusinessHours[];
}

// ── Fetch active locations (public) ──────────────────────
export async function getLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_open', true)
    .order('display_order');

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Fetch locations with business hours ───────────────────
export async function getLocationsWithHours(): Promise<LocationWithHours[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*, business_hours(*)')
    .eq('is_open', true)
    .order('display_order');

  if (error) throw new Error(error.message);
  return (data ?? []) as LocationWithHours[];
}

// ── Check if a location is currently open ─────────────────
export async function isLocationOpen(locationId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_location_open', {
    p_location_id: locationId,
  });

  if (error) return false;
  return data as boolean;
}

// ── Get business hours for a location ─────────────────────
export async function getBusinessHours(locationId: string): Promise<BusinessHours[]> {
  const { data, error } = await supabase
    .from('business_hours')
    .select('*')
    .eq('location_id', locationId)
    .order('day_of_week');

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Admin: fetch all locations ────────────────────────────
export async function getAllLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('display_order');

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Admin: create location ────────────────────────────────
export async function createLocation(loc: LocationInsert): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .insert(loc)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Admin: update location ────────────────────────────────
export async function updateLocation(
  id: string,
  updates: LocationUpdate,
): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
