import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as L from 'leaflet'
import {
  ArrowUpRight,
  Award,
  Box,
  Calendar,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  Package,
  Play,
  Percent,
  Road,
  RotateCcw,
  ThumbsDown,
  UsersRound,
  Weight,
  type LucideIcon,
} from 'lucide-react'
import { TruckLoadPlanner } from '@/components/TruckLoadPlanner'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { planningDataset } from '@/data/planningData'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { siteConfig } from '@/lib/site'
import type { AppView } from '@/types/navigation'
import type {
  PlanningDay,
  PlanningDaySummary,
  PlanningLoadRow,
  PlanningMaterialBreakdownItem,
  TruckType,
} from '@/types/planning'
import { getRoadRoutePolyline } from '@/utils/roadRouting'
import {
  buildDistributionPlan,
  getDefaultAvailability,
  type DistributionPlan,
  type PlannedTruck,
  type PolylinePoint,
  type RouteClient,
  type TruckAvailability,
} from '@/utils/routeOptimizer'
import { cn } from '@/utils/cn'
import type { LoadPiece, TruckLoadPlan } from '@/utils/loadPlanner'
import { formatDisplayProductTitle, splitDisplayProductNames } from '@/utils/productDisplay'
import truck6Icon from '../../assets/truck6.svg'
import truck8Icon from '../../assets/truck8.svg'
import vanIcon from '../../assets/van.svg'

type HomePageProps = {
  activeView: AppView
  onNavigate: (view: AppView) => void
}

type RouteSimulationStatus = 'idle' | 'running' | 'finished'

type RouteSimulationRunState = {
  elapsedMs: number
  routeKey: string
  runId: number
  status: RouteSimulationStatus
}

type RouteSimulationPhaseBase = {
  realEndMs: number
  realStartMs: number
  routeEndMinute: number
  routeStartMinute: number
}

type RouteSimulationDrivePhase = RouteSimulationPhaseBase & {
  destinationClientId: string
  destinationName: string
  kind: 'drive'
  legIndex: number
}

type RouteSimulationServicePhase = RouteSimulationPhaseBase & {
  clientId: string
  clientName: string
  kind: 'service'
  legIndex: number
  serviceMinutes: number
}

type RouteSimulationPhase = RouteSimulationDrivePhase | RouteSimulationServicePhase

type RouteProductItem = {
  material: string
  materialBreakdown: PlanningMaterialBreakdownItem[]
  product: string
  quantity: number
  unit: string
}

type RouteSimulationTimeline = {
  finishMinute: number
  phases: readonly RouteSimulationPhase[]
  startMinute: number
  totalRealMs: number
}

type RouteSimulationSnapshot = {
  clockLabel: string
  complete: boolean
  detailLabel: string
  highlightedClientId: string
  isStopped: boolean
  legIndex: number
  legProgress: number
  statusLabel: string
}

const numberFormatter = new Intl.NumberFormat('es-ES')
const decimalFormatter = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 })
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const statusLabels: Record<string, string> = {
  ok: 'En ventana',
  espera: 'Espera',
  tarde: 'Fuera de ventana',
}

const truckRouteColors = [
  '#C53030',
  '#2563EB',
  '#059669',
  '#D97706',
  '#7C3AED',
  '#0891B2',
  '#DB2777',
  '#4D7C0F',
  '#EA580C',
  '#475569',
  '#9333EA',
  '#0F766E',
  '#BE123C',
  '#1D4ED8',
  '#854D0E',
  '#15803D',
] as const

const EMPTY_ROUTE_CLIENTS: readonly RouteClient[] = []
const EMPTY_ROAD_POLYLINES: Record<string, readonly PolylinePoint[]> = {}
const ROUTE_START_MINUTE = 8 * 60
const EMPTY_ROUTE_SIMULATION_TIMELINE: RouteSimulationTimeline = {
  finishMinute: ROUTE_START_MINUTE,
  phases: [],
  startMinute: ROUTE_START_MINUTE,
  totalRealMs: 0,
}
const HOME_DISPLAY_DATE = '2026-05-09'
const ROUTE_DEFAULT_TRUCK_INDEX = 11
const ROUTE_DRIVE_MINUTES_PER_SECOND = 12
const ROUTE_MIN_DRIVE_MS = 800
const ROUTE_MAX_DRIVE_MS = 8_500
const ROUTE_STOP_MS_PER_SERVICE_MINUTE = 240
const ROUTE_MIN_STOP_MS = 2_200
const ROUTE_MAX_STOP_MS = 7_500
const ROUTE_ANIMATION_STATE_INTERVAL_MS = 80
const ROUTE_DAY_MINUTES = 24 * 60
const ROUTE_MIDNIGHT_ROLLOVER_AFTER_MINUTE = 18 * 60
const ROUTE_MIDNIGHT_ROLLOVER_BEFORE_MINUTE = 6 * 60
const HOME_INITIAL_AVAILABILITY_BY_CAPACITY: Record<number, number> = {
  3: 2,
  6: 10,
  8: 6,
}
const HOME_IDEAL_TARGET_CAPACITY_USE = 0.84
const HOME_IDEAL_MAX_CAPACITY_USE = 0.88
const HOME_IDEAL_MIN_CAPACITY_USE = 0.74
const HOME_IDEAL_CLIENTS_PER_TRANSPORT = 13
const HOME_IDEAL_PALLETS_PER_TRANSPORT = 6.2
const HOME_IDEAL_EXTRA_TRANSPORT_BUFFER = 8
const HOME_IDEAL_ROUTE_SHARE_BY_CAPACITY: Record<number, number> = {
  3: 0.125,
  6: 0.625,
  8: 0.25,
}

export function HomePage({ activeView, onNavigate }: HomePageProps) {
  const defaultDate =
    planningDataset.days['2026-02-05']?.date ?? planningDataset.dates[0]?.date ?? ''
  const defaultDay = planningDataset.days[defaultDate]
  const [selectedDate, setSelectedDate] = useState(defaultDate)
  const [availability, setAvailability] = useState<TruckAvailability>(() =>
    getHomeIdealAvailability(defaultDay, planningDataset.truckTypes),
  )
  const [selectedTruckId, setSelectedTruckId] = useState('')
  const selectedDay = planningDataset.days[selectedDate]
  const hasTrucks = Object.values(availability).some((value) => value > 0)
  const plan = useMemo(() => {
    if (!selectedDay || !hasTrucks) {
      return null
    }
    return buildDistributionPlan(
      selectedDay,
      planningDataset.truckTypes,
      availability,
      planningDataset.depot,
    )
  }, [availability, hasTrucks, selectedDay])
  const effectiveSelectedTruckId = getEffectiveSelectedTruckId(plan, selectedTruckId)

  useDocumentTitle(`${siteConfig.name} | ${viewTitle(activeView)}`)

  function handleAvailabilityChange(typeId: string, value: number) {
    setAvailability((current) => ({
      ...current,
      [typeId]: Math.max(0, Math.floor(Number.isFinite(value) ? value : 0)),
    }))
  }

  function handleDateChange(date: string) {
    setSelectedDate(date)
    setSelectedTruckId('')
    setAvailability(getHomeIdealAvailability(planningDataset.days[date], planningDataset.truckTypes))
  }

  if (activeView === 'pedidos') {
    return (
      <OrdersView
        availability={availability}
        dateOptions={planningDataset.dates}
        hasTrucks={hasTrucks}
        onAvailabilityChange={handleAvailabilityChange}
        onCalculate={() => onNavigate('organizacion')}
        onDateChange={handleDateChange}
        plan={plan}
        selectedDate={selectedDate}
        selectedDay={selectedDay}
        truckTypes={planningDataset.truckTypes}
      />
    )
  }

  return (
    <section
      className={cn(
        'min-h-[calc(100vh-55px)] bg-[#fdf4ec] pb-16 text-[#47392b]',
        activeView === 'ruta'
          ? 'px-2 pt-[58px] sm:px-3'
          : 'px-5 pt-8 sm:px-6 min-[1100px]:pt-12',
      )}
    >
      <Container className={cn('px-0 sm:px-0 lg:px-0', activeView === 'ruta' ? 'max-w-[1168px]' : 'max-w-[1104px]')}>
      {activeView === 'organizacion' ? (
        <OrganizationView
          onNavigate={onNavigate}
          onSelectTruck={setSelectedTruckId}
          plan={plan}
          selectedTruckId={selectedTruckId}
        />
      ) : null}
      {activeView === 'ruta' ? (
        <RouteDetailView
          onSelectTruck={setSelectedTruckId}
          plan={plan}
          selectedTruckId={effectiveSelectedTruckId}
        />
      ) : null}
      </Container>
    </section>
  )
}

