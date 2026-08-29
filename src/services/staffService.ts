// ============================================================
// Staff Service — staff management and outlet-menu operations.
// Admin-only operations (creating staff, assigning outlets)
// are kept separate from order operations.
// ============================================================

import { supabase } from '../lib/supabase';
import type {
  Profile,
  ProfileInsert,
  LocationMenuItem,
  LocationMenuItemInsert,
  MenuItem,
  CreateOrderResult,
  OrderType,
  PaymentMethod,
  CartItem,
} from '../types/database';

// ─────────────────── Staff profile helpers ────────────────

/** Get the authenticated staff member's own profile (includes location_id). */
export async function getMyStaffProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/** Admin: fetch all staff profiles (with their location info). */
export async function getAllStaff(): Promise<(Profile & { locations: { name: string } | null })[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, locations(name)')
    .eq('role', 'staff')
    .order('full_name');

  if (error) throw new Error(error.message);
  return (data ?? []) as (Profile & { locations: { name: string } | null })[];
}

/** Admin: fetch staff for a specific outlet. */
export async function getStaffByLocation(locationId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'staff')
    .eq('location_id', locationId)
    .order('full_name');

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Admin: create a new staff profile directly (no invite email yet). */
export async function createStaffProfile(
  staffData: Pick<ProfileInsert, 'email' | 'full_name' | 'phone' | 'location_id'>,
): Promise<Profile> {
  // Step 1: Create auth user via admin API
  // NOTE: This requires the Supabase service role key — only run server-side.
  // For the frontend-only flow, we insert the profile record and the
  // handle_new_user trigger fills it in after signup.
  // Until Edge Functions are set up, admins create staff by:
  //   1. Having the staff member sign up normally
  //   2. Then using updateStaffProfile to assign role=staff + location_id
  // This function is a placeholder for the full invitation flow.
  throw new Error(
    'Direct staff creation requires a server-side Edge Function with service role. ' +
    'Use the invite workflow: Admin → Staff → Invite. ' +
    'See supabase/README.md for setup instructions.',
  );

  // When Edge Function is ready, the flow will be:
  // 1. supabase.auth.admin.createUser({ email, password: tempPw })
  // 2. supabase.from('profiles').update({ role:'staff', location_id, full_name, phone })
  //    .eq('id', newUser.id)
  // 3. Send password-reset email so staff can set their own password

  void staffData; // suppress unused warning until implemented
}

/** Admin: update a staff member's profile (role, outlet, active status). */
export async function updateStaffProfile(
  staffId: string,
  updates: {
    full_name?: string;
    phone?: string;
    location_id?: string | null;
    is_active?: boolean;
    role?: 'staff' | 'customer';
  },
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', staffId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Admin: deactivate a staff account. */
export async function deactivateStaff(staffId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', staffId);

  if (error) throw new Error(error.message);
}

/** Admin: reactivate a staff account. */
export async function reactivateStaff(staffId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: true })
    .eq('id', staffId);

  if (error) throw new Error(error.message);
}

// ─────────────────── Outlet-scoped orders ─────────────────

/**
 * Fetch orders for a specific outlet (used by staff).
 * RLS enforces that staff only receive their outlet's orders.
 */
