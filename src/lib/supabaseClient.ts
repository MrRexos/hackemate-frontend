import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim()
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  return Boolean(url && key)
}

/**
 * Client singleton per al navegador. Requereix `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`
 * (la clau publishable `sb_publishable_...` val com a anon al client).
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (cached) return cached
  const url = import.meta.env.VITE_SUPABASE_URL!.trim()
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY!.trim()
  cached = createClient(url, key)
  return cached
}
