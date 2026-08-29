// ============================================================
// Auto-generated-style Supabase database types for Lord Reigneth Foods.
// Keep these in sync with supabase/migrations/*.sql.
// When you run `supabase gen types typescript`, replace this file.
// ============================================================

export type UserRole = 'customer' | 'staff' | 'admin';

export type OrderType = 'pickup' | 'delivery';
export type OrderSource = 'website' | 'whatsapp' | 'phone' | 'walk_in' | 'admin';
export type PaymentMethod = 'paystack' | 'cash_on_pickup' | 'cash_on_delivery' | 'whatsapp' | 'unpaid';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentGateway = 'paystack' | 'manual';

export type CateringStatus =
  | 'new'
  | 'contacted'
  | 'quoted'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type ContactStatus = 'unread' | 'read' | 'replied' | 'archived';

export type GalleryCategory =
  | 'food'
  | 'restaurant'
  | 'catering'
  | 'events'
  | 'behind_the_scenes';

export type NotificationType =
  | 'order_created'
  | 'order_confirmed'
  | 'order_preparing'
  | 'order_ready'
  | 'order_completed'
  | 'catering_update'
  | 'system';

// ─────────────────── Tables ────────────────────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      menu_categories: {
        Row: MenuCategory;
        Insert: MenuCategoryInsert;
        Update: MenuCategoryUpdate;
      };
      menu_items: {
        Row: MenuItem;
        Insert: MenuItemInsert;
        Update: MenuItemUpdate;
      };
      locations: {
        Row: Location;
        Insert: LocationInsert;
        Update: LocationUpdate;
      };
      location_menu_items: {
        Row: LocationMenuItem;
        Insert: LocationMenuItemInsert;
        Update: LocationMenuItemUpdate;
      };
      business_hours: {
        Row: BusinessHours;
        Insert: BusinessHoursInsert;
        Update: BusinessHoursUpdate;
      };
      orders: {
        Row: Order;
        Insert: OrderInsert;
        Update: OrderUpdate;
      };
      order_items: {
        Row: OrderItem;
        Insert: OrderItemInsert;
        Update: OrderItemUpdate;
      };
      payment_transactions: {
        Row: PaymentTransaction;
        Insert: PaymentTransactionInsert;
        Update: PaymentTransactionUpdate;
      };
      catering_requests: {
        Row: CateringRequest;
        Insert: CateringRequestInsert;
        Update: CateringRequestUpdate;
      };
      contact_messages: {
        Row: ContactMessage;
        Insert: ContactMessageInsert;
        Update: ContactMessageUpdate;
      };
      newsletter_subscribers: {
        Row: NewsletterSubscriber;
        Insert: NewsletterSubscriberInsert;
        Update: NewsletterSubscriberUpdate;
      };
      gallery_items: {
        Row: GalleryItem;
        Insert: GalleryItemInsert;
        Update: GalleryItemUpdate;
      };
      testimonials: {
        Row: Testimonial;
        Insert: TestimonialInsert;
        Update: TestimonialUpdate;
      };
      site_settings: {
        Row: SiteSetting;
        Insert: SiteSettingInsert;
        Update: SiteSettingUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: AuditLogInsert;
        Update: AuditLogUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: {
      generate_order_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      create_order: {
        Args: CreateOrderArgs;
        Returns: CreateOrderResult;   // jsonb — changed in migration 006
      };
      create_staff_whatsapp_order: {
        Args: {
          p_order_type: OrderType;
          p_payment_method: PaymentMethod;
          p_customer_name: string;
          p_customer_phone: string;
          p_customer_email: string | null;
          p_delivery_address: string | null;
          p_delivery_landmark: string | null;
          p_customer_notes: string | null;
          p_items: Array<{ menu_item_id: string; quantity: number; special_request?: string | null }>;
        };
        Returns: CreateOrderResult;
      };
      track_order_by_number: {
        Args: { p_order_number: string; p_phone: string };
        Returns: Record<string, unknown>;
      };
      is_location_open: {
        Args: { p_location_id: string };
        Returns: boolean;
      };
      get_staff_location_id: {
        Args: { p_user_id: string };
        Returns: string | null;
      };
      get_user_role: {
        Args: { user_id: string };
        Returns: UserRole;
      };
      auth_user_role: {
        Args: Record<string, never>;
        Returns: UserRole;
      };
    };
    Enums: {
      user_role: UserRole;
      order_type: OrderType;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      catering_status: CateringStatus;
      contact_status: ContactStatus;
      gallery_category: GalleryCategory;
      notification_type: NotificationType;
      order_source: OrderSource;
      payment_method: PaymentMethod;
    };
  };
}

// ─────────────────── Profile ───────────────────

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  location_id: string | null; // null for customers & admins; required for staff
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'role' | 'location_id'>>;

// ─────────────────── Location Menu Item (outlet availability) ───────────────────

export interface LocationMenuItem {
  id: string;
  location_id: string;
  menu_item_id: string;
  is_available: boolean;
  updated_at: string;
  updated_by: string | null;
}
export type LocationMenuItemInsert = Omit<LocationMenuItem, 'id' | 'updated_at'>;
export type LocationMenuItemUpdate = Pick<LocationMenuItem, 'is_available' | 'updated_by'>;

// ─────────────────── Menu Category ───────────────────

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type MenuCategoryInsert = Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>;
export type MenuCategoryUpdate = Partial<MenuCategoryInsert>;

