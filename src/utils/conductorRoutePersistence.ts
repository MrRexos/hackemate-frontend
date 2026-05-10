const STORAGE_VERSION = 1
const PREFIX = 'hackemate-conductor-session'

export type ConductorRouteSession = {
  v: typeof STORAGE_VERSION
  distanceAlong: number
  completedDeliveryIndices: number[]
  /** Parades on s’ha saltat l’entrega (no s’ha pogut baixar mercaderia); la simulació segueix. */
  skippedDeliveryIndices?: number[]
  speedKmh: number
  journeyCompleteOpen: boolean
}

function storageKey(codi: string, rutaId: string | number): string {
  return `${PREFIX}:${codi}:${String(rutaId)}`
}

export function loadConductorRouteSession(
  codi: string,
  rutaId: string | number,
): ConductorRouteSession | null {
  try {
    const raw = sessionStorage.getItem(storageKey(codi, rutaId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConductorRouteSession
    if (parsed.v !== STORAGE_VERSION) return null
    if (typeof parsed.distanceAlong !== 'number' || !Array.isArray(parsed.completedDeliveryIndices)) {
      return null
    }
    const skipped = parsed.skippedDeliveryIndices
    return {
      ...parsed,
      skippedDeliveryIndices: Array.isArray(skipped) ? skipped : [],
    }
  } catch {
    return null
  }
}

export function saveConductorRouteSession(
  codi: string,
  rutaId: string | number,
  session: Omit<ConductorRouteSession, 'v'>,
): void {
  try {
    const payload: ConductorRouteSession = {
      v: STORAGE_VERSION,
      ...session,
      skippedDeliveryIndices: [...(session.skippedDeliveryIndices ?? [])].sort((a, b) => a - b),
    }
    sessionStorage.setItem(storageKey(codi, rutaId), JSON.stringify(payload))
  } catch {
    // Quota o mode privat: ignorar
  }
}

export function clearConductorRouteSession(codi: string, rutaId: string | number): void {
  try {
    sessionStorage.removeItem(storageKey(codi, rutaId))
  } catch {
    // ignore
  }
}
