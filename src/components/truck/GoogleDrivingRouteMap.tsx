import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { DirectionsRenderer, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'

import type { ParadaRuta } from '@/models/Ruta'
import {
  buildPathMetrics,
  computeStopDistancesAlongPath,
  haversineMeters,
  lerpAngleDeg,
  sampleAlongPath,
  type LatLngLiteral,
} from '@/utils/routePathDrive'
import {
  advanceDistanceWithStops,
  blockingDeliveryIndexAtDistance,
  computeSimulationDtSec,
  type DeliveryArrivalPayload,
} from '@/utils/driveSimulation'
import { esParadaMagatzem, ometreMarcadorFiSiMateixMagatzem } from '@/utils/paradaMap'

import { NavigationArrowHud } from './NavigationArrowHud'

const mapContainerClassName =
  'h-[min(64vh,680px)] w-full min-h-[465px] rounded-xl max-h-[780px] bg-slate-300'

const LOOK_AHEAD_M = 38
const HEADING_SMOOTH = 0.14

function normalizeHeadingDeg(deg: number): number {
  const x = deg % 360
  return x < 0 ? x + 360 : x
}

type Props = {
  parades: readonly ParadaRuta[]
  speedMps: number
  resetSignal: number
  acknowledgedDeliveryIndices: ReadonlySet<number>
  initialDistanceAlong?: number
  onDeliveryArrival: (payload: DeliveryArrivalPayload) => void
  onDriveReady: (meta: { stopDistances: number[]; totalMeters: number }) => void
  onDriveTick: (payload: { distanceAlong: number }) => void
  onRouteComplete?: () => void
  simulationPaused: boolean
}

function densePathFromDirections(result: google.maps.DirectionsResult | null): LatLngLiteral[] | null {
  if (!result?.routes?.[0]) return null
  const pts: LatLngLiteral[] = []
  for (const leg of result.routes[0].legs) {
    for (const step of leg.steps) {
      for (const p of step.path) {
        const cur = { lat: p.lat(), lng: p.lng() }
        const last = pts[pts.length - 1]
        if (!last || haversineMeters(last, cur) >= 0.25) {
          pts.push(cur)
        }
      }
    }
  }
  if (pts.length < 2) return null
  return pts
}

function GoogleDrivingRouteMapInner({
  parades,
  speedMps,
  resetSignal,
  acknowledgedDeliveryIndices,
  initialDistanceAlong,
  onDeliveryArrival,
  onDriveReady,
  onDriveTick,
  onRouteComplete,
  simulationPaused,
}: Props) {
  const readyRef = useRef(onDriveReady)
  const tickRef = useRef(onDriveTick)
  const speedRef = useRef(speedMps)
  const arrivalRef = useRef(onDeliveryArrival)
  const ackRef = useRef(acknowledgedDeliveryIndices)
  const routeCompleteRef = useRef(onRouteComplete)
  const pausedRef = useRef(simulationPaused)

  useLayoutEffect(() => {
    readyRef.current = onDriveReady
    tickRef.current = onDriveTick
    speedRef.current = speedMps
    arrivalRef.current = onDeliveryArrival
    ackRef.current = acknowledgedDeliveryIndices
    routeCompleteRef.current = onRouteComplete
    pausedRef.current = simulationPaused
  }, [
    onDriveReady,
    onDriveTick,
    speedMps,
    onDeliveryArrival,
    acknowledgedDeliveryIndices,
    onRouteComplete,
    simulationPaused,
  ])

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    id: 'hackemate-google-maps',
    libraries: ['geometry'],
  })

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const routeKey = useMemo(
    () => parades.map((p) => `${p.lat},${p.lng}`).join('|'),
    [parades],
  )

  const pathPoints = useMemo(() => densePathFromDirections(directions), [directions])

  const directionsPolylineOptions = useMemo(
    () => ({
      strokeColor: '#1e293b',
      strokeWeight: 7,
      strokeOpacity: 0.92,
    }),
    [],
  )

  const directionsRendererOptions = useMemo(
    () => ({
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: directionsPolylineOptions,
    }),
    [directionsPolylineOptions],
  )

  /** Durant la simulació evitem gestos que lluitin amb `moveCamera` cada frame. */
  const mapOptionsSim = useMemo(
    (): google.maps.MapOptions => ({
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      rotateControl: false,
      gestureHandling: 'none',
      draggable: false,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      keyboardShortcuts: false,
      // Una mica menys d’inclinació redueix el “cel” en blanc als vores en 3D.
      tilt: 52,
      backgroundColor: '#cbd5e1',
    }),
    [],
  )

  const mapOptionsBrowse = useMemo(
    (): google.maps.MapOptions => ({
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      rotateControl: false,
      gestureHandling: 'greedy',
      tilt: 0,
    }),
    [],
  )

  const onMapLoad = useCallback((m: google.maps.Map) => {
    setMap(m)
  }, [])

  useEffect(() => {
    if (!isLoaded || parades.length < 2) {
      return
    }

    const g = globalThis.google
    if (!g?.maps) {
      return
    }

    const service = new g.maps.DirectionsService()
    const origin = { lat: parades[0].lat, lng: parades[0].lng }
    const destination = {
      lat: parades[parades.length - 1].lat,
      lng: parades[parades.length - 1].lng,
    }
    const waypoints =
      parades.length > 2
        ? parades.slice(1, -1).map((p) => ({
            location: { lat: p.lat, lng: p.lng },
            stopover: true,
          }))
        : []

    service.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: g.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === 'OK' && result) {
          setDirections(result)
        } else {
          setDirections(null)
        }
      },
    )
  }, [isLoaded, parades, routeKey])

  useEffect(() => {
    if (!map || !isLoaded || !pathPoints || pathPoints.length < 2) {
      return
    }

    const metrics = buildPathMetrics(pathPoints)
    if (metrics.totalMeters < 2) {
      return
    }

    const stopCoords = parades.map((p) => ({ lat: p.lat, lng: p.lng }))
    const stopDistances = computeStopDistancesAlongPath(metrics, stopCoords)
    readyRef.current({ stopDistances, totalMeters: metrics.totalMeters })

    const rawStart =
      initialDistanceAlong !== undefined ? initialDistanceAlong : 0
    const startDist = Math.max(0, Math.min(rawStart, metrics.totalMeters))

    let distanceAlong = startDist
    let lastTs = performance.now()
    let raf = 0
    let smoothHeading = sampleAlongPath(metrics, startDist, LOOK_AHEAD_M, { loop: false }).heading
    let tickCounter = 0
    let awaitingAckForIndex = blockingDeliveryIndexAtDistance(
      startDist,
      stopDistances,
      parades,
      ackRef.current,
    )
    let restoreArrivalPending =
      awaitingAckForIndex >= 0 && !ackRef.current.has(awaitingAckForIndex)
    let routeCompleteEmitted = false

    const tick = (now: number) => {
      if (restoreArrivalPending && awaitingAckForIndex >= 0) {
        restoreArrivalPending = false
        arrivalRef.current({
          index: awaitingAckForIndex,
          nom: parades[awaitingAckForIndex].nom,
        })
      }

      if (awaitingAckForIndex >= 0 && ackRef.current.has(awaitingAckForIndex)) {
        awaitingAckForIndex = -1
      }

      const userPaused = pausedRef.current
      const dt = userPaused ? 0 : computeSimulationDtSec(now, lastTs)
      lastTs = now

      const holdForDelivery =
        awaitingAckForIndex >= 0 && !ackRef.current.has(awaitingAckForIndex)

      if (!userPaused && !holdForDelivery && distanceAlong < metrics.totalMeters) {
        const { nextDistance, deliveryArrival } = advanceDistanceWithStops(
          distanceAlong,
          dt,
          speedRef.current,
          metrics.totalMeters,
          stopDistances,
          parades,
          ackRef.current,
        )
        distanceAlong = nextDistance
        if (deliveryArrival) {
          awaitingAckForIndex = deliveryArrival.index
          arrivalRef.current(deliveryArrival)
        }
      }

      const atEnd = distanceAlong >= metrics.totalMeters
      const { position, heading } = sampleAlongPath(
        metrics,
        atEnd ? metrics.totalMeters : distanceAlong,
        LOOK_AHEAD_M,
        { loop: false },
      )

      smoothHeading = lerpAngleDeg(smoothHeading, heading, HEADING_SMOOTH)
      const headingNorm = normalizeHeadingDeg(smoothHeading)

      map.moveCamera({
        center: position,
        heading: headingNorm,
        tilt: 52,
        zoom: 18,
      })

      tickCounter += 1
      if (tickCounter % 2 === 0) {
        tickRef.current({ distanceAlong })
      }

      if (!atEnd) {
        raf = requestAnimationFrame(tick)
      } else {
        if (!routeCompleteEmitted) {
          routeCompleteEmitted = true
          routeCompleteRef.current?.()
        }
        tickRef.current({ distanceAlong: metrics.totalMeters })
      }
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
    }
  }, [map, isLoaded, pathPoints, routeKey, parades, resetSignal, initialDistanceAlong])

  if (loadError) {
    return (
      <div className="flex min-h-[465px] items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 text-center text-sm text-amber-900">
        No s&apos;ha pogut carregar Google Maps. Revisa la clau d&apos;API.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-[465px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600">
        Carregant Google Maps…
      </div>
    )
  }

  if (parades.length === 0) {
    return (
      <div className="flex min-h-[465px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        Sense parades per mostrar al mapa.
      </div>
    )
  }

  const g = globalThis.google
  const iconMagatzem: google.maps.Symbol = {
    path: g.maps.SymbolPath.CIRCLE,
    scale: 18,
    fillColor: '#0f172a',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 3,
  }
  const iconEntrega: google.maps.Symbol = {
    path: g.maps.SymbolPath.CIRCLE,
    scale: 12,
    fillColor: '#ea580c',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 3,
  }

  const center = { lat: parades[0].lat, lng: parades[0].lng }

  const marcadors = parades.map((p, i) => {
    if (ometreMarcadorFiSiMateixMagatzem(parades, i)) return null
    const magatzem = esParadaMagatzem(i, parades.length)
    return (
      <Marker
        icon={magatzem ? iconMagatzem : iconEntrega}
        key={`${i}-${p.nom}`}
        label={{
          text: magatzem ? 'M' : String(i + 1),
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: '700',
        }}
        position={{ lat: p.lat, lng: p.lng }}
        title={p.nom}
        zIndex={magatzem ? 400 + i : 300 + i}
      />
    )
  })

  if (parades.length === 1) {
    return (
      <GoogleMap
        center={center}
        mapContainerClassName={mapContainerClassName}
        onLoad={onMapLoad}
        options={mapOptionsBrowse}
        zoom={15}
      >
        {marcadors}
      </GoogleMap>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <p className="pointer-events-none absolute left-2 top-2 z-[3] max-w-[90%] rounded-lg bg-white/90 px-2 py-1 text-[11px] font-medium text-slate-700 shadow">
        Google 3D · mapa amb rumb · fletxa fixa al centre
      </p>
      <NavigationArrowHud />
      <GoogleMap
        center={center}
        mapContainerClassName={mapContainerClassName}
        onLoad={onMapLoad}
        options={mapOptionsSim}
        zoom={17}
      >
        {directions ? (
          <DirectionsRenderer directions={directions} options={directionsRendererOptions} />
        ) : null}
        {marcadors}
      </GoogleMap>
    </div>
  )
}

export const GoogleDrivingRouteMap = memo(GoogleDrivingRouteMapInner)
