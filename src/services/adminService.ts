// ============================================================
// Admin Service — analytics, settings, audit, testimonials.
// All functions require admin role (enforced by RLS).
// ============================================================

import { supabase } from '../lib/supabase';
import type {
  SiteSetting,
  Testimonial,
  TestimonialInsert,
  TestimonialUpdate,
  AuditLogInsert,
  Profile,
} from '../types/database';

// ─────────────────── Dashboard Analytics ─────────────────

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  newCateringRequests: number;
  unreadMessages: number;
  totalCustomers: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0];

  const [ordersToday, pending, completed, catering, messages, customers] =
    await Promise.all([
      supabase
        .from('orders')
        .select('id, total', { count: 'exact' })
        .gte('created_at', `${today}T00:00:00`),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'completed'),
      supabase
        .from('catering_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
      supabase
        .from('contact_messages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'unread'),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'customer'),
    ]);

  const todayRevenue = (ordersToday.data ?? []).reduce(
    (sum, o) => sum + (o.total ?? 0),
    0,
  );

  return {
    todayOrders: ordersToday.count ?? 0,
    todayRevenue,
    pendingOrders: pending.count ?? 0,
    completedOrders: completed.count ?? 0,
    newCateringRequests: catering.count ?? 0,
    unreadMessages: messages.count ?? 0,
    totalCustomers: customers.count ?? 0,
  };
}

// ─────────────────── Site Settings ───────────────────────

export async function getSiteSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');

  if (error) throw new Error(error.message);

  return (data ?? []).reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value ?? '';
    return acc;
  }, {});
}

export async function updateSiteSetting(
  key: string,
  value: string,
): Promise<SiteSetting> {
  const { data, error } = await supabase
    .from('site_settings')
    .update({ value })
    .eq('key', key)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─────────────────── Testimonials ────────────────────────

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createTestimonial(
  testimonial: TestimonialInsert,
): Promise<Testimonial> {
  const { data, error } = await supabase
    .from('testimonials')
    .insert(testimonial)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateTestimonial(
  id: string,
  updates: TestimonialUpdate,
): Promise<Testimonial> {
  const { data, error } = await supabase
    .from('testimonials')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─────────────────── Customer Management ─────────────────

export async function getCustomers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateUserRole(
  userId: string,
  role: 'customer' | 'staff' | 'admin',
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId);

  if (error) throw new Error(error.message);
}

// ─────────────────── Audit Log ───────────────────────────

export async function writeAuditLog(entry: AuditLogInsert): Promise<void> {
  // Uses service-role in a real setup; here we insert as authenticated admin.
  const { error } = await supabase.from('audit_logs').insert(entry);
  // Audit failures are non-fatal — log but don't throw.
  if (error) console.error('[AuditLog] Failed to write:', error.message);
}
