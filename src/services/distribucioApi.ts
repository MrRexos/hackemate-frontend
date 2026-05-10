import type { LiniaDistribucio } from '@/domain/palletPacking'

import { getLiniesDistribucioMock } from '@/data/mockDistribucio'
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabaseClient'
import { fetchLiniesDistribucioEmpresaDesDeOrdre } from '@/services/fetchDistribucioEmpresa'
import { fetchLiniesDistribucioSupabase } from '@/services/fetchDistribucioSupabase'
import type { OrdreEntregaRuta } from '@/models/Ruta'
import {
  envTableVar,
  nomMaterialDesDeFila,
  pickNumber,
  pickString,
  type FilaSupabase,
} from '@/services/supabaseDistribucioMappers'

export type OrigenLiniesDistribucio = 'supabase' | 'mock'

export type ResultatLiniesDistribucio = {
  linies: LiniaDistribucio[]
  origen: OrigenLiniesDistribucio
}

function hashRutaId(id: string): number {
  let h = 2166136261
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

async function simularLiniesRealsDesDeBd(
  rutaId: string,
  totalParades: number,
): Promise<LiniaDistribucio[]> {
  const sb = getSupabaseBrowser()
  if (!sb) return []

  const T_MAT = envTableVar('VITE_SUPABASE_TABLE_MATERIALES', 'materiales')
  const { data: matRows, error } = await sb.from(T_MAT).select('*').limit(1200)
  if (error) {
    throw new Error(`[simulacio-bd] ${error.message}`)
  }

  const materials = (matRows ?? []) as FilaSupabase[]
  if (materials.length === 0) return []

  const nParadesEntrega = Math.max(1, totalParades - 2)
  const seed = hashRutaId(rutaId)

  const linies: LiniaDistribucio[] = []
  let k = 0

  for (let parada = 1; parada <= nParadesEntrega; parada++) {
    const nLiniesParada = 4 + ((seed + parada) % 5) // 4..8 línies per parada (simulació rica)
    for (let j = 0; j < nLiniesParada; j++) {
      const idx = (seed + parada * 17 + j * 13) % materials.length
      const mat = materials[idx]!
      const materialId = String((mat.material_id ?? pickString(mat, ['material_id', 'id', 'codigo'])) || `MAT-${idx}`)
      const nom = nomMaterialDesDeFila(mat, materialId)

      const unitat = (['CAIXA', 'LLAUNA', 'BARRIL'] as const)[(seed + parada + j) % 3]
      const basePes = pickNumber(mat, ['peso_neto', 'peso_unitario', 'peso', 'pes_bruto'])
      let pesKgPerUnitat = Number.isFinite(basePes) && basePes > 0 ? basePes : 1
      if (unitat === 'LLAUNA') pesKgPerUnitat = Math.max(0.01, pesKgPerUnitat / 24)
      if (unitat === 'BARRIL') pesKgPerUnitat = Math.max(0.2, pesKgPerUnitat * 4)

      const quantitat = 8 + ((seed + parada * 3 + j * 5) % 26)

      linies.push({
        paradaIndex: parada,
        producteId: `${materialId}-${k++}`,
        producteNom: nom,
        materialId,
        materialNom: nom,
        quantitat,
        unitat,
        pesKgPerUnitat,
      })
    }
  }

  return linies
}

/**
 * Carrega línies per al pla de palets només des de Supabase.
 */
export async function fetchLiniesDistribucioAmbOrigen(
  rutaId: string,
  totalParades: number = 0,
  transporteId: number | null = null,
  ordreEntregues: readonly OrdreEntregaRuta[] | null = null,
): Promise<ResultatLiniesDistribucio> {
  if (!isSupabaseConfigured()) {
    return {
      linies: getLiniesDistribucioMock(rutaId, totalParades),
      origen: 'mock',
    }
  }

  let linies: LiniaDistribucio[] = []
  if (ordreEntregues && ordreEntregues.length > 0) {
    try {
      linies = await fetchLiniesDistribucioEmpresaDesDeOrdre(rutaId, ordreEntregues)
    } catch (e) {
      console.warn('[distribucio] fusió multi-transport:', e)
    }
  }
  if (linies.length === 0 && transporteId != null) {
    try {
      linies = await fetchLiniesDistribucioSupabase(rutaId, transporteId)
    } catch (e) {
      console.warn('[distribucio] transport real no disponible, simulació BD:', e)
    }
  }

  if (linies.length === 0) {
    linies = await simularLiniesRealsDesDeBd(rutaId, totalParades)
  }
  if (linies.length === 0) {
    return {
      linies: getLiniesDistribucioMock(rutaId, totalParades),
      origen: 'mock',
    }
  }

  return { linies, origen: 'supabase' }
}

export async function fetchLiniesDistribucio(
  rutaId: string,
  totalParades: number = 0,
  transporteId: number | null = null,
  ordreEntregues: readonly OrdreEntregaRuta[] | null = null,
): Promise<LiniaDistribucio[]> {
  const { linies } = await fetchLiniesDistribucioAmbOrigen(rutaId, totalParades, transporteId, ordreEntregues)
  return linies
}
