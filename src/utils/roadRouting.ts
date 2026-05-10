import type { PolylinePoint } from '@/utils/routeOptimizer'

const OSRM_DRIVING_ROUTE_URL = 'https://router.project-osrm.org/route/v1/driving'
const COORDINATE_PRECISION = 6

type OsrmRouteResponse = {
  code?: string
  routes?: readonly {
    geometry?: {
      coordinates?: readonly [number, number][]
    }
  }[]
}

const routeGeometryCache = new Map<string, Promise<readonly PolylinePoint[]>>()
const segmentGeometryCache = new Map<string, Promise<readonly PolylinePoint[]>>()

export function getRoadRoutePolyline(points: readonly PolylinePoint[]) {
  const normalizedPoints = normalizePolyline(points)
  if (normalizedPoints.length < 2) {
    return Promise.resolve(normalizedPoints)
  }

  const cacheKey = cacheKeyFor(normalizedPoints)
  const cached = routeGeometryCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const request = fetchOsrmRoute(normalizedPoints)
    .catch(() => stitchSegmentRoutes(normalizedPoints))
    .catch(() => normalizedPoints)
  routeGeometryCache.set(cacheKey, request)
  return request
}

async function stitchSegmentRoutes(points: readonly PolylinePoint[]) {
  const stitched: PolylinePoint[] = []

  for (let index = 0; index < points.length - 1; index += 1) {
    const segment = await getRoadRouteSegment(points[index], points[index + 1])
    appendSegment(stitched, segment)
  }

  return stitched.length > 1 ? stitched : points
}

function getRoadRouteSegment(origin: PolylinePoint, destination: PolylinePoint) {
  const segmentPoints = [origin, destination]
  const cacheKey = cacheKeyFor(segmentPoints)
  const cached = segmentGeometryCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const request = fetchOsrmRoute(segmentPoints).catch(() => segmentPoints)
  segmentGeometryCache.set(cacheKey, request)
  return request
}

async function fetchOsrmRoute(points: readonly PolylinePoint[]) {
  const coords = points.map((point) => `${point.lng},${point.lat}`).join(';')
  const response = await fetch(
    `${OSRM_DRIVING_ROUTE_URL}/${coords}?overview=full&geometries=geojson&steps=false&alternatives=false`,
  )

  if (!response.ok) {
    throw new Error(`OSRM route request failed with ${response.status}`)
  }

  const result = (await response.json()) as OsrmRouteResponse
  const coordinates = result.code === 'Ok' ? result.routes?.[0]?.geometry?.coordinates : null
  if (!coordinates?.length) {
    throw new Error('OSRM route response did not include geometry')
  }

  return coordinates.map(([lng, lat]) => ({
    lat: roundCoordinate(lat),
    lng: roundCoordinate(lng),
  }))
}

function appendSegment(target: PolylinePoint[], segment: readonly PolylinePoint[]) {
  for (const point of segment) {
    const previous = target[target.length - 1]
    if (previous && samePoint(previous, point)) {
      continue
    }
    target.push(point)
  }
}

function normalizePolyline(points: readonly PolylinePoint[]) {
  const normalized: PolylinePoint[] = []

  for (const point of points) {
    if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) {
      continue
    }

    const nextPoint = {
      lat: roundCoordinate(point.lat),
      lng: roundCoordinate(point.lng),
    }
    const previous = normalized[normalized.length - 1]
    if (!previous || !samePoint(previous, nextPoint)) {
      normalized.push(nextPoint)
    }
  }

  return normalized
}

function cacheKeyFor(points: readonly PolylinePoint[]) {
  return points.map((point) => `${point.lng.toFixed(COORDINATE_PRECISION)},${point.lat.toFixed(COORDINATE_PRECISION)}`).join(';')
}

function samePoint(a: PolylinePoint, b: PolylinePoint) {
  return a.lat === b.lat && a.lng === b.lng
}

function roundCoordinate(value: number) {
  return Number(value.toFixed(COORDINATE_PRECISION))
}