export async function getOutletOrders(options?: {
  locationId?: string;
  activeOnly?: boolean;
  limit?: number;
}) {
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (options?.locationId) {
    query = query.eq('location_id', options.locationId);
  }

  if (options?.activeOnly) {
    query = query.in('status', ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery']);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Fetch today's orders for an outlet. */
export async function getOutletTodayOrders(locationId?: string) {
  const today = new Date().toISOString().split('T')[0];
  let query = supabase
    .from('orders')
    .select('*, order_items(*)')
    .gte('created_at', `${today}T00:00:00`)
    .order('created_at', { ascending: false });

  if (locationId) query = query.eq('location_id', locationId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Staff outlet stats — counts per status for today. */
export async function getOutletStats(locationId?: string) {
  const today = new Date().toISOString().split('T')[0];

  const baseQuery = () => {
    let q = supabase
      .from('orders')
      .select('id, status', { count: 'exact' })
      .gte('created_at', `${today}T00:00:00`);
    if (locationId) q = q.eq('location_id', locationId);
    return q;
  };

  const [all, pending, confirmed, preparing, ready, delivery, completed] = await Promise.all([
    baseQuery(),
    baseQuery().eq('status', 'pending'),
    baseQuery().eq('status', 'confirmed'),
    baseQuery().eq('status', 'preparing'),
    baseQuery().eq('status', 'ready'),
    baseQuery().eq('status', 'out_for_delivery'),
    baseQuery().eq('status', 'completed'),
  ]);

  return {
    total:     all.count        ?? 0,
    pending:   pending.count    ?? 0,
    confirmed: confirmed.count  ?? 0,
    preparing: preparing.count  ?? 0,
    ready:     ready.count      ?? 0,
    delivery:  delivery.count   ?? 0,
    completed: completed.count  ?? 0,
  };
}

/** Subscribe to realtime new orders for staff's outlet. */
export function subscribeToOutletOrders(
  locationId: string,
  onInsert: (order: Record<string, unknown>) => void,
  onUpdate: (order: Record<string, unknown>) => void,
) {
  const channel = supabase
    .channel(`outlet-orders-${locationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `location_id=eq.${locationId}`,
      },
      (payload) => onInsert(payload.new),
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `location_id=eq.${locationId}`,
      },
      (payload) => onUpdate(payload.new),
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ─────────────────── WhatsApp order entry ─────────────────

export interface StaffWhatsAppOrderPayload {
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  deliveryAddress: string | null;
  deliveryLandmark: string | null;
  customerNotes: string | null;
  items: CartItem[];
}

/**
 * Create a WhatsApp order via the secure DB function.
 * The location_id is ALWAYS determined server-side from the
 * authenticated staff member's profile — not trusted from the browser.
 */
export async function createStaffWhatsAppOrder(
  payload: StaffWhatsAppOrderPayload,
): Promise<CreateOrderResult> {
  const { data, error } = await supabase.rpc('create_staff_whatsapp_order', {
    p_order_type:        payload.orderType,
    p_payment_method:    payload.paymentMethod,
    p_customer_name:     payload.customerName,
    p_customer_phone:    payload.customerPhone,
    p_customer_email:    payload.customerEmail,
    p_delivery_address:  payload.deliveryAddress,
    p_delivery_landmark: payload.deliveryLandmark,
    p_customer_notes:    payload.customerNotes,
    p_items: payload.items.map((i) => ({
      menu_item_id:    i.menu_item_id,
      quantity:        i.quantity,
      special_request: i.special_request ?? null,
    })),
  });

  if (error) throw new Error(error.message);
  return data as CreateOrderResult;
}

// ─────────────────── Outlet menu availability ─────────────

/** Get all outlet-specific availability overrides for a location. */
export async function getLocationMenuItems(locationId: string): Promise<LocationMenuItem[]> {
  const { data, error } = await supabase
    .from('location_menu_items')
    .select('*')
    .eq('location_id', locationId);

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Get the full menu with outlet-specific availability merged in.
 * Items not in location_menu_items default to the global is_available.
 */
export async function getMenuWithOutletAvailability(
  locationId: string,
): Promise<(MenuItem & { outlet_available: boolean })[]> {
  const [menuRes, overridesRes] = await Promise.all([
    supabase.from('menu_items').select('*').order('display_order'),
    supabase
      .from('location_menu_items')
      .select('menu_item_id, is_available')
      .eq('location_id', locationId),
  ]);

  if (menuRes.error) throw new Error(menuRes.error.message);

  const overrides = new Map(
    (overridesRes.data ?? []).map((o) => [o.menu_item_id, o.is_available]),
  );

  return (menuRes.data ?? []).map((item) => ({
    ...item,
    outlet_available: overrides.has(item.id)
      ? (overrides.get(item.id) ?? item.is_available)
      : item.is_available,
  }));
}

/** Staff: toggle availability for a single item at their outlet. */
export async function setOutletItemAvailability(
  locationId: string,
  menuItemId: string,
  isAvailable: boolean,
  staffId: string,
): Promise<void> {
  const { error } = await supabase
    .from('location_menu_items')
    .upsert(
      {
        location_id:  locationId,
        menu_item_id: menuItemId,
        is_available: isAvailable,
        updated_by:   staffId,
      },
      { onConflict: 'location_id,menu_item_id' },
    );

  if (error) throw new Error(error.message);
}
