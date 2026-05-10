import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { ConductorRouteMap } from '@/components/truck/ConductorRouteMap'
import { DistribuidoraCamioPla2D } from '@/components/truck/DistribuidoraCamioPla2D'
import { RouteStopsTimeline } from '@/components/truck/RouteStopsTimeline'
import type { RepartimentRetornCaixesBarrils } from '@/domain/palletPacking'
import {
  descripcioUbicacioRetornablesParada,
  repartirRetorn60PercentEnCaixesIBarrils,
  resumRepartimentRetornText,
  volumMercaderiaNoRetornableParadaAlPla,
} from '@/domain/palletPacking'
import type { Camio } from '@/models/Camio'
import { useCamioDistribucio } from '@/hooks/useCamioDistribucio'
import type { DeliveryArrivalPayload } from '@/utils/driveSimulation'
import {
  clearCamioDistribucioSnapshot,
  fingerprintLiniesDistribucio,
  saveCamioDistribucioSnapshot,
} from '@/utils/camioDistribucioPersistence'
import {
  clearConductorRouteSession,
  loadConductorRouteSession,
  saveConductorRouteSession,
} from '@/utils/conductorRoutePersistence'
import { resumLiniaEntregaModal } from '@/utils/formatDistribucio'
import { esParadaMagatzem } from '@/utils/paradaMap'
import { timelineScrollLeadIndex } from '@/utils/routePathDrive'

type Props = {
  camio: Camio
  /**
   * Si és false (pestanya Distribuidora visible), la simulació es pausa sense perdre posició.
   * El panell roman muntat per conservar estat.
   */
  routeTabVisible?: boolean
  /** Es crida després de reiniciar la ruta per actualitzar la vista Distribuidora (pla de paquets). */
  onReiniciSimulacioRuta?: () => void
}

const PROGRAMMATIC_SCROLL_MS = 720

type DeliveryFlowState =
  | { step: 'arrival'; payload: DeliveryArrivalPayload }
  | { step: 'retornQuestion'; index: number; nom: string }
  | { step: 'retornUbicacio'; index: number; nom: string; repartiment: RepartimentRetornCaixesBarrils }

function deliveryFlowStopIndex(flow: DeliveryFlowState | null): number | null {
  if (!flow) return null
  if (flow.step === 'arrival') return flow.payload.index
  return flow.index
}

function isElementFullyVisibleInScroller(row: HTMLElement, scroller: HTMLElement): boolean {
  const sr = scroller.getBoundingClientRect()
  const rr = row.getBoundingClientRect()
  return rr.top >= sr.top - 2 && rr.bottom <= sr.bottom + 2
}

function bootstrapConductorFromStorage(camio: Camio): {
  distanceAlong: number
  completedDeliveryIndices: ReadonlySet<number>
  speedKmh: number
  journeyCompleteOpen: boolean
  sessionInitialDistanceAlong: number | undefined
} {
  const rutaId = camio.ruta?.id
  if (rutaId == null) {
    return {
      distanceAlong: 0,
      completedDeliveryIndices: new Set(),
      speedKmh: 48,
      journeyCompleteOpen: false,
      sessionInitialDistanceAlong: undefined,
    }
  }
  const snap = loadConductorRouteSession(camio.codi, rutaId)
  if (!snap) {
    return {
      distanceAlong: 0,
      completedDeliveryIndices: new Set(),
      speedKmh: 48,
      journeyCompleteOpen: false,
      sessionInitialDistanceAlong: undefined,
    }
  }
  return {
    distanceAlong: snap.distanceAlong,
    completedDeliveryIndices: new Set(snap.completedDeliveryIndices),
    speedKmh: typeof snap.speedKmh === 'number' && snap.speedKmh > 0 ? snap.speedKmh : 48,
    journeyCompleteOpen: snap.journeyCompleteOpen === true,
    sessionInitialDistanceAlong: snap.distanceAlong,
  }
}

/**
 * Estat de la línia de temps local al panell; el `key` al pare força reinici en canvi de camió/ruta.
 */
