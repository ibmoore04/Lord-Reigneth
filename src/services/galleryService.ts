// ============================================================
// Gallery Service
// ============================================================

import { supabase } from '../lib/supabase';
import type {
  GalleryItem,
  GalleryItemInsert,
  GalleryItemUpdate,
  GalleryCategory,
} from '../types/database';

// ── Fetch active gallery items (public) ───────────────────
export async function getGalleryItems(
  category?: GalleryCategory,
): Promise<GalleryItem[]> {
  let query = supabase
    .from('gallery_items')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Fetch featured gallery items ──────────────────────────
export async function getFeaturedGalleryItems(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('display_order')
    .limit(12);

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Admin: fetch all gallery items ───────────────────────
export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('display_order');

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Admin: create gallery item ───────────────────────────
export async function createGalleryItem(
  item: GalleryItemInsert,
): Promise<GalleryItem> {
  const { data, error } = await supabase
    .from('gallery_items')
    .insert(item)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Admin: update gallery item ───────────────────────────
export async function updateGalleryItem(
  id: string,
  updates: GalleryItemUpdate,
): Promise<GalleryItem> {
  const { data, error } = await supabase
    .from('gallery_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Admin: soft delete ────────────────────────────────────
export async function softDeleteGalleryItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('gallery_items')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ── Admin: upload gallery image ───────────────────────────
export async function uploadGalleryImage(
  file: File,
  filename?: string,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${filename ?? Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('gallery-images')
    .upload(path, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('gallery-images').getPublicUrl(path);
  return data.publicUrl;
}
