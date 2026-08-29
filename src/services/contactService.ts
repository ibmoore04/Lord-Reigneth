// ============================================================
// Contact & Newsletter Service
// ============================================================

import { supabase } from '../lib/supabase';
import type {
  ContactMessage,
  ContactMessageInsert,
  ContactMessageUpdate,
  NewsletterSubscriber,
} from '../types/database';

// ── Submit contact message (public) ──────────────────────
export async function submitContactMessage(
  data: ContactMessageInsert,
): Promise<ContactMessage> {
  const { data: result, error } = await supabase
    .from('contact_messages')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return result;
}

// ── Admin: fetch all messages ─────────────────────────────
export async function getContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ── Admin: update message status ─────────────────────────
export async function updateContactMessageStatus(
  id: string,
  updates: ContactMessageUpdate,
): Promise<ContactMessage> {
  const { data, error } = await supabase
    .from('contact_messages')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Admin: unread message count ───────────────────────────
export async function getUnreadMessageCount(): Promise<number> {
  const { count, error } = await supabase
    .from('contact_messages')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'unread');

  if (error) throw new Error(error.message);
  return count ?? 0;
}

// ── Subscribe to newsletter ───────────────────────────────
export async function subscribeToNewsletter(
  email: string,
  source = 'website',
): Promise<NewsletterSubscriber> {
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .upsert(
      { email, source, is_active: true },
      { onConflict: 'email', ignoreDuplicates: false },
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Unsubscribe from newsletter ───────────────────────────
export async function unsubscribeFromNewsletter(email: string): Promise<void> {
  const { error } = await supabase
    .from('newsletter_subscribers')
    .update({ is_active: false })
    .eq('email', email);

  if (error) throw new Error(error.message);
}
