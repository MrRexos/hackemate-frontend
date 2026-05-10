import type { Depot, PlanningClient, PlanningDay, PlanningLoadRow, TruckType } from '@/types/planning'
import { buildTruckLoadPlan, type TruckLoadPlan } from '@/utils/loadPlanner'

export type TruckAvailability = Record<string, number>

export type RouteStopMetrics = {
  clientId: string
  arrival: string
  baseServiceMinutes: number
  serviceMinutes: number
  waitMinutes: number
  lateMinutes: number
  windowPenalty: number
  priorityPenalty: number
  loadPenalty: number
  accessPenalty: number
  returnablePenalty: number
  returnablePallets: number
  projectedLoadPallets: number
  collectedReturnablePallets: number
  windowStatus: string
}

export type RouteMetrics = {
  distanceKm: number
  driveMinutes: number
  serviceMinutes: number
  waitMinutes: number
  lateMinutes: number
  windowPenalty: number
  priorityPenalty: number
  loadPenalty: number
  accessPenalty: number
  returnablePenalty: number
  frictionPenalty: number
  reservedReturnablePallets: number
  peakLoadPallets: number
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
  routeAccessPenalty: number
  routeReturnablePenalty: number
  routeWindowPenalty: number
  routeProjectedLoadPallets: number
  routeCollectedReturnablePallets: number
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
    variableCostMinutes: number
    occupancyPenalty: number
    vehicleSuitabilityPenalty: number
    cohesionPenalty: number
    operationalFriction: number
    reservedReturnablePallets: number
    peakLoadPallets: number
    targetCapacityUse: number
    riskLevel: 'bajo' | 'medio' | 'alto'
    risks: readonly string[]
    explanation: readonly string[]
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
    reservedReturnablePallets: number
    operationalFriction: number
    totalCostMinutes: number
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
  routeCache: Map<string, RouteMetrics>
  distanceCache: Map<string, number>
}

type LoadProjection = {
  pallets: number
  weightKg: number
  volumeM3: number
  lines: number
}

type DraftSetCandidate = {
  delta: number
  drafts: DraftTruck[]
}

