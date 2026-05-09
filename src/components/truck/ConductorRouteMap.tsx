import { useMemo } from 'react'

import type { ParadaRuta } from '@/models/Ruta'
import type { DeliveryArrivalPayload } from '@/utils/driveSimulation'

import { GoogleDrivingRouteMap } from './GoogleDrivingRouteMap'
import { OsrmDrivingRouteMap } from './OsrmDrivingRouteMap'

type Props = {
  parades: readonly ParadaRuta[]
  speedMps: number
  resetSignal: number
  acknowledgedDeliveryIndices: ReadonlySet<number>
  onDeliveryArrival: (payload: DeliveryArrivalPayload) => void
  onDriveReady: (meta: { stopDistances: number[]; totalMeters: number }) => void
  onDriveTick: (payload: { distanceAlong: number }) => void
  onRouteComplete?: () => void
  /** Aturat fins que l’usuari engegui la simulació (o pausa manual). */
  simulationPaused: boolean
}

function hasGoogleMapsKey(): boolean {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  return typeof key === 'string' && key.trim().length > 0
}

/**
 * Ruta per carrers: Google Maps si hi ha `VITE_GOOGLE_MAPS_API_KEY`, si no OSRM + OpenStreetMap.
 * Simulació de conducció amb callbacks cap al panell (línia de temps).
 */
export function ConductorRouteMap({
  parades,
  speedMps,
  resetSignal,
  acknowledgedDeliveryIndices,
  onDeliveryArrival,
  onDriveReady,
  onDriveTick,
  onRouteComplete,
  simulationPaused,
}: Props) {
  const routeKey = useMemo(
    () => parades.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join('|'),
    [parades],
  )
  const mapKey = `${routeKey}-${parades.length}`

  if (hasGoogleMapsKey()) {
    return (
      <GoogleDrivingRouteMap
        key={mapKey}
        acknowledgedDeliveryIndices={acknowledgedDeliveryIndices}
        onDeliveryArrival={onDeliveryArrival}
        onDriveReady={onDriveReady}
        onDriveTick={onDriveTick}
        onRouteComplete={onRouteComplete}
        parades={parades}
        resetSignal={resetSignal}
        simulationPaused={simulationPaused}
        speedMps={speedMps}
      />
    )
  }
  return (
    <OsrmDrivingRouteMap
      key={mapKey}
      acknowledgedDeliveryIndices={acknowledgedDeliveryIndices}
      onDeliveryArrival={onDeliveryArrival}
      onDriveReady={onDriveReady}
      onDriveTick={onDriveTick}
      onRouteComplete={onRouteComplete}
      parades={parades}
      resetSignal={resetSignal}
      simulationPaused={simulationPaused}
      speedMps={speedMps}
    />
  )
}
