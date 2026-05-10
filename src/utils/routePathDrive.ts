export type LatLngLiteral = { lat: number; lng: number }

const EARTH_RADIUS_M = 6_371_000

export function haversineMeters(a: LatLngLiteral, b: LatLngLiteral): number {
  const φ1 = (a.lat * Math.PI) / 180
  const φ2 = (b.lat * Math.PI) / 180
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(s)))
}

/** Rumb en graus (0 = nord, horari), entre dos punts. */
export function bearingDegrees(a: LatLngLiteral, b: LatLngLiteral): number {
  const φ1 = (a.lat * Math.PI) / 180
  const φ2 = (b.lat * Math.PI) / 180
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return (Math.atan2(y, x) * 180) / Math.PI
}

/** Elimina punts consecutius gairebé iguals per evitar segments de longitud 0. */
export function dedupeClosePoints(points: LatLngLiteral[], minMeters = 0.5): LatLngLiteral[] {
  if (points.length === 0) return []
  const out: LatLngLiteral[] = [points[0]]
  for (let i = 1; i < points.length; i++) {
    const prev = out[out.length - 1]
    const cur = points[i]
    if (haversineMeters(prev, cur) >= minMeters) {
      out.push(cur)
    }
  }
  if (out.length === 1 && points.length > 1) {
    out.push(points[points.length - 1])
  }
  return out
}

export type PathMetric = {
  points: LatLngLiteral[]
  segmentLengths: number[]
  totalMeters: number
}

export function buildPathMetrics(points: LatLngLiteral[]): PathMetric {
  const cleaned = dedupeClosePoints(points)
  if (cleaned.length < 2) {
    return { points: cleaned, segmentLengths: [], totalMeters: 0 }
  }
  const segmentLengths: number[] = []
  for (let i = 0; i < cleaned.length - 1; i++) {
    segmentLengths.push(haversineMeters(cleaned[i], cleaned[i + 1]))
  }
  const totalMeters = segmentLengths.reduce((acc, len) => acc + len, 0)
  return { points: cleaned, segmentLengths, totalMeters }
}

export function positionAtDistance(
  points: LatLngLiteral[],
  segmentLengths: number[],
  totalMeters: number,
  distanceAlong: number,
  options?: { loop?: boolean },
): LatLngLiteral {
  const loop = options?.loop !== false

  if (points.length === 0) {
    return { lat: 0, lng: 0 }
  }
  if (points.length === 1 || totalMeters <= 0) {
    return points[0]
  }

  let d: number
  if (loop) {
    d = distanceAlong % totalMeters
    if (d < 0) d += totalMeters
  } else {
    d = Math.min(Math.max(0, distanceAlong), totalMeters)
  }

  let seg = 0
  let acc = 0
  while (seg < segmentLengths.length && acc + segmentLengths[seg] < d) {
    acc += segmentLengths[seg]
    seg++
  }

  if (seg >= segmentLengths.length) {
    return points[points.length - 1]
  }

  const segLen = segmentLengths[seg]
  const t = segLen > 0 ? (d - acc) / segLen : 0
  const a = points[seg]
  const b = points[seg + 1]
  return {
    lat: a.lat + t * (b.lat - a.lat),
    lng: a.lng + t * (b.lng - a.lng),
  }
}

/** Interpolació angular curta (graus, horari). */
export function lerpAngleDeg(current: number, target: number, t: number): number {
  const diff = ((target - current + 540) % 360) - 180
  return current + diff * t
}

/**
 * Per cada parada (ordre), distància acumulada al llarg del path fins al punt més proper
 * (cerca endavant des de l’anterior, per mantenir l’ordre de la ruta).
 */
export function computeStopDistancesAlongPath(
  metrics: PathMetric,
  stops: readonly LatLngLiteral[],
): number[] {
  const { points, segmentLengths, totalMeters } = metrics
  if (stops.length === 0 || totalMeters <= 0) return []

  const stepM = 3
  const out: number[] = []
  let minSearch = 0

  for (const stop of stops) {
    let bestD = minSearch
    let bestH = Infinity
    for (let d = minSearch; d <= totalMeters; d += stepM) {
      const p = positionAtDistance(points, segmentLengths, totalMeters, d, { loop: false })
      const h = haversineMeters(p, stop)
      if (h < bestH) {
        bestH = h
        bestD = d
      }
    }
    const dClamped = Math.min(totalMeters, Math.max(minSearch, bestD))
    out.push(dClamped)
    minSearch = dClamped
  }

  for (let i = 1; i < out.length; i++) {
    if (out[i] < out[i - 1]) out[i] = out[i - 1]
  }
  return out
}

/** Alçada en px de la línia gruixuda segons distància recorreguda i parades. */
export function timelineThickHeightPx(
  stopDistances: readonly number[],
  distanceAlong: number,
  totalMeters: number,
  rowHeightPx: number,
): number {
  const n = stopDistances.length
  if (n < 2 || totalMeters <= 0) return 0

  const d = Math.min(Math.max(0, distanceAlong), totalMeters)

  let px = 0
  for (let j = 0; j < n - 1; j++) {
    const d0 = stopDistances[j]
    const d1 = stopDistances[j + 1]
    const seg = Math.max(1e-6, d1 - d0)
    if (d >= d1) {
      px += rowHeightPx
    } else if (d <= d0) {
      break
    } else {
      px += ((d - d0) / seg) * rowHeightPx
      break
    }
  }
  return px
}

/**
 * Índex de parada per centrar el scroll de la llista: la primera encara no assolida pel recorregut, o la darrera.
 */
export function timelineScrollLeadIndex(
  paradesLength: number,
  stopDistances: readonly number[] | null | undefined,
  distanceAlong: number,
  totalMeters: number,
): number {
  if (paradesLength < 1 || !stopDistances?.length) return 0
  const d = Math.min(Math.max(0, distanceAlong), totalMeters)
  for (let i = 0; i < paradesLength; i++) {
    const s = stopDistances[i]
    if (s === undefined) continue
    if (d < s) return i
  }
  return paradesLength - 1
}

export function sampleAlongPath(
  metrics: PathMetric,
  distanceAlong: number,
  lookAheadMeters: number,
  options?: { loop?: boolean },
): { position: LatLngLiteral; heading: number } {
  const loop = options?.loop !== false
  const { points, segmentLengths, totalMeters } = metrics
  if (points.length < 2 || totalMeters <= 0) {
    return { position: points[0] ?? { lat: 0, lng: 0 }, heading: 0 }
  }

  const position = positionAtDistance(points, segmentLengths, totalMeters, distanceAlong, { loop })
  let ahead = positionAtDistance(points, segmentLengths, totalMeters, distanceAlong + lookAheadMeters, {
    loop,
  })

  if (haversineMeters(position, ahead) < 0.5) {
    ahead = positionAtDistance(
      points,
      segmentLengths,
      totalMeters,
      distanceAlong + Math.max(lookAheadMeters * 3, 25),
      { loop },
    )
  }

  let heading = bearingDegrees(position, ahead)
  if (Number.isNaN(heading)) heading = 0
  return { position, heading }
}
