import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as L from 'leaflet'
import { Container } from '@/components/ui/Container'
import { pilotRoute } from '@/data/pilotRoute'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { siteConfig } from '@/lib/site'

type Client = {
  clientId: string
  name: string
  address: string
  postalCode: string
  city: string
  currentSequence: number
  optimizedSequence: number
  lines: number
  weightKg: number
  volumeM3: number
  pallets: number
  returnableUnits: number
  hasReturnables: boolean
  productTypes: readonly string[]
  lat: number
  lng: number
  geocodeSource: string
  window: {
    label: string
  }
  serviceMinutes: number
  priorityScore: number
  priorityLabel: string
  priorityReasons: readonly string[]
  loadDifficulty: number
  arrival: string
  windowStatus: string
  waitMinutes: number
  lateMinutes: number
  loadZone: number
}

type Depot = {
  name: string
  address: string
  city: string
  lat: number
  lng: number
}

type PolylinePoint = {
  lat: number
  lng: number
}

type TruckZone = {
  zone: number
  label: string
  position: string
  clients: readonly string[]
  pallets: number
  weightKg: number
  returnableStops: number
}

const numberFormatter = new Intl.NumberFormat('es-ES')
const decimalFormatter = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 })

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

function productLabel(type: string) {
  return typeLabels[type] ?? type
}

