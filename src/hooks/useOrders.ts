// ============================================================
// useOrders — order management hooks for customers and admins.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import type { Order, OrderStatus } from '../types/database';
import * as orderService from '../services/orderService';

// ── Customer: their own order history ─────────────────────
export function useMyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    orderService.getMyOrders()
      .then(setOrders)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);
  return { orders, loading, error, refetch: load };
}

// ── Track a specific order by order NUMBER ────────────────
// Fetches the order, then subscribes to realtime updates by its UUID.
// Realtime filter uses id (UUID) — order_number alone can't be filtered by Supabase realtime.
export function useOrderTracking(orderNumber: string | null) {
  const [order, setOrder] = useState<orderService.OrderWithItems | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setOrder(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    orderService.getOrderByNumber(orderNumber)
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
        setLoading(false);

        // Now subscribe by the order's UUID (not order_number)
        if (data?.id) {
          // Realtime subscription is set up inside the returned cleanup
        }
      })
      .catch((err: Error) => {
        if (!cancelled) { setError(err.message); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [orderNumber]);

  // Separate effect: subscribe once we have the order id
  useEffect(() => {
    if (!order?.id) return;

    const unsub = orderService.subscribeToOrderStatus(
      order.id,
      (updated) => {
        setOrder((prev) =>
          prev ? { ...prev, ...updated, order_items: prev.order_items } : null,
        );
      },
    );

    return unsub;
  }, [order?.id]);

  return { order, loading, error };
}

// ── Admin: all orders with realtime ──────────────────────
export function useAdminOrders(statusFilter?: OrderStatus) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    orderService.getAllOrders({ status: statusFilter })
      .then(setOrders)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    load();

    // Realtime: prepend new orders as they arrive
    const unsub = orderService.subscribeToOrders((newOrder) => {
      setOrders((prev) => {
        // Avoid duplicates if the initial fetch already included this order
        if (prev.some((o) => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });
    });

    return unsub;
  }, [load]);

  const updateStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      await orderService.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      );
    },
    [],
  );

  return { orders, loading, error, updateStatus, refetch: load };
}
