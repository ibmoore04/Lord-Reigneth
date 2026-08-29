// ============================================================
// Menu Service — all menu & category operations.
// ============================================================

import { supabase } from '../lib/supabase';
import type { MenuItem, MenuCategory, MenuItemInsert, MenuItemUpdate, MenuCategoryInsert, MenuCategoryUpdate } from '../types/database';

// ── Fetch all active categories ───────────────────────────
export async function getMenuCategories(): Promise<MenuCategory[]> {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Fetch all available menu items ───────────────────────
export async function getMenuItems(categoryId?: string): Promise<MenuItem[]> {
  let query = supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .order('display_order');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Fetch featured items (homepage) ──────────────────────
export async function getFeaturedItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_featured', true)
    .eq('is_available', true)
    .order('display_order')
    .limit(9);

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Fetch single item ─────────────────────────────────────
export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data;
}

// ── Admin: get all items (including unavailable) ──────────
export async function getAllMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, menu_categories(name, slug)')
    .order('category_id')
    .order('display_order');

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Admin: create item ────────────────────────────────────
export async function createMenuItem(item: MenuItemInsert): Promise<MenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert(item)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Admin: update item ────────────────────────────────────
export async function updateMenuItem(id: string, updates: MenuItemUpdate): Promise<MenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Admin: soft delete (mark unavailable) ─────────────────
export async function softDeleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .update({ is_available: false })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ── Admin: upload food image ──────────────────────────────
export async function uploadFoodImage(itemId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${itemId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('food-images')
    .upload(path, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('food-images').getPublicUrl(path);
  return data.publicUrl;
}

// ── Admin: create category ────────────────────────────────
export async function createMenuCategory(cat: MenuCategoryInsert): Promise<MenuCategory> {
  const { data, error } = await supabase
    .from('menu_categories')
    .insert(cat)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Admin: update category ────────────────────────────────
export async function updateMenuCategory(id: string, updates: MenuCategoryUpdate): Promise<MenuCategory> {
  const { data, error } = await supabase
    .from('menu_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Validate cart items against real DB prices ────────────
export async function validateCartItems(
  itemIds: string[],
): Promise<Pick<MenuItem, 'id' | 'name' | 'price' | 'is_available'>[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, price, is_available')
    .in('id', itemIds);

  if (error) throw new Error(error.message);
  return data ?? [];
}
