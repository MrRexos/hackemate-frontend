import type { RefObject } from 'react'
import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'

import type { ParadaRuta } from '@/models/Ruta'
import {
  advanceDistanceWithStops,
  blockingDeliveryIndexAtDistance,
  computeSimulationDtSec,
  type DeliveryArrivalPayload,
} from '@/utils/driveSimulation'
import {
  buildPathMetrics,
  computeStopDistancesAlongPath,
  lerpAngleDeg,
  sampleAlongPath,
  type LatLngLiteral,
} from '@/utils/routePathDrive'
import { esParadaMagatzem, ometreMarcadorFiSiMateixMagatzem } from '@/utils/paradaMap'

import { NavigationArrowHud } from './NavigationArrowHud'

import 'leaflet/dist/leaflet.css'

/** Mapa més gran que el visor perquè en girar no es vegin forats als cantons (diagonal + marge). */
const ROTATED_MAP_SURFACE_PERCENT = 300

const MAP_INNER_CLASS = 'z-0 h-full w-full rounded-xl'
const MAP_VIEWPORT_CLASS =
  'relative h-[min(64vh,680px)] w-full min-h-[465px] max-h-[780px] overflow-hidden rounded-xl bg-slate-300'

const MAP_CLASS =
  'z-0 h-[min(64vh,680px)] w-full min-h-[465px] max-h-[780px] overflow-hidden rounded-xl'

const LOOK_AHEAD_M = 38
const HEADING_SMOOTH = 0.14

