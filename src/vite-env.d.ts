/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL del projecte, p. ex. https://abcd.supabase.co */
  readonly VITE_SUPABASE_URL?: string
  /**
   * Clau pública (anon o `sb_publishable_...`).
   * No posis la service role key al frontend.
   */
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** Taula o vista PostgREST amb les línies de distribució (per defecte `distribucio_linies`). */
  readonly VITE_SUPABASE_DISTRIBUCIO_TABLE?: string
  /** Columna a `detalle_entrega` amb el nom del producte demanat (si difereix dels noms detectats automàticament). */
  readonly VITE_SUPABASE_COL_DETALLE_DESCRIPCIO_PRODUCTE?: string
  /** Taula opcional d’articles comercials (enllaç des del detall amb `articulo_id` / `id_articulo`). */
  readonly VITE_SUPABASE_TABLE_ARTICULOS?: string
  /** PK de la taula d’articles (per defecte `id`). */
  readonly VITE_SUPABASE_COL_ARTICULOS_PK?: string
  readonly VITE_API_URL?: string
  readonly VITE_GOOGLE_MAPS_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
