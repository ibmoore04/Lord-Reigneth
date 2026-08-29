// ============================================================
// TypeScript interfaces for all major data entities.
// Mirror these as Supabase table columns when backend is added.
// ============================================================

// ─────────────────── Menu ───────────────────

export type MenuCategoryId =
  | 'rice'
  | 'swallow'
  | 'soups'
  | 'proteins'
  | 'sides'
  | 'snacks'
  | 'drinks';

export interface MenuCategory {
  id: MenuCategoryId;
  label: string;
  description: string;
  icon: string; // Lucide icon name
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  categoryId: MenuCategoryId;
  image?: string; // path to local asset or future Supabase URL
  featured?: boolean; // shows on homepage "Customer Favorites"
  available?: boolean; // defaults true — can be toggled later
  // price is intentionally omitted until real prices are provided
}

// ─────────────────── Locations ───────────────────

export interface Location {
  id: string;
  name: string;
  description: string;
  address?: string;
  areaDescription: string;
  phone: string;
  hours: string;
  directionsUrl: string; // Google Maps-compatible URL
  isPrimary?: boolean;
}

// ─────────────────── Gallery ───────────────────

export type GalleryCategoryId =
  | 'food'
  | 'restaurant'
  | 'catering'
  | 'events'
  | 'behind-the-scenes';

export interface GalleryCategory {
  id: GalleryCategoryId;
  label: string;
}

export interface GalleryItem {
  id: string;
  src: string;
  alt: string;
  categoryId: GalleryCategoryId;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  caption?: string;
}

// ─────────────────── Catering ───────────────────

export type EventType =
  | 'wedding'
  | 'birthday'
  | 'corporate'
  | 'party'
  | 'celebration'
  | 'milestone'
  | 'other';

export interface CateringEnquiry {
  fullName: string;
  phone: string;
  email: string;
  eventType: EventType;
  eventDate: string;
  numberOfGuests: string;
  eventLocation: string;
  additionalInfo?: string;
}

// ─────────────────── Contact ───────────────────

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// ─────────────────── UI Helpers ───────────────────

export interface NavItem {
  label: string;
  href: string;
}

export interface TrustHighlight {
  icon: string;
  title: string;
  description: string;
}
