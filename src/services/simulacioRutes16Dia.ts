/**
 * Construeix exactament 16 rutes a partir de les entregues del dia operatiu (horaris + cabecera),
 * amb tipus de camió correlacionat amb la mida del bloc (Petit / Mitjà / Gran) i línies reals fusionades.
 */
import { ambSortidaITornadaMollet } from '@/data/magatzemMollet'
import type { getSupabaseBrowser } from '@/lib/supabaseClient'

import { TipusCamio } from '@/models/Camio'
import type { ParadaRuta } from '@/models/Ruta'
import { Ruta } from '@/models/Ruta'
import { envTableVar, idNormalitzat, pickString, type FilaSupabase } from '@/services/supabaseDistribucioMappers'

const MAGATZEM_LAT = 41.53975
const MAGATZEM_LNG = 2.21405

const DAY1_COLUMN_ENV = (import.meta.env.VITE_SUPABASE_DAY1_COLUMN as string | undefined)?.trim() || ''
const DAY1_VALUE_ENV = (import.meta.env.VITE_SUPABASE_DAY1_VALUE as string | undefined)?.trim() || '1'

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

/** Mateixa lògica que `fetchRutesDesSupabase`: es queda amb el dia 1 o el primer dia trobat. */
export function seleccionarFilesDiaOperatiu(rows: FilaSupabase[]): FilaSupabase[] {
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

  if (!millorCol || !millorGrups || millorGrups.size === 0) {
    return rows
  }

  const grups = [...millorGrups.values()]
  const grupDia1 = grups.find((g) => g.bucket.isDay1)
  if (grupDia1) return grupDia1.rows

  grups.sort((a, b) => a.bucket.order - b.bucket.order)
  return grups[0]!.rows
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

function horaParadaEntrega(index0: number): string {
  const minutsInici = 6 * 60 + 20 + index0 * 42
  const h = Math.floor(minutsInici / 60)
  const m = minutsInici % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function clausCabeceraPossibles(c: FilaSupabase): string[] {
  const tid = Number(c.transporte_id)
  const eid = idNormalitzat(c.entrega_id)
  const keys: string[] = []
  if (Number.isFinite(tid) && eid) keys.push(`te:${tid}|${eid}`)
  const pk = idNormalitzat((c as FilaSupabase).id ?? (c as FilaSupabase).cabecera_id)
  if (pk) keys.push(`id:${pk}`)
  return keys
}

function pickNumberSafe(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v.replace(',', '.'))
    return Number.isFinite(n) ? n : null
  }
  return null
}

function clausDesDHorari(h: FilaSupabase): string[] {
  const tid = pickNumberSafe(h.transporte_id)
  const eid = idNormalitzat(pickString(h, ['entrega_id']) ?? h.entrega_id)
  const out: string[] = []
  if (tid !== null && Number.isFinite(tid) && eid) out.push(`te:${tid}|${eid}`)
  const fk =
    idNormalitzat(pickString(h, ['id_cabecera', 'cabecera_id', 'id_cabecera_transporte']) ?? '') ||
    idNormalitzat(h.id_cabecera ?? h.cabecera_id)
  if (fk) out.push(`id:${fk}`)
  return out
}

/**
 * Filtra cabeceras que apareixen als horaris del mateix dia (per FK o transporte+entrega).
 */
function filtraCabeceresAmbHoraris(cabeceras: FilaSupabase[], horarisDelDia: FilaSupabase[]): FilaSupabase[] {
  const volguts = new Set<string>()
  for (const h of horarisDelDia) {
    for (const k of clausDesDHorari(h)) volguts.add(k)
  }
  if (volguts.size === 0) return []

  return cabeceras.filter((c) => clausCabeceraPossibles(c).some((k) => volguts.has(k)))
}

function augmentarFinsMin16(cabs: FilaSupabase[]): FilaSupabase[] {
  if (cabs.length === 0) return []
  const sorted = [...cabs].sort((a, b) => {
    const ta = Number(a.transporte_id) - Number(b.transporte_id)
    if (ta !== 0) return ta
    return Number(a.entrega_id) - Number(b.entrega_id)
  })
  const out = [...sorted]
  let i = 0
  while (out.length < 16) {
    out.push(sorted[i % sorted.length]!)
    i++
  }
  return out
}

function particionarEn16(cabs: FilaSupabase[]): FilaSupabase[][] {
  const ext = augmentarFinsMin16(cabs)
  const n = ext.length
  const chunkSize = Math.ceil(n / 16)
  const chunks: FilaSupabase[][] = []
  for (let r = 0; r < 16; r++) {
    chunks.push(ext.slice(r * chunkSize, (r + 1) * chunkSize))
  }
  return chunks
}

