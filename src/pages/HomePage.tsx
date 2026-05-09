import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as L from 'leaflet'
import {
  ArrowUpRight,
  Box,
  Calendar,
  Grid3X3,
  Package,
  Percent,
  Road,
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
import type { PlanningDay, PlanningDaySummary, TruckType } from '@/types/planning'
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
const HOME_DISPLAY_DATE = '2026-05-09'
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
    <section className="min-h-[calc(100vh-48px)] bg-[#fdf4ec] px-5 pb-16 pt-8 text-[#47392b] min-[1100px]:min-h-[calc(100vh-70px)] min-[1100px]:pt-12 sm:px-6">
      <Container className="max-w-[1104px] px-0">
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
          <p className="max-w-[706px] text-center text-[13px] font-bold leading-5 text-[#c53030]">
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
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.clientId ?? '')
  const [showOriginalRoute, setShowOriginalRoute] = useState(true)
  const effectiveSelectedClientId = clients.some((client) => client.clientId === selectedClientId)
    ? selectedClientId
    : clients[0]?.clientId ?? ''
  const selectedClient =
    clients.find((client) => client.clientId === effectiveSelectedClientId) ?? clients[0]

  const handleSelectClient = useCallback((clientId: string) => {
    setSelectedClientId(clientId)
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

  const metricSources = useMemo(() => {
    const totals = new Map<string, number>()
    for (const row of selectedTruck?.masterRows ?? []) {
      totals.set(row.metricSource, (totals.get(row.metricSource) ?? 0) + 1)
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1])
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

  return (
    <div className="space-y-[34px]" id="ruta">
      <section className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] font-bold uppercase leading-none tracking-[0.18em] text-[#b8aa9c]">
            Ruta
          </p>
          <h1 className="mt-4 max-w-4xl text-[28px] font-bold leading-[1.18] text-[#47392b] sm:text-[34px]">
            {selectedTruck.label}: {selectedTruck.summary.clients} clientes optimizados.
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] font-medium leading-6 text-[#806a54]">
            Día {formatDate(plan.date)}. La ruta minimiza conducción, coste de kilómetros,
            ventanas horarias, prioridad, logística inversa y acceso físico a la carga.
          </p>
        </div>
        <label className="block min-w-64">
          <span className="text-xs font-bold uppercase tracking-wide text-[#b8aa9c]">Camión</span>
          <select
            className="mt-2 min-h-12 w-full rounded-[16px] bg-[#fdf9f6] px-4 text-sm font-bold text-[#47392b] outline-none transition focus:ring-2 focus:ring-[#c53030]/25"
            onChange={(event) => onSelectTruck(event.target.value)}
            value={selectedTruck.id}
          >
            {plan.assignedTrucks.map((truck) => (
              <option key={truck.id} value={truck.id}>
                {truck.label} · {truck.summary.clients} clientes
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)] gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="min-w-0 space-y-6">
          <div className="grid grid-cols-2 gap-5">
            <Kpi label="Clientes" value={selectedTruck.summary.clients} />
            <Kpi label="Líneas" value={selectedTruck.summary.lines} />
            <Kpi label="Peso" value={formatKg(selectedTruck.summary.weightKg)} />
            <Kpi label="Camión" value={selectedTruck.type.shortLabel} tone="accent" />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <ScoreCard
              label="Orden original"
              primary={formatScore(selectedTruck.route.original.operationalScore)}
              secondary={`${selectedTruck.route.original.distanceKm} km · ${formatMinutes(selectedTruck.route.original.totalMinutes)}`}
            />
            <ScoreCard
              label="Hackemate"
              primary={formatScore(selectedTruck.route.optimized.operationalScore)}
              secondary={`${selectedTruck.route.optimized.distanceKm} km · ${formatMinutes(selectedTruck.route.optimized.totalMinutes)}`}
              tone="success"
            />
            <ScoreCard
              label="Mejora operativa"
              primary={formatScore(selectedTruck.route.scoreImprovement)}
              secondary={`${formatMinutes(selectedTruck.route.savingsMinutes)} · ${formatPercent(selectedTruck.route.scoreImprovementPercent)}`}
              tone="highlight"
            />
          </div>
        </div>

        <section className="min-w-0 overflow-hidden rounded-[18px] bg-[#fdf9f6]">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#f6e5d4] px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-[#47392b]">Mapa de reparto</h2>
              <p className="mt-1 text-sm font-medium text-[#806a54]">
                Haversine x1.32 local · polilínea por secuencia optimizada
              </p>
            </div>
            <button
              className="rounded-full bg-[#fdf9f6] px-4 py-2 text-sm font-bold text-[#806a54] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c53030] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6e5d4]"
              onClick={() => setShowOriginalRoute((value) => !value)}
              type="button"
            >
              {showOriginalRoute ? 'Ocultar original' : 'Ver original'}
            </button>
          </div>
          <RouteMap
            clients={clients}
            depot={planningDataset.depot}
            onSelectClient={handleSelectClient}
            optimizedPolyline={selectedTruck.optimizedPolyline}
            originalPolyline={selectedTruck.originalPolyline}
            routeKey={selectedTruck.id}
            selectedClientId={effectiveSelectedClientId}
            showOriginalRoute={showOriginalRoute}
          />
        </section>
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)] gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)]">
        <div className="min-w-0 overflow-hidden rounded-[18px] bg-[#fdf9f6]">
          <div className="bg-[#f6e5d4] px-5 py-4">
            <h2 className="text-base font-bold text-[#47392b]">Orden recomendado</h2>
            <p className="mt-1 text-sm font-medium text-[#806a54]">
              Primeras paradas cargadas cerca de la puerta trasera.
            </p>
          </div>
          <RouteOrdersTable
            clients={clients}
            onSelectClient={handleSelectClient}
            selectedClientId={effectiveSelectedClientId}
          />
        </div>

        <aside className="min-w-0 space-y-6">
          {selectedClient ? <SelectedClientPanel client={selectedClient} /> : null}

          <div className="rounded-[18px] bg-[#fdf9f6] p-5">
            <h2 className="text-base font-bold text-[#47392b]">Score operativo</h2>
            <div className="mt-4 space-y-3">
              <ScoreLine label="Score original" value={formatScore(selectedTruck.route.original.operationalScore)} />
              <ScoreLine label="Score Hackemate" value={formatScore(selectedTruck.route.optimized.operationalScore)} />
              <ScoreLine label="Mejora" value={formatScore(selectedTruck.route.scoreImprovement)} strong />
              <ScoreLine label="Tiempo ahorrado" value={formatMinutes(selectedTruck.route.savingsMinutes)} />
              <ScoreLine
                label="Distancia"
                value={`${selectedTruck.route.optimized.distanceKm} km (${decimalFormatter.format(selectedTruck.route.savingsKm)} km menos)`}
              />
              <ScoreLine label="Fin estimado" value={selectedTruck.route.optimized.finish} />
              <ScoreLine
                label="Penalización horarios"
                value={`${decimalFormatter.format(selectedTruck.route.optimized.waitMinutes)} min espera · ${decimalFormatter.format(selectedTruck.route.optimized.lateMinutes)} min tarde`}
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
        </aside>
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)] gap-8">
        <div className="min-w-0 rounded-[18px] bg-[#fdf9f6] p-5">
          <TruckLoadPlanner
            onSelectClient={handleSelectClient}
            plan={selectedTruck.loadPlan}
            selectedClientId={effectiveSelectedClientId}
            showFloorPlan
          />
        </div>

        <div className="min-w-0 rounded-[18px] bg-[#fdf9f6] p-5">
          <h2 className="text-base font-bold text-[#47392b]">Tabla maestra resumida</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SummaryBlock label="Materiales agrupados" value={selectedTruck.masterRows.length} />
            <SummaryBlock label="Entregas SAP" value={selectedTruck.summary.deliveries} />
            <SummaryBlock label="Volumen" value={formatM3(selectedTruck.summary.volumeM3)} />
            <SummaryBlock label="Peso" value={formatKg(selectedTruck.summary.weightKg)} />
          </div>
          <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#47392b]">Top productos por unidades</h3>
              <ul className="mt-3 space-y-2">
                {topProducts.map((product) => (
                  <li className="flex min-w-0 items-start justify-between gap-3 text-sm" key={`${product.material}-${product.product}`}>
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-[#47392b]">{product.product}</span>
                      <span className="text-xs font-medium text-[#a99583]">{product.material}</span>
                    </span>
                    <span className="shrink-0 font-medium text-[#806a54]">
                      {decimalFormatter.format(product.quantity)} {product.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[#47392b]">Calidad del cálculo</h3>
              <ul className="mt-3 space-y-2">
                {metricSources.map(([source, count]) => (
                  <li className="flex min-w-0 items-center justify-between gap-3 text-sm" key={source}>
                    <span className="min-w-0 truncate font-medium text-[#806a54]">{source}</span>
                    <span className="font-bold text-[#47392b]">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function RouteOrdersTable({
  clients,
  onSelectClient,
  selectedClientId,
}: {
  clients: readonly RouteClient[]
  onSelectClient: (clientId: string) => void
  selectedClientId: string
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[#f6e5d4] text-xs font-bold uppercase tracking-wide text-[#a99583]">
          <tr>
            <th className="px-5 py-3 font-medium">Stop</th>
            <th className="px-5 py-3 font-medium">Cliente</th>
            <th className="px-5 py-3 font-medium">Pedido</th>
            <th className="px-5 py-3 font-medium">Prioridad</th>
            <th className="px-5 py-3 font-medium">Carga</th>
            <th className="px-5 py-3 font-medium">Horario</th>
            <th className="px-5 py-3 font-medium">Zona</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f1e5d9]">
          {clients.map((client) => (
            <tr
              className={client.clientId === selectedClientId ? 'bg-[#f6e5d4]/75' : 'bg-[#fdf9f6]'}
              key={client.clientId}
            >
              <td className="px-5 py-3 align-top font-bold text-[#47392b]">{client.optimizedSequence}</td>
              <td className="px-5 py-3 align-top">
                <button
                  className="text-left font-bold text-[#47392b] transition hover:text-[#c53030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c53030] focus-visible:ring-offset-2"
                  onClick={() => onSelectClient(client.clientId)}
                  type="button"
                >
                  {client.name}
                </button>
                <p className="mt-1 max-w-64 text-xs font-medium leading-5 text-[#a99583]">
                  {client.address}, {client.postalCode} {client.city}
                </p>
              </td>
              <td className="px-5 py-3 align-top font-medium text-[#806a54]">
                {client.lines} líneas · {client.productTypes.map(productLabel).join(', ')}
              </td>
              <td className="px-5 py-3 align-top">
                <span className="rounded-[10px] bg-[#f6e5d4] px-2.5 py-1 text-xs font-bold text-[#806a54]">
                  {client.priorityLabel}
                </span>
                <p className="mt-1 text-xs font-medium text-[#a99583]">
                  {client.priorityReasons.slice(0, 2).join(', ')}
                </p>
              </td>
              <td className="px-5 py-3 align-top font-medium text-[#806a54]">
                {formatKg(client.weightKg)} · {decimalFormatter.format(client.pallets)} palets
              </td>
              <td className="px-5 py-3 align-top">
                <span className="font-bold text-[#47392b]">{client.arrival}</span>
                <p className="mt-1 text-xs font-medium text-[#a99583]">
                  {client.window.label} · {statusLabels[client.windowStatus] ?? client.windowStatus}
                </p>
              </td>
              <td className="px-5 py-3 align-top">
                <span className="rounded-[10px] bg-[#f6e5d4] px-2.5 py-1 text-xs font-bold text-[#806a54]">
                  Z{client.loadZone}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

function ScoreCard({
  label,
  primary,
  secondary,
  tone = 'default',
}: {
  label: string
  primary: string
  secondary: string
  tone?: 'default' | 'success' | 'highlight'
}) {
  const tones = {
    default: 'bg-[#fdf9f6]',
    success: 'bg-[#f6e5d4]',
    highlight: 'bg-[#c53030]',
  }
  const isHighlight = tone === 'highlight'
  return (
    <div className={`rounded-[13px] p-4 ${tones[tone]}`}>
      <p className={cn('text-[11px] font-bold uppercase leading-none tracking-wide', isHighlight ? 'text-white/75' : 'text-[#b8aa9c]')}>
        {label}
      </p>
      <p className={cn('mt-3 text-[24px] font-bold leading-none', isHighlight ? 'text-white' : 'text-[#806a54]')}>{primary}</p>
      <p className={cn('mt-2 text-sm font-medium', isHighlight ? 'text-white/80' : 'text-[#806a54]')}>{secondary}</p>
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
    <div className="flex items-center justify-between gap-4 border-b border-[#f1e5d9] pb-2 last:border-b-0 last:pb-0">
      <span className="text-sm font-medium text-[#806a54]">{label}</span>
      <span className={strong ? 'text-sm font-bold text-[#c53030]' : 'text-sm font-bold text-[#47392b]'}>
        {value}
      </span>
    </div>
  )
}

function SummaryBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[13px] bg-[#f6e5d4] p-3">
      <p className="text-[11px] font-bold uppercase leading-none tracking-wide text-[#b8aa9c]">{label}</p>
      <p className="mt-2 text-lg font-bold text-[#806a54]">{value}</p>
    </div>
  )
}

function SelectedClientPanel({ client }: { client: RouteClient }) {
  return (
    <div className="rounded-[18px] bg-[#fdf9f6] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase leading-none tracking-wide text-[#b8aa9c]">Cliente seleccionado</p>
          <h2 className="mt-2 text-lg font-bold text-[#47392b]">{client.name}</h2>
        </div>
        <span className="rounded-[10px] bg-[#c53030] px-2.5 py-1 text-xs font-bold text-white">
          Stop {client.optimizedSequence}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium leading-6 text-[#806a54]">
        {client.address}, {client.postalCode} {client.city}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <SummaryBlock label="Llegada" value={client.arrival} />
        <SummaryBlock label="Zona carga" value={`Z${client.loadZone}`} />
        <SummaryBlock label="Descarga" value={formatMinutes(client.serviceMinutes)} />
        <SummaryBlock label="Prioridad" value={client.priorityLabel} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {client.productTypes.map((type) => (
          <span className="rounded-[10px] bg-[#f6e5d4] px-2.5 py-1 text-xs font-bold text-[#806a54]" key={type}>
            {productLabel(type)}
          </span>
        ))}
        {client.hasReturnables ? (
          <span className="rounded-[10px] bg-[#f7d9cf] px-2.5 py-1 text-xs font-bold text-[#9b2c2c]">
            Retorno {decimalFormatter.format(client.returnableUnits)}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-xs font-medium text-[#a99583]">
        {formatKg(client.weightKg)} · {decimalFormatter.format(client.pallets)} palets · dificultad
        carga {decimalFormatter.format(client.loadDifficulty)}. Coordenadas: {client.geocodeSource}.
        Orden original: {client.currentSequence}.
      </p>
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

  useEffect(() => {
    fittedRef.current = false
  }, [routeKey])

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
      const line = truck.optimizedPolyline.map((point) => [point.lat, point.lng] as [number, number])

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

  useEffect(() => {
    fittedRef.current = false
  }, [routeKey])

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

    const optimizedLine = optimizedPolyline.map((point) => [point.lat, point.lng] as [number, number])
    const originalLine = originalPolyline.map((point) => [point.lat, point.lng] as [number, number])

    if (showOriginalRoute && originalLine.length > 1) {
      L.polyline(originalLine, {
        color: '#6B6B6B',
        dashArray: '6 8',
        opacity: 0.6,
        weight: 2,
      }).addTo(layer)
    }

    if (optimizedLine.length > 1) {
      L.polyline(optimizedLine, {
        color: '#C53030',
        opacity: 0.9,
        weight: 4,
      }).addTo(layer)
    }

    L.circleMarker([depot.lat, depot.lng], {
      color: '#1A1A1A',
      fillColor: '#1A1A1A',
      fillOpacity: 0.9,
      radius: 7,
      weight: 2,
    })
      .addTo(layer)
      .bindTooltip(depot.name, { direction: 'top' })

    for (const client of clients) {
      const selected = client.clientId === selectedClientId
      const marker = L.circleMarker([client.lat, client.lng], {
        color: selected ? '#822727' : '#C53030',
        fillColor: selected ? '#C53030' : '#E8DDD0',
        fillOpacity: selected ? 0.95 : 0.85,
        radius: selected ? 8 : 5,
        weight: selected ? 2 : 1.5,
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
      map.fitBounds(bounds, { padding: [28, 28] })
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
    optimizedPolyline,
    originalPolyline,
    selectedClientId,
    showOriginalRoute,
    onSelectClient,
  ])

  return (
    <div className="relative h-[430px] bg-[#f6e5d4]">
      <div className="h-full w-full" ref={containerRef} />
      <div className="pointer-events-none absolute left-3 top-3 rounded-[13px] bg-[#fdf9f6]/95 px-3 py-2 text-xs font-bold text-[#47392b]">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-8 rounded bg-[#c53030]" />
          Hackemate
        </div>
        {showOriginalRoute ? (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="h-px w-8 border-t border-dashed border-[#806a54]" />
            Original
          </div>
        ) : null}
      </div>
    </div>
  )
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
    : plan.assignedTrucks[0]?.id ?? plan.trucks[0]?.id ?? ''
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

function formatKg(value: number) {
  return `${numberFormatter.format(Math.round(value))} kg`
}

function formatM3(value: number) {
  return `${decimalFormatter.format(value)} m³`
}

function formatOrderCount(value: number) {
  return numberFormatter.format(Math.floor(value / 100) * 100)
}

function formatPercent(value: number) {
  return `${decimalFormatter.format(value)} %`
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
