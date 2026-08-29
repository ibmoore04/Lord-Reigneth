// ============================================================
// Supabase client — single shared instance for the entire app.
// Only uses the public ANON key (safe for the browser).
// The service-role key must NEVER appear in this file.
//
// When VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set
// (e.g. during local development before .env is created) the
// app runs in "offline" mode using static local data files.
// No crash, no broken UI.
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when Supabase credentials are present and look valid. */
export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseUrl!.startsWith('https://');

// Lazy singleton — only created when credentials exist.
let _client: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> {
  if (!isSupabaseConfigured) {
    throw new Error(
      '[Supabase] Not configured. Copy .env.example → .env and add your ' +
        'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    );
  }
  if (!_client) {
    _client = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _client;
}

/**
 * The Supabase client proxy.
 *
 * In development without a .env file every call is a no-op and returns a
 * safe fallback so the UI still renders from static local data.
 * In production (Vercel / any host with env vars set) this is the real client.
 */
export const supabase: any = new Proxy({} as any, {
  get(_target, prop) {
    if (!isSupabaseConfigured) {
      // Return safe stubs for the three surfaces the app uses.
      if (prop === 'auth') return createAuthStub();
      if (prop === 'from') return createFromStub();
      if (prop === 'rpc') return createRpcStub();
      if (prop === 'storage') return createStorageStub();
      if (prop === 'channel') return () => createChannelStub();
      if (prop === 'removeChannel') return () => {};
      return () => {};
    }
    const client = getClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

// ── Stubs (offline / unconfigured mode) ──────────────────
// Each stub returns the same chainable shape Supabase queries do,
// resolving to { data: null, error: null, count: null }.

const EMPTY_RESULT = { data: null, error: null, count: null };

function chainable(): any {
  return buildChain();
}

function buildChain(): any {
  const p: any = {};
  const methods = [
    'select','insert','update','upsert','delete',
    'eq','neq','gt','gte','lt','lte','like','ilike','in',
    'is','not','or','and','filter','match',
    'order','limit','range','single','maybeSingle',
    'returns','throwOnError',
  ];
  for (const m of methods) {
    p[m] = () => buildChain();
  }
  // Make it awaitable
  p.then = (resolve: (v: typeof EMPTY_RESULT) => unknown) => Promise.resolve(EMPTY_RESULT).then(resolve);
  p.catch = (reject: (e: unknown) => unknown) => Promise.resolve(EMPTY_RESULT).catch(reject);
  p.finally = (fn: () => void) => Promise.resolve(EMPTY_RESULT).finally(fn);
  return p as any;
}

function createFromStub() {
  return (_table: string) => chainable();
}

function createRpcStub() {
  return (_fn: string, _args?: unknown) => ({
    ...EMPTY_RESULT,
    then: (resolve: (v: typeof EMPTY_RESULT) => unknown) =>
      Promise.resolve(EMPTY_RESULT).then(resolve),
    catch: (reject: (e: unknown) => unknown) =>
      Promise.resolve(EMPTY_RESULT).catch(reject),
  });
}

function createAuthStub() {
  const session = { data: { session: null }, error: null };
  const user    = { data: { user: null },    error: null };
  return {
    getSession:        ()    => Promise.resolve(session),
    getUser:           ()    => Promise.resolve(user),
    signUp:            ()    => Promise.resolve({ data: {}, error: null }),
    signInWithPassword:()    => Promise.resolve({ data: {}, error: null }),
    signOut:           ()    => Promise.resolve({ error: null }),
    resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
    updateUser:        ()    => Promise.resolve({ data: {}, error: null }),
    onAuthStateChange: (_cb: unknown) => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
  };
}

function createStorageStub() {
  const bucket = {
    upload:       () => Promise.resolve({ data: null, error: null }),
    getPublicUrl: () => ({ data: { publicUrl: '' } }),
    remove:       () => Promise.resolve({ data: null, error: null }),
  };
  return { from: () => bucket };
}

function createChannelStub() {
  const ch = {
    on:        () => ch,
    subscribe: () => ch,
  };
  return ch;
}

// ── Dev-mode hint (non-crashing) ──────────────────────────
if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.info(
    '%c[Lord Reigneth Foods] Running in offline mode.\n' +
    'Copy .env.example → .env and add your Supabase credentials to enable the backend.',
    'color: #c9922a; font-weight: bold;',
  );
}
