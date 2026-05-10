import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { ConductorRouteMap } from '@/components/truck/ConductorRouteMap'
import { RouteStopsTimeline } from '@/components/truck/RouteStopsTimeline'
import type { LiniaDistribucio } from '@/domain/palletPacking'
import type { Camio } from '@/models/Camio'
import { fetchLiniesDistribucioAmbOrigen } from '@/services/distribucioApi'
import type { DeliveryArrivalPayload } from '@/utils/driveSimulation'
import { resumLiniaEntregaModal } from '@/utils/formatDistribucio'
import { esParadaMagatzem } from '@/utils/paradaMap'
import { timelineScrollLeadIndex } from '@/utils/routePathDrive'

type Props = {
  camio: Camio
}

const PROGRAMMATIC_SCROLL_MS = 720

function isElementFullyVisibleInScroller(row: HTMLElement, scroller: HTMLElement): boolean {
  const sr = scroller.getBoundingClientRect()
  const rr = row.getBoundingClientRect()
  return rr.top >= sr.top - 2 && rr.bottom <= sr.bottom + 2
}

/**
 * Estat de la línia de temps local al panell; el `key` al pare força reinici en canvi de camió/ruta.
 */
export function TruckConductorPanel({ camio }: Props) {
  const [speedKmh, setSpeedKmh] = useState(48)
  const speedMps = speedKmh / 3.6

  const [resetSignal, setResetSignal] = useState(0)
  const [driveMeta, setDriveMeta] = useState<{
    stopDistances: number[]
    totalMeters: number
  } | null>(null)
  const [distanceAlong, setDistanceAlong] = useState(0)
  const [deliveryModal, setDeliveryModal] = useState<DeliveryArrivalPayload | null>(null)
  const [completedDeliveryIndices, setCompletedDeliveryIndices] = useState(
    (): ReadonlySet<number> => new Set(),
  )
  const [journeyCompleteOpen, setJourneyCompleteOpen] = useState(false)
  const [simPlaying, setSimPlaying] = useState(false)
  const [simControlsOpen, setSimControlsOpen] = useState(false)

  const [liniesDistribucio, setLiniesDistribucio] = useState<LiniaDistribucio[] | null>(null)
  const [distribucioError, setDistribucioError] = useState<string | null>(null)

  const stopsScrollRef = useRef<HTMLDivElement>(null)
  const programmaticScrollRef = useRef(false)
  const programmaticScrollTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const userScrollPausedFollowRef = useRef(false)
  const prevLeadIndexRef = useRef(-1)

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
    const r = camio.ruta
    if (!r) {
      setLiniesDistribucio(null)
      setDistribucioError(null)
      return
    }
    let cancelled = false
    setLiniesDistribucio(null)
    setDistribucioError(null)
    void (async () => {
      try {
        const { linies } = await fetchLiniesDistribucioAmbOrigen(
          r.id,
          r.parades.length,
          r.transporteId ?? null,
          r.ordreEntregues ?? null,
        )
        if (!cancelled) {
          setLiniesDistribucio(linies)
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setDistribucioError(e instanceof Error ? e.message : 'No s’han pogut carregar les línies.')
          setLiniesDistribucio([])
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [camio.ruta])

  const liniesModalEntrega = useMemo(() => {
    if (!deliveryModal || !liniesDistribucio?.length) return []
    return liniesDistribucio.filter((l) => l.paradaIndex === deliveryModal.index)
  }, [deliveryModal, liniesDistribucio])

  const clearProgrammaticTimer = useCallback(() => {
    if (programmaticScrollTimerRef.current != null) {
      window.clearTimeout(programmaticScrollTimerRef.current)
      programmaticScrollTimerRef.current = null
    }
  }, [])

  const onDriveReady = useCallback(
    (meta: { stopDistances: number[]; totalMeters: number }) => {
      setDriveMeta(meta)
      setDistanceAlong(0)
      setJourneyCompleteOpen(false)
      setSimPlaying(false)
      userScrollPausedFollowRef.current = false
      prevLeadIndexRef.current = -1
    },
    [],
  )

  const onDriveTick = useCallback((payload: { distanceAlong: number }) => {
    setDistanceAlong(payload.distanceAlong)
  }, [])

  const onDeliveryArrival = useCallback((payload: DeliveryArrivalPayload) => {
    setDeliveryModal(payload)
  }, [])

  const onRouteComplete = useCallback(() => {
    setSimPlaying(false)
    setJourneyCompleteOpen(true)
  }, [])

  const dismissDelivery = useCallback(() => {
    setDeliveryModal((current) => {
      if (current) {
        setCompletedDeliveryIndices((prev) => new Set([...prev, current.index]))
      }
      return null
    })
  }, [])

  const dismissJourneyComplete = useCallback(() => {
    setJourneyCompleteOpen(false)
  }, [])

  const handleReset = () => {
    clearProgrammaticTimer()
    setResetSignal((n) => n + 1)
    setDriveMeta(null)
    setDistanceAlong(0)
    setDeliveryModal(null)
    setJourneyCompleteOpen(false)
    setCompletedDeliveryIndices(new Set())
    setSimPlaying(false)
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

  /** Arribada a entrega: sempre repren seguiment i centra el punt. */
  useEffect(() => {
    if (deliveryModal) {
      userScrollPausedFollowRef.current = false
    }
  }, [deliveryModal])

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

  /** Seguiment suau: només quan canvia la parada objectiu (ritme dels trams de ruta). */
  useEffect(() => {
    if (
      userScrollPausedFollowRef.current ||
      !camio.ruta ||
      !driveMeta ||
      deliveryModal != null
    ) {
      return
    }
    scrollStopsToIndex(scrollLeadIndex, 'smooth')
  }, [scrollLeadIndex, deliveryModal, camio.ruta, driveMeta, scrollStopsToIndex])

  /** Modal d’entrega: centra la fila del punt on ets. */
  useEffect(() => {
    if (!deliveryModal) return
    scrollStopsToIndex(deliveryModal.index, 'smooth')
  }, [deliveryModal, scrollStopsToIndex])

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
      if (deliveryModal != null || journeyCompleteOpen) return
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
  }, [simControlsOpen, deliveryModal, journeyCompleteOpen])

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
              onDeliveryArrival={onDeliveryArrival}
              onDriveReady={onDriveReady}
              onDriveTick={onDriveTick}
              onRouteComplete={onRouteComplete}
              parades={camio.ruta.parades}
              resetSignal={resetSignal}
              simulationPaused={!simPlaying}
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

      {deliveryModal ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[2px]"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900">Entrega</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Has arribat al punt d’entrega:
              <span className="mt-1 block font-semibold text-slate-900">{deliveryModal.nom}</span>
            </p>
            {liniesModalEntrega.length > 0 ? (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Mercaderia a entregar</p>
                <ul className="mt-2 max-h-52 space-y-2 overflow-y-auto text-sm text-slate-800">
                  {liniesModalEntrega.map((l) => (
                    <li className="border-b border-slate-200/80 pb-2 last:border-0 last:pb-0" key={l.producteId}>
                      {resumLiniaEntregaModal(l)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                Sense detall de productes per aquesta parada (comprova la connexió o les taules de la BD).
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              El camió romandrà aturat fins que confirmis la baixada de mercaderia.
            </p>
            <button
              className="mt-6 h-11 w-full rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={dismissDelivery}
              type="button"
            >
              Entrega completada · continuar ruta
            </button>
          </div>
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