export function HomePage() {
  useDocumentTitle(`${siteConfig.name} | Ruta piloto`)

  const clients = pilotRoute.clients as readonly Client[]
  const truckZones = pilotRoute.truckZones as readonly TruckZone[]
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.clientId ?? '')
  const [showOriginalRoute, setShowOriginalRoute] = useState(true)
  const selectedClient = clients.find((client) => client.clientId === selectedClientId) ?? clients[0]

  const handleSelectClient = useCallback((clientId: string) => {
    setSelectedClientId(clientId)
  }, [])

  const topProducts = useMemo(() => {
    const totals = new Map<string, { material: string; product: string; quantity: number; unit: string }>()
    for (const row of pilotRoute.masterRows) {
      const current = totals.get(row.material) ?? {
        material: row.material,
        product: row.product,
        quantity: 0,
        unit: row.unit,
      }
      current.quantity += row.quantity
      totals.set(row.material, current)
    }
    return [...totals.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 6)
  }, [])

  const metricSources = useMemo(() => {
    const totals = new Map<string, number>()
    for (const row of pilotRoute.masterRows) {
      totals.set(row.metricSource, (totals.get(row.metricSource) ?? 0) + 1)
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1])
  }, [])

  const statusCounts = useMemo(() => {
    return clients.reduce(
      (accumulator, client) => {
        accumulator[client.windowStatus] = (accumulator[client.windowStatus] ?? 0) + 1
        return accumulator
      },
      {} as Record<string, number>,
    )
  }, [clients])

  return (
    <Container className="py-10 sm:py-12">
      <div
        className="rounded-2xl bg-gradient-to-b from-rose-50/60 via-white to-white p-4 sm:p-6"
        style={{
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        }}
      >
      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]" id="piloto">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-700">
              Piloto DDI Mollet
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Ruta real optimizada para {pilotRoute.pilot.clients} clientes.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Transporte {pilotRoute.pilot.transport}, ruta real {pilotRoute.pilot.routeReal},
              día {pilotRoute.pilot.date}. La tabla maestra sale de Hackaton.xlsx, ZM040 y
              Horarios Entrega; el orden minimiza score operativo, no solo kilómetros.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi label="Clientes" value={pilotRoute.pilot.clients} />
            <Kpi label="Líneas" value={pilotRoute.pilot.lines} />
            <Kpi label="Peso" value={formatKg(pilotRoute.pilot.weightKg)} />
            <Kpi label="Camión" value={pilotRoute.pilot.recommendedTruck} tone="amber" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <ScoreCard
              label="Orden actual"
              primary={formatScore(pilotRoute.route.original.operationalScore)}
              secondary={`${pilotRoute.route.original.distanceKm} km · ${formatMinutes(pilotRoute.route.original.totalMinutes)}`}
            />
            <ScoreCard
              label="Hackemate"
              primary={formatScore(pilotRoute.route.optimized.operationalScore)}
              secondary={`${pilotRoute.route.optimized.distanceKm} km · ${formatMinutes(pilotRoute.route.optimized.totalMinutes)}`}
              tone="green"
            />
            <ScoreCard
              label="Mejora operativa"
              primary={formatScore(pilotRoute.route.scoreImprovement)}
              secondary={`${formatMinutes(pilotRoute.route.savingsMinutes)} · ${formatPercent(pilotRoute.route.scoreImprovementPercent)}`}
              tone="blue"
            />
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm" id="mapa">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-ink">Mapa de reparto</h2>
              <p className="text-sm text-muted">
                {pilotRoute.pilot.routingSource} · {pilotRoute.pilot.geometrySource}
              </p>
            </div>
            <button
              className="rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
              onClick={() => setShowOriginalRoute((value) => !value)}
              type="button"
            >
              {showOriginalRoute ? 'Ocultar actual' : 'Ver actual'}
            </button>
          </div>
          <RouteMap
            clients={clients}
            depot={pilotRoute.depot}
            onSelectClient={handleSelectClient}
            optimizedPolyline={pilotRoute.route.optimizedPolyline}
            originalPolyline={pilotRoute.route.originalPolyline}
            selectedClientId={selectedClientId}
            showOriginalRoute={showOriginalRoute}
          />
        </section>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.72fr]">
        <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-ink">Orden recomendado</h2>
              <p className="text-sm text-muted">
                Primeras paradas cargadas cerca de la puerta trasera.
              </p>
            </div>
            <a
              className="rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
              href={pilotRoute.pilot.masterCsv}
            >
              CSV maestro
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Stop</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Prioridad</th>
                  <th className="px-4 py-3">Carga</th>
                  <th className="px-4 py-3">Horario</th>
                  <th className="px-4 py-3">Zona</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <tr
                    className={
                      client.clientId === selectedClientId ? 'bg-rose-50/70' : 'bg-white'
                    }
                    key={client.clientId}
                  >
                    <td className="px-4 py-3 align-top font-semibold text-ink">
                      {client.optimizedSequence}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <button
                        className="text-left font-semibold text-ink transition hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
                        onClick={() => setSelectedClientId(client.clientId)}
                        type="button"
                      >
                        {client.name}
                      </button>
                      <p className="mt-1 max-w-64 text-xs leading-5 text-muted">
                        {client.address}, {client.postalCode} {client.city}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top text-muted">
                      {client.lines} líneas · {client.productTypes.map(productLabel).join(', ')}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-ink">
                        {client.priorityLabel}
                      </span>
                      <p className="mt-1 text-xs text-muted">
                        {client.priorityReasons.slice(0, 2).join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top text-muted">
                      {formatKg(client.weightKg)} · {decimalFormatter.format(client.pallets)} palets
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="font-medium text-ink">{client.arrival}</span>
                      <p className="mt-1 text-xs text-muted">
                        {client.window.label} · {statusLabels[client.windowStatus] ?? client.windowStatus}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-ink">
                        Z{client.loadZone}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-6">
          <SelectedClientPanel client={selectedClient} />

          <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm" id="score">
            <h2 className="text-base font-semibold text-ink">Score operativo</h2>
            <div className="mt-4 space-y-3">
              <ScoreLine label="Score actual" value={formatScore(pilotRoute.route.original.operationalScore)} />
              <ScoreLine label="Score Hackemate" value={formatScore(pilotRoute.route.optimized.operationalScore)} />
              <ScoreLine label="Mejora" value={formatScore(pilotRoute.route.scoreImprovement)} strong />
              <ScoreLine
                label="Tiempo ahorrado"
                value={formatMinutes(pilotRoute.route.savingsMinutes)}
              />
              <ScoreLine
                label="Distancia"
                value={`${pilotRoute.route.optimized.distanceKm} km (${pilotRoute.route.savingsKm} km menos)`}
              />
              <ScoreLine label="Fin estimado" value={pilotRoute.route.optimized.finish} />
              <ScoreLine
                label="Penalización horarios"
                value={`${decimalFormatter.format(pilotRoute.route.optimized.waitMinutes)} min espera · ${decimalFormatter.format(pilotRoute.route.optimized.lateMinutes)} min tarde`}
              />
              <ScoreLine
                label="Prioridad/carga"
                value={`${formatScore(pilotRoute.route.optimized.priorityPenalty)} / ${formatScore(pilotRoute.route.optimized.loadPenalty)}`}
              />
              <ScoreLine
                label="Ventanas correctas"
                value={`${statusCounts.ok ?? 0}/${pilotRoute.pilot.clients}`}
              />
            </div>
          </div>
        </aside>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]" id="carga">
        <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Camión visual</h2>
          <p className="mt-1 text-sm text-muted">
            {decimalFormatter.format(pilotRoute.pilot.pallets)} palets equivalentes,{' '}
            {formatM3(pilotRoute.pilot.volumeM3)} y retorno en{' '}
            {formatPercent(pilotRoute.pilot.returnableShare * 100)} de las líneas.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {truckZones.map((zone) => (
              <div className="min-h-36 rounded-xl border border-slate-200/70 bg-slate-50/70 p-3" key={zone.zone}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-ink">{zone.label}</span>
                  <span className="rounded bg-white px-2 py-1 text-xs text-muted">
                    {decimalFormatter.format(zone.pallets)} pal
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-muted">{zone.position}</p>
                <div className="mt-3 space-y-1">
                  {zone.clients.map((name) => (
                    <p className="truncate text-xs text-ink" key={name} title={name}>
                      {name}
                    </p>
                  ))}
                  {zone.clients.length === 0 ? (
                    <p className="text-xs text-muted">Libre</p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Tabla maestra resumida</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <SummaryBlock label="Materiales únicos" value={pilotRoute.pilot.materials} />
            <SummaryBlock label="Entregas SAP" value={pilotRoute.pilot.deliveries} />
            <SummaryBlock label="Volumen" value={formatM3(pilotRoute.pilot.volumeM3)} />
            <SummaryBlock label="Peso" value={formatKg(pilotRoute.pilot.weightKg)} />
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-ink">Top productos por unidades</h3>
              <ul className="mt-3 space-y-2">
                {topProducts.map((product) => (
                  <li className="flex items-start justify-between gap-3 text-sm" key={product.material}>
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
              <h3 className="text-sm font-semibold text-ink">Calidad del cálculo</h3>
              <ul className="mt-3 space-y-2">
                {metricSources.map(([source, count]) => (
                  <li className="flex items-center justify-between gap-3 text-sm" key={source}>
                    <span className="text-muted">{source}</span>
                    <span className="font-semibold text-ink">{count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold text-ink">Algoritmo aplicado</h2>
        <ol className="mt-3 grid gap-2 text-sm leading-6 text-muted md:grid-cols-2">
          {pilotRoute.algorithm.map((step) => (
            <li className="rounded-xl bg-slate-50/70 px-3 py-2" key={step}>
              {step}
            </li>
          ))}
        </ol>
      </section>
      </div>
    </Container>
  )
}

function Kpi({
  label,
  value,
  tone = 'slate',
}: {
  label: string
  value: string | number
  tone?: 'slate' | 'amber'
}) {
  const toneClass =
    tone === 'amber' ? 'border-amber-200/80 bg-amber-50/70' : 'border-slate-200/70 bg-white'
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-xl font-bold text-ink">{value}</p>
    </div>
  )
}

function ScoreCard({
  label,
  primary,
  secondary,
  tone = 'slate',
}: {
  label: string
  primary: string
  secondary: string
  tone?: 'slate' | 'green' | 'blue'
}) {
  const tones = {
    slate: 'border-slate-200/70 bg-white',
    green: 'border-emerald-200/80 bg-emerald-50/60',
    blue: 'border-rose-200/80 bg-rose-50/60',
  }
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{primary}</p>
      <p className="mt-1 text-sm text-muted">{secondary}</p>
    </div>
  )
}

function ScoreLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
      <span className="text-sm text-muted">{label}</span>
      <span className={strong ? 'text-sm font-bold text-emerald-700' : 'text-sm font-semibold text-ink'}>
        {value}
      </span>
    </div>
  )
}

function SummaryBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-50/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-lg font-bold text-ink">{value}</p>
    </div>
  )
}

function SelectedClientPanel({ client }: { client: Client }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Cliente seleccionado</p>
          <h2 className="mt-2 text-lg font-bold text-ink">{client.name}</h2>
        </div>
        <span className="rounded bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">
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
          <span className="rounded bg-slate-100/80 px-2 py-1 text-xs font-medium text-ink" key={type}>
            {productLabel(type)}
          </span>
        ))}
        {client.hasReturnables ? (
          <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
            Retorno {decimalFormatter.format(client.returnableUnits)}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-xs text-muted">
        {formatKg(client.weightKg)} · {decimalFormatter.format(client.pallets)} palets ·{' '}
        dificultad carga {decimalFormatter.format(client.loadDifficulty)}. Coordenadas:{' '}
        {client.geocodeSource}. Orden original: {client.currentSequence}.
      </p>
    </div>
  )
}

function RouteMap({
  clients,
  depot,
  optimizedPolyline,
  originalPolyline,
  selectedClientId,
  showOriginalRoute,
  onSelectClient,
}: {
  clients: readonly Client[]
  depot: Depot
  optimizedPolyline: readonly PolylinePoint[]
  originalPolyline: readonly PolylinePoint[]
  selectedClientId: string
  showOriginalRoute: boolean
  onSelectClient: (clientId: string) => void
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const fittedRef = useRef(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const map = L.map(containerRef.current, {
      attributionControl: true,
      scrollWheelZoom: false,
      zoomControl: false,
    }).setView([depot.lat, depot.lng], 13)

    L.control.zoom({ position: 'bottomright' }).addTo(map)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
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
        color: '#64748b',
        dashArray: '6 8',
        opacity: 0.75,
        weight: 3,
      }).addTo(layer)
    }

    if (optimizedLine.length > 1) {
      L.polyline(optimizedLine, {
        color: '#e11d48',
        opacity: 0.95,
        weight: 5,
      }).addTo(layer)
    }

    L.circleMarker([depot.lat, depot.lng], {
      color: '#111827',
      fillColor: '#111827',
      fillOpacity: 0.9,
      radius: 8,
      weight: 2,
    })
      .addTo(layer)
      .bindTooltip(depot.name, { direction: 'top' })

    for (const client of clients) {
      const selected = client.clientId === selectedClientId
      const marker = L.circleMarker([client.lat, client.lng], {
        color: selected ? '#9f1239' : '#e11d48',
        fillColor: selected ? '#fb7185' : '#fb7185',
        fillOpacity: selected ? 0.95 : 0.82,
        radius: selected ? 9 : 6,
        weight: selected ? 3 : 2,
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
    <div className="relative h-[430px] bg-slate-100">
      <div className="h-full w-full" ref={containerRef} />
      <div className="pointer-events-none absolute left-3 top-3 rounded-xl bg-white/95 px-3 py-2 text-xs text-ink shadow-sm ring-1 ring-slate-900/5">
        <div className="flex items-center gap-2">
          <span className="h-1 w-8 rounded bg-rose-600" />
          Hackemate
        </div>
        {showOriginalRoute ? (
          <div className="mt-1 flex items-center gap-2">
            <span className="h-px w-8 border-t border-dashed border-slate-500" />
            Actual
          </div>
        ) : null}
      </div>
    </div>
  )
}
