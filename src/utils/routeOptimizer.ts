import type { Depot, PlanningClient, PlanningDay, PlanningLoadRow, TruckType } from '@/types/planning'
import { buildTruckLoadPlan, type TruckLoadPlan } from '@/utils/loadPlanner'

export type TruckAvailability = Record<string, number>

export type RouteStopMetrics = {
  clientId: string
  arrival: string
  serviceMinutes: number
  waitMinutes: number
  lateMinutes: number
  priorityPenalty: number
  loadPenalty: number
  windowStatus: string
}

export type RouteMetrics = {
  distanceKm: number
  driveMinutes: number
  serviceMinutes: number
  waitMinutes: number
  lateMinutes: number
  priorityPenalty: number
  loadPenalty: number
  fuelPenalty: number
  operationalScore: number
  totalMinutes: number
  finish: string
  stops: readonly RouteStopMetrics[]
}

export type RouteClient = PlanningClient & {
  optimizedSequence: number
  arrival: string
  windowStatus: string
  waitMinutes: number
  lateMinutes: number
  routePriorityPenalty: number
  routeLoadPenalty: number
  loadZone: number
}

export type PolylinePoint = {
  lat: number
  lng: number
}

export type PlannedTruck = {
  id: string
  label: string
  type: TruckType
  capacityPallets: number
  clients: readonly RouteClient[]
  masterRows: readonly PlanningLoadRow[]
  loadPlan: TruckLoadPlan
  optimizedPolyline: readonly PolylinePoint[]
  originalPolyline: readonly PolylinePoint[]
  route: {
    originalSequence: readonly string[]
    optimizedSequence: readonly string[]
    original: RouteMetrics
    optimized: RouteMetrics
    savingsKm: number
    savingsMinutes: number
    scoreImprovement: number
    scoreImprovementPercent: number
  }
  summary: {
    clients: number
    lines: number
    deliveries: number
    weightKg: number
    volumeM3: number
    pallets: number
    capacityUse: number
    overflow: boolean
    activationCostMinutes: number
    totalScore: number
  }
}

export type DistributionPlan = {
  date: string
  trucks: readonly PlannedTruck[]
  assignedTrucks: readonly PlannedTruck[]
  unusedTrucks: readonly PlannedTruck[]
  warnings: readonly string[]
  summary: {
    clients: number
    lines: number
    deliveries: number
    weightKg: number
    volumeM3: number
    pallets: number
    availableTrucks: number
    usedTrucks: number
    totalCapacityPallets: number
    usedCapacityPallets: number
    operationalScore: number
  }
}

type DraftTruck = {
  id: string
  label: string
  type: TruckType
  routeIds: string[]
  currentScore: number
  pallets: number
  weightKg: number
  volumeM3: number
  lines: number
}

type OptimizerContext = {
  depot: Depot
  clientsById: Map<string, PlanningClient>
}

type LoadProjection = {
  pallets: number
  weightKg: number
  volumeM3: number
  lines: number
}

const START_MINUTE = 8 * 60
const AVERAGE_SPEED_M_PER_HOUR = 28_000
const ROAD_FACTOR = 1.32
const FUEL_EQUIVALENT_MIN_PER_KM = 0.3
const WAIT_PENALTY_FACTOR = 0.5
const LATE_PENALTY_FACTOR = 10
const PRIORITY_DELAY_FACTOR = 0.08
const LOAD_ACCESS_FACTOR = 1.6
const PALLET_WEIGHT_LIMIT_KG = 900
const PALLET_VOLUME_LIMIT_M3 = 1.25
const TRUCK_FILL_LIMIT = 0.98

export function getDefaultAvailability(truckTypes: readonly TruckType[]): TruckAvailability {
  return Object.fromEntries(
    truckTypes.map((type) => [type.id, type.defaultAvailable]),
  ) as TruckAvailability
}