export function TruckConductorPanel({ camio, routeTabVisible = true, onReiniciSimulacioRuta }: Props) {
  const [speedKmh, setSpeedKmh] = useState(() => bootstrapConductorFromStorage(camio).speedKmh)
  const speedMps = speedKmh / 3.6

  const [resetSignal, setResetSignal] = useState(0)
  const [driveMeta, setDriveMeta] = useState<{
    stopDistances: number[]
    totalMeters: number
  } | null>(null)
  const [distanceAlong, setDistanceAlong] = useState(() => bootstrapConductorFromStorage(camio).distanceAlong)
  const [deliveryFlow, setDeliveryFlow] = useState<DeliveryFlowState | null>(null)
  const [completedDeliveryIndices, setCompletedDeliveryIndices] = useState(
    (): ReadonlySet<number> => bootstrapConductorFromStorage(camio).completedDeliveryIndices,
  )
  const [journeyCompleteOpen, setJourneyCompleteOpen] = useState(
    () => bootstrapConductorFromStorage(camio).journeyCompleteOpen,
  )
  const [simPlaying, setSimPlaying] = useState(false)
  const [simControlsOpen, setSimControlsOpen] = useState(false)

  /** Distància inicial del simulador quan es restaura una sessió (no es neteja fins reinici o canvi de ruta). */
  const [sessionInitialDistanceAlong, setSessionInitialDistanceAlong] = useState<number | undefined>(
    () => bootstrapConductorFromStorage(camio).sessionInitialDistanceAlong,
  )

  const { error: distribucioError } = useCamioDistribucio(camio)
  const liniesDistribucio = camio.liniesDistribucio

  const stopsScrollRef = useRef<HTMLDivElement>(null)
  const programmaticScrollRef = useRef(false)
  const programmaticScrollTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const userScrollPausedFollowRef = useRef(false)
  const prevLeadIndexRef = useRef(-1)

  const persistRef = useRef({
    codi: camio.codi,
    rutaId: camio.ruta?.id ?? null,
    driveMeta: null as typeof driveMeta,
    distanceAlong: 0,
    completedDeliveryIndices: new Set<number>() as ReadonlySet<number>,
    speedKmh: 48,
    journeyCompleteOpen: false,
  })
  useLayoutEffect(() => {
    persistRef.current = {
      codi: camio.codi,
      rutaId: camio.ruta?.id ?? null,
      driveMeta,
      distanceAlong,
      completedDeliveryIndices,
      speedKmh,
      journeyCompleteOpen,
    }
  }, [
    camio.codi,
    camio.ruta?.id,
    driveMeta,
    distanceAlong,
    completedDeliveryIndices,
    speedKmh,
    journeyCompleteOpen,
  ])

  const persistirPlaSiRouteIniciada = useCallback(() => {
    const p = persistRef.current
    if (p.rutaId == null || !p.driveMeta) return
    const iniciada =
      p.completedDeliveryIndices.size > 0 || p.distanceAlong > 0 || p.journeyCompleteOpen
    if (!iniciada) return
    if (!camio.plaCarrega || camio.liniesDistribucio === null) return
    const fp = fingerprintLiniesDistribucio(camio.liniesDistribucio)
    const snap = camio.extreureSnapshotDistribucioPersistit(fp)
    if (snap) {
      saveCamioDistribucioSnapshot(camio.codi, p.rutaId, snap)
    }
  }, [camio])

  const scrollLeadIndex = useMemo(() => {
    if (!camio.ruta || !driveMeta?.stopDistances) return 0
    return timelineScrollLeadIndex(
      camio.ruta.parades.length,
      driveMeta.stopDistances,
      distanceAlong,
      driveMeta.totalMeters,
    )
  }, [camio.ruta, driveMeta, distanceAlong])

  const entreguesPendents = useMemo(() => {
    if (!camio.ruta) return 0
    const n = camio.ruta.parades.length
    let totalEntregues = 0
    for (let i = 0; i < n; i++) {
      if (!esParadaMagatzem(i, n)) totalEntregues++
    }
    let fetes = 0
    for (const idx of completedDeliveryIndices) {
      if (!esParadaMagatzem(idx, n)) fetes++
    }
    return Math.max(0, totalEntregues - fetes)
  }, [camio.ruta, completedDeliveryIndices])

  useEffect(() => {
    const rutaId = camio.ruta?.id
    if (rutaId == null || !driveMeta) return

    const id = window.setTimeout(() => {
      saveConductorRouteSession(camio.codi, rutaId, {
        distanceAlong,
        completedDeliveryIndices: [...completedDeliveryIndices].sort((a, b) => a - b),
        speedKmh,
        journeyCompleteOpen,
      })
      persistirPlaSiRouteIniciada()
    }, 350)

    return () => window.clearTimeout(id)
  }, [
    camio.codi,
    camio.ruta?.id,
    driveMeta,
    distanceAlong,
    completedDeliveryIndices,
    speedKmh,
    journeyCompleteOpen,
    persistirPlaSiRouteIniciada,
  ])

  useEffect(() => {
    const flush = () => {
      const p = persistRef.current
      if (p.rutaId == null || !p.driveMeta) return
      saveConductorRouteSession(p.codi, p.rutaId, {
        distanceAlong: p.distanceAlong,
        completedDeliveryIndices: [...p.completedDeliveryIndices].sort((a, b) => a - b),
        speedKmh: p.speedKmh,
        journeyCompleteOpen: p.journeyCompleteOpen,
      })
      persistirPlaSiRouteIniciada()
    }
    window.addEventListener('pagehide', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      flush()
    }
  }, [persistirPlaSiRouteIniciada])

  const liniesModalEntrega = useMemo(() => {
    if (!deliveryFlow || deliveryFlow.step !== 'arrival' || !liniesDistribucio?.length) return []
    return liniesDistribucio.filter((l) => l.paradaIndex === deliveryFlow.payload.index)
  }, [deliveryFlow, liniesDistribucio])

  const clearProgrammaticTimer = useCallback(() => {
    if (programmaticScrollTimerRef.current != null) {
      window.clearTimeout(programmaticScrollTimerRef.current)
      programmaticScrollTimerRef.current = null
    }
  }, [])

  const onDriveReady = useCallback(
    (meta: { stopDistances: number[]; totalMeters: number }) => {
      setDriveMeta(meta)
      setDistanceAlong((prev) => Math.max(0, Math.min(prev, meta.totalMeters)))
      setSimPlaying(false)
      if (sessionInitialDistanceAlong === undefined) {
        setJourneyCompleteOpen(false)
        userScrollPausedFollowRef.current = false
        prevLeadIndexRef.current = -1
      }
    },
    [sessionInitialDistanceAlong],
  )

  const onDriveTick = useCallback((payload: { distanceAlong: number }) => {
    setDistanceAlong(payload.distanceAlong)
  }, [])

  const onDeliveryArrival = useCallback((payload: DeliveryArrivalPayload) => {
    setDeliveryFlow({ step: 'arrival', payload })
  }, [])

  const onRouteComplete = useCallback(() => {
    setSimPlaying(false)
    setJourneyCompleteOpen(true)
  }, [])

  const completeDeliveryForIndex = useCallback((index: number) => {
    setCompletedDeliveryIndices((prev) => new Set([...prev, index]))
    setDeliveryFlow(null)
  }, [])

  const dismissJourneyComplete = useCallback(() => {
    setJourneyCompleteOpen(false)
  }, [])

  const handleReset = () => {
    if (camio.ruta?.id != null) {
      clearConductorRouteSession(camio.codi, camio.ruta.id)
      clearCamioDistribucioSnapshot(camio.codi, camio.ruta.id)
    }
    camio.reiniciarEstatDistribucioSimulacio()
    onReiniciSimulacioRuta?.()
    clearProgrammaticTimer()
    setResetSignal((n) => n + 1)
    setDriveMeta(null)
    setDistanceAlong(0)
    setDeliveryFlow(null)
    setJourneyCompleteOpen(false)
    setCompletedDeliveryIndices(new Set())
    setSimPlaying(false)
    setSessionInitialDistanceAlong(undefined)
    userScrollPausedFollowRef.current = false
    prevLeadIndexRef.current = -1
    programmaticScrollRef.current = false
  }

  /** Si la simulació “passa” de parada (índex lead puja), torna el seguiment automàtic. */
  useEffect(() => {
    if (scrollLeadIndex > prevLeadIndexRef.current) {
      userScrollPausedFollowRef.current = false
    }
    prevLeadIndexRef.current = scrollLeadIndex
  }, [scrollLeadIndex])

  /** Flux entrega / retorn: repren seguiment i centra el punt. */
  useEffect(() => {
    if (deliveryFlow) {
      userScrollPausedFollowRef.current = false
    }
  }, [deliveryFlow])

  const scrollStopsToIndex = useCallback((index: number, behavior: ScrollBehavior) => {
    const root = stopsScrollRef.current
    if (!root) return
    const row = root.querySelector(`[data-stop-index="${index}"]`)
    if (!(row instanceof HTMLElement)) return
    clearProgrammaticTimer()
    programmaticScrollRef.current = true
    row.scrollIntoView({ block: 'center', behavior, inline: 'nearest' })
    programmaticScrollTimerRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = false
      programmaticScrollTimerRef.current = null
    }, PROGRAMMATIC_SCROLL_MS)
  }, [clearProgrammaticTimer])

  useEffect(() => () => clearProgrammaticTimer(), [clearProgrammaticTimer])

  /** Quan es torna a mostrar la pestanya Conductor, Leaflet/Google necessiten un resize després de sortir de `display:none`. */
  useEffect(() => {
    if (!routeTabVisible || !camio.ruta) return
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'))
      })
    })
    return () => cancelAnimationFrame(id)
  }, [routeTabVisible, camio.ruta])

  /** Seguiment suau: només quan canvia la parada objectiu (ritme dels trams de ruta). */
  useEffect(() => {
    if (
      userScrollPausedFollowRef.current ||
      !camio.ruta ||
      !driveMeta ||
      deliveryFlow != null ||
      !routeTabVisible
    ) {
      return
    }
    scrollStopsToIndex(scrollLeadIndex, 'smooth')
  }, [scrollLeadIndex, deliveryFlow, routeTabVisible, camio.ruta, driveMeta, scrollStopsToIndex])

  /** Modal entrega / retorn: centra la fila del punt on ets. */
  useEffect(() => {
    const idx = deliveryFlowStopIndex(deliveryFlow)
    if (idx == null) return
    scrollStopsToIndex(idx, 'smooth')
  }, [deliveryFlow, scrollStopsToIndex])

  /** Fi de trajecte: darrera parada. */
  useEffect(() => {
    if (!journeyCompleteOpen || !camio.ruta?.parades.length) return
    userScrollPausedFollowRef.current = false
    const last = camio.ruta.parades.length - 1
    scrollStopsToIndex(last, 'smooth')
  }, [journeyCompleteOpen, camio.ruta, scrollStopsToIndex])

  const tryResumeFollowIfUserRealigned = useCallback(() => {
    const root = stopsScrollRef.current
    if (!root || !userScrollPausedFollowRef.current || !camio.ruta) return
    const row = root.querySelector(`[data-stop-index="${scrollLeadIndex}"]`)
    if (row instanceof HTMLElement && isElementFullyVisibleInScroller(row, root)) {
      userScrollPausedFollowRef.current = false
    }
  }, [scrollLeadIndex, camio.ruta])

  const handleStopsScroll = useCallback(() => {
    if (programmaticScrollRef.current) return
    if (userScrollPausedFollowRef.current) {
      tryResumeFollowIfUserRealigned()
      return
    }
    userScrollPausedFollowRef.current = true
  }, [tryResumeFollowIfUserRealigned])

  const handleStopsWheel = useCallback(() => {
    if (programmaticScrollRef.current) return
    userScrollPausedFollowRef.current = true
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (simControlsOpen) {
          e.preventDefault()
          setSimControlsOpen(false)
        }
        return
      }
      if (deliveryFlow != null || journeyCompleteOpen) return
      const el = e.target
      if (!(el instanceof HTMLElement)) return
      const tag = el.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable) return
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault()
        setSimControlsOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [simControlsOpen, deliveryFlow, journeyCompleteOpen])

  return (
    <div className="relative">
      {camio.ruta ? (
        <button
          aria-expanded={simControlsOpen}
          aria-haspopup="dialog"
          aria-label={simControlsOpen ? 'Tancar controls de simulació' : 'Obrir controls de simulació (tecla C)'}
          className="fixed bottom-4 right-4 z-[1850] flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-800 shadow-md transition hover:bg-slate-50 sm:bottom-5 sm:right-5"
          onClick={() => setSimControlsOpen((o) => !o)}
          type="button"
        >
          <svg
            aria-hidden
            className="h-[18px] w-[18px]"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.723 6.723 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.37.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.077-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : null}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[2.08fr_1.08fr] lg:items-start lg:gap-4">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {camio.ruta ? (
            <ConductorRouteMap
              acknowledgedDeliveryIndices={completedDeliveryIndices}
              initialDistanceAlong={sessionInitialDistanceAlong}
              onDeliveryArrival={onDeliveryArrival}
              onDriveReady={onDriveReady}
              onDriveTick={onDriveTick}
              onRouteComplete={onRouteComplete}
              parades={camio.ruta.parades}
              resetSignal={resetSignal}
              simulationPaused={!simPlaying || deliveryFlow !== null || !routeTabVisible}
              speedMps={speedMps}
            />
          ) : (
            <div className="flex min-h-[465px] items-center justify-center px-4 text-center text-sm text-slate-500">
              No hi ha cap ruta assignada encara.
            </div>
          )}
        </div>

        <aside className="flex min-h-0 max-h-[min(90vh,740px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 lg:max-h-[calc(min(64vh,680px)+2.75rem)]">
          <div className="shrink-0 border-b border-slate-200/70 px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-800">Punts d&apos;entrega</h3>
            {camio.ruta ? (
              <>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="tabular-nums font-medium text-slate-800">{entreguesPendents}</span>{' '}
                  {entreguesPendents === 1 ? 'entrega pendent' : 'entregues pendents'}
                </p>
                {distribucioError ? (
                  <p className="mt-1 text-xs text-amber-800">{distribucioError}</p>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="relative flex min-h-0 flex-1 flex-col">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-14 bg-gradient-to-b from-slate-50 via-slate-50/90 via-40% to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-slate-50 via-slate-50/95 via-35% to-transparent"
            />
            <div
              className="scrollbar-hide min-h-0 flex-1 scroll-pb-28 scroll-pt-16 overflow-y-auto overflow-x-hidden px-4 pb-28 pt-10 [-webkit-overflow-scrolling:touch]"
              onScroll={handleStopsScroll}
              onWheel={handleStopsWheel}
              ref={stopsScrollRef}
            >
              {camio.ruta ? (
                <RouteStopsTimeline
                  completedDeliveryIndices={completedDeliveryIndices}
                  distanceAlong={distanceAlong}
                  parades={camio.ruta.parades}
                  stopDistances={driveMeta?.stopDistances ?? null}
                  totalPathMeters={driveMeta?.totalMeters ?? null}
                />
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">
                  No hi ha cap ruta assignada encara.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {simControlsOpen ? (
        <div
          aria-labelledby="sim-controls-title"
          aria-modal="true"
          className="fixed inset-0 z-[1900] flex items-end justify-center p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:items-center"
          role="dialog"
        >
          <button
            aria-label="Tancar controls"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
            onClick={() => setSimControlsOpen(false)}
            type="button"
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900" id="sim-controls-title">
                Controls de simulació
              </h2>
              <button
                className="shrink-0 rounded-lg px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100"
                onClick={() => setSimControlsOpen(false)}
                type="button"
              >
                Tancar
              </button>
            </div>
            

            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-2">
                <button
                  className="h-10 flex-1 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!camio.ruta || !driveMeta}
                  onClick={() => setSimPlaying((p) => !p)}
                  type="button"
                >
                  {simPlaying ? 'Pausar simulació' : 'Iniciar simulació'}
                </button>
                <button
                  className="h-10 shrink-0 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  onClick={() => {
                    handleReset()
                    setSimControlsOpen(false)
                  }}
                  type="button"
                >
                  Reiniciar ruta
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <label className="flex flex-col gap-2 text-sm text-slate-700" htmlFor="sim-speed-modal">
                  <span className="font-medium">Velocitat simulada</span>
                  <span className="flex items-center gap-3">
                    <input
                      className="h-2 w-full min-w-0 accent-slate-900"
                      id="sim-speed-modal"
                      max={4000}
                      min={5}
                      onChange={(e) => setSpeedKmh(Number(e.target.value))}
                      title="1 km/h = 1/3,6 m/s; temps real entre fotogrames."
                      type="range"
                      value={speedKmh}
                    />
                    <span className="min-w-[3.75rem] shrink-0 tabular-nums text-slate-900">
                      {Math.round(speedKmh)} km/h
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {deliveryFlow ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
          role="dialog"
        >
          {deliveryFlow.step === 'arrival' ? (
            <div className="max-h-[min(92vh,900px)] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">Entrega</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Has arribat al punt d’entrega:
                <span className="mt-1 block font-semibold text-slate-900">{deliveryFlow.payload.nom}</span>
              </p>
              <p className="mt-2 text-xs text-amber-900/90">
                La simulació de la ruta està en pausa fins que finalitzis la comanda.
              </p>

              <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_1fr] lg:items-stretch lg:gap-6">
                <div className="flex min-h-0 flex-col">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Disseny del camió (mercat en verd = aquesta parada)
                  </p>
                  <div className="relative min-h-[200px] w-full overflow-hidden rounded-xl border border-slate-200 bg-[#ebe4d9] lg:min-h-[240px]">
                    {camio.plaCarrega ? (
                      <div className="h-[min(42vh,260px)] min-h-[200px] w-full lg:h-[280px]">
                        <DistribuidoraCamioPla2D
                          compacte
                          encaixaSenseScroll
                          paradaEntregaIndex={deliveryFlow.payload.index}
                          paradesCompletades={completedDeliveryIndices}
                          pla={camio.plaCarrega}
                          senseLlegenda
                          teDesbordament={camio.plaCarrega.teDesbordament}
                          tipusCamio={camio.tipus}
                        />
                      </div>
                    ) : (
                      <div className="flex h-[200px] items-center justify-center px-4 text-center text-sm text-slate-500">
                        Sense pla de càrrega disponible encara.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex min-h-0 flex-col">
                  {liniesModalEntrega.length > 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                        Mercaderia a entregar aquí
                      </p>
                      <ul className="mt-2 max-h-[min(40vh,280px)] space-y-2 overflow-y-auto text-sm text-slate-800 lg:max-h-[320px]">
                        {liniesModalEntrega.map((l) => (
                          <li className="border-b border-slate-200/80 pb-2 last:border-0 last:pb-0" key={l.producteId}>
                            {resumLiniaEntregaModal(l)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
                      Sense detall de productes per aquesta parada (comprova la connexió o les taules de la BD).
                    </p>
                  )}
                  <p className="mt-3 text-xs text-slate-500">
                    El camió romandrà aturat fins que confirmis la baixada de mercaderia.
                  </p>
                </div>
              </div>

              <button
                className="mt-6 h-11 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800"
                onClick={() =>
                  setDeliveryFlow({
                    step: 'retornQuestion',
                    index: deliveryFlow.payload.index,
                    nom: deliveryFlow.payload.nom,
                  })
                }
                type="button"
              >
                He finalitzat la comanda
              </button>
            </div>
          ) : null}

          {deliveryFlow.step === 'retornQuestion' ? (
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-slate-900">Retorn de buits</h3>
              <p className="mt-2 text-sm text-slate-600">
                Has recollit envàs retornable (buits) per portar al magatzem en aquesta entrega?
              </p>
              <p className="mt-2 text-xs text-amber-900/90">La ruta romandrà en pausa fins que responguis.</p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
                <button
                  className="h-11 flex-1 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                  onClick={() => {
                    camio.finalitzarEntregaSenseRetorn(deliveryFlow.index)
                    completeDeliveryForIndex(deliveryFlow.index)
                  }}
                  type="button"
                >
                  No, cap retorn
                </button>
                <button
                  className="h-11 flex-1 rounded-xl bg-emerald-700 text-sm font-semibold text-white transition hover:bg-emerald-800"
                  onClick={() => {
                    if (!camio.plaCarrega) return
                    const vol = volumMercaderiaNoRetornableParadaAlPla(camio.plaCarrega, deliveryFlow.index)
                    const repartiment = repartirRetorn60PercentEnCaixesIBarrils(vol)
                    camio.afegirRetornablesDespresEntrega(deliveryFlow.index)
                    setDeliveryFlow({
                      step: 'retornUbicacio',
                      index: deliveryFlow.index,
                      nom: deliveryFlow.nom,
                      repartiment,
                    })
                  }}
                  type="button"
                >
                  Sí, hi ha retorn
                </button>
              </div>
            </div>
          ) : null}

          {deliveryFlow.step === 'retornUbicacio' ? (
            <div className="max-h-[min(92vh,900px)] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">On guardar el retorn</h3>
              <p className="mt-1 text-sm text-slate-600">
                Parada: <span className="font-semibold text-slate-900">{deliveryFlow.nom}</span>
              </p>
              <p className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800">
                <span className="font-medium text-slate-900">Quantitat aproximada (60% del volum baixat del camió):</span>{' '}
                {resumRepartimentRetornText(deliveryFlow.repartiment)}
              </p>
              <p className="mt-3 rounded-xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-3 text-sm leading-relaxed text-emerald-950">
                {descripcioUbicacioRetornablesParada(camio.plaCarrega, deliveryFlow.index, camio.tipus)}
              </p>
              <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Pla del camió (verd = retornables d’aquesta parada)
              </p>
              <div className="relative min-h-[200px] w-full overflow-hidden rounded-xl border border-slate-200 bg-[#ebe4d9] lg:min-h-[260px]">
                {camio.plaCarrega ? (
                  <div className="h-[min(44vh,280px)] min-h-[220px] w-full lg:h-[300px]">
                    <DistribuidoraCamioPla2D
                      compacte
                      encaixaSenseScroll
                      paradaEntregaIndex={deliveryFlow.index}
                      paradesCompletades={completedDeliveryIndices}
                      pla={camio.plaCarrega}
                      teDesbordament={camio.plaCarrega.teDesbordament}
                      tipusCamio={camio.tipus}
                    />
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center px-4 text-center text-sm text-slate-500">
                    Sense pla de càrrega.
                  </div>
                )}
              </div>
              <button
                className="mt-6 h-11 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800"
                onClick={() => completeDeliveryForIndex(deliveryFlow.index)}
                type="button"
              >
                Ja està col·locat · Continuar la ruta
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {journeyCompleteOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">Trajecte finalitzat</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Has completat tota la ruta d’avui. <span className="font-semibold text-slate-800">Fins demà!</span>
            </p>
            <p className="mt-2 text-xs text-slate-500">Fi de la simulació.</p>
            <button
              className="mt-6 h-11 w-full rounded-xl bg-emerald-700 text-sm font-semibold text-white transition hover:bg-emerald-800"
              onClick={dismissJourneyComplete}
              type="button"
            >
              D’acord
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
