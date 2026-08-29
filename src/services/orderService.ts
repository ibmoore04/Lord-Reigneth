// ============================================================
// Order Service — order creation, tracking and management.
// IMPORTANT: Order totals are calculated server-side via the
// create_order() PostgreSQL function. Prices from the browser
// are NEVER trusted for financial calculations.
// ============================================================

import { supabase } from '../lib/supabase';
import type {
  Order,
  OrderItem,
  OrderUpdate,
  OrderStatus,
  OrderSource,
  CartItem,
  OrderType,
  PaymentMethod,
  CreateOrderResult,
} from '../types/database';

export interface CreateOrderPayload {
  customerId: string | null;
  locationId: string | null;
  orderType: OrderType;
  orderSource: OrderSource;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  deliveryAddress: string | null;
  deliveryLandmark: string | null;
  customerNotes: string | null;
  items: CartItem[];
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

// ── Create order (via secure DB function) ─────────────────
export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResult> {
  const { data, error } = await supabase.rpc('create_order', {
    p_customer_id:       payload.customerId,
    p_location_id:       payload.locationId,
    p_order_type:        payload.orderType,
    p_order_source:      payload.orderSource,
    p_payment_method:    payload.paymentMethod,
    p_customer_name:     payload.customerName,
    p_customer_phone:    payload.customerPhone,
    p_customer_email:    payload.customerEmail,
    p_delivery_address:  payload.deliveryAddress,
    p_delivery_landmark: payload.deliveryLandmark,
    p_customer_notes:    payload.customerNotes,
    p_items: payload.items.map((item) => ({
      menu_item_id:    item.menu_item_id,
      quantity:        item.quantity,
      special_request: item.special_request ?? null,
    })),
  });

  if (error) throw new Error(error.message);
  return data as CreateOrderResult;
}

// ── Fetch order by ID ─────────────────────────────────────
export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as OrderWithItems;
}

// ── Fetch order by number (customer tracking) ─────────────
// For authenticated users, RLS handles access.
// For guests, the caller must verify phone separately (see OrderTrackingPage).
export async function getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as OrderWithItems | null;
}

// ── Fetch current user's orders ───────────────────────────
export async function getMyOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Admin: fetch all orders ───────────────────────────────
export async function getAllOrders(options?: {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.status) query = query.eq('status', options.status);
  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, (options.offset + (options.limit ?? 20)) - 1);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Admin: fetch today's orders ───────────────────────────
export async function getTodaysOrders(): Promise<Order[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', `${today}T00:00:00`)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Admin/Staff: update order status ─────────────────────
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status } satisfies OrderUpdate)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Admin/Staff: mark order as paid ──────────────────────
// Only updates payment_status — never touches order totals.
export async function markOrderPaid(orderId: string): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ payment_status: 'paid' } satisfies OrderUpdate)
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Admin: get order analytics summary ───────────────────
export async function getOrderSummary() {
  const today = new Date().toISOString().split('T')[0];

  const [todayRes, pendingRes, completedRes] = await Promise.all([
    supabase
      .from('orders')
      .select('id, total', { count: 'exact' })
      .gte('created_at', `${today}T00:00:00`),
    supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('status', 'pending'),
    supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('status', 'completed'),
  ]);

  const todayRevenue = (todayRes.data ?? []).reduce(
    (sum, o) => sum + (o.total ?? 0),
    0,
  );

  return {
    todayCount: todayRes.count ?? 0,
    todayRevenue,
    pendingCount: pendingRes.count ?? 0,
    completedCount: completedRes.count ?? 0,
  };
}

// ── Subscribe to realtime order updates (admin) ───────────
export function subscribeToOrders(callback: (order: Order) => void) {
  const channel = supabase
    .channel('orders-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => callback(payload.new as Order),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ── Subscribe to a specific order's status (customer) ────
export function subscribeToOrderStatus(
  orderId: string,
  callback: (order: Order) => void,
) {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => callback(payload.new as Order),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
