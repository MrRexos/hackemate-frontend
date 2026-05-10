import type { LiniaDistribucio, PlaCarrega } from '@/domain/palletPacking'
import type { RepartimentRetornCaixesBarrils } from '@/domain/palletPacking'

import type { ConductorRouteSession } from '@/utils/conductorRoutePersistence'

const STORAGE_VERSION = 1 as const
const PREFIX = 'hackemate-camio-distrib'

export type CamioDistribucioPersistSnapshot = {
  v: typeof STORAGE_VERSION
  rutaId: string
  liniesFingerprint: string
  linies: LiniaDistribucio[]
  plaCarrega: PlaCarrega
  paradesEntregadesSimulacio: number[]
  blocsRetornDespresEntrega: Array<{
    paradaIndex: number
    paradaNom: string
    repartiment: RepartimentRetornCaixesBarrils
  }>
}

function storageKey(codi: string, rutaId: string | number): string {
  return `${PREFIX}:${codi}:${String(rutaId)}`
}

/** Empremta estable de les línies per saber si el pla guardat encara és vàlid. */
export function fingerprintLiniesDistribucio(linies: LiniaDistribucio[]): string {
  const normalized = [...linies].sort((a, b) => {
    const ka = `${a.paradaIndex}-${a.producteId}`
    const kb = `${b.paradaIndex}-${b.producteId}`
    return ka.localeCompare(kb)
  })
  return JSON.stringify(
    normalized.map((l) => ({
      p: l.paradaIndex,
      id: l.producteId,
      q: l.quantitat,
      u: l.unitat,
      mat: l.materialId,
      pes: Math.round(l.pesKgPerUnitat * 1000) / 1000,
    })),
  )
}

export function haIniciatRutaConductorSession(session: ConductorRouteSession | null): boolean {
  if (!session) return false
  return (
    session.distanceAlong > 0 ||
    session.completedDeliveryIndices.length > 0 ||
    session.journeyCompleteOpen === true
  )
}

export function loadCamioDistribucioSnapshot(
  codi: string,
  rutaId: string | number,
): CamioDistribucioPersistSnapshot | null {
  try {
    const raw = sessionStorage.getItem(storageKey(codi, rutaId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CamioDistribucioPersistSnapshot
    if (parsed.v !== STORAGE_VERSION) return null
    if (!parsed.rutaId || typeof parsed.liniesFingerprint !== 'string') return null
    if (!Array.isArray(parsed.linies) || !parsed.plaCarrega) return null
    if (!Array.isArray(parsed.paradesEntregadesSimulacio)) return null
    if (!Array.isArray(parsed.blocsRetornDespresEntrega)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveCamioDistribucioSnapshot(
  codi: string,
  rutaId: string | number,
  snapshot: CamioDistribucioPersistSnapshot,
): void {
  try {
    sessionStorage.setItem(storageKey(codi, rutaId), JSON.stringify(snapshot))
  } catch {
    // Quota o mode privat
  }
}

export function clearCamioDistribucioSnapshot(codi: string, rutaId: string | number): void {
  try {
    sessionStorage.removeItem(storageKey(codi, rutaId))
  } catch {
    // ignore
  }
}
