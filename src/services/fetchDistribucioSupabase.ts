import type { LiniaDistribucio } from '@/domain/palletPacking'
import { getSupabaseBrowser } from '@/lib/supabaseClient'
import { fetchLiniesDistribucioEmpresa } from '@/services/fetchDistribucioEmpresa'
import { filaDistribucioALinia, type FilaSupabase } from '@/services/supabaseDistribucioMappers'

async function fetchLiniesDistribucioTaulaPlana(
  rutaId: string,
  table: string,
): Promise<LiniaDistribucio[]> {
  const sb = getSupabaseBrowser()
  if (!sb) {
    throw new Error('Supabase no està configurat (falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY).')
  }

  const { data, error } = await sb.from(table).select('*').eq('route_id', rutaId)

  if (error) {
    throw new Error(error.message)
  }

  const linies: LiniaDistribucio[] = []
  for (const row of data ?? []) {
    const linia = filaDistribucioALinia(row as FilaSupabase)
    if (linia) linies.push(linia)
  }
  return linies
}

/**
 * Si `VITE_SUPABASE_DISTRIBUCIO_TABLE` està definit → taula/vista plana (`route_id`).
 * Si no → `cabecera_transporte` + `detalle_entrega` + `materiales` per `transporte_id`.
 */
function transporteIdDesDeRutaId(rutaId: string, transporteId: number | null): number | null {
  if (transporteId != null && Number.isFinite(transporteId)) return transporteId
  const m = /^R-BD-(\d+)$/.exec(rutaId.trim())
  if (m) {
    const n = Number(m[1])
    return Number.isFinite(n) ? n : null
  }
  const n = Number(rutaId)
  if (Number.isFinite(n) && String(rutaId).trim() !== '') return n
  return null
}

export async function fetchLiniesDistribucioSupabase(
  rutaId: string,
  transporteId: number | null = null,
): Promise<LiniaDistribucio[]> {
  const taulaPlana = import.meta.env.VITE_SUPABASE_DISTRIBUCIO_TABLE?.trim()
  if (taulaPlana) {
    return fetchLiniesDistribucioTaulaPlana(rutaId, taulaPlana)
  }
  const tid = transporteIdDesDeRutaId(rutaId, transporteId)
  if (tid == null) {
    throw new Error(
      `No s’ha pogut resoldre «transporte_id» per «${rutaId}». Les rutes de la BD usen id tipus R-BD-<número> o cal \`Ruta.transporteId\`.`,
    )
  }
  return fetchLiniesDistribucioEmpresa(rutaId, tid)
}