function assignarTipusPerPesChunks(chunks: FilaSupabase[][]): Map<number, TipusCamio> {
  const pesos = chunks.map((ch) => ch.length)
  const idxOrd = [...chunks.keys()].sort((a, b) => pesos[a]! - pesos[b]!)
  const mapa = new Map<number, TipusCamio>()
  mapa.set(idxOrd[0]!, TipusCamio.Petit)
  for (let k = 1; k <= 11; k++) {
    mapa.set(idxOrd[k]!, TipusCamio.Mitja)
  }
  for (let k = 12; k <= 15; k++) {
    mapa.set(idxOrd[k]!, TipusCamio.Gran)
  }
  return mapa
}

export async function construirRutesSimulacio16DesDeBd(
  sb: NonNullable<ReturnType<typeof getSupabaseBrowser>>,
): Promise<Ruta[]> {
  const T_CAB = envTableVar('VITE_SUPABASE_TABLE_CABECERA', 'cabecera_transporte')
  const T_HOR = envTableVar('VITE_SUPABASE_TABLE_HORARIOS', 'horarios_entrega')
  const T_CLI = envTableVar('VITE_SUPABASE_TABLE_CLIENTES', 'clientes')

  const { data: cabAll, error: cabErr } = await sb.from(T_CAB).select('*').limit(8000)
  if (cabErr || !cabAll?.length) {
    console.warn('[sim16] Sense cabecera_transporte:', cabErr?.message)
    return []
  }

  let cabRows = seleccionarFilesDiaOperatiu(cabAll as FilaSupabase[])

  const { data: horAll, error: horErr } = await sb.from(T_HOR).select('*').limit(8000)
  if (!horErr && horAll?.length) {
    const horDia = seleccionarFilesDiaOperatiu(horAll as FilaSupabase[])
    const filtrades = filtraCabeceresAmbHoraris(cabRows as FilaSupabase[], horDia)
    if (filtrades.length > 0) {
      cabRows = filtrades
    }
  }

  if (cabRows.length === 0) return []

  const clienteIds = new Set<string>()
  for (const r of cabRows) {
    const c = idNormalitzat((r as FilaSupabase).cliente_id)
    if (c) clienteIds.add(c)
  }

  const clientMap = new Map<string, FilaSupabase>()
  if (clienteIds.size > 0) {
    const idsNumeric = [...clienteIds]
      .map((x) => Number(x))
      .filter((n) => Number.isFinite(n)) as number[]
    const { data: cliRows, error: cliErr } = await sb.from(T_CLI).select('*').in('cliente_id', idsNumeric)
    if (cliErr) {
      console.warn('[sim16] clientes:', cliErr.message)
    } else {
      for (const c of cliRows ?? []) {
        const row = c as FilaSupabase
        const id = idNormalitzat(row.cliente_id ?? pickString(row, ['cliente_id']))
        if (id) clientMap.set(id, row)
      }
    }
  }

  const chunks = particionarEn16(cabRows as FilaSupabase[])
  const tipusPerRuta = assignarTipusPerPesChunks(chunks)

  const rutes: Ruta[] = []

  for (let r = 0; r < 16; r++) {
    const chunkRaw = chunks[r]!
    const chunk = chunkRaw.filter(
      (row) => Number.isFinite(Number(row.transporte_id)) && idNormalitzat(row.entrega_id),
    )
    const files = chunk.length > 0 ? chunk : chunkRaw
    const tipus = tipusPerRuta.get(r)!
    const ordreEntregues = files
      .map((row) => ({
        transporteId: Number(row.transporte_id),
        entregaId: idNormalitzat(row.entrega_id),
      }))
      .filter((o) => Number.isFinite(o.transporteId) && o.entregaId.length > 0)

    const paradesIntermedies: ParadaRuta[] = files.map((f, i) => {
      const cid = idNormalitzat(f.cliente_id)
      const cli = cid ? clientMap.get(cid) : undefined
      const nombre = cli ? pickString(cli, ['nombre']) || `Client ${cid}` : cid ? `Client ${cid}` : `Entrega ${i + 1}`
      const poblacion = cli ? pickString(cli, ['poblacion', 'población']) : ''
      const lat = pickNumberSafe(cli?.latitud)
      const lng = pickNumberSafe(cli?.longitud)
      return paradaDesDeClient(nombre, poblacion, lat, lng, horaParadaEntrega(i), cid)
    })

    const primeraHora = '06:05'
    const ultimaHora = horaParadaEntrega(paradesIntermedies.length + 2)
    const primerTid = Number(files[0]?.transporte_id)

    rutes.push(
      new Ruta(
        `R-SIM16-${String(r + 1).padStart(2, '0')}`,
        ambSortidaITornadaMollet(paradesIntermedies, primeraHora, ultimaHora),
        tipus,
        Number.isFinite(primerTid) ? primerTid : null,
        ordreEntregues.length > 0 ? ordreEntregues : null,
      ),
    )
  }

  return rutes
}
