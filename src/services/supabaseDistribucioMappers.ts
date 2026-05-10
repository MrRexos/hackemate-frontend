import type { LiniaDistribucio, UnitatVolum } from '@/domain/palletPacking'

export type FilaSupabase = Record<string, unknown>

export function pickString(row: FilaSupabase, keys: string[]): string {
  for (const k of keys) {
    const v = row[k]
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim()
  }
  return ''
}

/** Igual que `pickString` però tolerant a majúscules/minúscules del nom de columna (Postgres / PostgREST). */
export function pickStringFlexible(row: FilaSupabase, keys: string[]): string {
  const direct = pickString(row, keys)
  if (direct) return direct
  const lowerToActual = new Map<string, string>()
  for (const rk of Object.keys(row)) {
    lowerToActual.set(rk.toLowerCase(), rk)
  }
  for (const want of keys) {
    const actual = lowerToActual.get(want.toLowerCase())
    if (!actual) continue
    const v = row[actual]
    if (v !== undefined && v !== null && String(v).trim() !== '') return String(v).trim()
  }
  return ''
}

/**
 * Text del **detall de línia** (comanda del client). Ordre: descripció de línia → textos típics SAP/ERP.
 */
const DETALLE_ENTREGA_NOM_KEYS = [
  'descripcion',
  'descripcion_linea',
  'descripcion_articulo',
  'descripcion_material_linea',
  'descripcion_pedido',
  'descripcion_entrega',
  'descripcion_comercial',
  'descripcion_extendida',
  'desc_extendida',
  'literal',
  'literal_material',
  'literal_pedido',
  'texto_material',
  'texto_material_pedido',
  'texto_pedido',
  'texto_linea',
  'texto_cliente',
  'material_texto',
  'material_descripcion',
  'nombre_articulo',
  'nombre_material_pedido',
  'nombre_material',
  'nombre_producto',
  'nombre_comercial',
  'nombre_extendido',
  'marca',
  'marca_y_producto',
  'producto',
  'articulo',
  'articulo_desc',
  'desc_articulo',
  'denominacion_articulo',
  'denominacion',
  'denominación',
  'denominacion_corta',
  'texto_breve_linea',
  'texto_breve',
  'texto_largo',
  'observaciones',
  'glosa',
  'comentario',
  'maktx',
  'label',
]

/**
 * Catàleg `materiales`: nom del **article** (no jerarquia / família com a primera opció).
 */
const MATERIAL_NOM_KEYS = [
  'descripcion',
  'descripcion_material',
  'nombre_material',
  'nombre_comercial',
  'nombre',
  'nombre_articulo',
  'producto',
  'articulo',
  'maktx',
  'texto_breve',
  'texto_material',
  'desc_material',
  'material_desc',
  'descripcion_larga',
  'label',
  'titulo',
  'denominacion',
  'denominación',
  'texto',
  'desc_larga',
  'observaciones',
]

/** Penalitza jerarquia/classificació; premia descripció i nom d’article. */
function inferNomProducteDesDeFila(row: FilaSupabase): string {
  type Scored = { key: string; score: number }
  const scored: Scored[] = []

  for (const key of Object.keys(row)) {
    const kl = key.toLowerCase()
    const v = row[key]
    if (v === undefined || v === null) continue
    const s = String(v).trim()
    if (s.length === 0) continue

    if (/cliente|customer|proveedor/i.test(kl)) continue
    if (/transporte_id|entrega_id|^cantidad|^unidades|^peso_|^pes_|^stock|^importe|^precio|^qty$/i.test(kl)) continue
    if (/(^|_)id$/i.test(kl) && kl !== 'material_id') continue

    let score = 0
    if (/maktx|descripcion_material|material_descripcion|nombre_material|nombre_articulo|nombre_comercial/.test(kl))
      score += 130
    else if (/literal|descripcion_comercial|marca|nombre_extendido|denominacion_corta/.test(kl)) score += 125
    else if (/descripcion(?!.*jerar)|denominacion.*articulo/.test(kl) && !/jerarquia/.test(kl)) score += 110
    else if (/producto|articulo|^nombre$|^nombre_/.test(kl)) score += 75
    else if (/texto_largo|texto_breve|observaciones|glosa|label|titulo/.test(kl)) score += 65
    else if (/texto|desc/.test(kl) && !/jerarquia/.test(kl)) score += 40

    if (/jerarquia|jerarq|hierarchy|familia|grupo_material|clase_mat|categoria_mat|tipo_mat|sector|nivel/.test(kl))
      score -= 90

    if (score > 0) scored.push({ key, score })
  }

  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]
  return best ? String(row[best.key]).trim() : ''
}