function OrdersView({
  availability,
  dateOptions,
  hasTrucks,
  onAvailabilityChange,
  onCalculate,
  onDateChange,
  plan,
  selectedDate,
  selectedDay,
  truckTypes,
}: {
  availability: TruckAvailability
  dateOptions: readonly PlanningDaySummary[]
  hasTrucks: boolean
  onAvailabilityChange: (typeId: string, value: number) => void
  onCalculate: () => void
  onDateChange: (date: string) => void
  plan: DistributionPlan | null
  selectedDate: string
  selectedDay: PlanningDay | undefined
  truckTypes: readonly TruckType[]
}) {
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
  const datePickerRef = useRef<HTMLDivElement | null>(null)
  const selectorDate = selectedDate === '2026-02-05' ? HOME_DISPLAY_DATE : selectedDate
  const transportOptions = getTransportOptions(truckTypes, availability)
  const summary = selectedDay?.summary
  const availableTransports = countAvailableTransports(availability, truckTypes)
  const usedTransports = plan?.summary.usedTrucks ?? 0
  const dayCapacity = summary ? Math.round(summary.pallets) : 0
  const warning = getHomeWarning(plan, selectedDay, hasTrucks)
  const homeMetrics = [
    {
      icon: UsersRound,
      label: 'CLIENTES',
      value: summary ? numberFormatter.format(summary.clients) : '0',
    },
    {
      icon: Package,
      label: 'PEDIDOS',
      value: summary ? formatOrderCount(summary.lines) : '0',
    },
    {
      icon: Road,
      label: 'TRANSPORTES',
      value: availableTransports > 0 ? `${usedTransports}/${availableTransports}` : '0/0',
    },
    {
      icon: Grid3X3,
      label: 'PALETS',
      value: summary ? numberFormatter.format(Math.round(summary.pallets)) : '0',
    },
    {
      icon: Weight,
      label: 'PESO',
      value: summary ? `${formatRoundedKg(summary.weightKg)} kg` : '0 kg',
      compactValue: true,
    },
    {
      icon: Box,
      label: 'VOLUMEN',
      value: summary ? `${numberFormatter.format(Math.round(summary.pallets) * 10)} m³` : '0 m³',
      compactValue: true,
    },
    {
      icon: Percent,
      label: 'CAPACIDAD DEL DÍA',
      value: `${numberFormatter.format(dayCapacity)} %`,
      compactValue: true,
    },
  ] satisfies readonly HomeMetric[]

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!datePickerRef.current?.contains(event.target as Node)) {
        setIsDateMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  return (
    <section
      className="min-h-[calc(100vh-48px)] bg-[#fdf4ec] px-5 pb-8 pt-[62px] text-[#47392b] min-[1100px]:min-h-[calc(100vh-70px)] min-[1100px]:pb-16 min-[1100px]:pt-[84px] sm:px-6"
      id="pedidos"
    >
      <h1 className="mx-auto max-w-[620px] text-center text-[28px] font-bold leading-[1.22] text-[#47392b] min-[1100px]:max-w-[765px] min-[1100px]:text-[36px] sm:text-[30px]">
        SELECCIONA UNA FECHA Y
        <br />
        TRANSPORTES DISPONIBLES
      </h1>

      <div className="mx-auto mt-[44px] flex flex-wrap items-center justify-center gap-[17px] min-[1100px]:mt-[63px]">
        <div className="flex h-[56px] w-full max-w-[426px] items-center justify-center rounded-[18px] bg-[#fdf9f6] px-[26px] min-[1100px]:h-[75px] min-[1100px]:max-w-[573px] min-[1100px]:rounded-[24px] min-[1100px]:px-[28px]">
          <div className="relative" ref={datePickerRef}>
            <button
              aria-expanded={isDateMenuOpen}
              className="flex min-w-0 items-center gap-[12px] text-[15px] font-bold text-[#322d28] outline-none min-[1100px]:gap-[14px] min-[1100px]:text-[19px]"
              onClick={() => setIsDateMenuOpen((current) => !current)}
              type="button"
            >
              <span className="whitespace-nowrap">{formatSelectorDate(selectorDate)}</span>
              <Calendar
                aria-hidden="true"
                className="size-[18px] shrink-0 min-[1100px]:size-[23px]"
                strokeWidth={2.35}
              />
            </button>
            {isDateMenuOpen ? (
              <div className="absolute left-0 top-[calc(100%+10px)] z-20 max-h-[310px] w-[112px] overflow-y-auto border border-[#d8d1ca] bg-white py-1 shadow-sm">
                {dateOptions.map((option) => (
                  <button
                    className={cn(
                      'block w-full px-2 py-[6px] text-left text-[13px] font-medium leading-none text-[#111111] outline-none hover:bg-[#f6e5d4]',
                      option.date === selectedDate && 'bg-[#f6e5d4]',
                    )}
                    key={option.date}
                    onClick={() => {
                      onDateChange(option.date)
                      setIsDateMenuOpen(false)
                    }}
                    type="button"
                  >
                    {formatSelectorDate(option.date).replaceAll(' ', '')}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <span className="mx-[20px] h-[28px] w-px shrink-0 bg-[#ece7e3] min-[1100px]:mx-[26px] min-[1100px]:h-[29px]" />

          <div className="flex items-center gap-[17px] min-[1100px]:gap-[29px]">
            {transportOptions.map((option) => (
              <label className="flex items-center gap-[7px]" key={option.type.id}>
                <input
                  aria-label={option.type.label}
                  className="w-[34px] bg-transparent text-center text-[15px] font-bold leading-none text-[#322d28] outline-none min-[1100px]:w-[38px] min-[1100px]:text-[19px]"
                  min={0}
                  onChange={(event) => onAvailabilityChange(option.type.id, Number(event.target.value))}
                  type="number"
                  value={option.value}
                />
                <img
                  alt=""
                  aria-hidden="true"
                  className={cn('shrink-0 opacity-70', option.iconClassName)}
                  src={option.icon}
                />
              </label>
            ))}
          </div>
        </div>

        <button
          aria-label="Calcular organización"
          className="flex size-[31px] items-center justify-center rounded-full bg-[#c53030] text-white outline-none transition hover:bg-[#b12b2b] disabled:cursor-not-allowed disabled:opacity-45 min-[1100px]:size-[36px]"
          disabled={!selectedDay || !hasTrucks}
          onClick={onCalculate}
          type="button"
        >
          <ArrowUpRight aria-hidden="true" className="size-[18px] min-[1100px]:size-[21px]" strokeWidth={2.8} />
        </button>
      </div>

      <div className="mx-auto mt-[37px] flex w-full max-w-[889px] flex-col items-center gap-[22px]">
        <div className="grid w-full max-w-[661px] gap-[20px] min-[640px]:grid-cols-3">
          {homeMetrics.slice(0, 3).map((metric) => (
            <HomeMetricCard key={metric.label} metric={metric} />
          ))}
        </div>
        <div className="grid w-full max-w-[889px] gap-[20px] min-[760px]:grid-cols-4">
          {homeMetrics.slice(3).map((metric) => (
            <HomeMetricCard key={metric.label} metric={metric} />
          ))}
        </div>
        {warning ? (
          <p className="mt-[65px] max-w-[706px] text-center text-[13px] font-bold leading-5 text-[#c53030]">
            {warning}
          </p>
        ) : null}
      </div>
    </section>
  )
}

type HomeMetric = {
  icon: LucideIcon
  label: string
  value: string
  compactValue?: boolean
}

function HomeMetricCard({ metric }: { metric: HomeMetric }) {
  const Icon = metric.icon

  return (
    <div className="flex h-[80px] items-center rounded-[14px] bg-[#f6e5d4] px-[20px]">
      <Icon
        aria-hidden="true"
        className="size-[35px] shrink-0 text-[#a99583]"
        strokeWidth={2.35}
      />
      <div className="ml-[18px] min-w-0">
        <p className="whitespace-nowrap text-[10.5px] font-bold leading-none text-[#b8aa9c]">
          {metric.label}
        </p>
        <p
          className={cn(
            'mt-[7px] whitespace-nowrap font-bold leading-none text-[#806a54]',
            metric.compactValue ? 'text-[23px]' : 'text-[29px]',
          )}
        >
          {metric.value}
        </p>
      </div>
    </div>
  )
}

function getTransportOptions(
  truckTypes: readonly TruckType[],
  availability: TruckAvailability,
) {
  return truckTypes.map((type) => {
    const iconData = getTruckIconData(type)

    return {
      icon: iconData.icon,
      iconClassName: iconData.className,
      type,
      value: availability[type.id] ?? 0,
    }
  })
}

function getTruckIconData(type: TruckType) {
  if (type.palletCapacity === 3) {
    return { icon: vanIcon, className: 'h-[16px] w-[17px] min-[1100px]:h-[21px] min-[1100px]:w-[21px]' }
  }
  if (type.palletCapacity === 6) {
    return { icon: truck6Icon, className: 'h-[16px] w-[19px] min-[1100px]:h-[22px] min-[1100px]:w-[22px]' }
  }
  return { icon: truck8Icon, className: 'h-[20px] w-[24px] min-[1100px]:h-[32px] min-[1100px]:w-[32px]' }
}

function OrganizationView({
  onNavigate,
  onSelectTruck,
  plan,
  selectedTruckId,
}: {
  onNavigate: (view: AppView) => void
  onSelectTruck: (truckId: string) => void
  plan: DistributionPlan | null
  selectedTruckId: string
}) {
  const selectedTruck = plan?.trucks.find((truck) => truck.id === selectedTruckId)
  const selectedRouteId = selectedTruck?.id ?? ''
  function handleSelectTruck(truckId: string) {
    onSelectTruck(truckId === selectedRouteId ? '' : truckId)
  }

  if (!plan) {
    return <EmptyState title="Sin planificación" body="Selecciona una fecha y al menos un transporte en Pedidos." />
  }

  const allRoutesMapKey = `${plan.date}-${plan.assignedTrucks
    .map((truck) => `${truck.id}:${truck.clients.length}`)
    .join('|')}`
  const selectedMapTruckId = plan.assignedTrucks.some((truck) => truck.id === selectedRouteId)
    ? selectedRouteId
    : ''

  return (
    <div className="space-y-[34px]" id="organizacion">
      <section>
        <h1 className="max-w-4xl text-[28px] font-bold leading-[1.18] text-[#47392b] sm:text-[34px]">
          Distribución optimizada para {formatDate(plan.date)}.
        </h1>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Usados" value={`${plan.summary.usedTrucks}/${plan.summary.availableTrucks}`} />
        <Kpi label="Clientes" value={plan.summary.clients} />
        <Kpi label="Palets día" value={decimalFormatter.format(plan.summary.pallets)} />
        <Kpi label="Score" value={formatScore(plan.summary.operationalScore)} tone="accent" />
      </section>

      <section className="route-section distribution-transports-section">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="route-section-title">Transportes:</h2>
          {selectedTruck ? (
            <Button
              disabled={selectedTruck.clients.length === 0}
              onClick={() => onNavigate('ruta')}
            >
              Ver ruta
            </Button>
          ) : null}
        </div>
        <DistributionTransportsList
          onSelectTruck={handleSelectTruck}
          selectedTruckId={selectedRouteId}
          trucks={plan.trucks}
        />
      </section>

      {selectedTruck ? (
        <section className="route-section route-truck-section distribution-truck-section">
          <TruckLoadPlanner
            detailMode="contents"
            onSelectClient={() => undefined}
            plan={selectedTruck.loadPlan}
            showFloorPlan
          />
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="route-distribution-map-title">Mapa global de rutas</h2>
          </div>
        </div>
        <OrganizationRoutesMap
          depot={planningDataset.depot}
          onSelectTruck={handleSelectTruck}
          routeKey={allRoutesMapKey}
          selectedTruckId={selectedMapTruckId}
          trucks={plan.assignedTrucks}
        />
      </section>
    </div>
  )
}

function DistributionTransportsList({
  onSelectTruck,
  selectedTruckId,
  trucks,
}: {
  onSelectTruck: (truckId: string) => void
  selectedTruckId: string
  trucks: readonly PlannedTruck[]
}) {
  return (
    <div className="route-orders-card">
      {trucks.map((truck, index) => {
        const expanded = truck.id === selectedTruckId
        const status = transportStatusLabel(truck)

        return (
          <article
            className={cn('route-order-row', expanded && 'route-order-row-selected')}
            key={truck.id}
          >
            <button
              className="route-order-summary"
              onClick={() => onSelectTruck(truck.id)}
              type="button"
            >
              <span className="route-order-number">{index + 1}.</span>
              <span className="route-order-site">
                <strong>{routeTruckLabel(trucks, truck)}</strong>
                <small>{truck.type.label}</small>
              </span>
              <span className="route-order-pedidos">{truck.summary.clients} clientes</span>
              <span className="route-order-weight">
                {formatKg(truck.summary.weightKg)}
                <small>{formatCeilPalletUnit(truck.summary.pallets)}</small>
              </span>
              <span className="route-order-priority">
                <strong>{status.label}</strong>
                <small>{status.detail}</small>
              </span>
              <span className="route-order-time">
                <strong>{truck.summary.clients > 0 ? truck.route.optimized.finish : '--:--'}</strong>
                <small>Fin estimado</small>
              </span>
              {expanded ? (
                <ChevronUp aria-hidden="true" className="route-order-chevron" strokeWidth={3.2} />
              ) : (
                <ChevronDown aria-hidden="true" className="route-order-chevron" strokeWidth={3.2} />
              )}
            </button>
            {expanded ? <DistributionTransportExpanded truck={truck} /> : null}
          </article>
        )
      })}
    </div>
  )
}

function DistributionTransportExpanded({ truck }: { truck: PlannedTruck }) {
  const splitIndex = Math.ceil(truck.clients.length / 2)
  const columns = [truck.clients.slice(0, splitIndex), truck.clients.slice(splitIndex)]

  return (
    <div className="route-order-expanded-content">
      <div className="route-order-expanded-meta">
        <span>
          CAPACIDAD: <strong>{Math.ceil(truck.summary.pallets)}/{truck.capacityPallets} PALETS</strong>
        </span>
        <span>
          RUTA:{' '}
          <strong>
            {truck.clients.length > 0
              ? `${formatKmRounded(truck.route.optimized.distanceKm)} · ${formatMinutes(truck.route.optimized.totalMinutes)}`
              : 'SIN CLIENTES'}
          </strong>
        </span>
      </div>

      {truck.clients.length > 0 ? (
        <div className="route-order-clients">
          {columns.map((column, index) => (
            <ul key={index}>
              {column.map((client) => (
                <li key={client.clientId}>
                  <strong>
                    {client.optimizedSequence}. {client.name}
                  </strong>
                  <small>
                    {client.address} · {client.postalCode} {client.city}
                  </small>
                  <span>
                    {client.arrival} · {formatKg(client.weightKg)} · {formatPalletUnit(client.pallets)}
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      ) : (
        <p className="route-order-empty">Este transporte queda disponible sin clientes asignados.</p>
      )}
    </div>
  )
}

function RouteDetailView({
  onSelectTruck,
  plan,
  selectedTruckId,
}: {
  onSelectTruck: (truckId: string) => void
  plan: DistributionPlan | null
  selectedTruckId: string
}) {
  const selectedTruck =
    plan?.assignedTrucks.find((truck) => truck.id === selectedTruckId) ?? plan?.assignedTrucks[0]
  const clients = selectedTruck?.clients ?? EMPTY_ROUTE_CLIENTS
  const [selectedClientId, setSelectedClientId] = useState('')
  const [routeSimulation, setRouteSimulation] = useState<RouteSimulationRunState>({
    elapsedMs: 0,
    routeKey: '',
    runId: 0,
    status: 'idle',
  })
  const routeSimulationElapsedRef = useRef(0)
  const selectedTruckKey = selectedTruck?.id ?? ''
  const effectiveSelectedClientId = clients.some((client) => client.clientId === selectedClientId)
    ? selectedClientId
    : ''
  const activeRouteSimulationStatus =
    routeSimulation.routeKey === selectedTruckKey ? routeSimulation.status : 'idle'
  const simulationTimeline = useMemo(
    () => (selectedTruck ? buildRouteSimulationTimeline(selectedTruck) : EMPTY_ROUTE_SIMULATION_TIMELINE),
    [selectedTruck],
  )
  const simulationSnapshot = useMemo(() => {
    if (activeRouteSimulationStatus === 'idle') {
      return null
    }

    return getRouteSimulationSnapshot(simulationTimeline, routeSimulation.elapsedMs)
  }, [activeRouteSimulationStatus, routeSimulation.elapsedMs, simulationTimeline])

  const handleSelectClient = useCallback((clientId: string) => {
    setSelectedClientId((currentClientId) => (currentClientId === clientId ? '' : clientId))
  }, [])

  const handleStartRoute = useCallback(() => {
    if (!selectedTruck || clients.length === 0) {
      return
    }

    setSelectedClientId('')
    setRouteSimulation((current) => ({
      elapsedMs: simulationTimeline.totalRealMs > 0 ? 0 : simulationTimeline.totalRealMs,
      routeKey: selectedTruck.id,
      runId: current.runId + 1,
      status: simulationTimeline.totalRealMs > 0 ? 'running' : 'finished',
    }))
  }, [clients.length, selectedTruck, simulationTimeline.totalRealMs])

  useEffect(() => {
    routeSimulationElapsedRef.current = routeSimulation.elapsedMs
  }, [routeSimulation.elapsedMs])

  useEffect(() => {
    if (routeSimulation.status !== 'running' || routeSimulation.routeKey !== selectedTruckKey) {
      return
    }

    const totalRealMs = simulationTimeline.totalRealMs
    const startedAt = performance.now() - routeSimulationElapsedRef.current
    let animationFrame = 0
    let lastStateUpdate = 0

    function tick(now: number) {
      const elapsedMs = Math.min(totalRealMs, now - startedAt)
      const shouldUpdateState =
        elapsedMs >= totalRealMs || now - lastStateUpdate >= ROUTE_ANIMATION_STATE_INTERVAL_MS

      if (shouldUpdateState) {
        lastStateUpdate = now
        setRouteSimulation((current) => {
          if (current.status !== 'running' || current.routeKey !== selectedTruckKey) {
            return current
          }

          return {
            ...current,
            elapsedMs,
            status: elapsedMs >= totalRealMs ? 'finished' : 'running',
          }
        })
      }

      if (elapsedMs < totalRealMs) {
        animationFrame = window.requestAnimationFrame(tick)
      }
    }

    animationFrame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [
    routeSimulation.routeKey,
    routeSimulation.runId,
    routeSimulation.status,
    selectedTruckKey,
    simulationTimeline.totalRealMs,
  ])

  const topProducts = useMemo(() => {
    const totals = new Map<string, RouteProductItem>()
    for (const row of selectedTruck?.masterRows ?? []) {
      const key = `${row.material}-${row.product}`
      const current = totals.get(key) ?? {
        material: row.material,
        materialBreakdown: [],
        product: row.product,
        quantity: 0,
        unit: row.unit,
      }
      current.quantity += row.quantity
      current.materialBreakdown = mergeMaterialBreakdown(
        current.materialBreakdown,
        materialBreakdownForRow(row),
      )
      totals.set(key, current)
    }
    return [...totals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 6)
  }, [selectedTruck])

  const rowsByClient = useMemo(() => {
    const rows = new Map<string, PlanningLoadRow[]>()
    for (const row of selectedTruck?.masterRows ?? []) {
      const clientRows = rows.get(row.clientId) ?? []
      clientRows.push(row)
      rows.set(row.clientId, clientRows)
    }
    return rows
  }, [selectedTruck])

  const statusCounts = useMemo(() => {
    return clients.reduce(
      (accumulator, client) => {
        accumulator[client.windowStatus] = (accumulator[client.windowStatus] ?? 0) + 1
        return accumulator
      },
      {} as Record<string, number>,
    )
  }, [clients])

  if (!plan || !selectedTruck) {
    return <EmptyState title="Sin ruta" body="Calcula una organización y selecciona un camión asignado." />
  }

  const selectedTruckName = routeTruckLabel(plan.assignedTrucks, selectedTruck)
  const activeSelectedClientId = simulationSnapshot?.highlightedClientId || effectiveSelectedClientId
  const routeClockLabel = simulationSnapshot?.clockLabel ?? formatRouteClockMinute(simulationTimeline.startMinute)
  const routeStartLabel =
    activeRouteSimulationStatus === 'finished'
      ? 'Repetir ruta'
      : activeRouteSimulationStatus === 'running'
        ? 'Reiniciar ruta'
        : 'Iniciar ruta'
  const RouteStartIcon = activeRouteSimulationStatus === 'idle' ? Play : RotateCcw

  return (
    <div className="route-screen" id="ruta">
      <section className="route-hero-panel">
        <div className="route-title-row">
          <h1>Ruta para el {selectedTruckName}:</h1>
          <label className="route-select-label">
            <span className="sr-only">Camión</span>
          <select
              className="route-truck-select"
            onChange={(event) => onSelectTruck(event.target.value)}
            value={selectedTruck.id}
          >
              {plan.assignedTrucks.map((truck) => (
              <option key={truck.id} value={truck.id}>
                  {routeTruckLabel(plan.assignedTrucks, truck)}
              </option>
            ))}
          </select>
            <ChevronDown aria-hidden="true" className="route-select-chevron" strokeWidth={2.4} />
        </label>
        </div>

        <div className="route-kpi-grid">
          <RouteKpiCard icon={UsersRound} label="Clientes" value={selectedTruck.summary.clients} />
          <RouteKpiCard icon={Package} label="Pedidos" value={selectedTruck.summary.deliveries} />
          <RouteKpiCard
            className="route-kpi-card-wide"
            icon={Weight}
            label="Peso"
            value={formatKg(selectedTruck.summary.weightKg)}
          />
          <RouteKpiCard icon={Box} label="Volumen" value={formatM3(selectedTruck.summary.volumeM3)} />
          <RouteKpiCard icon={Grid3X3} label="Palets" value={selectedTruck.capacityPallets} />
          </div>

        <div className="route-comparison-row">
          <RouteComparisonCard
            icon={ThumbsDown}
              label="Orden original"
            value={`${formatKmRounded(selectedTruck.route.original.distanceKm)} · ${formatMinutes(selectedTruck.route.original.totalMinutes)}`}
            />
          <RouteComparisonCard
            icon={Award}
              label="Hackemate"
            value={`${formatKmRounded(selectedTruck.route.optimized.distanceKm)} · ${formatMinutes(selectedTruck.route.optimized.totalMinutes)}`}
            variant="highlight"
            />
          </div>

        <div className="route-map-heading">
          <h2>Mapa del reparto:</h2>
          <div className="route-simulation-controls">
            <div
              className={cn(
                'route-simulation-clock',
                simulationSnapshot?.isStopped && 'route-simulation-clock-stopped',
                simulationSnapshot?.complete && 'route-simulation-clock-complete',
              )}
            >
              <strong>{routeClockLabel}</strong>
            </div>
            <button
              className="route-start-button"
              disabled={clients.length === 0}
              onClick={handleStartRoute}
              type="button"
            >
              <RouteStartIcon aria-hidden="true" className="route-start-button-icon" strokeWidth={2.8} />
              <span>{routeStartLabel}</span>
            </button>
          </div>
          </div>

        <div className="route-map-frame">
          <RouteMap
            clients={clients}
            depot={planningDataset.depot}
            onSelectClient={handleSelectClient}
            optimizedPolyline={selectedTruck.optimizedPolyline}
            originalPolyline={selectedTruck.originalPolyline}
            routeKey={selectedTruck.id}
            selectedClientId={activeSelectedClientId}
            showOriginalRoute={false}
            simulation={simulationSnapshot}
          />
        </div>
      </section>

      <section className="route-section route-deliveries-section">
        <h2 className="route-section-title">Repartos:</h2>
        <RouteOrdersList
            clients={clients}
            loadPlan={selectedTruck.loadPlan}
            onSelectClient={handleSelectClient}
          rowsByClient={rowsByClient}
            selectedClientId={activeSelectedClientId}
          />
      </section>

      <section className="route-section route-truck-section">
          <TruckLoadPlanner
            onSelectClient={handleSelectClient}
            plan={selectedTruck.loadPlan}
            selectedClientId={activeSelectedClientId}
            showFloorPlan
          />
      </section>

      <section className="route-section route-extras-section">
        <h2 className="route-section-title">Extras:</h2>
        <div className="route-extras-grid">
          <RouteProductsCard products={topProducts} />

          <div className="route-score-panel">
            <h3>Score operativo</h3>
            <div>
            <ScoreLine label="Score original" value={formatScore(selectedTruck.route.original.operationalScore)} />
            <ScoreLine label="Score Hackemate" value={formatScore(selectedTruck.route.optimized.operationalScore)} />
            <ScoreLine label="Mejora" value={formatScore(selectedTruck.route.scoreImprovement)} strong />
            <ScoreLine label="Tiempo ahorrado" value={formatMinutes(selectedTruck.route.savingsMinutes)} />
            <ScoreLine
              label="Distancia"
              value={`${decimalFormatter.format(selectedTruck.route.optimized.distanceKm)} km (${decimalFormatter.format(selectedTruck.route.savingsKm)} km menos)`}
            />
            <ScoreLine label="Fin estimado" value={selectedTruck.route.optimized.finish} />
            <ScoreLine
              label="Penalización horarios"
              value={`${decimalFormatter.format(selectedTruck.route.optimized.waitMinutes)} min espera - ${decimalFormatter.format(selectedTruck.route.optimized.lateMinutes)} min tarde`}
            />
            <ScoreLine
              label="Prioridad/carga"
              value={`${formatScore(selectedTruck.route.optimized.priorityPenalty)} / ${formatScore(selectedTruck.route.optimized.loadPenalty)}`}
            />
            <ScoreLine
              label="Ventanas correctas"
              value={`${statusCounts.ok ?? 0}/${selectedTruck.summary.clients}`}
            />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function RouteOrdersList({
  clients,
  loadPlan,
  onSelectClient,
  rowsByClient,
  selectedClientId,
}: {
  clients: readonly RouteClient[]
  loadPlan: TruckLoadPlan
  onSelectClient: (clientId: string) => void
  rowsByClient: ReadonlyMap<string, readonly PlanningLoadRow[]>
  selectedClientId: string
}) {
  return (
    <div className="route-orders-card">
      {clients.map((client) => {
        const expanded = client.clientId === selectedClientId
        return (
          <article
            className={cn('route-order-row', expanded && 'route-order-row-selected')}
            key={client.clientId}
          >
            <button
              className="route-order-summary"
              onClick={() => onSelectClient(client.clientId)}
              type="button"
            >
              <span className="route-order-number">{client.optimizedSequence}.</span>
              <span className="route-order-site">
                <strong>{client.name}</strong>
                <small>
                  {client.address}
                  <br />
                  {client.postalCode} {client.city}
                </small>
              </span>
              <span className="route-order-pedidos">{client.deliveries.length} pedidos</span>
              <span className="route-order-weight">
                {formatKg(client.weightKg)}
                <small>{formatPalletUnit(client.pallets)}</small>
              </span>
              <span className="route-order-priority">
                <strong>{client.priorityLabel}</strong>
                <small>{client.priorityReasons[0] ?? 'Sin restricción'}</small>
              </span>
              <span className="route-order-time">
                <strong>{client.arrival}</strong>
                <small>
                  {client.window.label} - {statusLabels[client.windowStatus] ?? client.windowStatus}
                </small>
              </span>
              {expanded ? (
                <ChevronUp aria-hidden="true" className="route-order-chevron" strokeWidth={3.2} />
              ) : (
                <ChevronDown aria-hidden="true" className="route-order-chevron" strokeWidth={3.2} />
              )}
            </button>
            {expanded ? (
              <RouteOrderExpanded
                client={client}
                loadPlan={loadPlan}
                rows={rowsByClient.get(client.clientId) ?? []}
              />
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

function RouteOrderExpanded({
  client,
  loadPlan,
  rows,
}: {
  client: RouteClient
  loadPlan: TruckLoadPlan
  rows: readonly PlanningLoadRow[]
}) {
  const visibleRows = rows.slice(0, 8)
  const splitIndex = Math.ceil(visibleRows.length / 2)
  const columns = [visibleRows.slice(0, splitIndex), visibleRows.slice(splitIndex)]

  return (
    <div className="route-order-expanded-content">
      <div className="route-order-expanded-meta">
        <span>
          ZONA DE CARGA: <strong>Z{client.loadZone}</strong>
        </span>
        <span>
          DESCARGA: <strong>{formatMinutes(client.serviceMinutes)}</strong>
        </span>
      </div>
      <div className="route-order-products">
        {columns.map((column, index) => (
          <ul key={index}>
            {column.map((row) => (
              <li className={cn(row.returnable && 'route-order-product-returnable')} key={row.lineId}>
                <strong title={formatDisplayProductTitle(row.product)}>
                  {decimalFormatter.format(row.quantity)} {row.unit || 'uds'} de{' '}
                  <ProductNameLines product={row.product} />
                </strong>
                <span>{formatRowPalletLocation(row, loadPlan)}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

function Kpi({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string | number
  tone?: 'default' | 'accent'
}) {
  const toneClass = tone === 'accent' ? 'bg-[#c53030] text-white' : 'bg-[#f6e5d4] text-[#806a54]'
  return (
    <div className={`rounded-[13px] p-4 ${toneClass}`}>
      <p
        className={cn(
          'text-[11px] font-bold uppercase leading-none tracking-wide',
          tone === 'accent' ? 'text-white/75' : 'text-[#b8aa9c]',
        )}
      >
        {label}
      </p>
      <p className={cn('mt-3 text-[24px] font-bold leading-none', tone === 'accent' ? 'text-white' : 'text-[#806a54]')}>
        {value}
      </p>
    </div>
  )
}

function RouteKpiCard({
  className,
  icon: Icon,
  label,
  value,
}: {
  className?: string
  icon: LucideIcon
  label: string
  value: string | number
}) {
  return (
    <div className={cn('route-kpi-card', className)}>
      <Icon aria-hidden="true" className="route-kpi-icon" strokeWidth={2.1} />
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function RouteComparisonCard({
  icon: Icon,
  label,
  value,
  variant = 'default',
}: {
  icon: LucideIcon
  label: string
  value: string
  variant?: 'default' | 'highlight'
}) {
  return (
    <div className={cn('route-comparison-card', variant === 'highlight' && 'route-comparison-card-highlight')}>
      <Icon aria-hidden="true" className="route-comparison-icon" strokeWidth={2.3} />
      <div>
        <p>
        {label}
      </p>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function ScoreLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="route-score-line">
      <span>{label}</span>
      <strong className={strong ? 'route-score-line-strong' : undefined}>{value}</strong>
    </div>
  )
}

function RouteProductsCard({
  products,
}: {
  products: readonly RouteProductItem[]
}) {
  return (
    <div className="route-products-card">
      <h3>Lista de todos los productos</h3>
      <ul>
        {products.map((product) => {
          const materials = formatProductMaterials(product)
          return (
            <li key={`${product.material}-${product.product}`}>
              <span>
                <strong title={formatDisplayProductTitle(product.product)}>
                  <ProductNameLines product={product.product} />
                </strong>
                <small title={materials}>{materials}</small>
              </span>
              <em>
                {decimalFormatter.format(product.quantity)} {product.unit}
              </em>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ProductNameLines({ product }: { product: string | readonly string[] }) {
  const products = splitDisplayProductNames(product)

  return (
    <>
      {products.map((productName, index) => (
        <Fragment key={`${productName}-${index}`}>
          {index > 0 ? <br /> : null}
          {productName}
        </Fragment>
      ))}
    </>
  )
}

function formatRowPalletLocation(row: PlanningLoadRow, loadPlan: TruckLoadPlan) {
  const palletNumbers = getRowPalletNumbers(row, loadPlan)

  if (palletNumbers.length === 0) {
    return row.returnable ? 'Reserva retornables' : 'Sin palet'
  }

  return palletNumbers.length === 1
    ? `Palet ${palletNumbers[0]}`
    : `Palets ${palletNumbers.join(', ')}`
}

function getRowPalletNumbers(row: PlanningLoadRow, loadPlan: TruckLoadPlan) {
  if (row.returnable) {
    return uniqueSortedNumbers(
      loadPlan.pallets
        .filter((pallet) => pallet.reservedForReturnables)
        .map((pallet) => pallet.slotNumber),
    )
  }

  const exactMatches = uniqueSortedNumbers(
    loadPlan.pallets
      .filter((pallet) => pallet.pieces.some((piece) => pieceMatchesRow(piece, row, true)))
      .map((pallet) => pallet.slotNumber),
  )

  if (exactMatches.length > 0) {
    return exactMatches
  }

  return uniqueSortedNumbers(
    loadPlan.pallets
      .filter((pallet) => pallet.pieces.some((piece) => pieceMatchesRow(piece, row, false)))
      .map((pallet) => pallet.slotNumber),
  )
}

function pieceMatchesRow(piece: LoadPiece, row: PlanningLoadRow, exact: boolean) {
  if (piece.clientId !== row.clientId || piece.productType !== row.productType) {
    return false
  }

  if (!exact) {
    return true
  }

  const rowProducts = splitDisplayProductNames(row.product)
  const pieceProducts = splitDisplayProductNames(piece.products)
  const productMatches = rowProducts.some((product) => pieceProducts.includes(product))

  if (productMatches) {
    return true
  }

  const pieceMaterials = new Set([
    ...piece.materialCodes,
    ...piece.materialBreakdown.map((item) => item.material),
  ])
  return rowMaterialCodes(row).some((material) => pieceMaterials.has(material))
}

function rowMaterialCodes(row: PlanningLoadRow) {
  return materialBreakdownForRow(row)
    .flatMap((item) => item.material.split(','))
    .map((material) => material.trim())
    .filter(Boolean)
}

function uniqueSortedNumbers(values: readonly number[]) {
  return [...new Set(values)].sort((a, b) => a - b)
}

function materialBreakdownForRow(row: PlanningLoadRow): PlanningMaterialBreakdownItem[] {
  const breakdown = row.materialBreakdown?.filter((item) => item.material) ?? []
  if (breakdown.length > 0) {
    return breakdown.map((item) => ({
      material: item.material,
      quantity: item.quantity,
    }))
  }

  return row.material
    ? [{
        material: row.material,
        quantity: row.quantity,
      }]
    : []
}

function mergeMaterialBreakdown(
  current: readonly PlanningMaterialBreakdownItem[],
  additions: readonly PlanningMaterialBreakdownItem[],
): PlanningMaterialBreakdownItem[] {
  const totals = new Map<string, number>()
  for (const item of [...current, ...additions]) {
    totals.set(item.material, (totals.get(item.material) ?? 0) + item.quantity)
  }
  return [...totals.entries()].map(([material, quantity]) => ({ material, quantity }))
}

function formatProductMaterials(product: RouteProductItem) {
  const materialCodes = product.material
    ? product.material.split(',').map((material) => material.trim()).filter(Boolean)
    : product.materialBreakdown.map((item) => item.material)

  if (materialCodes.length === 0) {
    return 'Sin código'
  }

  const quantitiesByMaterial = new Map(product.materialBreakdown.map((item) => [item.material, item.quantity]))
  return materialCodes
    .map((material) => {
      const quantity = quantitiesByMaterial.get(material)
      return typeof quantity === 'number' ? `${material} x${decimalFormatter.format(quantity)}` : material
    })
    .join(', ')
}

function OrganizationRoutesMap({
  depot,
  onSelectTruck,
  routeKey,
  selectedTruckId,
  trucks,
}: {
  depot: { name: string; lat: number; lng: number }
  onSelectTruck: (truckId: string) => void
  routeKey: string
  selectedTruckId: string
  trucks: readonly PlannedTruck[]
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const fittedRef = useRef(false)
  const roadPolylineBatchKey = useMemo(
    () => `${routeKey}|${trucks.map((truck) => `${truck.id}:${polylineSignature(truck.optimizedPolyline)}`).join('|')}`,
    [routeKey, trucks],
  )
  const [roadPolylineState, setRoadPolylineState] = useState<{
    key: string
    polylines: Record<string, readonly PolylinePoint[]>
  }>({ key: '', polylines: EMPTY_ROAD_POLYLINES })
  const roadPolylineByTruck =
    roadPolylineState.key === roadPolylineBatchKey
      ? roadPolylineState.polylines
      : EMPTY_ROAD_POLYLINES

  useEffect(() => {
    fittedRef.current = false
  }, [routeKey])

  useEffect(() => {
    let cancelled = false

    void Promise.all(
      trucks.map(async (truck) => {
        const polyline = await getRoadRoutePolyline(truck.optimizedPolyline)
        return [truck.id, polyline] as const
      }),
    ).then((entries) => {
      if (!cancelled) {
        setRoadPolylineState({
          key: roadPolylineBatchKey,
          polylines: Object.fromEntries(entries),
        })
      }
    })

    return () => {
      cancelled = true
    }
  }, [roadPolylineBatchKey, trucks])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const map = L.map(containerRef.current, {
      attributionControl: false,
      scrollWheelZoom: false,
      zoomControl: false,
    }).setView([depot.lat, depot.lng], 10)

    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      className: 'route-map-tiles',
      maxZoom: 20,
    }).addTo(map)

    mapRef.current = map
    window.setTimeout(() => map.invalidateSize(), 0)

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [depot.lat, depot.lng])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    layerRef.current?.remove()
    const layer = L.layerGroup().addTo(map)
    layerRef.current = layer

    L.circleMarker([depot.lat, depot.lng], {
      color: '#1A1A1A',
      fillColor: '#1A1A1A',
      fillOpacity: 0.9,
      radius: 7,
      weight: 2,
    })
      .addTo(layer)
      .bindTooltip(depot.name, { direction: 'top' })

    for (const [truckIndex, truck] of trucks.entries()) {
      const color = truckRouteColors[truckIndex % truckRouteColors.length]
      const isSelected = truck.id === selectedTruckId
      const hasSelectedRoute = selectedTruckId.length > 0
      const routePolyline = roadPolylineByTruck[truck.id] ?? truck.optimizedPolyline
      const line = routePolyline.map((point) => [point.lat, point.lng] as [number, number])

      if ((!hasSelectedRoute || isSelected) && line.length > 1) {
        L.polyline(line, {
          color,
          opacity: isSelected ? 0.95 : 0.62,
          weight: isSelected ? 5 : 3,
        }).addTo(layer)
      }

      for (const client of truck.clients) {
        if (isSelected) {
          const marker = L.marker([client.lat, client.lng], {
            icon: createRouteSequenceIcon(client.optimizedSequence, color, false),
            title: `${client.optimizedSequence}. ${client.name}`,
            zIndexOffset: 500,
          }).addTo(layer)

          marker.bindTooltip(`${truck.label} · ${client.optimizedSequence}. ${client.name}`, {
            direction: 'top',
          })
          marker.on('click', () => onSelectTruck(truck.id))
          continue
        }

        const marker = L.circleMarker([client.lat, client.lng], {
          color,
          fillColor: '#FFFBF7',
          fillOpacity: 0.82,
          radius: 4.5,
          weight: 1.8,
        }).addTo(layer)

        marker.bindTooltip(`${truck.label} · ${client.optimizedSequence}. ${client.name}`, {
          direction: 'top',
          offset: [0, -4],
        })
        marker.on('click', () => onSelectTruck(truck.id))
      }
    }

    if (!fittedRef.current) {
      const points = trucks.flatMap((truck) => truck.clients.map((client) => [client.lat, client.lng] as [number, number]))
      const bounds = L.latLngBounds([
        [depot.lat, depot.lng],
        ...points,
      ])
      map.fitBounds(bounds, { padding: [32, 32] })
      fittedRef.current = true
    }

    return () => {
      layer.remove()
    }
  }, [
    depot.lat,
    depot.lng,
    depot.name,
    onSelectTruck,
    roadPolylineByTruck,
    selectedTruckId,
    trucks,
  ])

  return (
    <div className="mx-auto max-w-[820px]">
      <div className="relative h-[480px] overflow-hidden rounded-[18px] bg-[#eef0ee]">
        <div className="h-full w-full" ref={containerRef} />
        <div className="pointer-events-none absolute left-3 top-3 rounded-[13px] bg-[#fdf9f6]/95 px-3 py-2 text-xs font-bold text-[#47392b]">
          {selectedTruckId ? 'Ruta seleccionada' : 'Todas las rutas'}
        </div>
      </div>
      <div className="grid gap-2 pt-3 sm:grid-cols-2 lg:grid-cols-3">
        {trucks.map((truck, index) => (
          <button
            className={cn(
              'flex min-w-0 items-center gap-2 rounded-[13px] px-3 py-2 text-left text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c53030]',
              truck.id === selectedTruckId
                ? 'bg-[#c53030] text-white'
                : 'bg-transparent hover:bg-[#f6e5d4]/55',
            )}
            key={truck.id}
            onClick={() => onSelectTruck(truck.id)}
            type="button"
          >
            <span
              className="h-2.5 w-7 shrink-0 rounded-full"
              style={{ backgroundColor: truckRouteColors[index % truckRouteColors.length] }}
            />
            <span className={cn('truncate font-bold', truck.id === selectedTruckId ? 'text-white' : 'text-[#47392b]')}>
              {truck.label} · {truck.summary.clients} clientes
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function RouteMap({
  clients,
  depot,
  optimizedPolyline,
  originalPolyline,
  routeKey,
  selectedClientId,
  showOriginalRoute,
  simulation,
  onSelectClient,
}: {
  clients: readonly RouteClient[]
  depot: { name: string; lat: number; lng: number }
  optimizedPolyline: readonly PolylinePoint[]
  originalPolyline: readonly PolylinePoint[]
  routeKey: string
  selectedClientId: string
  showOriginalRoute: boolean
  simulation?: RouteSimulationSnapshot | null
  onSelectClient: (clientId: string) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const vehicleMarkerRef = useRef<L.Marker | null>(null)
  const vehicleStoppedRef = useRef<boolean | null>(null)
  const fittedRef = useRef(false)
  const roadRouteKey = useMemo(
    () =>
      `${routeKey}|${polylineSignature(optimizedPolyline)}|${
        showOriginalRoute ? polylineSignature(originalPolyline) : ''
      }`,
    [optimizedPolyline, originalPolyline, routeKey, showOriginalRoute],
  )
  const [roadRouteState, setRoadRouteState] = useState<{
    key: string
    optimizedLegs: readonly (readonly PolylinePoint[])[] | null
    optimizedPolyline: readonly PolylinePoint[] | null
    originalPolyline: readonly PolylinePoint[] | null
  }>({ key: '', optimizedLegs: null, optimizedPolyline: null, originalPolyline: null })
  const hasCurrentRoadRoute = roadRouteState.key === roadRouteKey

  useEffect(() => {
    fittedRef.current = false
  }, [routeKey])

  useEffect(() => {
    let cancelled = false

    const optimizedLegRequests = optimizedPolyline.slice(0, -1).map((point, index) => {
      return getRoadRoutePolyline([point, optimizedPolyline[index + 1]])
    })

    void Promise.all([
      getRoadRoutePolyline(optimizedPolyline),
      showOriginalRoute ? getRoadRoutePolyline(originalPolyline) : Promise.resolve(null),
      Promise.all(optimizedLegRequests),
    ]).then(([roadOptimizedPolyline, roadOriginalPolyline, roadOptimizedLegs]) => {
      if (!cancelled) {
        setRoadRouteState({
          key: roadRouteKey,
          optimizedLegs: roadOptimizedLegs,
          optimizedPolyline: roadOptimizedPolyline,
          originalPolyline: roadOriginalPolyline,
        })
      }
    })

    return () => {
      cancelled = true
    }
  }, [optimizedPolyline, originalPolyline, roadRouteKey, showOriginalRoute])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const map = L.map(containerRef.current, {
      attributionControl: false,
      scrollWheelZoom: false,
      zoomControl: false,
    }).setView([depot.lat, depot.lng], 10)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      className: 'route-map-tiles',
      maxZoom: 20,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      vehicleMarkerRef.current = null
    }
  }, [depot.lat, depot.lng])

  useEffect(() => {
    return () => {
      vehicleMarkerRef.current?.remove()
      vehicleMarkerRef.current = null
      vehicleStoppedRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return
    }

    layerRef.current?.remove()
    const layer = L.layerGroup().addTo(map)
    layerRef.current = layer

    const optimizedRoutePolyline =
      hasCurrentRoadRoute && roadRouteState.optimizedPolyline
        ? roadRouteState.optimizedPolyline
        : optimizedPolyline
    const originalRoutePolyline =
      hasCurrentRoadRoute && roadRouteState.originalPolyline
        ? roadRouteState.originalPolyline
        : originalPolyline
    const optimizedLine = optimizedRoutePolyline.map((point) => [point.lat, point.lng] as [number, number])
    const originalLine = originalRoutePolyline.map((point) => [point.lat, point.lng] as [number, number])

    if (showOriginalRoute && originalLine.length > 1) {
      L.polyline(originalLine, {
        color: '#6B6B6B',
        dashArray: '6 8',
        opacity: 0.42,
        weight: 2,
      }).addTo(layer)
    }

    if (optimizedLine.length > 1) {
      L.polyline(optimizedLine, {
        color: '#D0312D',
        opacity: 0.92,
        weight: 5,
      }).addTo(layer)
    }

    L.circleMarker([depot.lat, depot.lng], {
      color: '#1A1A1A',
      fillColor: '#1A1A1A',
      fillOpacity: 0.94,
      radius: 8,
      weight: 2,
    })
      .addTo(layer)
      .bindTooltip(depot.name, { direction: 'top' })

    for (const client of clients) {
      const selected = client.clientId === selectedClientId
      const marker = L.marker([client.lat, client.lng], {
        icon: createRouteSequenceIcon(client.optimizedSequence, '#D0312D', selected),
        title: `${client.optimizedSequence}. ${client.name}`,
        zIndexOffset: selected ? 500 : 0,
      }).addTo(layer)

      marker.bindTooltip(`${client.optimizedSequence}. ${client.name}`, {
        direction: 'top',
      })
      marker.on('click', () => onSelectClient(client.clientId))
    }

    if (!fittedRef.current) {
      const bounds = L.latLngBounds([
        [depot.lat, depot.lng],
        ...clients.map((client) => [client.lat, client.lng] as [number, number]),
      ])
      map.fitBounds(bounds, { padding: [54, 54] })
      fittedRef.current = true
    }

    return () => {
      layer.remove()
    }
  }, [
    clients,
    depot.lat,
    depot.lng,
    depot.name,
    hasCurrentRoadRoute,
    optimizedPolyline,
    originalPolyline,
    roadRouteState,
    selectedClientId,
    showOriginalRoute,
    onSelectClient,
  ])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !simulation) {
      vehicleMarkerRef.current?.remove()
      vehicleMarkerRef.current = null
      vehicleStoppedRef.current = null
      return
    }

    const point = getSimulationMapPoint(
      simulation,
      optimizedPolyline,
      hasCurrentRoadRoute ? roadRouteState.optimizedLegs : null,
    )
    if (!point) {
      return
    }

    const latLng: [number, number] = [point.lat, point.lng]
    if (!vehicleMarkerRef.current) {
      vehicleMarkerRef.current = L.marker(latLng, {
        icon: createRouteVehicleIcon(simulation.isStopped),
        interactive: false,
        keyboard: false,
        zIndexOffset: 1_000,
      }).addTo(map)
      vehicleStoppedRef.current = simulation.isStopped
      return
    }

    vehicleMarkerRef.current.setLatLng(latLng)
    if (vehicleStoppedRef.current !== simulation.isStopped) {
      vehicleMarkerRef.current.setIcon(createRouteVehicleIcon(simulation.isStopped))
      vehicleStoppedRef.current = simulation.isStopped
    }
  }, [hasCurrentRoadRoute, optimizedPolyline, roadRouteState.optimizedLegs, simulation])

  return (
    <div className="route-map-canvas">
      <div className="h-full w-full" ref={containerRef} />
    </div>
  )
}

function polylineSignature(polyline: readonly PolylinePoint[]) {
  return polyline.map((point) => `${point.lng.toFixed(6)},${point.lat.toFixed(6)}`).join(';')
}

function createRouteSequenceIcon(sequence: number, color: string, selected: boolean) {
  const label = String(sequence)
  const height = selected ? 30 : 24
  const width = Math.max(height, label.length * (selected ? 13 : 11) + 14)

  return L.divIcon({
    className: 'route-sequence-marker',
    html: `<span class="route-sequence-marker-badge${
      selected ? ' route-sequence-marker-badge-selected' : ''
    }" style="--route-marker-color:${color}">${label}</span>`,
    iconAnchor: [width / 2, height / 2],
    iconSize: [width, height],
    tooltipAnchor: [0, -height / 2],
  })
}

function createRouteVehicleIcon(isStopped: boolean) {
  return L.divIcon({
    className: 'route-vehicle-marker-wrapper',
    html: `<span class="route-vehicle-marker${
      isStopped ? ' route-vehicle-marker-stopped' : ''
    }"><span></span></span>`,
    iconAnchor: [18, 18],
    iconSize: [36, 36],
  })
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[18px] bg-[#fdf9f6] p-8">
      <h1 className="text-2xl font-bold text-[#47392b]">{title}</h1>
      <p className="mt-3 text-sm font-medium leading-6 text-[#806a54]">{body}</p>
    </div>
  )
}

function buildRouteSimulationTimeline(truck: PlannedTruck): RouteSimulationTimeline {
  const phases: RouteSimulationPhase[] = []
  let routeMinute = ROUTE_START_MINUTE
  let realMs = 0

  truck.clients.forEach((client, index) => {
    const arrivalMinute = parseRouteClockMinute(client.arrival, routeMinute) ?? routeMinute
    const driveMinutes = Math.max(0, arrivalMinute - routeMinute)
    if (driveMinutes > 0) {
      const realDurationMs = driveRealDurationMs(driveMinutes)
      phases.push({
        destinationClientId: client.clientId,
        destinationName: client.name,
        kind: 'drive',
        legIndex: index,
        realEndMs: realMs + realDurationMs,
        realStartMs: realMs,
        routeEndMinute: arrivalMinute,
        routeStartMinute: routeMinute,
      })
      realMs += realDurationMs
      routeMinute = arrivalMinute
    }

    const serviceMinutes = Math.max(0, client.serviceMinutes)
    if (serviceMinutes > 0) {
      const realDurationMs = serviceRealDurationMs(serviceMinutes)
      phases.push({
        clientId: client.clientId,
        clientName: client.name,
        kind: 'service',
        legIndex: index,
        realEndMs: realMs + realDurationMs,
        realStartMs: realMs,
        routeEndMinute: routeMinute + serviceMinutes,
        routeStartMinute: routeMinute,
        serviceMinutes,
      })
      realMs += realDurationMs
      routeMinute += serviceMinutes
    }
  })

  const finishMinute = parseRouteClockMinute(truck.route.optimized.finish, routeMinute) ?? routeMinute
  const returnDriveMinutes = Math.max(0, finishMinute - routeMinute)
  if (returnDriveMinutes > 0) {
    const realDurationMs = driveRealDurationMs(returnDriveMinutes)
    phases.push({
      destinationClientId: '',
      destinationName: 'base',
      kind: 'drive',
      legIndex: truck.clients.length,
      realEndMs: realMs + realDurationMs,
      realStartMs: realMs,
      routeEndMinute: finishMinute,
      routeStartMinute: routeMinute,
    })
    realMs += realDurationMs
  }

  return {
    finishMinute,
    phases,
    startMinute: ROUTE_START_MINUTE,
    totalRealMs: realMs,
  }
}

function getRouteSimulationSnapshot(
  timeline: RouteSimulationTimeline,
  elapsedMs: number,
): RouteSimulationSnapshot {
  if (timeline.phases.length === 0 || elapsedMs >= timeline.totalRealMs) {
    return {
      clockLabel: formatRouteClockMinute(timeline.finishMinute),
      complete: true,
      detailLabel: 'Ruta finalizada',
      highlightedClientId: '',
      isStopped: false,
      legIndex: Math.max(0, timeline.phases[timeline.phases.length - 1]?.legIndex ?? 0),
      legProgress: 1,
      statusLabel: 'Llegada a base',
    }
  }

  const phase = timeline.phases.find((item) => elapsedMs < item.realEndMs) ?? timeline.phases[0]
  const phaseDurationMs = Math.max(1, phase.realEndMs - phase.realStartMs)
  const phaseProgress = clampValue((elapsedMs - phase.realStartMs) / phaseDurationMs, 0, 1)
  const routeMinute = interpolateValue(phase.routeStartMinute, phase.routeEndMinute, phaseProgress)

  if (phase.kind === 'service') {
    return {
      clockLabel: formatRouteClockMinute(routeMinute),
      complete: false,
      detailLabel: `${formatMinutes(phase.serviceMinutes)} de descarga`,
      highlightedClientId: phase.clientId,
      isStopped: true,
      legIndex: phase.legIndex,
      legProgress: 1,
      statusLabel: `Descargando en ${phase.clientName}`,
    }
  }

  return {
    clockLabel: formatRouteClockMinute(routeMinute),
    complete: false,
    detailLabel: phase.destinationClientId ? 'En recorrido' : 'Regreso a fábrica',
    highlightedClientId: phase.destinationClientId,
    isStopped: false,
    legIndex: phase.legIndex,
    legProgress: phaseProgress,
    statusLabel: phase.destinationClientId ? `Hacia ${phase.destinationName}` : 'Volviendo a base',
  }
}

function getSimulationMapPoint(
  simulation: RouteSimulationSnapshot,
  routePoints: readonly PolylinePoint[],
  routeLegs: readonly (readonly PolylinePoint[])[] | null,
) {
  const origin = routePoints[simulation.legIndex]
  const destination = routePoints[simulation.legIndex + 1] ?? origin
  if (!origin || !destination) {
    return null
  }

  const roadLeg = routeLegs?.[simulation.legIndex]
  const leg = roadLeg && roadLeg.length > 1 ? roadLeg : [origin, destination]
  return pointAtPolylineProgress(leg, simulation.legProgress)
}

function pointAtPolylineProgress(polyline: readonly PolylinePoint[], progress: number) {
  if (polyline.length === 0) {
    return null
  }
  if (polyline.length === 1) {
    return polyline[0]
  }

  const targetDistance =
    polylineDistance(polyline) * clampValue(progress, 0, 1)
  let coveredDistance = 0

  for (let index = 0; index < polyline.length - 1; index += 1) {
    const start = polyline[index]
    const end = polyline[index + 1]
    const segmentDistance = distanceBetweenPoints(start, end)
    if (coveredDistance + segmentDistance >= targetDistance) {
      const segmentProgress =
        segmentDistance > 0 ? (targetDistance - coveredDistance) / segmentDistance : 0
      return {
        lat: interpolateValue(start.lat, end.lat, segmentProgress),
        lng: interpolateValue(start.lng, end.lng, segmentProgress),
      }
    }
    coveredDistance += segmentDistance
  }

  return polyline[polyline.length - 1]
}

function polylineDistance(polyline: readonly PolylinePoint[]) {
  let total = 0
  for (let index = 0; index < polyline.length - 1; index += 1) {
    total += distanceBetweenPoints(polyline[index], polyline[index + 1])
  }
  return total
}

function distanceBetweenPoints(a: PolylinePoint, b: PolylinePoint) {
  const latScale = 111_320
  const lngScale = Math.cos(degreesToRadians((a.lat + b.lat) / 2)) * 111_320
  return Math.hypot((b.lat - a.lat) * latScale, (b.lng - a.lng) * lngScale)
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180
}

function parseRouteClockMinute(value: string, minimumMinute: number) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value)
  if (!match) {
    return null
  }

  const clockMinute = Number(match[1]) * 60 + Number(match[2])
  const minimumDayStart = Math.floor(minimumMinute / ROUTE_DAY_MINUTES) * ROUTE_DAY_MINUTES
  const sameDayMinute = minimumDayStart + clockMinute

  if (sameDayMinute >= minimumMinute) {
    return sameDayMinute
  }

  const previousClockMinute = minimumMinute % ROUTE_DAY_MINUTES
  const isMidnightRollover =
    previousClockMinute >= ROUTE_MIDNIGHT_ROLLOVER_AFTER_MINUTE &&
    clockMinute <= ROUTE_MIDNIGHT_ROLLOVER_BEFORE_MINUTE

  return isMidnightRollover ? sameDayMinute + ROUTE_DAY_MINUTES : minimumMinute
}

function formatRouteClockMinute(totalMinutes: number) {
  const roundedMinutes = Math.round(totalMinutes)
  const hour = Math.floor(roundedMinutes / 60) % 24
  const minute = roundedMinutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function driveRealDurationMs(routeMinutes: number) {
  return clampValue(
    (routeMinutes / ROUTE_DRIVE_MINUTES_PER_SECOND) * 1_000,
    ROUTE_MIN_DRIVE_MS,
    ROUTE_MAX_DRIVE_MS,
  )
}

function serviceRealDurationMs(serviceMinutes: number) {
  return clampValue(
    Math.max(1, serviceMinutes) * ROUTE_STOP_MS_PER_SERVICE_MINUTE,
    ROUTE_MIN_STOP_MS,
    ROUTE_MAX_STOP_MS,
  )
}

function interpolateValue(start: number, end: number, progress: number) {
  return start + (end - start) * progress
}

function clampValue(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function getEffectiveSelectedTruckId(plan: DistributionPlan | null, selectedTruckId: string) {
  if (!plan) {
    return ''
  }
  return plan.trucks.some((truck) => truck.id === selectedTruckId)
    ? selectedTruckId
    : plan.assignedTrucks[ROUTE_DEFAULT_TRUCK_INDEX]?.id ?? plan.assignedTrucks[0]?.id ?? plan.trucks[0]?.id ?? ''
}

type HomeFleetCandidate = {
  availability: TruckAvailability
  capacityDistance: number
  fixedCost: number
  score: number
  transportCount: number
}

function countAvailableTransports(
  availability: TruckAvailability,
  truckTypes: readonly TruckType[],
) {
  return truckTypes.reduce((total, type) => {
    return total + Math.max(0, Math.floor(availability[type.id] ?? 0))
  }, 0)
}

function getHomeIdealAvailability(
  day: PlanningDay | undefined,
  truckTypes: readonly TruckType[],
): TruckAvailability {
  const defaultAvailability = getDefaultAvailability(truckTypes)

  if (!day) {
    return Object.fromEntries(
      truckTypes.map((type) => [
        type.id,
        HOME_INITIAL_AVAILABILITY_BY_CAPACITY[type.palletCapacity] ?? defaultAvailability[type.id] ?? 0,
      ]),
    ) as TruckAvailability
  }

  const planningDay = day
  const minimumCapacity = Math.ceil(planningDay.summary.pallets)
  const targetCapacity = Math.ceil(planningDay.summary.pallets / HOME_IDEAL_TARGET_CAPACITY_USE)
  const targetTransportCount = Math.max(
    1,
    Math.ceil(planningDay.summary.clients / HOME_IDEAL_CLIENTS_PER_TRANSPORT),
    Math.ceil(planningDay.summary.pallets / HOME_IDEAL_PALLETS_PER_TRANSPORT),
  )
  const preferredCounts = getHomePreferredTransportCounts(truckTypes, targetTransportCount)
  const maxTransportCount = Math.max(
    truckTypes.length,
    targetTransportCount + HOME_IDEAL_EXTRA_TRANSPORT_BUFFER,
  )
  const maxCounts = truckTypes.map((type) => {
    const capacityLimit = Math.ceil(targetCapacity / Math.max(1, type.palletCapacity))
    return Math.max(1, Math.min(maxTransportCount, capacityLimit + HOME_IDEAL_EXTRA_TRANSPORT_BUFFER))
  })
  const best: { current: HomeFleetCandidate | null } = { current: null }

  function visit(
    index: number,
    counts: number[],
    totalCapacity: number,
    transportCount: number,
    fixedCost: number,
  ) {
    if (transportCount > maxTransportCount) {
      return
    }

    if (index === truckTypes.length) {
      if (transportCount === 0 || totalCapacity < minimumCapacity) {
        return
      }

      const availability = Object.fromEntries(
        truckTypes.map((type, typeIndex) => [type.id, counts[typeIndex] ?? 0]),
      ) as TruckAvailability
      const capacityUse = planningDay.summary.pallets / Math.max(1, totalCapacity)
      const underTargetCapacity = Math.max(0, targetCapacity - totalCapacity)
      const overTargetCapacity = Math.max(0, totalCapacity - targetCapacity)
      const transportCountGap = Math.abs(transportCount - targetTransportCount)
      const capacityDistance = Math.abs(totalCapacity - targetCapacity)
      const mixPenalty = truckTypes.reduce((total, type, typeIndex) => {
        return total + Math.abs((counts[typeIndex] ?? 0) - (preferredCounts[type.id] ?? 0)) * 18
      }, 0)
      const score =
        underTargetCapacity * 80 +
        overTargetCapacity * 4 +
        Math.max(0, capacityUse - HOME_IDEAL_MAX_CAPACITY_USE) * 900 +
        Math.max(0, HOME_IDEAL_MIN_CAPACITY_USE - capacityUse) * 220 +
        transportCountGap * 28 +
        fixedCost * 0.1 +
        mixPenalty
      const candidate = {
        availability,
        capacityDistance,
        fixedCost,
        score,
        transportCount,
      }

      if (isBetterHomeFleetCandidate(candidate, best.current, targetTransportCount)) {
        best.current = candidate
      }
      return
    }

    const truckType = truckTypes[index]
    const maxCount = maxCounts[index] ?? 0

    for (let count = 0; count <= maxCount; count += 1) {
      counts[index] = count
      visit(
        index + 1,
        counts,
        totalCapacity + count * truckType.palletCapacity,
        transportCount + count,
        fixedCost + count * truckType.fixedCostMinutes,
      )
    }
  }

  visit(0, [], 0, 0, 0)

  if (best.current) {
    return best.current.availability
  }

  return Object.fromEntries(
    truckTypes.map((type) => [
      type.id,
      HOME_INITIAL_AVAILABILITY_BY_CAPACITY[type.palletCapacity] ?? defaultAvailability[type.id] ?? 0,
    ]),
  ) as TruckAvailability
}

function getHomePreferredTransportCounts(
  truckTypes: readonly TruckType[],
  targetTransportCount: number,
): TruckAvailability {
  if (targetTransportCount <= 2) {
    const smallestType = truckTypes.reduce<TruckType | null>((smallest, type) => {
      return !smallest || type.palletCapacity < smallest.palletCapacity ? type : smallest
    }, null)

    return Object.fromEntries(
      truckTypes.map((type) => [type.id, type.id === smallestType?.id ? targetTransportCount : 0]),
    ) as TruckAvailability
  }

  const weightedTypes = truckTypes.map((type) => ({
    type,
    weight: HOME_IDEAL_ROUTE_SHARE_BY_CAPACITY[type.palletCapacity] ?? 1,
  }))
  const totalWeight = weightedTypes.reduce((total, item) => total + item.weight, 0) || 1
  let assignedCount = 0
  const entries = weightedTypes.map(({ type, weight }, index) => {
    const isLast = index === weightedTypes.length - 1
    const count = isLast
      ? Math.max(0, targetTransportCount - assignedCount)
      : Math.max(0, Math.round((targetTransportCount * weight) / totalWeight))
    assignedCount += count
    return [type.id, count] as const
  })

  return Object.fromEntries(entries) as TruckAvailability
}

function isBetterHomeFleetCandidate(
  candidate: HomeFleetCandidate,
  current: HomeFleetCandidate | null,
  targetTransportCount: number,
) {
  if (!current) {
    return true
  }

  const scoreDelta = candidate.score - current.score
  if (Math.abs(scoreDelta) > 0.0001) {
    return scoreDelta < 0
  }

  const candidateCountDistance = Math.abs(candidate.transportCount - targetTransportCount)
  const currentCountDistance = Math.abs(current.transportCount - targetTransportCount)
  return (
    candidate.capacityDistance < current.capacityDistance ||
    (candidate.capacityDistance === current.capacityDistance &&
      (candidateCountDistance < currentCountDistance ||
        (candidateCountDistance === currentCountDistance && candidate.fixedCost < current.fixedCost)))
  )
}

function getHomeWarning(
  plan: DistributionPlan | null,
  selectedDay: PlanningDay | undefined,
  hasTrucks: boolean,
) {
  if (!selectedDay) {
    return 'No hay pedidos cargados para esta fecha.'
  }
  if (!hasTrucks) {
    return 'No hay transportes disponibles para calcular la distribución.'
  }
  return plan?.warnings.join(' ') ?? ''
}

function viewTitle(view: AppView) {
  if (view === 'pedidos') {
    return 'Home'
  }
  if (view === 'organizacion') {
    return 'Distribución'
  }
  return 'Rutas'
}

function routeTruckLabel(trucks: readonly PlannedTruck[], truck: PlannedTruck) {
  const routeNumber = trucks.findIndex((item) => item.id === truck.id) + 1
  return routeNumber > 0 ? `Camión ${routeNumber}` : truck.label
}

function transportStatusLabel(truck: PlannedTruck) {
  if (truck.summary.clients === 0) {
    return {
      detail: 'Sin asignación',
      label: 'Libre',
    }
  }
  if (truck.summary.overflow) {
    return {
      detail: 'Capacidad excedida',
      label: 'Revisar',
    }
  }
  return {
    detail: `${truck.summary.lines} productos`,
    label: 'Asignado',
  }
}

function formatKg(value: number) {
  return `${numberFormatter.format(Math.round(value))} kg`
}

function formatM3(value: number) {
  return `${decimalFormatter.format(value)} m³`
}

function formatOrderCount(value: number) {
  return numberFormatter.format(Math.floor(value / 100) * 100)
}

function formatPalletUnit(value: number) {
  const label = Math.abs(value - 1) < 0.05 ? 'palet' : 'palets'
  return `${decimalFormatter.format(value)} ${label}`
}

function formatCeilPalletUnit(value: number) {
  const roundedValue = Math.ceil(value)
  const label = roundedValue === 1 ? 'palet' : 'palets'
  return `${numberFormatter.format(roundedValue)} ${label}`
}

function formatKmRounded(value: number) {
  return `${numberFormatter.format(Math.round(value))} km`
}

function formatMinutes(value: number) {
  const hours = Math.floor(value / 60)
  const minutes = Math.round(value % 60)
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`
}

function formatScore(value: number) {
  return `${decimalFormatter.format(value)} pts`
}

function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}

function formatRoundedKg(value: number) {
  return numberFormatter.format(Math.round(value / 100) * 100)
}

function formatSelectorDate(date: string) {
  const [year, month, day] = date.split('-')
  return `${day} / ${month} / ${year}`
}
