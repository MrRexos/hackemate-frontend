import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as L from 'leaflet'
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

const EMPTY_ROUTE_CLIENTS: readonly RouteClient[] = []

export function HomePage({ activeView, onNavigate }: HomePageProps) {
  const defaultDate =
    planningDataset.days['2026-02-05']?.date ?? planningDataset.dates[0]?.date ?? ''
  const [selectedDate, setSelectedDate] = useState(defaultDate)
  const [availability, setAvailability] = useState<TruckAvailability>(() =>
    getDefaultAvailability(planningDataset.truckTypes),
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

  return (
    <Container className="py-10 sm:py-12">
      {activeView === 'pedidos' ? (
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
      ) : null}
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
  const firstDate = dateOptions[0]?.date
  const lastDate = dateOptions[dateOptions.length - 1]?.date

  return (
    <div className="space-y-8" id="pedidos">
      <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-600">
            Pedidos del día
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            Selecciona fecha y transportes disponibles.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted">
            La planificación usa todos los pedidos del día seleccionado y decide cuántos
            transportes activar según capacidad, tiempos, coste operativo, ventanas de entrega,
            retorno de envases y fricción de carga.
          </p>
        </div>

        <div className="rounded-lg border border-cream-300 bg-cream-50 p-5">
          <div className="grid gap-5 sm:grid-cols-[0.8fr_1.2fr]">
            <label className="block">
              <span className="text-sm font-medium text-ink">Fecha</span>
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-cream-300 bg-cream-50 px-3 text-sm text-ink outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
                list="available-dates"
                max={lastDate}
                min={firstDate}
                onChange={(event) => onDateChange(event.target.value)}
                type="date"
                value={selectedDate}
              />
              <datalist id="available-dates">
                {dateOptions.map((option) => (
                  <option key={option.date} value={option.date} />
                ))}
              </datalist>
            </label>

            <div>
              <p className="text-sm font-medium text-ink">Disponibilidad por tipo</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-3">
                {truckTypes.map((type) => (
                  <label
                    className="rounded-md border border-cream-300 bg-cream-100/50 p-3"
                    key={type.id}
                  >
                    <span className="block text-xs font-medium uppercase tracking-wide text-muted">
                      {type.shortLabel}
                    </span>
                    <input
                      className="mt-2 h-10 w-full rounded-md border border-cream-300 bg-cream-50 px-3 text-base font-semibold text-ink outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      min={0}
                      onChange={(event) => onAvailabilityChange(type.id, Number(event.target.value))}
                      type="number"
                      value={availability[type.id] ?? 0}
                    />
                    <span className="mt-1 block text-xs text-muted">{type.label}</span>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">
                Tipos confirmados en la documentación: furgoneta de 3 palets, camión de 6
                palets y camión de 8 palets.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 pt-5">
            <div className="text-sm text-muted">
              {selectedDay ? (
                <>
                  {formatDate(selectedDay.date)} · {numberFormatter.format(selectedDay.summary.clients)} clientes ·{' '}
                  {decimalFormatter.format(selectedDay.summary.pallets)} palets
                </>
              ) : (
                'No hay pedidos cargados para esta fecha.'
              )}
            </div>
            <Button disabled={!selectedDay || !hasTrucks} onClick={onCalculate}>
              Calcular organización
            </Button>
          </div>
        </div>
      </section>

      {selectedDay ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Clientes" value={selectedDay.summary.clients} />
          <Kpi label="Líneas" value={numberFormatter.format(selectedDay.summary.lines)} />
          <Kpi label="Peso" value={formatKg(selectedDay.summary.weightKg)} />
          <Kpi label="Palets" value={decimalFormatter.format(selectedDay.summary.pallets)} tone="accent" />
        </section>
      ) : null}

      {plan ? (
        <section className="grid gap-4 lg:grid-cols-3">
          <ScoreCard
            label="Transportes usados"
            primary={`${plan.summary.usedTrucks}/${plan.summary.availableTrucks}`}
            secondary={`${decimalFormatter.format(plan.summary.usedCapacityPallets)} de ${decimalFormatter.format(plan.summary.totalCapacityPallets)} palets activados`}
          />
          <ScoreCard
            label="Score operativo"
            primary={formatScore(plan.summary.operationalScore)}
            secondary="Incluye coste de activar transporte"
            tone="success"
          />
          <ScoreCard
            label="Capacidad del día"
            primary={`${decimalFormatter.format((plan.summary.pallets / Math.max(1, plan.summary.totalCapacityPallets)) * 100)} %`}
            secondary={`${formatKg(plan.summary.weightKg)} · ${formatM3(plan.summary.volumeM3)}`}
            tone="highlight"
          />
        </section>
      ) : null}

      {plan?.warnings.length ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {plan.warnings.join(' ')}
        </div>
      ) : null}
    </div>
  )
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
  if (!plan) {
    return <EmptyState title="Sin planificación" body="Selecciona una fecha y al menos un transporte en Pedidos." />
  }

  const selectedTruck =
    plan.trucks.find((truck) => truck.id === selectedTruckId) ??
    plan.assignedTrucks[0] ??
    plan.trucks[0]

  return (
    <div className="space-y-8" id="organizacion">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-600">
            Organización
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            Distribución optimizada para {formatDate(plan.date)}.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Usados" value={`${plan.summary.usedTrucks}/${plan.summary.availableTrucks}`} />
        <Kpi label="Clientes" value={plan.summary.clients} />
        <Kpi label="Palets día" value={decimalFormatter.format(plan.summary.pallets)} />
        <Kpi label="Score" value={formatScore(plan.summary.operationalScore)} tone="accent" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {plan.trucks.map((truck) => (
          <button
            className={cn(
              'rounded-lg border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
              truck.id === selectedTruck?.id
                ? 'border-red-500 bg-red-50 ring-2 ring-red-100'
                : 'border-cream-300 bg-cream-50 hover:border-red-200 hover:bg-cream-100/50',
            )}
            key={truck.id}
            onClick={() => onSelectTruck(truck.id)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{truck.label}</p>
                <p className="mt-1 text-xs text-muted">{truck.type.label}</p>
              </div>
              <span
                className={cn(
                  'rounded-md border px-2 py-1 text-xs font-medium',
                  truck.clients.length === 0
                    ? 'border-cream-300 bg-cream-100 text-muted'
                    : truck.summary.overflow
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-cream-300 bg-cream-100 text-ink',
                )}
              >
                {truck.clients.length === 0 ? 'Libre' : truck.summary.overflow ? 'Revisar' : 'Asignado'}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
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
          <div className="rounded-lg border border-cream-300 bg-cream-50 p-5">
            <TruckLoadPlanner
              onSelectClient={() => undefined}
              plan={selectedTruck.loadPlan}
            />
          </div>
          <div className="rounded-lg border border-cream-300 bg-cream-50">
            <div className="border-b border-cream-300 px-5 py-4">
              <h2 className="text-base font-medium text-ink">Paradas del camión</h2>
              <p className="mt-0.5 text-sm text-muted">
                {selectedTruck.summary.clients > 0
                  ? `${formatKg(selectedTruck.summary.weightKg)} · ${decimalFormatter.format(selectedTruck.summary.pallets)} palets`
                  : 'Transporte disponible sin asignación'}
              </p>
            </div>
            <TruckStopList truck={selectedTruck} />
          </div>
        </section>
      ) : null}
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
    <div className="space-y-8" id="ruta">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-red-600">
            Ruta
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            {selectedTruck.label}: {selectedTruck.summary.clients} clientes optimizados.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted">
            Día {formatDate(plan.date)}. La ruta minimiza conducción, coste de kilómetros,
            ventanas horarias, prioridad, logística inversa y acceso físico a la carga.
          </p>
        </div>
        <label className="block min-w-64">
          <span className="text-sm font-medium text-ink">Camión</span>
          <select
            className="mt-2 min-h-11 w-full rounded-md border border-cream-300 bg-cream-50 px-3 text-sm text-ink outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-200"
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

      <section className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Kpi label="Clientes" value={selectedTruck.summary.clients} />
            <Kpi label="Líneas" value={selectedTruck.summary.lines} />
            <Kpi label="Peso" value={formatKg(selectedTruck.summary.weightKg)} />
            <Kpi label="Camión" value={selectedTruck.type.shortLabel} tone="accent" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
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

        <section className="overflow-hidden rounded-lg border border-cream-300 bg-cream-50">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-300 px-5 py-4">
            <div>
              <h2 className="text-base font-medium text-ink">Mapa de reparto</h2>
              <p className="mt-0.5 text-sm text-muted">
                Haversine x1.32 local · polilínea por secuencia optimizada
              </p>
            </div>
            <button
              className="rounded-md border border-cream-300 bg-cream-50 px-3 py-2 text-sm font-medium text-ink transition hover:bg-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
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

      <section className="grid gap-8 xl:grid-cols-[1fr_0.72fr]">
        <div className="rounded-lg border border-cream-300 bg-cream-50">
          <div className="border-b border-cream-300 px-5 py-4">
            <h2 className="text-base font-medium text-ink">Orden recomendado</h2>
            <p className="mt-0.5 text-sm text-muted">
              Primeras paradas cargadas cerca de la puerta trasera.
            </p>
          </div>
          <RouteOrdersTable
            clients={clients}
            onSelectClient={handleSelectClient}
            selectedClientId={effectiveSelectedClientId}
          />
        </div>

        <aside className="space-y-6">
          {selectedClient ? <SelectedClientPanel client={selectedClient} /> : null}

          <div className="rounded-lg border border-cream-300 bg-cream-50 p-5">
            <h2 className="text-base font-medium text-ink">Score operativo</h2>
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

      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-lg border border-cream-300 bg-cream-50 p-5">
          <TruckLoadPlanner onSelectClient={handleSelectClient} plan={selectedTruck.loadPlan} />
        </div>

        <div className="rounded-lg border border-cream-300 bg-cream-50 p-5">
          <h2 className="text-base font-medium text-ink">Tabla maestra resumida</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SummaryBlock label="Materiales agrupados" value={selectedTruck.masterRows.length} />
            <SummaryBlock label="Entregas SAP" value={selectedTruck.summary.deliveries} />
            <SummaryBlock label="Volumen" value={formatM3(selectedTruck.summary.volumeM3)} />
            <SummaryBlock label="Peso" value={formatKg(selectedTruck.summary.weightKg)} />
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-ink">Top productos por unidades</h3>
              <ul className="mt-3 space-y-2">
                {topProducts.map((product) => (
                  <li className="flex items-start justify-between gap-3 text-sm" key={`${product.material}-${product.product}`}>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-ink">{product.product}</span>
                      <span className="text-xs text-muted">{product.material}</span>
                    </span>
                    <span className="shrink-0 text-muted">
                      {decimalFormatter.format(product.quantity)} {product.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-ink">Calidad del cálculo</h3>
              <ul className="mt-3 space-y-2">
                {metricSources.map(([source, count]) => (
                  <li className="flex items-center justify-between gap-3 text-sm" key={source}>
                    <span className="text-muted">{source}</span>
                    <span className="font-medium text-ink">{count}</span>
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
        <thead className="border-b border-cream-200 bg-cream-100/50 text-xs uppercase tracking-wide text-muted">
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
        <tbody className="divide-y divide-cream-200">
          {clients.map((client) => (
            <tr
              className={client.clientId === selectedClientId ? 'bg-cream-200/50' : 'bg-cream-50'}
              key={client.clientId}
            >
              <td className="px-5 py-3 align-top font-medium text-ink">{client.optimizedSequence}</td>
              <td className="px-5 py-3 align-top">
                <button
                  className="text-left font-medium text-ink transition hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                  onClick={() => onSelectClient(client.clientId)}
                  type="button"
                >
                  {client.name}
                </button>
                <p className="mt-1 max-w-64 text-xs leading-5 text-muted">
                  {client.address}, {client.postalCode} {client.city}
                </p>
              </td>
              <td className="px-5 py-3 align-top text-muted">
                {client.lines} líneas · {client.productTypes.map(productLabel).join(', ')}
              </td>
              <td className="px-5 py-3 align-top">
                <span className="rounded-md border border-cream-300 bg-cream-100 px-2 py-1 text-xs font-medium text-ink">
                  {client.priorityLabel}
                </span>
                <p className="mt-1 text-xs text-muted">
                  {client.priorityReasons.slice(0, 2).join(', ')}
                </p>
              </td>
              <td className="px-5 py-3 align-top text-muted">
                {formatKg(client.weightKg)} · {decimalFormatter.format(client.pallets)} palets
              </td>
              <td className="px-5 py-3 align-top">
                <span className="font-medium text-ink">{client.arrival}</span>
                <p className="mt-1 text-xs text-muted">
                  {client.window.label} · {statusLabels[client.windowStatus] ?? client.windowStatus}
                </p>
              </td>
              <td className="px-5 py-3 align-top">
                <span className="rounded-md border border-cream-300 bg-cream-100 px-2 py-1 text-xs font-medium text-ink">
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
    return <div className="p-5 text-sm text-muted">Este transporte queda sin asignar.</div>
  }

  return (
    <div className="max-h-[520px] overflow-y-auto">
      {truck.clients.map((client) => (
        <div className="border-b border-cream-200 px-5 py-4 last:border-b-0" key={client.clientId}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">
                {client.optimizedSequence}. {client.name}
              </p>
              <p className="mt-1 text-xs leading-5 text-muted">
                {client.address}, {client.postalCode} {client.city}
              </p>
            </div>
            <span className="rounded-md border border-cream-300 bg-cream-100 px-2 py-1 text-xs font-medium text-ink">
              {client.arrival}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
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
  const toneClass = tone === 'accent' ? 'border-red-200 bg-red-50' : 'border-cream-300 bg-cream-50'
  return (
    <div className={`rounded-md border p-4 ${toneClass}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
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
    default: 'border-cream-300 bg-cream-50',
    success: 'border-cream-300 bg-cream-100',
    highlight: 'border-red-200 bg-red-50',
  }
  return (
    <div className={`rounded-md border p-4 ${tones[tone]}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{primary}</p>
      <p className="mt-1 text-sm text-muted">{secondary}</p>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  )
}

function ScoreLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-cream-200 pb-2 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted">{label}</span>
      <span className={strong ? 'text-sm font-semibold text-red-600' : 'text-sm font-medium text-ink'}>
        {value}
      </span>
    </div>
  )
}

function SummaryBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-cream-200 bg-cream-100/50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-ink">{value}</p>
    </div>
  )
}

function SelectedClientPanel({ client }: { client: RouteClient }) {
  return (
    <div className="rounded-lg border border-cream-300 bg-cream-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Cliente seleccionado</p>
          <h2 className="mt-2 text-lg font-semibold text-ink">{client.name}</h2>
        </div>
        <span className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-600">
          Stop {client.optimizedSequence}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">
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
          <span className="rounded-md border border-cream-300 bg-cream-100 px-2 py-1 text-xs font-medium text-ink" key={type}>
            {productLabel(type)}
          </span>
        ))}
        {client.hasReturnables ? (
          <span className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
            Retorno {decimalFormatter.format(client.returnableUnits)}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-xs text-muted">
        {formatKg(client.weightKg)} · {decimalFormatter.format(client.pallets)} palets · dificultad
        carga {decimalFormatter.format(client.loadDifficulty)}. Coordenadas: {client.geocodeSource}.
        Orden original: {client.currentSequence}.
      </p>
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
    <div className="relative h-[430px] bg-cream-100">
      <div className="h-full w-full" ref={containerRef} />
      <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-cream-300 bg-cream-50/95 px-3 py-2 text-xs text-ink">
        <div className="flex items-center gap-2">
          <span className="h-0.5 w-8 rounded bg-red-600" />
          Hackemate
        </div>
        {showOriginalRoute ? (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="h-px w-8 border-t border-dashed border-muted" />
            Original
          </div>
        ) : null}
      </div>
    </div>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-cream-300 bg-cream-50 p-8">
      <h1 className="text-2xl font-semibold text-ink">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
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

function viewTitle(view: AppView) {
  if (view === 'pedidos') {
    return 'Pedidos'
  }
  if (view === 'organizacion') {
    return 'Organización'
  }
  return 'Ruta'
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