export function buildDistributionPlan(
  day: PlanningDay,
  truckTypes: readonly TruckType[],
  availability: TruckAvailability,
  depot: Depot,
): DistributionPlan {
  const trucks = expandAvailableTrucks(truckTypes, availability)
  const clientsById = new Map(day.clients.map((client) => [client.clientId, client]))
  const context: OptimizerContext = { depot, clientsById }
  const rowsByClient = groupRowsByClient(day.masterRows)
  const warnings: string[] = []

  const totalCapacityPallets = trucks.reduce((total, truck) => total + truck.capacityPallets, 0)
  if (day.summary.pallets > totalCapacityPallets * TRUCK_FILL_LIMIT) {
    warnings.push('La capacidad indicada no cubre todos los palets con el margen operativo recomendado.')
  }

  const drafts = trucks.map(createDraftTruck)
  const orderedClients = [...day.clients].sort(orderClientsForAssignment)

  for (const client of orderedClients) {
    const best = chooseBestTruckInsertion(drafts, client, context)
    const draft = drafts[best.truckIndex]
    draft.routeIds = best.routeIds
    draft.currentScore = best.routeScore
    draft.pallets = roundTwo(draft.pallets + client.pallets)
    draft.weightKg = roundOne(draft.weightKg + client.weightKg)
    draft.volumeM3 = roundTwo(draft.volumeM3 + client.volumeM3)
    draft.lines += client.lines
  }

  for (const draft of drafts) {
    if (draft.routeIds.length === 0) {
      continue
    }
    draft.routeIds = improveRoute(draft.routeIds, context)
    draft.currentScore = evaluateRoute(draft.routeIds, context).operationalScore
  }

  const plannedTrucks = drafts.map((draft) => finalizeTruck(draft, context, rowsByClient))
  const assignedTrucks = plannedTrucks.filter((truck) => truck.clients.length > 0)
  const unusedTrucks = plannedTrucks.filter((truck) => truck.clients.length === 0)
  const overloaded = assignedTrucks.filter((truck) => truck.summary.overflow)
  if (overloaded.length > 0) {
    warnings.push(`${overloaded.length} camión(es) quedan por encima de la capacidad recomendada.`)
  }
  if (unusedTrucks.length > 0) {
    warnings.push(`${unusedTrucks.length} transporte(s) disponible(s) se dejan sin asignar por eficiencia.`)
  }

  return {
    date: day.date,
    trucks: plannedTrucks,
    assignedTrucks,
    unusedTrucks,
    warnings,
    summary: {
      clients: day.summary.clients,
      lines: day.summary.lines,
      deliveries: day.summary.deliveries,
      weightKg: day.summary.weightKg,
      volumeM3: day.summary.volumeM3,
      pallets: day.summary.pallets,
      availableTrucks: plannedTrucks.length,
      usedTrucks: assignedTrucks.length,
      totalCapacityPallets,
      usedCapacityPallets: roundTwo(assignedTrucks.reduce((total, truck) => total + truck.capacityPallets, 0)),
      operationalScore: roundOne(assignedTrucks.reduce((total, truck) => total + truck.summary.totalScore, 0)),
    },
  }
}

function expandAvailableTrucks(
  truckTypes: readonly TruckType[],
  availability: TruckAvailability,
) {
  return truckTypes
    .flatMap((type) => {
      const count = Math.max(0, Math.floor(availability[type.id] ?? 0))
      return Array.from({ length: count }, (_, index) => ({
        id: `${type.id}-${index + 1}`,
        label: `${type.shortLabel} #${index + 1}`,
        type,
        capacityPallets: type.palletCapacity,
      }))
    })
    .sort((a, b) => a.capacityPallets - b.capacityPallets || a.label.localeCompare(b.label))
}

function createDraftTruck(truck: {
  id: string
  label: string
  type: TruckType
  capacityPallets: number
}): DraftTruck {
  return {
    id: truck.id,
    label: truck.label,
    type: truck.type,
    routeIds: [],
    currentScore: 0,
    pallets: 0,
    weightKg: 0,
    volumeM3: 0,
    lines: 0,
  }
}

function orderClientsForAssignment(a: PlanningClient, b: PlanningClient) {
  const windowA = a.window.endMinute ?? Number.POSITIVE_INFINITY
  const windowB = b.window.endMinute ?? Number.POSITIVE_INFINITY
  return (
    windowA - windowB ||
    b.priorityScore - a.priorityScore ||
    b.pallets - a.pallets ||
    b.weightKg - a.weightKg ||
    a.currentSequence - b.currentSequence
  )
}

function chooseBestTruckInsertion(
  drafts: readonly DraftTruck[],
  client: PlanningClient,
  context: OptimizerContext,
) {
  let best:
    | {
        truckIndex: number
        routeIds: string[]
        routeScore: number
        totalDelta: number
        feasible: boolean
      }
    | null = null

  for (let truckIndex = 0; truckIndex < drafts.length; truckIndex += 1) {
    const draft = drafts[truckIndex]
    const insertion = bestInsertion(draft.routeIds, client.clientId, draft.currentScore, context)
    const projection = projectLoad(draft, client)
    const feasible = isFeasibleProjection(projection, draft.type.palletCapacity)
    const openingCost = draft.routeIds.length === 0 ? draft.type.fixedCostMinutes : 0
    const totalDelta =
      insertion.deltaScore +
      openingCost +
      capacityPenalty(projection, draft.type.palletCapacity) +
      fillPreferencePenalty(projection, draft.type.palletCapacity)

    if (!best || (feasible && !best.feasible) || (feasible === best.feasible && totalDelta < best.totalDelta)) {
      best = {
        truckIndex,
        routeIds: insertion.routeIds,
        routeScore: insertion.routeScore,
        totalDelta,
        feasible,
      }
    }
  }

  if (!best) {
    throw new Error('No hay transportes disponibles para asignar pedidos.')
  }
  return best
}

