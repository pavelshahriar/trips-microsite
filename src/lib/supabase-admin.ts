/**
 * Supabase admin (service-role) client
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY which bypasses Row Level Security.
 * NEVER import this file from a client component ("use client") or
 * expose the key to the browser. Only use in:
 *  - Server Actions ("use server")
 *  - Route Handlers (app/api/…/route.ts)
 *  - Middleware (middleware.ts) when reads via anon key aren't enough
 */

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. " +
        "Add SUPABASE_SERVICE_ROLE_KEY to .env.local and your Netlify environment."
    );
  }

  return createClient(url, key, {
    auth: {
      // Service role client should not persist or auto-refresh sessions
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