function paradaDivIcon(index: number, total: number): L.DivIcon {
  const magatzem = esParadaMagatzem(index, total)
  const label = magatzem ? 'M' : String(index + 1)
  const size = magatzem ? 38 : 34
  const bg = magatzem ? '#0f172a' : '#ea580c'
  const html = `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;color:#fff;font:700 ${magatzem ? 12 : 14}px ui-sans-serif,system-ui,sans-serif">${label}</div>`
  return L.divIcon({
    className: 'leaflet-parada-marker-hackemate',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

type SimProps = {
  path: LatLngLiteral[]
  parades: readonly ParadaRuta[]
  speedMps: number
  resetSignal: number
  rotateInnerRef: RefObject<HTMLDivElement | null>
  acknowledgedDeliveryIndices: ReadonlySet<number>
  /** Distància inicial al llarg del camí (p. ex. sessió restaurada). */
  initialDistanceAlong?: number
  onDeliveryArrival: (payload: DeliveryArrivalPayload) => void
  onDriveReady: (meta: { stopDistances: number[]; totalMeters: number }) => void
  onDriveTick: (payload: { distanceAlong: number }) => void
  onRouteComplete?: () => void
  simulationPaused: boolean
}

function OsrmTruckSimulator({
  path,
  parades,
  speedMps,
  resetSignal,
  rotateInnerRef,
  acknowledgedDeliveryIndices,
  initialDistanceAlong,
  onDeliveryArrival,
  onDriveReady,
  onDriveTick,
  onRouteComplete,
  simulationPaused,
}: SimProps) {
  const map = useMap()
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

  useEffect(() => {
    const metrics = buildPathMetrics(path)
    if (metrics.totalMeters < 2) {
      return
    }

    const rotEl = rotateInnerRef.current

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

      if (rotEl) {
        rotEl.style.transform = `translate(-50%, -50%) rotate(${-smoothHeading}deg)`
      }

      map.setView([position.lat, position.lng], 17, { animate: false })

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
      if (rotEl) {
        rotEl.style.transform = 'translate(-50%, -50%) rotate(0deg)'
      }
    }
  }, [map, path, parades, resetSignal, rotateInnerRef, initialDistanceAlong])

  return null
}

function MarcadorsParades({ parades }: { parades: readonly ParadaRuta[] }) {
  return (
    <>
      {parades.map((p, i) => {
        if (ometreMarcadorFiSiMateixMagatzem(parades, i)) return null
        return (
          <Marker
            icon={paradaDivIcon(i, parades.length)}
            key={`${i}-${p.nom}`}
            position={[p.lat, p.lng]}
            zIndexOffset={esParadaMagatzem(i, parades.length) ? 600 + i : 500 + i}
          >
            <Popup>
              <span className="text-sm font-medium">{p.nom}</span>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
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

function OsrmDrivingRouteMapInner({
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
  const [positions, setPositions] = useState<[number, number][]>([])
  const [error, setError] = useState<string | null>(null)
  const rotateInnerRef = useRef<HTMLDivElement>(null)

  const routeKey = useMemo(
    () => parades.map((p) => `${p.lat},${p.lng}`).join('|'),
    [parades],
  )

  const pathLiterals: LatLngLiteral[] = useMemo(
    () => positions.map(([lat, lng]) => ({ lat, lng })),
    [positions],
  )

  useEffect(() => {
    if (parades.length < 2) {
      return
    }

    const coords = parades.map((p) => `${p.lng},${p.lat}`).join(';')
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`

    let cancelled = false

    fetch(url)
      .then((response) => response.json())
      .then((data: { routes?: { geometry?: { coordinates?: [number, number][] } }[] }) => {
        if (cancelled) return
        const raw = data.routes?.[0]?.geometry?.coordinates
        if (!raw?.length) {
          setPositions([])
          setError('No s\'ha pogut calcular la ruta per carrers (OSRM).')
          return
        }
        setPositions(raw.map(([lng, lat]) => [lat, lng] as [number, number]))
      })
      .catch(() => {
        if (cancelled) return
        setPositions([])
        setError('Error de xarxa calculant la ruta.')
      })

    return () => {
      cancelled = true
    }
  }, [parades, routeKey])

  const canSimulate = pathLiterals.length >= 2 && buildPathMetrics(pathLiterals).totalMeters >= 2

  const mapCenter = useMemo((): [number, number] => [parades[0].lat, parades[0].lng], [parades])

  const rotatePct = `${ROTATED_MAP_SURFACE_PERCENT}%`

  if (parades.length === 0) {
    return (
      <div className="flex min-h-[465px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500">
        Sense parades per mostrar al mapa.
      </div>
    )
  }

  if (parades.length === 1) {
    return (
      <MapContainer center={mapCenter} className={MAP_CLASS} scrollWheelZoom zoom={15}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarcadorsParades parades={parades} />
      </MapContainer>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      {error ? (
        <p className="absolute bottom-2 left-2 right-2 z-[500] rounded-lg bg-white/95 px-3 py-2 text-center text-xs text-amber-900 shadow">
          {error} Amb Google Maps la vista 3D és més fluida.
        </p>
      ) : null}
      <NavigationArrowHud />
      <div className={MAP_VIEWPORT_CLASS}>
        <div
          className="absolute left-1/2 top-1/2 will-change-transform"
          ref={rotateInnerRef}
          style={{
            height: rotatePct,
            width: rotatePct,
            transform: 'translate(-50%, -50%) rotate(0deg)',
            transformOrigin: 'center center',
          }}
        >
          <MapContainer
            center={mapCenter}
            className={MAP_INNER_CLASS}
            dragging={false}
            scrollWheelZoom={false}
            zoom={16}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {positions.length > 1 ? (
              <Polyline
                pathOptions={{ color: '#1e293b', weight: 7, opacity: 0.92 }}
                positions={positions}
              />
            ) : null}
            {canSimulate ? (
              <OsrmTruckSimulator
                acknowledgedDeliveryIndices={acknowledgedDeliveryIndices}
                initialDistanceAlong={initialDistanceAlong}
                onDeliveryArrival={onDeliveryArrival}
                onDriveReady={onDriveReady}
                onDriveTick={onDriveTick}
                onRouteComplete={onRouteComplete}
                parades={parades}
                path={pathLiterals}
                resetSignal={resetSignal}
                rotateInnerRef={rotateInnerRef}
                simulationPaused={simulationPaused}
                speedMps={speedMps}
              />
            ) : null}
            <MarcadorsParades parades={parades} />
          </MapContainer>
        </div>
      </div>
    </div>
  )
}

export const OsrmDrivingRouteMap = memo(OsrmDrivingRouteMapInner)