/**
 * Si cap columna té nom conegut: busca el text més plausible de **nom comercial** (marca + referència,
 * p. ex. «Estrella Damm…», «Aigua …»): text amb lletres, força llarg, no només codis numèrics.
 */
export function inferNomTextComercialLlarg(row: FilaSupabase): string {
  let best = ''
  let bestScore = 0

  for (const key of Object.keys(row)) {
    const kl = key.toLowerCase()
    if (/^(id|uuid)|_(id|fk|uuid)$|fecha|hora|timestamp|created|updated/.test(kl)) continue
    if (
      /transporte|entrega_id|cliente_id|^cantidad|^unidades|^peso_|^pes_|stock|precio|importe|tipo_unidad|unidad_medida|status|estado/.test(
        kl,
      )
    )
      continue

    const raw = row[key]
    if (raw === undefined || raw === null) continue
    const s = String(raw).trim()
    if (s.length < 6) continue
    if (/^[0-9.,\-_\s]+$/.test(s)) continue
    if (/^[a-f0-9-]{32,36}$/i.test(s)) continue

    const letters = (s.match(/[a-záéíóúñüçàèìòùA-ZÁÉÍÓÚÑÜÇÀÈÌÒÙ]/g) ?? []).length
    if (letters < 4) continue

    const words = s.split(/\s+/).filter(Boolean).length
    let score = letters + words * 10
    if (words >= 2) score += 40
    if (/\d/.test(s)) score += 5
    if (/jerarquia|familia|grupo|categoria|tipo_mat|sector|nivel/i.test(kl)) score -= 50
    if (/observaciones_internas|notas_intern|comentario_almacen|instrucciones_entrega/i.test(kl)) score -= 45

    if (score > bestScore) {
      bestScore = score
      best = s
    }
  }

  return best
}

/** Nom del producte segons la línia de comanda (`detalle_entrega`). */
export function nomProducteDesDeDetalleEntrega(row: FilaSupabase): string {
  const extra = envColOptional('VITE_SUPABASE_COL_DETALLE_DESCRIPCIO_PRODUCTE')
  if (extra) {
    const v = pickStringFlexible(row, [extra])
    if (v) return v
  }
  let nom = pickStringFlexible(row, DETALLE_ENTREGA_NOM_KEYS)
  if (nom) return nom
  nom = inferNomProducteDesDeFila(row)
  if (nom) return nom
  return inferNomTextComercialLlarg(row)
}

/** Nom llegible des del catàleg `materiales`; `fallbackId` només si no hi ha cap text usable. */
export function nomMaterialDesDeFila(filaMat: FilaSupabase, fallbackId: string): string {
  let nom = pickStringFlexible(filaMat, MATERIAL_NOM_KEYS)
  if (nom) return nom
  nom = inferNomProducteDesDeFila(filaMat)
  if (nom) return nom
  nom = inferNomTextComercialLlarg(filaMat)
  if (nom) return nom
  /* Molts ERP només publiquen codi de jerarquia/grup al catàleg logístic (sense `descripcion`). */
  nom = pickStringFlexible(filaMat, ['jerarquia', 'codigo_jerarquia', 'hierarchy_code', 'grupo_material'])
  return nom || fallbackId
}

export function pickNumber(row: FilaSupabase, keys: string[]): number {
  for (const k of keys) {
    const v = row[k]
    if (typeof v === 'number' && Number.isFinite(v)) return v
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(String(v).replace(',', '.'))
      if (Number.isFinite(n)) return n
    }
  }
  return NaN
}