type OptimizationBudget = {
  passes: number
  allowSwaps: boolean
  maxCloseRouteSize: number
  maxRelocationCandidatesPerTruck: number
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
const PHYSICAL_FILL_LIMIT = 1
const HARD_FILL_LIMIT = 1.02
const TARGET_FILL_MIN = 0.75
const TARGET_FILL_MAX = 0.88
const HIGH_RETURNABLE_TARGET_FILL_MAX = 0.82
const RETURNABLE_UNIT_PALLET_SHARE = 0.0035
const RETURNABLE_RESERVE_SAFETY_FACTOR = 1.25
const MAX_LOAD_SEARCH_EXTRA_MINUTES = 12
const MAX_ACCESS_EXTRA_MINUTES = 8
const MAX_RETURNABLE_EXTRA_MINUTES = 9
const MIN_SCORE_IMPROVEMENT = 0.15
const GLOBAL_IMPROVEMENT_PASSES = 3

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
  const context: OptimizerContext = {
    depot,
    clientsById,
    routeCache: new Map(),
    distanceCache: new Map(),
  }
  const rowsByClient = groupRowsByClient(day.masterRows)
  const warnings: string[] = []

  const totalCapacityPallets = trucks.reduce((total, truck) => total + truck.capacityPallets, 0)
  if (day.summary.pallets > totalCapacityPallets * PHYSICAL_FILL_LIMIT) {
    warnings.push('La capacidad física indicada no cubre todos los palets del día.')
  } else if (day.summary.pallets > totalCapacityPallets * TARGET_FILL_MAX) {
    warnings.push('La capacidad indicada cubre el día, pero supera la ocupación inicial óptima recomendada.')
  }

  const drafts = buildBestDraftPlan(trucks, day.clients, context)

  const plannedTrucks = drafts.map((draft) => finalizeTruck(draft, context, rowsByClient))
  const assignedTrucks = plannedTrucks.filter((truck) => truck.clients.length > 0)
  const unusedTrucks = plannedTrucks.filter((truck) => truck.clients.length === 0)
  const overloaded = assignedTrucks.filter((truck) => truck.summary.overflow)
  if (overloaded.length > 0) {
    warnings.push(`${overloaded.length} camión(es) quedan por encima de la capacidad física o de la reserva necesaria.`)
  }
  const highRiskTrucks = assignedTrucks.filter((truck) => truck.summary.riskLevel === 'alto')
  if (highRiskTrucks.length > 0) {
    warnings.push(`${highRiskTrucks.length} ruta(s) tienen riesgo operativo alto por horarios, retornables o fricción de carga.`)
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
      reservedReturnablePallets: roundTwo(assignedTrucks.reduce((total, truck) => total + truck.summary.reservedReturnablePallets, 0)),
      operationalFriction: roundOne(assignedTrucks.reduce((total, truck) => total + truck.summary.operationalFriction, 0)),
      totalCostMinutes: roundOne(assignedTrucks.reduce((total, truck) => total + truck.summary.totalScore, 0)),
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

function buildBestDraftPlan(
  trucks: readonly {
    id: string
    label: string
    type: TruckType
    capacityPallets: number
  }[],
  clients: readonly PlanningClient[],
  context: OptimizerContext,
) {
  // Multi-start construction avoids locking the plan into one greedy ordering.
  if (clients.length === 0) {
    return trucks.map(createDraftTruck)
  }

  let bestDrafts: DraftTruck[] | null = null
  let bestScore = Number.POSITIVE_INFINITY

  for (const order of buildAssignmentOrders(clients, context.depot)) {
    const initialDrafts = assignClientsGreedily(trucks, order.clients, context)
    const score = totalDraftScore(initialDrafts, context)

    if (score < bestScore) {
      bestDrafts = initialDrafts
      bestScore = score
    }
  }

  if (!bestDrafts) {
    throw new Error('No hay transportes disponibles para asignar pedidos.')
  }

  return optimizeDraftsGlobally(bestDrafts, context, budgetFor(clients.length))
}

function buildAssignmentOrders(clients: readonly PlanningClient[], depot: Depot) {
  const orders = [
    [...clients].sort(orderClientsForAssignment),
    [...clients].sort(orderClientsByGeoSweep(depot, 1)),
    [...clients].sort(orderClientsByGeoSweep(depot, -1)),
    [...clients].sort(orderClientsByDistanceAndLoad(depot)),
    [...clients].sort(orderClientsByLoadAndPriority),
    [...clients].sort((a, b) => a.currentSequence - b.currentSequence),
  ]
  const seen = new Set<string>()

  return orders
    .map((orderClients) => ({
      clients: orderClients,
      key: orderClients.map((client) => client.clientId).join('|'),
    }))
    .filter((order) => {
      if (seen.has(order.key)) {
        return false
      }
      seen.add(order.key)
      return true
    })
    .slice(0, clients.length > 160 ? 3 : clients.length > 100 ? 4 : 6)
}

function budgetFor(clientCount: number): OptimizationBudget {
  if (clientCount > 160) {
    return {
      passes: 1,
      allowSwaps: false,
      maxCloseRouteSize: 2,
      maxRelocationCandidatesPerTruck: 5,
    }
  }
  if (clientCount > 100) {
    return {
      passes: 2,
      allowSwaps: true,
      maxCloseRouteSize: 3,
      maxRelocationCandidatesPerTruck: 8,
    }
  }
  return {
    passes: GLOBAL_IMPROVEMENT_PASSES,
    allowSwaps: true,
    maxCloseRouteSize: Number.POSITIVE_INFINITY,
    maxRelocationCandidatesPerTruck: Number.POSITIVE_INFINITY,
  }
}

function assignClientsGreedily(
  trucks: readonly {
    id: string
    label: string
    type: TruckType
    capacityPallets: number
  }[],
  clients: readonly PlanningClient[],
  context: OptimizerContext,
) {
  const drafts = trucks.map(createDraftTruck)

  for (const client of clients) {
    const best = chooseBestTruckInsertion(drafts, client, context)
    assignClientToDraft(drafts[best.truckIndex], client, best.routeIds, best.routeScore)
  }

  return drafts.map((draft) => {
    if (draft.routeIds.length === 0) {
      return draft
    }
    return rebuildDraft(draft, improveRoute(draft.routeIds, context), context)
  })
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

function orderClientsByGeoSweep(depot: Depot, direction: 1 | -1) {
  return (a: PlanningClient, b: PlanningClient) => {
    const angleA = geoAngle(a, depot) * direction
    const angleB = geoAngle(b, depot) * direction
    return (
      angleA - angleB ||
      orderClientsForAssignment(a, b) ||
      distanceFromDepot(b, depot) - distanceFromDepot(a, depot)
    )
  }
}

function orderClientsByDistanceAndLoad(depot: Depot) {
  return (a: PlanningClient, b: PlanningClient) => {
    return (
      distanceFromDepot(b, depot) - distanceFromDepot(a, depot) ||
      b.pallets - a.pallets ||
      b.priorityScore - a.priorityScore ||
      a.currentSequence - b.currentSequence
    )
  }
}

function orderClientsByLoadAndPriority(a: PlanningClient, b: PlanningClient) {
  return (
    b.pallets - a.pallets ||
    b.weightKg - a.weightKg ||
    b.priorityScore - a.priorityScore ||
    orderClientsForAssignment(a, b)
  )
}

function chooseBestTruckInsertion(
  drafts: readonly DraftTruck[],
  client: PlanningClient,
  context: OptimizerContext,
  excludedTruckIndexes?: ReadonlySet<number>,
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
    if (excludedTruckIndexes?.has(truckIndex)) {
      continue
    }
    const draft = drafts[truckIndex]
    const insertion = bestInsertion(draft.routeIds, client.clientId, draft.currentScore, context)
    const projection = projectLoad(draft, client)
    const feasible = isFeasibleProjection(projection, draft.type.palletCapacity)
    const totalDelta =
      scoreDraftState(draft, insertion.routeScore, projection, insertion.routeIds, context) -
      draftOptimizationScore(draft, context)

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

function assignClientToDraft(
  draft: DraftTruck,
  client: PlanningClient,
  routeIds: readonly string[],
  routeScore: number,
) {
  draft.routeIds = [...routeIds]
  draft.currentScore = routeScore
  draft.pallets = roundTwo(draft.pallets + client.pallets)
  draft.weightKg = roundOne(draft.weightKg + client.weightKg)
  draft.volumeM3 = roundTwo(draft.volumeM3 + client.volumeM3)
  draft.lines += client.lines
}

function optimizeDraftsGlobally(
  drafts: readonly DraftTruck[],
  context: OptimizerContext,
  budget: OptimizationBudget,
) {
  let current = relieveOperationalPressure(
    closeInefficientTrucks(drafts.map(cloneDraft), context, budget),
    context,
  )

  for (let pass = 0; pass < budget.passes; pass += 1) {
    const relocation = findBestRelocation(current, context, budget)
    const swap = budget.allowSwaps ? findBestSwap(current, context) : null
    const candidates = [relocation, swap].filter(
      (candidate): candidate is DraftSetCandidate => Boolean(candidate),
    )

    if (candidates.length === 0) {
      break
    }

    candidates.sort((a, b) => a.delta - b.delta)
    if (candidates[0].delta >= -MIN_SCORE_IMPROVEMENT) {
      break
    }

    current = relieveOperationalPressure(
      closeInefficientTrucks(candidates[0].drafts, context, budget),
      context,
    )
  }

  return relieveOperationalPressure(current, context)
}

function relieveOperationalPressure(
  drafts: readonly DraftTruck[],
  context: OptimizerContext,
) {
  let current = drafts.map(cloneDraft)
  let improved = true
  let attempts = 0

  while (improved && attempts < current.length) {
    improved = false
    attempts += 1
    const unusedIndexes = current
      .map((draft, index) => ({ draft, index }))
      .filter(({ draft }) => draft.routeIds.length === 0)
      .sort((a, b) => a.draft.type.fixedCostMinutes - b.draft.type.fixedCostMinutes)
      .map(({ index }) => index)

    if (unusedIndexes.length === 0) {
      break
    }

    const sourceIndexes = current
      .map((draft, index) => ({
        index,
        pressure: draftOperationalPressure(draft, context),
      }))
      .filter(({ pressure }) => pressure > 0)
      .sort((a, b) => b.pressure - a.pressure)
      .slice(0, 5)
      .map(({ index }) => index)

    for (const sourceIndex of sourceIndexes) {
      for (const targetIndex of unusedIndexes.slice(0, 3)) {
        const candidate = trySplitDraftIntoEmptyTruck(current, sourceIndex, targetIndex, context)
        if (!candidate) {
          continue
        }

        if (totalDraftScore(candidate, context) + MIN_SCORE_IMPROVEMENT < totalDraftScore(current, context)) {
          current = candidate
          improved = true
          break
        }
      }

      if (improved) {
        break
      }
    }
  }

  return current
}

function draftOperationalPressure(draft: DraftTruck, context: OptimizerContext) {
  if (draft.routeIds.length <= 1) {
    return 0
  }

  const routeMetrics = evaluateRoute(draft.routeIds, context)
  const fillRatio = draft.pallets / Math.max(1, draft.type.palletCapacity)
  const targetMax = targetFillMaxForReturnables(
    routeMetrics.reservedReturnablePallets / Math.max(1, draft.type.palletCapacity),
  )
  const reserveOverflow = Math.max(
    0,
    draft.pallets + routeMetrics.reservedReturnablePallets - draft.type.palletCapacity,
  )
  const peakOverflow = Math.max(0, routeMetrics.peakLoadPallets - draft.type.palletCapacity)
  const targetOverflow = Math.max(0, fillRatio - targetMax)
  const latePressure = routeMetrics.windowPenalty / 120
  const frictionPressure = routeMetrics.frictionPenalty / Math.max(1, draft.routeIds.length * 4.5)

  return reserveOverflow * 12 + peakOverflow * 18 + targetOverflow * 10 + latePressure + frictionPressure
}

function trySplitDraftIntoEmptyTruck(
  drafts: readonly DraftTruck[],
  sourceIndex: number,
  targetIndex: number,
  context: OptimizerContext,
) {
  const sourceDraft = drafts[sourceIndex]
  const targetDraft = drafts[targetIndex]
  if (sourceDraft.routeIds.length <= 1 || targetDraft.routeIds.length > 0) {
    return null
  }

  let best: DraftSetCandidate | null = null
  const baselineScore = totalDraftScore(drafts, context)
  for (const segment of splitSegmentsForRelief(sourceDraft.routeIds, context)) {
    if (segment.length === 0 || segment.length >= sourceDraft.routeIds.length) {
      continue
    }

    const movedClients = new Set(segment)
    const remainingRoute = sourceDraft.routeIds.filter((clientId) => !movedClients.has(clientId))
    const movedRoute = improveRoute(segment, context)
    const next = drafts.map(cloneDraft)
    next[sourceIndex] = rebuildDraft(next[sourceIndex], improveRoute(remainingRoute, context), context)
    next[targetIndex] = rebuildDraft(next[targetIndex], movedRoute, context)
    const delta = totalDraftScore(next, context) - baselineScore

    if (!best || delta < best.delta) {
      best = {
        delta,
        drafts: next,
      }
    }
  }

  return best && best.delta < -MIN_SCORE_IMPROVEMENT ? best.drafts : null
}

function splitSegmentsForRelief(routeIds: readonly string[], context: OptimizerContext) {
  const segments: string[][] = []
  const routeMetrics = evaluateRoute(routeIds, context)
  const expensiveStops = routeMetrics.stops
    .map((stop) => ({
      clientId: stop.clientId,
      score:
        stop.windowPenalty +
        stop.loadPenalty +
        stop.accessPenalty +
        stop.returnablePenalty +
        stop.returnablePallets * 20 +
        stop.lateMinutes * 8,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((stop) => stop.clientId)
  const centerIndexes = new Set<number>([
    0,
    Math.max(0, routeIds.length - 1),
    Math.floor(routeIds.length / 2),
  ])

  for (const clientId of expensiveStops) {
    const index = routeIds.indexOf(clientId)
    if (index < 0) {
      continue
    }
    centerIndexes.add(index)
  }

  for (const center of centerIndexes) {
    for (let length = 1; length <= Math.min(5, routeIds.length - 1); length += 1) {
      const start = clampInteger(center - Math.floor(length / 2), 0, routeIds.length - length)
      segments.push(routeIds.slice(start, start + length))
    }
  }

  return dedupeRouteSegments(segments).slice(0, 36)
}

function dedupeRouteSegments(segments: readonly string[][]) {
  const seen = new Set<string>()
  const deduped: string[][] = []
  for (const segment of segments) {
    const key = segment.join('\u001f')
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    deduped.push(segment)
  }
  return deduped
}

function findBestRelocation(
  drafts: readonly DraftTruck[],
  context: OptimizerContext,
  budget: OptimizationBudget,
): DraftSetCandidate | null {
  let best:
    | {
        fromIndex: number
        toIndex: number
        clientId: string
        routeIds: string[]
        rawDelta: number
      }
    | null = null

  for (let fromIndex = 0; fromIndex < drafts.length; fromIndex += 1) {
    const fromDraft = drafts[fromIndex]
    if (fromDraft.routeIds.length === 0) {
      continue
    }

    for (const clientId of relocationClientIds(fromDraft, context, budget)) {
      const client = context.clientsById.get(clientId)
      if (!client) {
        continue
      }

      const routeWithoutClient = fromDraft.routeIds.filter((routeClientId) => routeClientId !== clientId)
      const fromLoad = loadForRoute(routeWithoutClient, context)
      const fromRouteScore = evaluateRoute(routeWithoutClient, context).operationalScore
      const beforeFrom = draftOptimizationScore(fromDraft, context)

      for (let toIndex = 0; toIndex < drafts.length; toIndex += 1) {
        if (toIndex === fromIndex) {
          continue
        }

        const toDraft = drafts[toIndex]
        const insertion = bestInsertion(toDraft.routeIds, clientId, toDraft.currentScore, context)
        const toLoad = projectLoad(toDraft, client)
        const rawDelta =
          scoreDraftState(fromDraft, fromRouteScore, fromLoad, routeWithoutClient, context) +
          scoreDraftState(toDraft, insertion.routeScore, toLoad, insertion.routeIds, context) -
          beforeFrom -
          draftOptimizationScore(toDraft, context)

        if (!best || rawDelta < best.rawDelta) {
          best = {
            fromIndex,
            toIndex,
            clientId,
            routeIds: insertion.routeIds,
            rawDelta,
          }
        }
      }
    }
  }

  if (!best) {
    return null
  }

  const candidate = buildRelocationCandidate(
    drafts,
    best.fromIndex,
    best.toIndex,
    best.clientId,
    best.routeIds,
    context,
  )
  return candidate.delta < -MIN_SCORE_IMPROVEMENT ? candidate : null
}

function relocationClientIds(
  draft: DraftTruck,
  context: OptimizerContext,
  budget: OptimizationBudget,
) {
  if (draft.routeIds.length <= budget.maxRelocationCandidatesPerTruck) {
    return draft.routeIds
  }

  const selected = new Set<string>()
  for (const clientId of draft.routeIds.slice(0, 2)) {
    selected.add(clientId)
  }
  for (const clientId of draft.routeIds.slice(-2)) {
    selected.add(clientId)
  }

  const stopScores = evaluateRoute(draft.routeIds, context).stops
    .map((stop) => {
      const client = context.clientsById.get(stop.clientId)
      return {
        clientId: stop.clientId,
        score:
          stop.lateMinutes * LATE_PENALTY_FACTOR +
          stop.priorityPenalty +
          stop.loadPenalty +
          (client?.pallets ?? 0) * 3 +
          (client?.loadDifficulty ?? 0),
      }
    })
    .sort((a, b) => b.score - a.score)

  for (const stop of stopScores) {
    if (selected.size >= budget.maxRelocationCandidatesPerTruck) {
      break
    }
    selected.add(stop.clientId)
  }

  return draft.routeIds.filter((clientId) => selected.has(clientId))
}

function findBestSwap(
  drafts: readonly DraftTruck[],
  context: OptimizerContext,
): DraftSetCandidate | null {
  let best:
    | {
        firstIndex: number
        secondIndex: number
        firstClientId: string
        secondClientId: string
        rawDelta: number
      }
    | null = null

  for (let firstIndex = 0; firstIndex < drafts.length - 1; firstIndex += 1) {
    const firstDraft = drafts[firstIndex]
    if (firstDraft.routeIds.length === 0) {
      continue
    }

    for (let secondIndex = firstIndex + 1; secondIndex < drafts.length; secondIndex += 1) {
      const secondDraft = drafts[secondIndex]
      if (secondDraft.routeIds.length === 0) {
        continue
      }

      const beforePair = draftOptimizationScore(firstDraft, context) + draftOptimizationScore(secondDraft, context)

      for (const firstClientId of firstDraft.routeIds) {
        const firstClient = context.clientsById.get(firstClientId)
        if (!firstClient) {
          continue
        }

        for (const secondClientId of secondDraft.routeIds) {
          const secondClient = context.clientsById.get(secondClientId)
          if (!secondClient) {
            continue
          }

          const firstRoute = replaceClient(firstDraft.routeIds, firstClientId, secondClientId)
          const secondRoute = replaceClient(secondDraft.routeIds, secondClientId, firstClientId)
          const firstLoad = swapClientLoad(firstDraft, firstClient, secondClient)
          const secondLoad = swapClientLoad(secondDraft, secondClient, firstClient)
          const firstScore = evaluateRoute(firstRoute, context).operationalScore
          const secondScore = evaluateRoute(secondRoute, context).operationalScore
          const rawDelta =
            scoreDraftState(firstDraft, firstScore, firstLoad, firstRoute, context) +
            scoreDraftState(secondDraft, secondScore, secondLoad, secondRoute, context) -
            beforePair

          if (!best || rawDelta < best.rawDelta) {
            best = {
              firstIndex,
              secondIndex,
              firstClientId,
              secondClientId,
              rawDelta,
            }
          }
        }
      }
    }
  }

  if (!best) {
    return null
  }

  const candidate = buildSwapCandidate(
    drafts,
    best.firstIndex,
    best.secondIndex,
    best.firstClientId,
    best.secondClientId,
    context,
  )
  return candidate.delta < -MIN_SCORE_IMPROVEMENT ? candidate : null
}

function buildRelocationCandidate(
  drafts: readonly DraftTruck[],
  fromIndex: number,
  toIndex: number,
  clientId: string,
  toRouteIds: readonly string[],
  context: OptimizerContext,
): DraftSetCandidate {
  const next = drafts.map(cloneDraft)
  const fromRoute = next[fromIndex].routeIds.filter((routeClientId) => routeClientId !== clientId)
  next[fromIndex] = rebuildDraft(next[fromIndex], improveRoute(fromRoute, context), context)
  next[toIndex] = rebuildDraft(next[toIndex], improveRoute(toRouteIds, context), context)
  return {
    delta: totalDraftScore(next, context) - totalDraftScore(drafts, context),
    drafts: next,
  }
}

function buildSwapCandidate(
  drafts: readonly DraftTruck[],
  firstIndex: number,
  secondIndex: number,
  firstClientId: string,
  secondClientId: string,
  context: OptimizerContext,
): DraftSetCandidate {
  const next = drafts.map(cloneDraft)
  const firstRoute = replaceClient(next[firstIndex].routeIds, firstClientId, secondClientId)
  const secondRoute = replaceClient(next[secondIndex].routeIds, secondClientId, firstClientId)
  next[firstIndex] = rebuildDraft(next[firstIndex], improveRoute(firstRoute, context), context)
  next[secondIndex] = rebuildDraft(next[secondIndex], improveRoute(secondRoute, context), context)
  return {
    delta: totalDraftScore(next, context) - totalDraftScore(drafts, context),
    drafts: next,
  }
}

function closeInefficientTrucks(
  drafts: readonly DraftTruck[],
  context: OptimizerContext,
  budget: OptimizationBudget,
) {
  let current = drafts.map(cloneDraft)
  let improved = true
  let attempts = 0

  while (improved && attempts < current.length) {
    improved = false
    attempts += 1
    const orderedIndexes = current
      .map((draft, index) => ({ draft, index }))
      .filter(({ draft }) => {
        return draft.routeIds.length > 0 && draft.routeIds.length <= budget.maxCloseRouteSize
      })
      .sort((a, b) => {
        return (
          a.draft.routeIds.length - b.draft.routeIds.length ||
          draftOptimizationScore(b.draft, context) - draftOptimizationScore(a.draft, context)
        )
      })

    for (const { index } of orderedIndexes) {
      const candidate = tryCloseTruck(current, index, context)
      if (!candidate) {
        continue
      }

      if (totalDraftScore(candidate, context) + MIN_SCORE_IMPROVEMENT < totalDraftScore(current, context)) {
        current = candidate
        improved = true
        break
      }
    }
  }

  return current
}

function tryCloseTruck(
  drafts: readonly DraftTruck[],
  truckIndex: number,
  context: OptimizerContext,
) {
  const sourceDraft = drafts[truckIndex]
  if (sourceDraft.routeIds.length === 0) {
    return null
  }

  const next = drafts.map(cloneDraft)
  const excluded = new Set([truckIndex])
  const clientsToMove = sourceDraft.routeIds
    .map((clientId) => context.clientsById.get(clientId))
    .filter((client): client is PlanningClient => Boolean(client))
    .sort(orderClientsForAssignment)
  next[truckIndex] = rebuildDraft(next[truckIndex], [], context)

  try {
    for (const client of clientsToMove) {
      const best = chooseBestTruckInsertion(next, client, context, excluded)
      assignClientToDraft(next[best.truckIndex], client, best.routeIds, best.routeScore)
    }
  } catch {
    return null
  }

  return next.map((draft) => {
    if (draft.routeIds.length === 0) {
      return draft
    }
    return rebuildDraft(draft, improveRoute(draft.routeIds, context), context)
  })
}

function bestInsertion(
  routeIds: readonly string[],
  clientId: string,
  currentScore: number,
  context: OptimizerContext,
) {
  if (routeIds.length === 0) {
    const candidate = [clientId]
    const routeScore = evaluateRoute(candidate, context).operationalScore
    return {
      routeIds: candidate,
      routeScore,
      deltaScore: routeScore,
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

function swapClientLoad(
  draft: DraftTruck,
  removed: PlanningClient,
  added: PlanningClient,
): LoadProjection {
  return {
    pallets: draft.pallets - removed.pallets + added.pallets,
    weightKg: draft.weightKg - removed.weightKg + added.weightKg,
    volumeM3: draft.volumeM3 - removed.volumeM3 + added.volumeM3,
    lines: draft.lines - removed.lines + added.lines,
  }
}

function loadForRoute(routeIds: readonly string[], context: OptimizerContext): LoadProjection {
  return routeIds.reduce(
    (load, clientId) => {
      const client = context.clientsById.get(clientId)
      if (!client) {
        return load
      }
      return {
        pallets: load.pallets + client.pallets,
        weightKg: load.weightKg + client.weightKg,
        volumeM3: load.volumeM3 + client.volumeM3,
        lines: load.lines + client.lines,
      }
    },
    {
      pallets: 0,
      weightKg: 0,
      volumeM3: 0,
      lines: 0,
    },
  )
}

function cloneDraft(draft: DraftTruck): DraftTruck {
  return {
    ...draft,
    routeIds: [...draft.routeIds],
  }
}

function rebuildDraft(
  draft: DraftTruck,
  routeIds: readonly string[],
  context: OptimizerContext,
): DraftTruck {
  const load = loadForRoute(routeIds, context)
  return {
    ...draft,
    routeIds: [...routeIds],
    currentScore: routeIds.length > 0 ? evaluateRoute(routeIds, context).operationalScore : 0,
    pallets: roundTwo(load.pallets),
    weightKg: roundOne(load.weightKg),
    volumeM3: roundTwo(load.volumeM3),
    lines: load.lines,
  }
}

function totalDraftScore(drafts: readonly DraftTruck[], context: OptimizerContext) {
  return (
    drafts.reduce((total, draft) => total + draftOptimizationScore(draft, context), 0) +
    routeBalancePenalty(drafts, context)
  )
}

function draftOptimizationScore(draft: DraftTruck, context: OptimizerContext) {
  return scoreDraftState(draft, draft.currentScore, draft, draft.routeIds, context)
}

function scoreDraftState(
  draft: DraftTruck,
  routeScore: number,
  load: LoadProjection,
  routeIds: readonly string[],
  context: OptimizerContext,
) {
  if (load.lines <= 0) {
    return 0
  }
  const routeMetrics = routeIds.length > 0 ? evaluateRoute(routeIds, context) : null
  const variableCost = routeMetrics ? vehicleVariableCost(draft.type, routeMetrics) : 0
  const suitabilityPenalty = routeMetrics
    ? vehicleSuitabilityPenalty(draft.type, load, routeMetrics, routeIds, context)
    : 0
  const cohesionPenalty = routeCohesionPenalty(routeIds, context)
  return (
    routeScore +
    draft.type.fixedCostMinutes +
    variableCost +
    capacityPenalty(load, draft.type.palletCapacity, routeMetrics) +
    fillPreferencePenalty(load, draft.type.palletCapacity, routeMetrics) +
    suitabilityPenalty +
    cohesionPenalty
  )
}

function replaceClient(
  routeIds: readonly string[],
  fromClientId: string,
  toClientId: string,
) {
  return routeIds.map((clientId) => (clientId === fromClientId ? toClientId : clientId))
}

function isFeasibleProjection(load: LoadProjection, capacityPallets: number) {
  return (
    load.pallets <= capacityPallets * PHYSICAL_FILL_LIMIT &&
    load.weightKg <= capacityPallets * PALLET_WEIGHT_LIMIT_KG &&
    load.volumeM3 <= capacityPallets * PALLET_VOLUME_LIMIT_M3
  )
}

function capacityPenalty(
  load: LoadProjection,
  capacityPallets: number,
  routeMetrics: RouteMetrics | null = null,
) {
  const palletLimit = capacityPallets * PHYSICAL_FILL_LIMIT
  const weightLimit = capacityPallets * PALLET_WEIGHT_LIMIT_KG
  const volumeLimit = capacityPallets * PALLET_VOLUME_LIMIT_M3
  const palletOverflow = Math.max(0, load.pallets - palletLimit)
  const hardPalletOverflow = Math.max(0, load.pallets - capacityPallets * HARD_FILL_LIMIT)
  const peakOverflow = Math.max(0, (routeMetrics?.peakLoadPallets ?? load.pallets) - palletLimit)
  const weightOverflow = Math.max(0, load.weightKg - weightLimit)
  const volumeOverflow = Math.max(0, load.volumeM3 - volumeLimit)
  return (
    palletOverflow * 5200 +
    hardPalletOverflow * 16000 +
    peakOverflow * 4200 +
    (weightOverflow / 100) * 360 +
    volumeOverflow * 3200
  )
}

function fillPreferencePenalty(
  load: LoadProjection,
  capacityPallets: number,
  routeMetrics: RouteMetrics | null = null,
) {
  const fillRatio = load.pallets / Math.max(1, capacityPallets)
  const reservedRatio = (routeMetrics?.reservedReturnablePallets ?? 0) / Math.max(1, capacityPallets)
  const targetMax = targetFillMaxForReturnables(reservedRatio)
  const underfillPenalty =
    fillRatio < TARGET_FILL_MIN
      ? (TARGET_FILL_MIN - fillRatio) ** 2 * capacityPallets * 46
      : 0
  const excessiveFillPenalty =
    fillRatio > targetMax
      ? (fillRatio - targetMax) ** 2 * capacityPallets * 520
      : 0
  const returnableReservePenalty =
    routeMetrics && load.pallets + routeMetrics.reservedReturnablePallets > capacityPallets * PHYSICAL_FILL_LIMIT
      ? (load.pallets + routeMetrics.reservedReturnablePallets - capacityPallets) * 620
      : 0
  return underfillPenalty + excessiveFillPenalty + returnableReservePenalty
}

function routeBalancePenalty(drafts: readonly DraftTruck[], context: OptimizerContext) {
  const activeDrafts = drafts.filter((draft) => draft.routeIds.length > 0)
  if (activeDrafts.length <= 1) {
    return 0
  }

  const workloads = activeDrafts.map((draft) => {
    const routeMetrics = evaluateRoute(draft.routeIds, context)
    return routeMetrics.totalMinutes + routeMetrics.frictionPenalty * 0.35 + draft.pallets * 6
  })
  const average = workloads.reduce((total, workload) => total + workload, 0) / workloads.length
  const variance =
    workloads.reduce((total, workload) => total + (workload - average) ** 2, 0) / workloads.length
  const spread = Math.max(...workloads) - Math.min(...workloads)

  return variance * 0.018 + Math.max(0, spread - 90) * 1.25
}

function vehicleVariableCost(type: TruckType, routeMetrics: RouteMetrics) {
  const distanceFactor = type.palletCapacity <= 3 ? 0.12 : type.palletCapacity <= 6 ? 0.18 : 0.26
  const driveTimeFactor = type.palletCapacity <= 3 ? 0.01 : type.palletCapacity <= 6 ? 0.016 : 0.024
  return routeMetrics.distanceKm * distanceFactor + routeMetrics.driveMinutes * driveTimeFactor
}

function vehicleSuitabilityPenalty(
  type: TruckType,
  load: LoadProjection,
  routeMetrics: RouteMetrics,
  routeIds: readonly string[],
  context: OptimizerContext,
) {
  const fillRatio = load.pallets / Math.max(1, type.palletCapacity)
  const clients = routeIds
    .map((clientId) => context.clientsById.get(clientId))
    .filter((client): client is PlanningClient => Boolean(client))
  const averageDifficulty =
    clients.reduce((total, client) => total + client.loadDifficulty, 0) / Math.max(1, clients.length)
  const difficultStops = clients.filter((client) => client.loadDifficulty >= 6).length
  const returnablePressure = routeMetrics.reservedReturnablePallets / Math.max(1, type.palletCapacity)
  let penalty = 0

  if (type.palletCapacity <= 3) {
    penalty += Math.max(0, fillRatio - 0.86) ** 2 * 850
    penalty += Math.max(0, routeMetrics.distanceKm - 85) * 0.18
  } else if (type.palletCapacity >= 8) {
    penalty += fillRatio < 0.64 ? (0.64 - fillRatio) ** 2 * 180 : 0
    penalty += Math.max(0, averageDifficulty - 4.8) * 4.8
    penalty += difficultStops * 1.8
  } else {
    penalty += Math.max(0, fillRatio - 0.94) ** 2 * 420
  }

  penalty += Math.max(0, routeMetrics.peakLoadPallets - type.palletCapacity * 0.96) * 500
  penalty += Math.max(0, returnablePressure - 0.12) * 90
  return penalty
}

function routeCohesionPenalty(routeIds: readonly string[], context: OptimizerContext) {
  const clients = routeIds
    .map((clientId) => context.clientsById.get(clientId))
    .filter((client): client is PlanningClient => Boolean(client))
  if (clients.length <= 1) {
    return 0
  }

  const centroid = {
    lat: clients.reduce((total, client) => total + client.lat, 0) / clients.length,
    lng: clients.reduce((total, client) => total + client.lng, 0) / clients.length,
  }
  const averageDispersionKm =
    clients.reduce((total, client) => total + roadDistanceMeters(client, centroid) / 1000, 0) /
    clients.length
  const zoneChanges = clients.reduce((total, client, index) => {
    const previous = index > 0 ? clients[index - 1] : null
    return total + (previous && logisticZone(previous) !== logisticZone(client) ? 1 : 0)
  }, 0)
  const strictWindows = clients.filter((client) => client.window.endMinute !== null)
  const windowSpread =
    strictWindows.length > 1
      ? Math.max(...strictWindows.map((client) => client.window.endMinute ?? 0)) -
        Math.min(...strictWindows.map((client) => client.window.endMinute ?? 0))
      : 0
  const productFamilies = new Set(clients.flatMap((client) => client.productTypes))
  const productPenalty = Math.max(0, productFamilies.size - 4) * 0.8

  return averageDispersionKm * 1.15 + zoneChanges * 0.9 + Math.max(0, windowSpread - 240) * 0.012 + productPenalty
}

function targetFillMaxForReturnables(reservedRatio: number) {
  return clamp(
    TARGET_FILL_MAX - reservedRatio * 0.7,
    HIGH_RETURNABLE_TARGET_FILL_MAX,
    TARGET_FILL_MAX,
  )
}

function estimateRouteReturnableReserve(routeIds: readonly string[], context: OptimizerContext) {
  const expectedReturnables = routeIds.reduce((total, clientId) => {
    const client = context.clientsById.get(clientId)
    return total + (client ? estimateClientReturnablePallets(client) : 0)
  }, 0)
  return expectedReturnables * RETURNABLE_RESERVE_SAFETY_FACTOR
}

function estimateClientReturnablePallets(client: PlanningClient) {
  const declaredReturnables = Math.max(0, client.returnableUnits) * RETURNABLE_UNIT_PALLET_SHARE
  const fallbackReturnables =
    client.hasReturnables && declaredReturnables <= 0
      ? Math.min(0.08, Math.max(0.02, client.pallets * 0.12))
      : 0
  return declaredReturnables + fallbackReturnables
}

function estimateAccessPenaltyMinutes(client: PlanningClient) {
  const accessDifficulty = Math.max(0, client.loadDifficulty - 2) * 0.22
  const largeDrop = Math.max(0, client.pallets - 0.45) * 1.4
  const heavyDrop = Math.max(0, client.weightKg - 350) / 350
  return clamp(accessDifficulty + largeDrop + heavyDrop, 0, MAX_ACCESS_EXTRA_MINUTES)
}

function estimateLoadFrictionMinutes(
  client: PlanningClient,
  stopPosition: number,
  remainingDeliveryPallets: number,
  collectedReturnablePallets: number,
  routeSize: number,
) {
  const productFragmentation =
    client.productTypes.length * 0.55 + Math.max(0, client.lines - 8) * 0.055
  const accessSearch = stopPosition ** 1.35 * (client.loadDifficulty * LOAD_ACCESS_FACTOR * 0.26 + productFragmentation)
  const returnableBlocking =
    remainingDeliveryPallets > 0.2
      ? clamp((collectedReturnablePallets / remainingDeliveryPallets) * 1.8, 0, 4.2)
      : 0
  const longRouteFatigue = routeSize > 18 ? Math.min(2.5, (routeSize - 18) * 0.09) * stopPosition : 0
  return clamp(accessSearch + returnableBlocking + longRouteFatigue, 0, MAX_LOAD_SEARCH_EXTRA_MINUTES)
}

function estimateReturnableHandlingMinutes(
  client: PlanningClient,
  clientReturnablePallets: number,
  remainingDeliveryPallets: number,
  collectedReturnablePallets: number,
) {
  if (!client.hasReturnables && clientReturnablePallets <= 0) {
    return 0
  }
  const handling = clientReturnablePallets * 7 + Math.max(0, client.returnableUnits) * 0.018
  const blockingRisk =
    remainingDeliveryPallets > 0.25
      ? (collectedReturnablePallets / remainingDeliveryPallets) * 1.1
      : 0
  return clamp(handling + blockingRisk, 0, MAX_RETURNABLE_EXTRA_MINUTES)
}

function serviceWindowPenalty(client: PlanningClient, lateMinutes: number) {
  if (lateMinutes <= 0) {
    return 0
  }

  const windowSpan =
    client.window.startMinute !== null && client.window.endMinute !== null
      ? client.window.endMinute - client.window.startMinute
      : Number.POSITIVE_INFINITY
  const narrowWindowMultiplier = windowSpan <= 120 ? 0.85 : windowSpan <= 240 ? 0.4 : 0
  const priorityMultiplier = 1 + client.priorityScore * 0.22 + narrowWindowMultiplier
  return lateMinutes * LATE_PENALTY_FACTOR * priorityMultiplier
}

function logisticZone(client: PlanningClient) {
  return `${client.postalCode.slice(0, 3)}-${client.city.trim().toLocaleUpperCase('es-ES')}`
}

function truckRisks(
  draft: DraftTruck,
  routeMetrics: RouteMetrics,
  loadOverflow: boolean,
  capacityUse: number,
  targetCapacityUse: number,
) {
  const risks: string[] = []
  if (draft.routeIds.length === 0) {
    return risks
  }

  if (capacityUse > targetCapacityUse) {
    risks.push(`Ocupación inicial ${roundOne(capacityUse)}% por encima del objetivo ${roundOne(targetCapacityUse)}%`)
  }
  if (routeMetrics.peakLoadPallets > draft.type.palletCapacity * PHYSICAL_FILL_LIMIT) {
    risks.push('Los retornables pueden superar la capacidad física durante la ruta')
  }
  if (loadOverflow) {
    risks.push('La carga visual necesita más huecos que los disponibles con la reserva de retornables')
  }
  if (routeMetrics.lateMinutes > 0) {
    risks.push(`${roundOne(routeMetrics.lateMinutes)} min de retraso acumulado en ventanas de entrega`)
  }
  if (routeMetrics.frictionPenalty > draft.routeIds.length * 5) {
    risks.push('Fricción de descarga alta por acceso, mezcla de carga o retornables')
  }
  if (routeMetrics.reservedReturnablePallets > Math.max(0.8, draft.type.palletCapacity * 0.16)) {
    risks.push(`${roundTwo(routeMetrics.reservedReturnablePallets)} palets reservados para retornables`)
  }
  return risks
}

function riskLevelFor(risks: readonly string[], routeMetrics: RouteMetrics): 'bajo' | 'medio' | 'alto' {
  if (risks.length >= 3 || routeMetrics.windowPenalty > 180 || routeMetrics.peakLoadPallets > routeMetrics.reservedReturnablePallets + 8) {
    return 'alto'
  }
  if (risks.length > 0 || routeMetrics.windowPenalty > 0 || routeMetrics.frictionPenalty > 35) {
    return 'medio'
  }
  return 'bajo'
}

function truckExplanation(
  draft: DraftTruck,
  routeMetrics: RouteMetrics,
  capacityUse: number,
  targetCapacityUse: number,
  variableCostMinutes: number,
  occupancyPenalty: number,
  suitabilityPenalty: number,
) {
  if (draft.routeIds.length === 0) {
    return ['Transporte disponible sin salida: el coste fijo no compensa abrir otra ruta.']
  }

  const explanations = [
    `${draft.type.label}: ${roundOne(capacityUse)}% de ocupación inicial frente a objetivo ${roundOne(targetCapacityUse)}%.`,
    `Coste operativo: ${roundOne(routeMetrics.totalMinutes)} min de ruta, ${roundOne(draft.type.fixedCostMinutes)} min fijos y ${roundOne(variableCostMinutes)} min variables.`,
    `Reserva de retornables: ${roundTwo(routeMetrics.reservedReturnablePallets)} palets; pico dinámico estimado ${roundTwo(routeMetrics.peakLoadPallets)} palets.`,
  ]

  if (routeMetrics.lateMinutes > 0) {
    explanations.push(`Se penalizan ${roundOne(routeMetrics.lateMinutes)} min de retraso, ponderados por prioridad y franja horaria.`)
  }
  if (occupancyPenalty > 0) {
    explanations.push('La ocupación se corrige contra una zona rentable, no contra el llenado máximo.')
  }
  if (suitabilityPenalty > 0) {
    explanations.push('El tipo de vehículo añade penalización por tamaño, acceso o uso insuficiente.')
  }
  if (routeMetrics.frictionPenalty > 0) {
    explanations.push(`Fricción operativa estimada: ${roundOne(routeMetrics.frictionPenalty)} min por acceso, búsqueda de producto y retornables.`)
  }

  return explanations
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

    for (let from = 0; from < best.length; from += 1) {
      for (let to = 0; to <= best.length - 1; to += 1) {
        if (from === to) {
          continue
        }
        const candidate = relocateRouteSegment(best, from, 1, to)
        const score = evaluateRoute(candidate, context).operationalScore
        if (score + 0.1 < bestScore) {
          best = candidate
          bestScore = score
          improved = true
        }
      }
    }

    if (best.length <= 35) {
      for (let from = 0; from < best.length - 1; from += 1) {
        for (let to = 0; to <= best.length - 2; to += 1) {
          if (to >= from && to <= from + 1) {
            continue
          }
          const candidate = relocateRouteSegment(best, from, 2, to)
          const score = evaluateRoute(candidate, context).operationalScore
          if (score + 0.1 < bestScore) {
            best = candidate
            bestScore = score
            improved = true
          }
        }
      }
    }

    if (!improved) {
      break
    }
  }

  return best
}

function relocateRouteSegment(
  routeIds: readonly string[],
  from: number,
  length: number,
  to: number,
) {
  const segment = routeIds.slice(from, from + length)
  const withoutSegment = [
    ...routeIds.slice(0, from),
    ...routeIds.slice(from + length),
  ]
  const insertAt = to > from ? Math.max(0, to - length + 1) : to
  return [
    ...withoutSegment.slice(0, insertAt),
    ...segment,
    ...withoutSegment.slice(insertAt),
  ]
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
      serviceMinutes: stop?.serviceMinutes ?? client.serviceMinutes,
      optimizedSequence,
      arrival: stop?.arrival ?? 'Sin hora',
      windowStatus: stop?.windowStatus ?? 'ok',
      waitMinutes: stop?.waitMinutes ?? 0,
      lateMinutes: stop?.lateMinutes ?? 0,
      routePriorityPenalty: stop?.priorityPenalty ?? 0,
      routeLoadPenalty: stop?.loadPenalty ?? 0,
      routeAccessPenalty: stop?.accessPenalty ?? 0,
      routeReturnablePenalty: stop?.returnablePenalty ?? 0,
      routeWindowPenalty: stop?.windowPenalty ?? 0,
      routeProjectedLoadPallets: stop?.projectedLoadPallets ?? 0,
      routeCollectedReturnablePallets: stop?.collectedReturnablePallets ?? 0,
      loadZone: Math.min(
        draft.type.palletCapacity,
        Math.max(1, Math.ceil(optimizedSequence * draft.type.palletCapacity / Math.max(1, draft.routeIds.length))),
      ),
    }
  })
  const masterRows = clients.flatMap((client) => rowsByClient.get(client.clientId) ?? [])
  const loadPlan = buildTruckLoadPlan(clients, masterRows, {
    slots: draft.type.palletCapacity,
    reservedReturnablePallets: optimizedEval.reservedReturnablePallets,
  })
  const savingsKm = originalEval.distanceKm - optimizedEval.distanceKm
  const scoreImprovement = originalEval.operationalScore - optimizedEval.operationalScore
  const scoreImprovementPercent =
    originalEval.operationalScore > 0 ? (scoreImprovement / originalEval.operationalScore) * 100 : 0
  const capacityUse = draft.type.palletCapacity > 0 ? (draft.pallets / draft.type.palletCapacity) * 100 : 0
  const targetCapacityUse = targetFillMaxForReturnables(
    optimizedEval.reservedReturnablePallets / Math.max(1, draft.type.palletCapacity),
  ) * 100
  const variableCostMinutes = clients.length > 0 ? vehicleVariableCost(draft.type, optimizedEval) : 0
  const occupancyPenalty = clients.length > 0
    ? fillPreferencePenalty(draft, draft.type.palletCapacity, optimizedEval)
    : 0
  const suitabilityPenalty = clients.length > 0
    ? vehicleSuitabilityPenalty(draft.type, draft, optimizedEval, draft.routeIds, context)
    : 0
  const cohesionPenalty = clients.length > 0 ? routeCohesionPenalty(draft.routeIds, context) : 0
  const physicalOverflow =
    draft.pallets > draft.type.palletCapacity * PHYSICAL_FILL_LIMIT ||
    optimizedEval.peakLoadPallets > draft.type.palletCapacity * PHYSICAL_FILL_LIMIT ||
    draft.weightKg > draft.type.palletCapacity * PALLET_WEIGHT_LIMIT_KG ||
    draft.volumeM3 > draft.type.palletCapacity * PALLET_VOLUME_LIMIT_M3
  const overflow = physicalOverflow
  const risks = truckRisks(draft, optimizedEval, loadPlan.summary.overflow, capacityUse, targetCapacityUse)
  const riskLevel = riskLevelFor(risks, optimizedEval)
  const explanation = truckExplanation(
    draft,
    optimizedEval,
    capacityUse,
    targetCapacityUse,
    variableCostMinutes,
    occupancyPenalty,
    suitabilityPenalty,
  )

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
      variableCostMinutes: roundOne(variableCostMinutes),
      occupancyPenalty: roundOne(occupancyPenalty),
      vehicleSuitabilityPenalty: roundOne(suitabilityPenalty),
      cohesionPenalty: roundOne(cohesionPenalty),
      operationalFriction: optimizedEval.frictionPenalty,
      reservedReturnablePallets: optimizedEval.reservedReturnablePallets,
      peakLoadPallets: optimizedEval.peakLoadPallets,
      targetCapacityUse: roundOne(targetCapacityUse),
      riskLevel,
      risks,
      explanation,
      totalScore: roundOne(draftOptimizationScore(draft, context)),
    },
  }
}

function evaluateRoute(routeIds: readonly string[], context: OptimizerContext): RouteMetrics {
  const cacheKey = routeIds.join('\u001f')
  const cached = context.routeCache.get(cacheKey)
  if (cached) {
    return cached
  }

  let totalDistanceMeters = 0
  let totalDriveMinutes = 0
  let totalWaitMinutes = 0
  let totalLateMinutes = 0
  let totalWindowPenalty = 0
  let totalPriorityPenalty = 0
  let totalLoadPenalty = 0
  let totalAccessPenalty = 0
  let totalReturnablePenalty = 0
  let totalFrictionPenalty = 0
  let totalServiceMinutes = 0
  let remainingDeliveryPallets = routeIds.reduce((total, clientId) => {
    return total + (context.clientsById.get(clientId)?.pallets ?? 0)
  }, 0)
  let collectedReturnablePallets = 0
  let peakLoadPallets = remainingDeliveryPallets
  const reservedReturnablePallets = estimateRouteReturnableReserve(routeIds, context)
  let currentMinute = START_MINUTE
  const stops: RouteStopMetrics[] = []
  const path = [null, ...routeIds, null]

  for (let index = 0; index < path.length - 1; index += 1) {
    const origin = pointFor(path[index], context)
    const destination = pointFor(path[index + 1], context)
    const distance = cachedRoadDistanceMeters(origin, destination, context)
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
    const stopPosition = (stopNumber - 1) / Math.max(1, routeIds.length - 1)
    const clientReturnablePallets = estimateClientReturnablePallets(client)
    const accessPenalty = estimateAccessPenaltyMinutes(client)
    const loadPenalty = estimateLoadFrictionMinutes(
      client,
      stopPosition,
      remainingDeliveryPallets,
      collectedReturnablePallets,
      routeIds.length,
    )
    const returnablePenalty = estimateReturnableHandlingMinutes(
      client,
      clientReturnablePallets,
      remainingDeliveryPallets,
      collectedReturnablePallets,
    )
    const serviceMinutes = client.serviceMinutes + accessPenalty + loadPenalty + returnablePenalty
    const windowPenalty = serviceWindowPenalty(client, lateMinutes)
    const priorityPenalty =
      Math.max(0, currentMinute - START_MINUTE) *
      client.priorityScore *
      PRIORITY_DELAY_FACTOR

    totalWaitMinutes += waitMinutes
    totalLateMinutes += lateMinutes
    totalWindowPenalty += windowPenalty
    totalPriorityPenalty += priorityPenalty
    totalLoadPenalty += loadPenalty
    totalAccessPenalty += accessPenalty
    totalReturnablePenalty += returnablePenalty
    totalFrictionPenalty += loadPenalty + accessPenalty + returnablePenalty
    totalServiceMinutes += serviceMinutes
    remainingDeliveryPallets = Math.max(0, remainingDeliveryPallets - client.pallets)
    collectedReturnablePallets += clientReturnablePallets
    peakLoadPallets = Math.max(peakLoadPallets, remainingDeliveryPallets + collectedReturnablePallets)
    stops.push({
      clientId: client.clientId,
      arrival: formatMinutes(currentMinute),
      baseServiceMinutes: roundOne(client.serviceMinutes),
      serviceMinutes: roundOne(serviceMinutes),
      waitMinutes: roundOne(waitMinutes),
      lateMinutes: roundOne(lateMinutes),
      windowPenalty: roundOne(windowPenalty),
      priorityPenalty: roundOne(priorityPenalty),
      loadPenalty: roundOne(loadPenalty),
      accessPenalty: roundOne(accessPenalty),
      returnablePenalty: roundOne(returnablePenalty),
      returnablePallets: roundTwo(clientReturnablePallets),
      projectedLoadPallets: roundTwo(remainingDeliveryPallets + collectedReturnablePallets),
      collectedReturnablePallets: roundTwo(collectedReturnablePallets),
      windowStatus: status,
    })
    currentMinute += serviceMinutes
  }

  const fuelPenalty = (totalDistanceMeters / 1000) * FUEL_EQUIVALENT_MIN_PER_KM
  const operationalScore =
    totalDriveMinutes +
    totalServiceMinutes +
    totalWaitMinutes * WAIT_PENALTY_FACTOR +
    totalWindowPenalty +
    totalPriorityPenalty +
    totalLoadPenalty +
    totalAccessPenalty +
    totalReturnablePenalty +
    fuelPenalty

  const metrics = {
    distanceKm: roundOne(totalDistanceMeters / 1000),
    driveMinutes: roundOne(totalDriveMinutes),
    serviceMinutes: roundOne(totalServiceMinutes),
    waitMinutes: roundOne(totalWaitMinutes),
    lateMinutes: roundOne(totalLateMinutes),
    windowPenalty: roundOne(totalWindowPenalty),
    priorityPenalty: roundOne(totalPriorityPenalty),
    loadPenalty: roundOne(totalLoadPenalty),
    accessPenalty: roundOne(totalAccessPenalty),
    returnablePenalty: roundOne(totalReturnablePenalty),
    frictionPenalty: roundOne(totalFrictionPenalty),
    reservedReturnablePallets: roundTwo(reservedReturnablePallets),
    peakLoadPallets: roundTwo(peakLoadPallets),
    fuelPenalty: roundOne(fuelPenalty),
    operationalScore: roundOne(operationalScore),
    totalMinutes: roundOne(currentMinute - START_MINUTE),
    finish: formatMinutes(currentMinute),
    stops,
  }
  context.routeCache.set(cacheKey, metrics)
  return metrics
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

function geoAngle(
  client: { lat: number; lng: number },
  depot: { lat: number; lng: number },
) {
  return Math.atan2(client.lat - depot.lat, client.lng - depot.lng)
}

function distanceFromDepot(
  client: { lat: number; lng: number },
  depot: { lat: number; lng: number },
) {
  return Math.hypot(client.lat - depot.lat, client.lng - depot.lng)
}

function cachedRoadDistanceMeters(
  a: (Depot | PlanningClient) & { lat: number; lng: number },
  b: (Depot | PlanningClient) & { lat: number; lng: number },
  context: OptimizerContext,
) {
  const keyA = pointCacheKey(a)
  const keyB = pointCacheKey(b)
  const cacheKey = keyA < keyB ? `${keyA}|${keyB}` : `${keyB}|${keyA}`
  const cached = context.distanceCache.get(cacheKey)
  if (cached !== undefined) {
    return cached
  }

  const distance = roadDistanceMeters(a, b)
  context.distanceCache.set(cacheKey, distance)
  return distance
}

function pointCacheKey(point: Depot | PlanningClient) {
  return 'clientId' in point ? `c:${point.clientId}` : `d:${point.id}`
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

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function clampInteger(value: number, minimum: number, maximum: number) {
  return Math.round(clamp(value, minimum, maximum))
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10
}

function roundTwo(value: number) {
  return Math.round(value * 100) / 100
}
