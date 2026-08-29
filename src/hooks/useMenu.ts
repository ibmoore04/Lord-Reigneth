// ============================================================
// useMenu — fetches menu categories and items from Supabase.
// Falls back gracefully if Supabase is not yet configured.
// ============================================================

import { useState, useEffect } from 'react';
import type { MenuItem, MenuCategory } from '../types/database';
import * as menuService from '../services/menuService';

export interface UseMenuReturn {
  categories: MenuCategory[];
  items: MenuItem[];
  featuredItems: MenuItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMenu(): UseMenuReturn {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      menuService.getMenuCategories(),
      menuService.getMenuItems(),
      menuService.getFeaturedItems(),
    ])
      .then(([cats, allItems, featured]) => {
        if (cancelled) return;
        setCategories(cats);
        setItems(allItems);
        setFeaturedItems(featured);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tick]);

  return {
    categories,
    items,
    featuredItems,
    loading,
    error,
    refetch: () => setTick((t) => t + 1),
  };
}

// Fetch items for a single category
export function useMenuCategory(categoryId: string | null) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryId) return;
    let cancelled = false;
    setLoading(true);

    menuService.getMenuItems(categoryId)
      .then((data) => { if (!cancelled) setItems(data); })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [categoryId]);

  return { items, loading, error };
}