function bestInsertion(
  routeIds: readonly string[],
  clientId: string,
  currentScore: number,
  context: OptimizerContext,
) {
  if (routeIds.length === 0) {
    const candidate = [clientId]
    return {
      routeIds: candidate,
      routeScore: evaluateRoute(candidate, context).operationalScore,
      deltaScore: evaluateRoute(candidate, context).operationalScore,
    }
  }

  let bestRoute = [...routeIds, clientId]
  let bestScore = evaluateRoute(bestRoute, context).operationalScore

  for (let position = 0; position <= routeIds.length; position += 1) {
    const candidate = [
      ...routeIds.slice(0, position),
      clientId,
      ...routeIds.slice(position),
    ]
    const score = evaluateRoute(candidate, context).operationalScore
    if (score < bestScore) {
      bestRoute = candidate
      bestScore = score
    }
  }

  return {
    routeIds: bestRoute,
    routeScore: bestScore,
    deltaScore: bestScore - currentScore,
  }
}

function projectLoad(draft: DraftTruck, client: PlanningClient): LoadProjection {
  return {
    pallets: draft.pallets + client.pallets,
    weightKg: draft.weightKg + client.weightKg,
    volumeM3: draft.volumeM3 + client.volumeM3,
    lines: draft.lines + client.lines,
  }
}

function isFeasibleProjection(load: LoadProjection, capacityPallets: number) {
  return (
    load.pallets <= capacityPallets * TRUCK_FILL_LIMIT &&
    load.weightKg <= capacityPallets * PALLET_WEIGHT_LIMIT_KG &&
    load.volumeM3 <= capacityPallets * PALLET_VOLUME_LIMIT_M3
  )
}

function capacityPenalty(load: LoadProjection, capacityPallets: number) {
  const palletLimit = capacityPallets * TRUCK_FILL_LIMIT
  const weightLimit = capacityPallets * PALLET_WEIGHT_LIMIT_KG
  const volumeLimit = capacityPallets * PALLET_VOLUME_LIMIT_M3
  const palletOverflow = Math.max(0, load.pallets - palletLimit)
  const weightOverflow = Math.max(0, load.weightKg - weightLimit)
  const volumeOverflow = Math.max(0, load.volumeM3 - volumeLimit)
  return palletOverflow * 3000 + (weightOverflow / 100) * 240 + volumeOverflow * 2200
}

function fillPreferencePenalty(load: LoadProjection, capacityPallets: number) {
  const fillRatio = load.pallets / Math.max(1, capacityPallets)
  return fillRatio < 0.2 ? 6 : 0
}

function improveRoute(routeIds: readonly string[], context: OptimizerContext) {
  let best = [...routeIds]
  let bestScore = evaluateRoute(best, context).operationalScore
  const maxPasses = routeIds.length > 35 ? 1 : 2

  for (let pass = 0; pass < maxPasses; pass += 1) {
    let improved = false

    for (let start = 0; start < best.length - 2; start += 1) {
      for (let end = start + 2; end <= best.length; end += 1) {
        const candidate = [
          ...best.slice(0, start),
          ...best.slice(start, end).reverse(),
          ...best.slice(end),
        ]
        const score = evaluateRoute(candidate, context).operationalScore
        if (score + 0.1 < bestScore) {
          best = candidate
          bestScore = score
          improved = true
        }
      }
    }

    for (let first = 0; first < best.length - 1; first += 1) {
      for (let second = first + 1; second < best.length; second += 1) {
        const candidate = [...best]
        ;[candidate[first], candidate[second]] = [candidate[second], candidate[first]]
        const score = evaluateRoute(candidate, context).operationalScore
        if (score + 0.1 < bestScore) {
          best = candidate
          bestScore = score
          improved = true
        }
      }
    }

    if (!improved) {
      break
    }
  }

  return best
}