// ─────────────────── Menu Item ───────────────────

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  preparation_time: number | null; // minutes
  display_order: number;
  created_at: string;
  updated_at: string;
}
export type MenuItemInsert = Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>;
export type MenuItemUpdate = Partial<MenuItemInsert>;

// ─────────────────── Location ───────────────────

export interface Location {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  description: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_time: string | null; // HH:MM
  closing_time: string | null;
  is_open: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
export type LocationInsert = Omit<Location, 'id' | 'created_at' | 'updated_at'>;
export type LocationUpdate = Partial<LocationInsert>;

// ─────────────────── Business Hours ───────────────────

export interface BusinessHours {
  id: string;
  location_id: string;
  day_of_week: number; // 0 = Sunday … 6 = Saturday
  opening_time: string | null;
  closing_time: string | null;
  is_closed: boolean;
}
export type BusinessHoursInsert = Omit<BusinessHours, 'id'>;
export type BusinessHoursUpdate = Partial<BusinessHoursInsert>;

// ─────────────────── Order ───────────────────

export interface Order {
  id: string;
  customer_id: string | null;
  location_id: string | null;
  order_number: string;
  order_type: OrderType;
  order_source: OrderSource;
  payment_method: PaymentMethod;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_address: string | null;
  delivery_landmark: string | null;
  customer_notes: string | null;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}
export type OrderInsert = Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>;
export type OrderUpdate = Partial<Omit<Order, 'id' | 'order_number' | 'created_at'>>;

// ─────────────────── Order Item ───────────────────

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;  // snapshot at time of purchase
  unit_price: number; // snapshot at time of purchase
  quantity: number;
  subtotal: number;
  special_request: string | null;
  created_at: string;
}
export type OrderItemInsert = Omit<OrderItem, 'id' | 'created_at'>;
export type OrderItemUpdate = Partial<Pick<OrderItem, 'quantity' | 'special_request'>>;

// ─────────────────── Payment Transaction ───────────────────

export interface PaymentTransaction {
  id: string;
  order_id: string;
  customer_id: string | null;
  reference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway: PaymentGateway;
  gateway_response: Record<string, unknown> | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}
export type PaymentTransactionInsert = Omit<
  PaymentTransaction,
  'id' | 'created_at' | 'updated_at'
>;
export type PaymentTransactionUpdate = Partial<
  Pick<PaymentTransaction, 'status' | 'gateway_response' | 'paid_at'>
>;

// ─────────────────── Catering Request ───────────────────

export interface CateringRequest {
  id: string;
  name: string;
  phone: string;
  email: string;
  event_type: string;
  event_date: string;
  guest_count: number;
  event_location: string;
  message: string | null;
  status: CateringStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}
export type CateringRequestInsert = Omit<
  CateringRequest,
  'id' | 'status' | 'admin_notes' | 'created_at' | 'updated_at'
>;
export type CateringRequestUpdate = Partial<
  Pick<CateringRequest, 'status' | 'admin_notes'>
>;

// ─────────────────── Contact Message ───────────────────

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  created_at: string;
}
export type ContactMessageInsert = Omit<ContactMessage, 'id' | 'status' | 'created_at'>;
export type ContactMessageUpdate = Partial<Pick<ContactMessage, 'status'>>;

// ─────────────────── Newsletter ───────────────────

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
  source: string | null;
}
export type NewsletterSubscriberInsert = Omit<
  NewsletterSubscriber,
  'id' | 'subscribed_at' | 'is_active'
>;
export type NewsletterSubscriberUpdate = Partial<Pick<NewsletterSubscriber, 'is_active'>>;

// ─────────────────── Gallery Item ───────────────────

export interface GalleryItem {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  category: GalleryCategory;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export type GalleryItemInsert = Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'>;
export type GalleryItemUpdate = Partial<GalleryItemInsert>;

// ─────────────────── Testimonial ───────────────────

export interface Testimonial {
  id: string;
  customer_name: string;
  content: string;
  rating: number | null; // 1–5
  image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
export type TestimonialInsert = Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>;
export type TestimonialUpdate = Partial<TestimonialInsert>;

// ─────────────────── Site Setting ───────────────────

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  updated_at: string;
}
export type SiteSettingInsert = Omit<SiteSetting, 'id' | 'updated_at'>;
export type SiteSettingUpdate = Pick<SiteSetting, 'value'>;

// ─────────────────── Notification ───────────────────

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}
export type NotificationInsert = Omit<Notification, 'id' | 'is_read' | 'created_at'>;
export type NotificationUpdate = Pick<Notification, 'is_read'>;

// ─────────────────── Audit Log ───────────────────

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}
export type AuditLogInsert = Omit<AuditLog, 'id' | 'created_at'>;
export type AuditLogUpdate = never; // audit logs are append-only — no updates

// ─────────────────── Function Args ───────────────────

export interface CreateOrderArgs {
  p_customer_id: string | null;
  p_location_id: string | null;
  p_order_type: OrderType;
  p_order_source: OrderSource;
  p_payment_method: PaymentMethod;
  p_customer_name: string;
  p_customer_phone: string;
  p_customer_email: string | null;
  p_delivery_address: string | null;
  p_delivery_landmark: string | null;
  p_customer_notes: string | null;
  p_items: Array<{
    menu_item_id: string;
    quantity: number;
    special_request?: string;
  }>;
}

export interface CreateOrderResult {
  order_id: string;
  order_number: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
}

// ─────────────────── Cart (client-side only) ───────────────────

export interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  special_request?: string;
}
