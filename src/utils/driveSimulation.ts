import type { ParadaRuta } from '@/models/Ruta'
import { esParadaMagatzem } from '@/utils/paradaMap'

/** Temps real entre ticks; límit per evitar salts enormes (p. ex. pestanya en segon pla). */
export const MAX_SIMULATION_DT_SEC = 0.35

/**
 * Δt en segons a partir del rellotge de simulació (precisió per a v ≈ km/h reals).
 */
export function computeSimulationDtSec(nowMs: number, lastTsMs: number): number {
  const raw = (nowMs - lastTsMs) / 1000
  if (!Number.isFinite(raw) || raw < 0) return 0
  return Math.min(MAX_SIMULATION_DT_SEC, raw)
}

export type DeliveryArrivalPayload = { index: number; nom: string }

/**
 * Avança `distanceAlong` amb v (m/s) · Δt. Si es creua una entrega no reconeguda, atura exactament a la parada.
 */
export function advanceDistanceWithStops(
  distanceAlong: number,
  dtSec: number,
  speedMps: number,
  totalMeters: number,
  stopDistances: readonly number[],
  parades: readonly ParadaRuta[],
  acknowledgedDeliveryIndices: ReadonlySet<number>,
): { nextDistance: number; deliveryArrival: DeliveryArrivalPayload | null } {
  if (dtSec <= 0 || totalMeters <= 0) {
    return { nextDistance: distanceAlong, deliveryArrival: null }
  }

  const step = speedMps * dtSec
  const nextDistance = Math.min(totalMeters, distanceAlong + step)

  for (let i = 0; i < parades.length; i++) {
    if (esParadaMagatzem(i, parades.length)) continue
    if (acknowledgedDeliveryIndices.has(i)) continue
    const stopD = stopDistances[i]
    if (stopD === undefined) continue
    if (distanceAlong < stopD && nextDistance >= stopD) {
      return {
        nextDistance: stopD,
        deliveryArrival: { index: i, nom: parades[i].nom },
      }
    }
  }

  return { nextDistance, deliveryArrival: null }
}

/**
 * Primera parada d’entrega (no magatzem) encara no reconeguda per la qual la distància ja ha arribat o passat.
 * Útil en restaurar posició desada sense perdre la pausa d’entrega.
 */
export function blockingDeliveryIndexAtDistance(
  distanceAlong: number,
  stopDistances: readonly number[],
  parades: readonly ParadaRuta[],
  acknowledgedDeliveryIndices: ReadonlySet<number>,
): number {
  for (let i = 0; i < parades.length; i++) {
    if (esParadaMagatzem(i, parades.length)) continue
    if (acknowledgedDeliveryIndices.has(i)) continue
    const stopD = stopDistances[i]
    if (stopD === undefined) continue
    if (distanceAlong >= stopD) return i
  }
  return -1
}