function finalizeTruck(
  draft: DraftTruck,
  context: OptimizerContext,
  rowsByClient: Map<string, PlanningLoadRow[]>,
): PlannedTruck {
  const optimizedEval = evaluateRoute(draft.routeIds, context)
  const originalIds = [...draft.routeIds].sort((a, b) => {
    const clientA = context.clientsById.get(a)
    const clientB = context.clientsById.get(b)
    return (clientA?.currentSequence ?? 0) - (clientB?.currentSequence ?? 0)
  })
  const originalEval = evaluateRoute(originalIds, context)
  const stopsByClient = new Map(optimizedEval.stops.map((stop) => [stop.clientId, stop]))
  const clients = draft.routeIds.map((clientId, index) => {
    const client = context.clientsById.get(clientId)
    if (!client) {
      throw new Error(`Cliente no encontrado: ${clientId}`)
    }
    const stop = stopsByClient.get(clientId)
    const optimizedSequence = index + 1
    return {
      ...client,
      optimizedSequence,
      arrival: stop?.arrival ?? 'Sin hora',
      windowStatus: stop?.windowStatus ?? 'ok',
      waitMinutes: stop?.waitMinutes ?? 0,
      lateMinutes: stop?.lateMinutes ?? 0,
      routePriorityPenalty: stop?.priorityPenalty ?? 0,
      routeLoadPenalty: stop?.loadPenalty ?? 0,
      loadZone: Math.min(
        draft.type.palletCapacity,
        Math.max(1, Math.ceil(optimizedSequence * draft.type.palletCapacity / Math.max(1, draft.routeIds.length))),
      ),
    }
  })
  const masterRows = clients.flatMap((client) => rowsByClient.get(client.clientId) ?? [])
  const loadPlan = buildTruckLoadPlan(clients, masterRows, { slots: draft.type.palletCapacity })
  const savingsKm = originalEval.distanceKm - optimizedEval.distanceKm
  const scoreImprovement = originalEval.operationalScore - optimizedEval.operationalScore
  const scoreImprovementPercent =
    originalEval.operationalScore > 0 ? (scoreImprovement / originalEval.operationalScore) * 100 : 0
  const capacityUse = draft.type.palletCapacity > 0 ? (draft.pallets / draft.type.palletCapacity) * 100 : 0
  const overflow =
    draft.pallets > draft.type.palletCapacity * TRUCK_FILL_LIMIT ||
    draft.weightKg > draft.type.palletCapacity * PALLET_WEIGHT_LIMIT_KG ||
    draft.volumeM3 > draft.type.palletCapacity * PALLET_VOLUME_LIMIT_M3

  return {
    id: draft.id,
    label: draft.label,
    type: draft.type,
    capacityPallets: draft.type.palletCapacity,
    clients,
    masterRows,
    loadPlan,
    optimizedPolyline: routePolyline(draft.routeIds, context),
    originalPolyline: routePolyline(originalIds, context),
    route: {
      originalSequence: originalIds,
      optimizedSequence: draft.routeIds,
      original: originalEval,
      optimized: optimizedEval,
      savingsKm: roundOne(savingsKm),
      savingsMinutes: roundOne(originalEval.totalMinutes - optimizedEval.totalMinutes),
      scoreImprovement: roundOne(scoreImprovement),
      scoreImprovementPercent: roundOne(scoreImprovementPercent),
    },
    summary: {
      clients: clients.length,
      lines: clients.reduce((total, client) => total + client.lines, 0),
      deliveries: new Set(clients.flatMap((client) => client.deliveries)).size,
      weightKg: roundOne(draft.weightKg),
      volumeM3: roundTwo(draft.volumeM3),
      pallets: roundTwo(draft.pallets),
      capacityUse: roundOne(capacityUse),
      overflow,
      activationCostMinutes: clients.length > 0 ? draft.type.fixedCostMinutes : 0,
      totalScore: roundOne(optimizedEval.operationalScore + (clients.length > 0 ? draft.type.fixedCostMinutes : 0)),
    },
  }
}

