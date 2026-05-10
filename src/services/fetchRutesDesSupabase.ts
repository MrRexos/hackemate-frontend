import { ambSortidaITornadaMollet } from '@/data/magatzemMollet'
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabaseClient'
import { crearRutesSimulades } from '@/services/assignacioRutes'
import { TipusCamio } from '@/models/Camio'
import type { ParadaRuta } from '@/models/Ruta'
import { Ruta } from '@/models/Ruta'
import {
  envTableVar,
  type FilaSupabase,
  idNormalitzat,
  pickString,
} from '@/services/supabaseDistribucioMappers'
import { construirRutesSimulacio16DesDeBd } from '@/services/simulacioRutes16Dia'

/** Posar a `"0"` per saltar la simulació de 16 rutes i usar directament el flux antic (per transport). */
const SIMULACIO_16_ACTIVA =
  (import.meta.env.VITE_SIMULACIO_16_RUTES as string | undefined)?.trim() !== '0'

const MAGATZEM_LAT = 41.53975
const MAGATZEM_LNG = 2.21405

const DAY1_COLUMN_ENV = (import.meta.env.VITE_SUPABASE_DAY1_COLUMN as string | undefined)?.trim() || ''
const DAY1_VALUE_ENV = (import.meta.env.VITE_SUPABASE_DAY1_VALUE as string | undefined)?.trim() || '1'

function pickNumberSafe(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v.replace(',', '.'))
    return Number.isFinite(n) ? n : null
  }
  return null
}

function valorFila(row: FilaSupabase, key: string): unknown {
  if (key in row) return row[key]
  const lower = key.toLowerCase()
  const hit = Object.keys(row).find((k) => k.toLowerCase() === lower)
  return hit ? row[hit] : undefined
}

type DayBucket = {
  key: string
  order: number
  isDay1: boolean
}

function parseDayBucket(v: unknown): DayBucket | null {
  if (typeof v === 'number' && Number.isFinite(v)) {
    return { key: `n:${v}`, order: v, isDay1: v === Number(DAY1_VALUE_ENV) || v === 1 }
  }
  if (typeof v !== 'string') return null
  const s = v.trim()
  if (!s) return null
  const asNum = Number(s.replace(',', '.'))
  if (Number.isFinite(asNum)) {
    return { key: `n:${asNum}`, order: asNum, isDay1: asNum === Number(DAY1_VALUE_ENV) || asNum === 1 }
  }
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const day1FromEnv = Number(DAY1_VALUE_ENV)
  const isDay1 = d.getDate() === 1 || (Number.isFinite(day1FromEnv) && d.getDate() === day1FromEnv)
  return { key: `d:${y}-${m}-${day}`, order: new Date(`${y}-${m}-${day}T00:00:00`).getTime(), isDay1 }
}

function agruparPerDia(rows: FilaSupabase[], col: string): Map<string, { bucket: DayBucket; rows: FilaSupabase[] }> {
  const out = new Map<string, { bucket: DayBucket; rows: FilaSupabase[] }>()
  for (const row of rows) {
    const raw = valorFila(row, col)
    const b = parseDayBucket(raw)
    if (!b) continue
    const curr = out.get(b.key)
    if (curr) {
      curr.rows.push(row)
    } else {
      out.set(b.key, { bucket: b, rows: [row] })
    }
  }
  return out
}

function seleccionarFilesDiaOperatiu(rows: FilaSupabase[]): FilaSupabase[] {
  const candidates = DAY1_COLUMN_ENV
    ? [DAY1_COLUMN_ENV]
    : ['dia', 'day', 'delivery_day', 'dia_entrega', 'dia_ruta', 'jornada', 'fecha', 'fecha_entrega', 'delivery_date']

  let millorCol: string | null = null
  let millorGrups: Map<string, { bucket: DayBucket; rows: FilaSupabase[] }> | null = null
  let millorCobertura = 0

  for (const col of candidates) {
    const groups = agruparPerDia(rows, col)
    const cobertura = [...groups.values()].reduce((acc, g) => acc + g.rows.length, 0)
    if (cobertura > millorCobertura) {
      millorCobertura = cobertura
      millorCol = col
      millorGrups = groups
    }
  }

  // No hi ha columna de dia usable: tornem totes les files (sense mock).
  if (!millorCol || !millorGrups || millorGrups.size === 0) {
    console.warn('[rutes] Sense columna de dia detectable. S\'usen totes les files de cabecera_transporte.')
    return rows
  }

  const grups = [...millorGrups.values()]
  const grupDia1 = grups.find((g) => g.bucket.isDay1)
  if (grupDia1) return grupDia1.rows

  // Si no hi ha “dia 1”, agafem el primer dia disponible.
  grups.sort((a, b) => a.bucket.order - b.bucket.order)
  const primer = grups[0]
  console.warn(`[rutes] No hi ha dia 1 a columna "${millorCol}". S'usa primer dia disponible (${primer.bucket.key}).`)
  return primer.rows
}

