import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  Percent,
  Road,
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
import type { PlanningDay, PlanningDaySummary, PlanningLoadRow, TruckType } from '@/types/planning'
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
import truck6Icon from '../../assets/truck6.svg'
import truck8Icon from '../../assets/truck8.svg'
import vanIcon from '../../assets/van.svg'

type HomePageProps = {
  activeView: AppView
  onNavigate: (view: AppView) => void
}

const numberFormatter = new Intl.NumberFormat('es-ES')
const decimalFormatter = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 })
const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const typeLabels: Record<string, string> = {
  barril: 'Barriles',
  caja: 'Cajas',
  lata: 'Latas',
  otros: 'Otros',
  retornable: 'Retornables',
}

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
const HOME_DISPLAY_DATE = '2026-05-09'
const ROUTE_DEFAULT_TRUCK_INDEX = 11
const HOME_INITIAL_AVAILABILITY_BY_CAPACITY: Record<number, number> = {
  3: 2,
  6: 10,
  8: 6,
}

export function HomePage({ activeView, onNavigate }: HomePageProps) {
  const defaultDate =
    planningDataset.days['2026-02-05']?.date ?? planningDataset.dates[0]?.date ?? ''
  const [selectedDate, setSelectedDate] = useState(defaultDate)
  const [availability, setAvailability] = useState<TruckAvailability>(() =>
    getHomeInitialAvailability(planningDataset.truckTypes),
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

  if (activeView === 'pedidos') {
    return (
      <OrdersView
        availability={availability}
        dateOptions={planningDataset.dates}
        hasTrucks={hasTrucks}
        onAvailabilityChange={handleAvailabilityChange}
        onCalculate={() => onNavigate('organizacion')}
        onDateChange={setSelectedDate}
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
          selectedTruckId={effectiveSelectedTruckId}
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
  const usedTransports = selectedDate === '2026-02-05' ? 14 : plan?.summary.usedTrucks ?? 0
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
      value: usedTransports > 0 ? `${usedTransports}/${usedTransports}` : hasTrucks ? '0/0' : '0/0',
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
  const [showAllRoutes, setShowAllRoutes] = useState(true)

  if (!plan) {
    return <EmptyState title="Sin planificación" body="Selecciona una fecha y al menos un transporte en Pedidos." />
  }

  const selectedTruck =
    plan.trucks.find((truck) => truck.id === selectedTruckId) ??
    plan.assignedTrucks[0] ??
    plan.trucks[0]
  const allRoutesMapKey = `${plan.date}-${plan.assignedTrucks
    .map((truck) => `${truck.id}:${truck.clients.length}`)
    .join('|')}`

  return (
    <div className="space-y-[34px]" id="organizacion">
      <section className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] font-bold uppercase leading-none tracking-[0.18em] text-[#b8aa9c]">
            Organización
          </p>
          <h1 className="mt-4 max-w-4xl text-[28px] font-bold leading-[1.18] text-[#47392b] sm:text-[34px]">
            Distribución optimizada para {formatDate(plan.date)}.
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] font-medium leading-6 text-[#806a54]">
            Se asignan todos los pedidos del día y se dejan libres los transportes que no mejoran
            el coste operativo global.
          </p>
        </div>
        <Button
          disabled={!selectedTruck || selectedTruck.clients.length === 0}
          onClick={() => onNavigate('ruta')}
        >
          Ver ruta
        </Button>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Usados" value={`${plan.summary.usedTrucks}/${plan.summary.availableTrucks}`} />
        <Kpi label="Clientes" value={plan.summary.clients} />
        <Kpi label="Palets día" value={decimalFormatter.format(plan.summary.pallets)} />
        <Kpi label="Score" value={formatScore(plan.summary.operationalScore)} tone="accent" />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {plan.trucks.map((truck) => (
          <button
            className={cn(
              'rounded-[18px] p-5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c53030] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf4ec]',
              truck.id === selectedTruck?.id
                ? 'bg-[#f6e5d4] ring-2 ring-[#c53030]/20'
                : 'bg-[#fdf9f6] hover:bg-[#f6e5d4]/65',
            )}
            key={truck.id}
            onClick={() => onSelectTruck(truck.id)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-bold text-[#47392b]">{truck.label}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#b8aa9c]">{truck.type.label}</p>
              </div>
              <span
                className={cn(
                  'rounded-[10px] px-2.5 py-1 text-xs font-bold',
                  truck.clients.length === 0
                    ? 'bg-[#f2ebe4] text-[#a99583]'
                    : truck.summary.overflow
                      ? 'bg-[#f7d9cf] text-[#9b2c2c]'
                      : 'bg-[#fdf9f6] text-[#806a54]',
                )}
              >
                {truck.clients.length === 0 ? 'Libre' : truck.summary.overflow ? 'Revisar' : 'Asignado'}
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <MiniMetric label="Clientes" value={truck.summary.clients} />
              <MiniMetric label="Palets" value={`${decimalFormatter.format(truck.summary.pallets)}/${truck.capacityPallets}`} />
              <MiniMetric label="Fin" value={truck.route.optimized.finish} />
              <MiniMetric label="Score" value={formatScore(truck.summary.totalScore)} />
            </div>
          </button>
        ))}
      </section>

      {selectedTruck ? (
        <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[18px] bg-[#fdf9f6] p-5">
            <TruckLoadPlanner
              onSelectClient={() => undefined}
              plan={selectedTruck.loadPlan}
            />
          </div>
          <div className="overflow-hidden rounded-[18px] bg-[#fdf9f6]">
            <div className="bg-[#f6e5d4] px-5 py-4">
              <h2 className="text-base font-bold text-[#47392b]">Paradas del camión</h2>
              <p className="mt-1 text-sm font-medium text-[#806a54]">
                {selectedTruck.summary.clients > 0
                  ? `${formatKg(selectedTruck.summary.weightKg)} · ${decimalFormatter.format(selectedTruck.summary.pallets)} palets`
                  : 'Transporte disponible sin asignación'}
              </p>
            </div>
            <TruckStopList truck={selectedTruck} />
          </div>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[18px] bg-[#fdf9f6]">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#f6e5d4] px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[#47392b]">Mapa global de rutas</h2>
            <p className="mt-1 text-sm font-medium text-[#806a54]">
              Cada color representa un transporte asignado. Los puntos se mantienen visibles al ocultar rutas.
            </p>
          </div>
          <Button onClick={() => setShowAllRoutes((current) => !current)}>
            {showAllRoutes ? 'Ocultar rutas' : 'Mostrar rutas'}
          </Button>
        </div>
        <OrganizationRoutesMap
          depot={planningDataset.depot}
          onSelectTruck={onSelectTruck}
          routeKey={allRoutesMapKey}
          selectedTruckId={selectedTruck?.id ?? ''}
          showRoutes={showAllRoutes}
          trucks={plan.assignedTrucks}
        />
      </section>
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
  const effectiveSelectedClientId = clients.some((client) => client.clientId === selectedClientId)
    ? selectedClientId
    : ''

  const handleSelectClient = useCallback((clientId: string) => {
    setSelectedClientId((currentClientId) => (currentClientId === clientId ? '' : clientId))
  }, [])

  const topProducts = useMemo(() => {
    const totals = new Map<string, { material: string; product: string; quantity: number; unit: string }>()
    for (const row of selectedTruck?.masterRows ?? []) {
      const key = `${row.material}-${row.product}`
      const current = totals.get(key) ?? {
        material: row.material,
        product: row.product,
        quantity: 0,
        unit: row.unit,
      }
      current.quantity += row.quantity
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
            <button
            className="route-start-button"
              type="button"
            >
            Iniciar ruta
            </button>
          </div>

        <div className="route-map-frame">
          <RouteMap
            clients={clients}
            depot={planningDataset.depot}
            onSelectClient={handleSelectClient}
            optimizedPolyline={selectedTruck.optimizedPolyline}
            originalPolyline={selectedTruck.originalPolyline}
            routeKey={selectedTruck.id}
            selectedClientId={effectiveSelectedClientId}
            showOriginalRoute={false}
          />
        </div>
      </section>

      <section className="route-section route-deliveries-section">
        <h2 className="route-section-title">Repartos:</h2>
        <RouteOrdersList
            clients={clients}
            onSelectClient={handleSelectClient}
          rowsByClient={rowsByClient}
            selectedClientId={effectiveSelectedClientId}
          />
      </section>

      <section className="route-section route-truck-section">
          <TruckLoadPlanner
            onSelectClient={handleSelectClient}
            plan={selectedTruck.loadPlan}
            selectedClientId={effectiveSelectedClientId}
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
  onSelectClient,
  rowsByClient,
  selectedClientId,
}: {
  clients: readonly RouteClient[]
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
                <ChevronUp aria-hidden="true" className="route-order-chevron" strokeWidth={2.2} />
              ) : (
                <ChevronDown aria-hidden="true" className="route-order-chevron" strokeWidth={2.2} />
              )}
            </button>
            {expanded ? (
              <RouteOrderExpanded client={client} rows={rowsByClient.get(client.clientId) ?? []} />
            ) : null}
          </article>
        )
      })}
    </div>
  )
}

function RouteOrderExpanded({
  client,
  rows,
}: {
  client: RouteClient
  rows: readonly PlanningLoadRow[]
}) {
  const visibleRows = rows.slice(0, 8)
  const splitIndex = Math.ceil(visibleRows.length / 2)
  const columns = [visibleRows.slice(0, splitIndex), visibleRows.slice(splitIndex)]

  return (
    <div className="route-order-expanded-content">
      <div className="route-order-expanded-meta">
        <span>ZONA DE CARGA: Z{client.loadZone}</span>
        <span>DESCARGA: {formatMinutes(client.serviceMinutes)}</span>
      </div>
      <div className="route-order-products">
        {columns.map((column, index) => (
          <ul key={index}>
            {column.map((row) => (
              <li key={row.lineId}>
                <strong>{decimalFormatter.format(row.quantity)} uds de [{trimProductName(row.product)}]</strong>
                <span>PALET X</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

function TruckStopList({ truck }: { truck: PlannedTruck }) {
  if (truck.clients.length === 0) {
    return <div className="p-5 text-sm font-medium text-[#806a54]">Este transporte queda sin asignar.</div>
  }

  return (
    <div className="max-h-[520px] overflow-y-auto">
      {truck.clients.map((client) => (
        <div className="border-b border-[#f1e5d9] px-5 py-4 last:border-b-0" key={client.clientId}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[#47392b]">
                {client.optimizedSequence}. {client.name}
              </p>
              <p className="mt-1 text-xs font-medium leading-5 text-[#a99583]">
                {client.address}, {client.postalCode} {client.city}
              </p>
            </div>
            <span className="rounded-[10px] bg-[#f6e5d4] px-2.5 py-1 text-xs font-bold text-[#806a54]">
              {client.arrival}
            </span>
          </div>
          <p className="mt-2 text-xs font-medium text-[#806a54]">
            {formatKg(client.weightKg)} · {decimalFormatter.format(client.pallets)} palets ·{' '}
            {client.productTypes.map(productLabel).join(', ')}
          </p>
        </div>
      ))}
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

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase leading-none tracking-wide text-[#b8aa9c]">{label}</p>
      <p className="mt-2 text-sm font-bold text-[#806a54]">{value}</p>
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
  products: readonly { material: string; product: string; quantity: number; unit: string }[]
}) {
  return (
    <div className="route-products-card">
      <h3>Lista de todos los productos</h3>
      <ul>
        {products.map((product) => (
          <li key={`${product.material}-${product.product}`}>
            <span>
              <strong>{trimProductName(product.product)}</strong>
              <small>{product.material}</small>
            </span>
            <em>
              {decimalFormatter.format(product.quantity)} {product.unit}
            </em>
          </li>
        ))}
      </ul>
    </div>
  )
}

function OrganizationRoutesMap({
  depot,
  onSelectTruck,
  routeKey,
  selectedTruckId,
  showRoutes,
  trucks,
}: {
  depot: { name: string; lat: number; lng: number }
  onSelectTruck: (truckId: string) => void
  routeKey: string
  selectedTruckId: string
  showRoutes: boolean
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
    showRoutes && roadPolylineState.key === roadPolylineBatchKey
      ? roadPolylineState.polylines
      : EMPTY_ROAD_POLYLINES

  useEffect(() => {
    fittedRef.current = false
  }, [routeKey])

  useEffect(() => {
    let cancelled = false

    if (!showRoutes) {
      return () => {
        cancelled = true
      }
    }

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
  }, [roadPolylineBatchKey, showRoutes, trucks])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const map = L.map(containerRef.current, {
      attributionControl: true,
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
      const routePolyline = roadPolylineByTruck[truck.id] ?? truck.optimizedPolyline
      const line = routePolyline.map((point) => [point.lat, point.lng] as [number, number])

      if (showRoutes && line.length > 1) {
        L.polyline(line, {
          color,
          opacity: isSelected ? 0.95 : 0.62,
          weight: isSelected ? 5 : 3,
        }).addTo(layer)
      }

      for (const client of truck.clients) {
        const marker = L.circleMarker([client.lat, client.lng], {
          color,
          fillColor: isSelected ? color : '#FFFBF7',
          fillOpacity: isSelected ? 0.9 : 0.82,
          radius: isSelected ? 6 : 4.5,
          weight: isSelected ? 2.5 : 1.8,
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
    showRoutes,
    trucks,
  ])

  return (
    <div>
      <div className="relative h-[480px] bg-[#f6e5d4]">
        <div className="h-full w-full" ref={containerRef} />
        <div className="pointer-events-none absolute left-3 top-3 rounded-[13px] bg-[#fdf9f6]/95 px-3 py-2 text-xs font-bold text-[#47392b]">
          {showRoutes ? 'Rutas visibles' : 'Solo puntos'}
        </div>
      </div>
      <div className="grid gap-2 bg-[#f6e5d4] px-5 py-4 sm:grid-cols-2 lg:grid-cols-4">
        {trucks.map((truck, index) => (
          <button
            className={cn(
              'flex min-w-0 items-center gap-2 rounded-[13px] px-3 py-2 text-left text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c53030]',
              truck.id === selectedTruckId
                ? 'bg-[#c53030] text-white'
                : 'bg-[#fdf9f6] hover:bg-white',
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
  onSelectClient,
}: {
  clients: readonly RouteClient[]
  depot: { name: string; lat: number; lng: number }
  optimizedPolyline: readonly PolylinePoint[]
  originalPolyline: readonly PolylinePoint[]
  routeKey: string
  selectedClientId: string
  showOriginalRoute: boolean
  onSelectClient: (clientId: string) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
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
    optimizedPolyline: readonly PolylinePoint[] | null
    originalPolyline: readonly PolylinePoint[] | null
  }>({ key: '', optimizedPolyline: null, originalPolyline: null })
  const hasCurrentRoadRoute = roadRouteState.key === roadRouteKey

  useEffect(() => {
    fittedRef.current = false
  }, [routeKey])

  useEffect(() => {
    let cancelled = false

    void Promise.all([
      getRoadRoutePolyline(optimizedPolyline),
      showOriginalRoute ? getRoadRoutePolyline(originalPolyline) : Promise.resolve(null),
    ]).then(([roadOptimizedPolyline, roadOriginalPolyline]) => {
      if (!cancelled) {
        setRoadRouteState({
          key: roadRouteKey,
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
      const marker = L.circleMarker([client.lat, client.lng], {
        color: '#D0312D',
        fillColor: selected ? '#D0312D' : '#FDF4EC',
        fillOpacity: selected ? 0.92 : 0.96,
        radius: selected ? 9 : 6,
        weight: selected ? 2 : 2.5,
      }).addTo(layer)

      marker.bindTooltip(`${client.optimizedSequence}. ${client.name}`, {
        direction: 'top',
        offset: [0, -4],
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

  return (
    <div className="route-map-canvas">
      <div className="h-full w-full" ref={containerRef} />
    </div>
  )
}

function polylineSignature(polyline: readonly PolylinePoint[]) {
  return polyline.map((point) => `${point.lng.toFixed(6)},${point.lat.toFixed(6)}`).join(';')
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[18px] bg-[#fdf9f6] p-8">
      <h1 className="text-2xl font-bold text-[#47392b]">{title}</h1>
      <p className="mt-3 text-sm font-medium leading-6 text-[#806a54]">{body}</p>
    </div>
  )
}

function getEffectiveSelectedTruckId(plan: DistributionPlan | null, selectedTruckId: string) {
  if (!plan) {
    return ''
  }
  return plan.trucks.some((truck) => truck.id === selectedTruckId)
    ? selectedTruckId
    : plan.assignedTrucks[ROUTE_DEFAULT_TRUCK_INDEX]?.id ?? plan.assignedTrucks[0]?.id ?? plan.trucks[0]?.id ?? ''
}

function getHomeInitialAvailability(truckTypes: readonly TruckType[]): TruckAvailability {
  const defaultAvailability = getDefaultAvailability(truckTypes)

  return Object.fromEntries(
    truckTypes.map((type) => [
      type.id,
      HOME_INITIAL_AVAILABILITY_BY_CAPACITY[type.palletCapacity] ?? defaultAvailability[type.id] ?? 0,
    ]),
  ) as TruckAvailability
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

function productLabel(type: string) {
  return typeLabels[type] ?? type
}

function routeTruckLabel(trucks: readonly PlannedTruck[], truck: PlannedTruck) {
  const routeNumber = trucks.findIndex((item) => item.id === truck.id) + 1
  return routeNumber > 0 ? `Camión ${routeNumber}` : truck.label
}

function trimProductName(product: string) {
  return product.length > 46 ? `${product.slice(0, 43)}...` : product
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