function evaluateRoute(routeIds: readonly string[], context: OptimizerContext): RouteMetrics {
  let totalDistanceMeters = 0
  let totalDriveMinutes = 0
  let totalWaitMinutes = 0
  let totalLateMinutes = 0
  let totalPriorityPenalty = 0
  let totalLoadPenalty = 0
  let currentMinute = START_MINUTE
  const stops: RouteStopMetrics[] = []
  const path = [null, ...routeIds, null]

  for (let index = 0; index < path.length - 1; index += 1) {
    const origin = pointFor(path[index], context)
    const destination = pointFor(path[index + 1], context)
    const distance = roadDistanceMeters(origin, destination)
    const driveMinutes = (distance / AVERAGE_SPEED_M_PER_HOUR) * 60
    totalDistanceMeters += distance
    totalDriveMinutes += driveMinutes
    currentMinute += driveMinutes

    const destinationId = path[index + 1]
    if (!destinationId) {
      continue
    }

    const client = context.clientsById.get(destinationId)
    if (!client) {
      continue
    }

    let status = 'ok'
    let waitMinutes = 0
    let lateMinutes = 0
    const windowStart = client.window.startMinute
    const windowEnd = client.window.endMinute

    if (windowStart !== null && currentMinute < windowStart) {
      waitMinutes = windowStart - currentMinute
      currentMinute = windowStart
      status = 'espera'
    }

    if (windowEnd !== null && currentMinute > windowEnd) {
      lateMinutes = currentMinute - windowEnd
      status = 'tarde'
    }

    const stopNumber = index + 1
    const priorityPenalty =
      Math.max(0, currentMinute - START_MINUTE) *
      client.priorityScore *
      PRIORITY_DELAY_FACTOR
    const loadPosition = (stopNumber - 1) / Math.max(1, routeIds.length - 1)
    const loadPenalty = client.loadDifficulty * loadPosition * LOAD_ACCESS_FACTOR

    totalWaitMinutes += waitMinutes
    totalLateMinutes += lateMinutes
    totalPriorityPenalty += priorityPenalty
    totalLoadPenalty += loadPenalty
    stops.push({
      clientId: client.clientId,
      arrival: formatMinutes(currentMinute),
      serviceMinutes: roundOne(client.serviceMinutes),
      waitMinutes: roundOne(waitMinutes),
      lateMinutes: roundOne(lateMinutes),
      priorityPenalty: roundOne(priorityPenalty),
      loadPenalty: roundOne(loadPenalty),
      windowStatus: status,
    })
    currentMinute += client.serviceMinutes
  }

  const serviceMinutes = routeIds.reduce((total, clientId) => {
    return total + (context.clientsById.get(clientId)?.serviceMinutes ?? 0)
  }, 0)
  const fuelPenalty = (totalDistanceMeters / 1000) * FUEL_EQUIVALENT_MIN_PER_KM
  const operationalScore =
    totalDriveMinutes +
    serviceMinutes +
    totalWaitMinutes * WAIT_PENALTY_FACTOR +
    totalLateMinutes * LATE_PENALTY_FACTOR +
    totalPriorityPenalty +
    totalLoadPenalty +
    fuelPenalty

  return {
    distanceKm: roundOne(totalDistanceMeters / 1000),
    driveMinutes: roundOne(totalDriveMinutes),
    serviceMinutes: roundOne(serviceMinutes),
    waitMinutes: roundOne(totalWaitMinutes),
    lateMinutes: roundOne(totalLateMinutes),
    priorityPenalty: roundOne(totalPriorityPenalty),
    loadPenalty: roundOne(totalLoadPenalty),
    fuelPenalty: roundOne(fuelPenalty),
    operationalScore: roundOne(operationalScore),
    totalMinutes: roundOne(currentMinute - START_MINUTE),
    finish: formatMinutes(currentMinute),
    stops,
  }
}

function pointFor(clientId: string | null, context: OptimizerContext) {
  if (clientId === null) {
    return context.depot
  }
  const client = context.clientsById.get(clientId)
  if (!client) {
    return context.depot
  }
  return client
}

function routePolyline(routeIds: readonly string[], context: OptimizerContext): PolylinePoint[] {
  const points = [
    context.depot,
    ...routeIds
      .map((clientId) => context.clientsById.get(clientId))
      .filter((client): client is PlanningClient => Boolean(client)),
    context.depot,
  ]
  return points.map((point) => ({
    lat: point.lat,
    lng: point.lng,
  }))
}

function roadDistanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const radius = 6_371_000
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)
  const deltaLat = toRadians(b.lat - a.lat)
  const deltaLng = toRadians(b.lng - a.lng)
  const step =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2
  return 2 * radius * Math.asin(Math.sqrt(step)) * ROAD_FACTOR
}

function groupRowsByClient(rows: readonly PlanningLoadRow[]) {
  const rowsByClient = new Map<string, PlanningLoadRow[]>()
  for (const row of rows) {
    const clientRows = rowsByClient.get(row.clientId) ?? []
    clientRows.push(row)
    rowsByClient.set(row.clientId, clientRows)
  }
  return rowsByClient
}

function formatMinutes(totalMinutes: number) {
  const total = Math.round(totalMinutes)
  const hour = Math.floor(total / 60) % 24
  const minute = total % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function toRadians(value: number) {
  return (value * Math.PI) / 180
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10
}

function roundTwo(value: number) {
  return Math.round(value * 100) / 100
}