function tipusCamioPerNombreParades(n: number): TipusCamio {
  if (n <= 1) return TipusCamio.Petit
  if (n <= 4) return TipusCamio.Mitja
  return TipusCamio.Gran
}

function horaParadaEntrega(index0: number): string {
  const minutsInici = 6 * 60 + 30 + index0 * 45
  const h = Math.floor(minutsInici / 60)
  const m = minutsInici % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function paradaDesDeClient(
  nombre: string,
  poblacion: string,
  lat: number | null,
  lng: number | null,
  hora: string,
  clienteId: string,
): ParadaRuta {
  const nom = poblacion ? `${nombre} — ${poblacion}` : nombre
  return {
    nom,
    lat: lat ?? MAGATZEM_LAT + (Math.sin(clienteId.length) * 0.04),
    lng: lng ?? MAGATZEM_LNG + (Math.cos(clienteId.length) * 0.06),
    horaArribadaAprox: hora,
    clienteId: clienteId || undefined,
  }
}

function horaPerIndex(index0: number): string {
  const minuts = 6 * 60 + 30 + index0 * 35
  const h = Math.floor(minuts / 60)
  const m = minuts % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

async function crearRutesSimuladesAmbEmpresesReals(
  sb: NonNullable<ReturnType<typeof getSupabaseBrowser>>,
  T_CLI: string,
): Promise<Ruta[]> {
  const { data: cliRows, error } = await sb.from(T_CLI).select('*').limit(3000)
  if (error) {
    throw new Error(`[rutes-sim-bd] ${error.message}`)
  }
  const clients = (cliRows ?? []) as FilaSupabase[]
  if (clients.length === 0) return []

  const cOrdenats = [...clients].sort((a, b) => {
    const an = pickString(a, ['nombre']) || ''
    const bn = pickString(b, ['nombre']) || ''
    return an.localeCompare(bn)
  })

  const rutes: Ruta[] = []
  let i = 0
  let rutaNum = 1
  while (i < cOrdenats.length && rutaNum <= 80) {
    const nStops = 3 + (rutaNum % 6) // 3..8 parades
    const bloc = cOrdenats.slice(i, i + nStops)
    i += nStops
    if (bloc.length === 0) break

    const paradesIntermedies: ParadaRuta[] = bloc.map((c, j) => {
      const cid = idNormalitzat(c.cliente_id)
      const nombre = pickString(c, ['nombre']) || `Client ${cid || i + j}`
      const poblacion = pickString(c, ['poblacion', 'población'])
      const lat = pickNumberSafe(c.latitud)
      const lng = pickNumberSafe(c.longitud)
      return paradaDesDeClient(nombre, poblacion, lat, lng, horaPerIndex(j), cid)
    })

    const tipus = tipusCamioPerNombreParades(paradesIntermedies.length)
    rutes.push(
      new Ruta(
        `R-SIMBD-${String(rutaNum).padStart(3, '0')}`,
        ambSortidaITornadaMollet(paradesIntermedies, '06:10', horaPerIndex(paradesIntermedies.length + 1)),
        tipus,
        null,
      ),
    )
    rutaNum++
  }
  return rutes
}

/**
 * Rutes des de `cabecera_transporte` + `clientes` (només entregues del dia 1).
 */
export async function fetchRutesDesSupabase(): Promise<Ruta[]> {
  const sb = getSupabaseBrowser()
  if (!sb) return []

  if (SIMULACIO_16_ACTIVA) {
    try {
      const sim16 = await construirRutesSimulacio16DesDeBd(sb)
      if (sim16.length === 16) return sim16
    } catch (e) {
      console.warn('[rutes] No s’ha pogut construir la simulació de 16 rutes:', e)
    }
  }

  const T_CAB = envTableVar('VITE_SUPABASE_TABLE_CABECERA', 'cabecera_transporte')
  const T_CLI = envTableVar('VITE_SUPABASE_TABLE_CLIENTES', 'clientes')

  const { data: cabAll, error: cabErr } = await sb.from(T_CAB).select('*').limit(8000)

  if (cabErr || !cabAll?.length) {
    console.warn('[rutes] cabecera_transporte no disponible, creo simulació amb empreses reals.')
    return crearRutesSimuladesAmbEmpresesReals(sb, T_CLI)
  }

  const cabRows = (cabAll ?? []) as FilaSupabase[]
  const filesDia1 = seleccionarFilesDiaOperatiu(cabRows)
  if (filesDia1.length === 0) {
    return crearRutesSimuladesAmbEmpresesReals(sb, T_CLI)
  }

  const sorted = [...filesDia1] as FilaSupabase[]
  sorted.sort((a, b) => {
    const ta = Number(a.transporte_id)
    const tb = Number(b.transporte_id)
    if (ta !== tb) return ta - tb
    return Number(a.entrega_id) - Number(b.entrega_id)
  })

  const byTransport = new Map<number, FilaSupabase[]>()
  for (const row of sorted) {
    const tid = Number(row.transporte_id)
    if (!Number.isFinite(tid)) continue
    const arr = byTransport.get(tid) ?? []
    arr.push(row)
    byTransport.set(tid, arr)
  }

  const clienteIds = new Set<string>()
  for (const rows of byTransport.values()) {
    for (const r of rows) {
      const c = idNormalitzat(r.cliente_id)
      if (c) clienteIds.add(c)
    }
  }

  const clientMap = new Map<string, FilaSupabase>()
  if (clienteIds.size > 0) {
    const idsNumeric = [...clienteIds]
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n)) as number[]
    const { data: cliRows, error: cliErr } = await sb.from(T_CLI).select('*').in('cliente_id', idsNumeric)
    if (cliErr) {
      console.warn('[rutes] clientes:', cliErr.message)
    } else {
      for (const c of cliRows ?? []) {
        const row = c as FilaSupabase
        const id = idNormalitzat(row.cliente_id ?? pickString(row, ['cliente_id']))
        if (id) clientMap.set(id, row)
      }
    }
  }

  const rutes: Ruta[] = []
  const transportsOrdenats = [...byTransport.entries()].sort((a, b) => a[0] - b[0])

  for (const [transporteId, files] of transportsOrdenats) {
    if (files.length === 0) continue

    const paradesIntermedies: ParadaRuta[] = files.map((f, i) => {
      const cid = idNormalitzat(f.cliente_id)
      const cli = cid ? clientMap.get(cid) : undefined
      const nombre = cli
        ? pickString(cli, ['nombre']) || `Client ${cid}`
        : cid
          ? `Client ${cid}`
          : `Entrega ${i + 1}`
      const poblacion = cli ? pickString(cli, ['poblacion', 'población']) : ''
      const lat = pickNumberSafe(cli?.latitud)
      const lng = pickNumberSafe(cli?.longitud)

      return paradaDesDeClient(nombre, poblacion, lat, lng, horaParadaEntrega(i), cid)
    })

    const tipus = tipusCamioPerNombreParades(paradesIntermedies.length)
    const primeraHora = '06:15'
    const ultimaHora = horaParadaEntrega(paradesIntermedies.length + 1)

    rutes.push(
      new Ruta(
        `R-BD-${transporteId}`,
        ambSortidaITornadaMollet(paradesIntermedies, primeraHora, ultimaHora),
        tipus,
        transporteId,
      ),
    )
  }

  if (rutes.length > 0) return rutes
  return crearRutesSimuladesAmbEmpresesReals(sb, T_CLI)
}

export async function carregarRutesPreferintSupabase(): Promise<Ruta[]> {
  if (!isSupabaseConfigured()) {
    return crearRutesSimulades()
  }
  const rutes = await fetchRutesDesSupabase()
  return rutes.length > 0 ? rutes : crearRutesSimulades()
}
