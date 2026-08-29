// ============================================================
// Auth Service — wraps Supabase Auth for the app.
// All auth operations flow through here; never call
// supabase.auth directly from components.
// ============================================================

import { supabase } from '../lib/supabase';
import type { Profile, ProfileUpdate } from '../types/database';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
}

// ── Sign Up ───────────────────────────────────────────────
export async function signUp(data: SignUpData) {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        phone: data.phone ?? null,
      },
    },
  });

  if (error) throw new Error(error.message);
  return authData;
}

// ── Sign In ───────────────────────────────────────────────
export async function signIn(data: SignInData) {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) throw new Error(error.message);
  return authData;
}

// ── Sign Out ──────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

// ── Get current session ───────────────────────────────────
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

// ── Get current user ──────────────────────────────────────
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

// ── Password reset request ────────────────────────────────
export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) throw new Error(error.message);
}

// ── Update password ───────────────────────────────────────
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

// ── Get user profile ──────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    // maybeSingle returns null (not an error) when 0 rows found.
    // .single() returns a 406 when 0 rows found — which is what
    // caused the console error before the migrations were run.
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

// ── Update user profile ───────────────────────────────────
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Upload avatar ─────────────────────────────────────────
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

// ── Invite staff (admin-only workflow) ───────────────────
export async function inviteStaff(data: {
  email: string;
  fullName: string;
  phone?: string;
  locationId: string;
}): Promise<{ email: string }> {
  // Capture the admin's current session BEFORE creating the staff account,
  // so we can restore it afterward (signUp signs in as the new user).
  const { data: { session: adminSession } } = await supabase.auth.getSession();

  const tempPw = crypto.randomUUID() + crypto.randomUUID();

  // 1 — Create the auth user with a needs_password_reset flag
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: tempPw,
    options: {
      data: {
        full_name: data.fullName,
        phone: data.phone ?? null,
        needs_password_reset: true, // detected by StaffGuard
      },
    },
  });

  if (signUpError) throw new Error(signUpError.message);
  if (!authData.user) throw new Error('Failed to create staff account.');

  // 2 — Update their profile to staff role + outlet
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert(
      {
        id:          authData.user.id,
        email:       data.email,
        full_name:   data.fullName,
        phone:       data.phone ?? null,
        role:        'staff',
        location_id: data.locationId,
        is_active:   true,
      },
      { onConflict: 'id' },
    );

  if (profileError) throw new Error(profileError.message);

  // 3 — Restore admin session (signUp replaced it with the new user's session)
  if (adminSession) {
    await supabase.auth.setSession({
      access_token:  adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });
  }

  // 4 — Send password-reset email
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(
    data.email,
    { redirectTo: `${window.location.origin}/auth/reset-password` },
  );

  if (resetError) {
    console.warn('[inviteStaff] Could not send reset email:', resetError.message);
  }

  return { email: data.email };
}

// ── Auth state listener ───────────────────────────────────
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void,
) {
  return supabase.auth.onAuthStateChange(callback);
}