export function idNormalitzat(v: unknown): string {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

export function normalitzarUnitat(raw: unknown): UnitatVolum | null {
  const s = String(raw ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
  if (['CAIXA', 'CAJA', 'BOX', 'CAX', 'CAJ', 'CAJAS', 'CJ'].includes(s)) return 'CAIXA'
  if (['LLAUNA', 'LATA', 'CAN', 'LAT', 'LLATA', 'UN', 'UND', 'UD', 'PZA', 'PZ'].includes(s))
    return 'LLAUNA'
  if (['BARRIL', 'BIDON', 'BIDO', 'TAMBOR', 'BAR'].includes(s)) return 'BARRIL'
  return null
}

/** Fila plana (taula `distribucio_linies` o vista). */
export function filaDistribucioALinia(row: FilaSupabase): LiniaDistribucio | null {
  const paradaIndex = Math.round(
    pickNumber(row, ['parada_index', 'paradaIndex', 'stop_index', 'stopIndex']),
  )
  const producteId = pickString(row, ['producte_id', 'product_id', 'producteId', 'sku'])
  const producteNom = pickString(row, ['producte_nom', 'product_name', 'producteNom', 'nom_producte'])
  const materialId = pickString(row, ['material_id', 'materialId', 'codi_material'])
  const materialNom = pickString(row, ['material_nom', 'material_name', 'materialNom', 'nom_material'])
  const quantitat = pickNumber(row, ['quantitat', 'quantity', 'qty'])
  const unitatRaw = pickString(row, ['unitat', 'unit', 'unitat_volum'])
  const unitat = normalitzarUnitat(unitatRaw !== '' ? unitatRaw : row.unitat)
  const pesKgPerUnitat = pickNumber(row, ['pes_kg_per_unitat', 'pesKgPerUnitat', 'pes_per_unitat_kg'])

  if (!Number.isFinite(paradaIndex) || paradaIndex < 0) return null
  if (!producteId) return null
  if (!Number.isFinite(quantitat) || quantitat <= 0) return null
  if (!unitat) return null
  if (!Number.isFinite(pesKgPerUnitat) || pesKgPerUnitat <= 0) return null

  return {
    paradaIndex,
    producteId,
    producteNom: producteNom || producteId,
    materialId: materialId || '—',
    materialNom: materialNom || materialId || 'Material',
    quantitat,
    unitat,
    pesKgPerUnitat,
  }
}

export function pesKgPerUnitatDesDeMaterial(filaMat: FilaSupabase, unitat: UnitatVolum): number {
  if (unitat === 'CAIXA') {
    const p = pickNumber(filaMat, [
      'peso_caja_kg',
      'peso_caixa_kg',
      'peso_caja',
      'pes_caja',
      'peso_por_caja',
      'peso_unitario_caja',
    ])
    if (Number.isFinite(p) && p > 0) return p
  }
  if (unitat === 'LLAUNA') {
    const p = pickNumber(filaMat, ['peso_lata_kg', 'peso_lata', 'peso_lata_unitario'])
    if (Number.isFinite(p) && p > 0) return p
  }
  if (unitat === 'BARRIL') {
    const p = pickNumber(filaMat, ['peso_barril_kg', 'peso_barril', 'peso_bidon_kg'])
    if (Number.isFinite(p) && p > 0) return p
  }
  const generic = pickNumber(filaMat, [
    'peso_unitario_kg',
    'peso_unitario',
    'peso_neto',
    'peso',
    'pes_bruto',
  ])
  if (Number.isFinite(generic) && generic > 0) return generic
  return NaN
}

function readEnv(key: string): string | undefined {
  const env = import.meta.env as Record<string, string | undefined>
  const v = env[key]
  return typeof v === 'string' ? v.trim() || undefined : undefined
}

export function envTableVar(name: string, fallback: string): string {
  return readEnv(name) ?? fallback
}

/** Taula opcional (sense valor per defecte): només si està definida a `.env`. */
export function envTableOptional(name: string): string | undefined {
  return readEnv(name)
}

export function envColVar(name: string, fallback: string): string {
  return readEnv(name) ?? fallback
}

/** Variable d’entorn de columna només si està definida i no buida. */
export function envColOptional(name: string): string | undefined {
  const v = readEnv(name)
  return v && v.length > 0 ? v : undefined
}
