import type { LiniaDistribucio } from '@/domain/palletPacking'
import { getSupabaseBrowser } from '@/lib/supabaseClient'
import type { OrdreEntregaRuta } from '@/models/Ruta'
import {
  type FilaSupabase,
  envColOptional,
  envTableOptional,
  envTableVar,
  idNormalitzat,
  normalitzarUnitat,
  nomMaterialDesDeFila,
  nomProducteDesDeDetalleEntrega,
  pesKgPerUnitatDesDeMaterial,
  pickNumber,
  pickString,
} from '@/services/supabaseDistribucioMappers'

const T_CLI_DEFAULT = 'clientes'

/**
 * Esquema Supabase (taules reals):
 * - `cabecera_transporte`: una fila per entrega (`entrega_id`, `transporte_id`, `cliente_id`, …).
 *   L’ordre de parada ve d’ordenar per `entrega_id` (o columna configurable).
 * - `detalle_entrega`: línies de comanda (text comercial del que demana el client + `material_id`, quantitat…).
 * - Opcional `VITE_SUPABASE_TABLE_ARTICULOS`: catàleg d’articles enllaçat per `articulo_id` / `id_articulo` al detall.
 * - `materiales`: catàleg logístic per `material_id`; el nom es resol amb columns típiques (`descripcion`, `maktx`, …),
 *   inferència per nom de columna (evitant jerarquia/família com a primera opció) i segona consulta si l’id és numèric.
 *
 * `horarios_entrega` i `zonas` són finestres / catàleg; no defineixen l’ordre del camió en aquest model.
 *
 * Cal un **transporte_id** numèric: `Ruta.transporteId` o un `ruta.id` que sigui només el número (p. ex. "11420136").
 */
export async function fetchLiniesDistribucioEmpresa(
  rutaId: string,
  transporteId: number,
): Promise<LiniaDistribucio[]> {
  const sb = getSupabaseBrowser()
  if (!sb) {
    throw new Error('Supabase no està configurat (falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY).')
  }

  const tid = transporteId
  if (!Number.isFinite(tid)) {
    throw new Error(`transporte_id no vàlid per a la ruta «${rutaId}».`)
  }

  const T_CAB = envTableVar('VITE_SUPABASE_TABLE_CABECERA', 'cabecera_transporte')
  const T_DET = envTableVar('VITE_SUPABASE_TABLE_DETALLE', 'detalle_entrega')
  const T_MAT = envTableVar('VITE_SUPABASE_TABLE_MATERIALES', 'materiales')
  const T_CLI = envTableVar('VITE_SUPABASE_TABLE_CLIENTES', T_CLI_DEFAULT)

  const COL_TRANSPORTE = 'transporte_id'
  const COL_ENTREGA = 'entrega_id'
  const COL_CLIENTE_CAB = 'cliente_id'
  const COL_MAT_ID = 'material_id'

  const { data: cabRows, error: cabErr } = await sb
    .from(T_CAB)
    .select('*')
    .eq(COL_TRANSPORTE, tid)
    .order(COL_ENTREGA, { ascending: true })

  if (cabErr) {
    throw new Error(cabErr.message)
  }

  const cabeceras = (cabRows ?? []) as FilaSupabase[]
  if (cabeceras.length === 0) {
    throw new Error(
      `No hi ha files a «${T_CAB}» amb ${COL_TRANSPORTE} = ${tid}. Comprova l’id o les polítiques RLS.`,
    )
  }

  const entregaToParada = new Map<string, number>()
  const clienteToParada = new Map<string, number>()

  cabeceras.forEach((row, i) => {
    const p = i + 1
    const eid = idNormalitzat(row[COL_ENTREGA])
    const cid = idNormalitzat(row[COL_CLIENTE_CAB])
    if (eid) entregaToParada.set(eid, p)
    if (cid) clienteToParada.set(cid, p)
  })

  const idsClientsCab = new Set<string>()
  for (const row of cabeceras) {
    const c = idNormalitzat(row[COL_CLIENTE_CAB])
    if (c) idsClientsCab.add(c)
  }

  const clientMap = new Map<string, FilaSupabase>()
  if (idsClientsCab.size > 0) {
    const idsNumeric = [...idsClientsCab].map((x) => Number(x)).filter((n) => Number.isFinite(n)) as number[]
    const { data: cliRows, error: cliErr } = await sb.from(T_CLI).select('*').in('cliente_id', idsNumeric)
    if (cliErr) {
      console.warn('[distribucio] clientes:', cliErr.message)
    } else {
      for (const c of cliRows ?? []) {
        const row = c as FilaSupabase
        const id = idNormalitzat(row.cliente_id ?? pickString(row, ['cliente_id']))
        if (id) clientMap.set(id, row)
      }
    }
  }

  const entregaToClient = new Map<string, { id: string; nom: string }>()
  for (const row of cabeceras) {
    const eid = idNormalitzat(row[COL_ENTREGA])
    const cid = idNormalitzat(row[COL_CLIENTE_CAB])
    if (!eid || !cid) continue
    const cli = clientMap.get(cid)
    const nom = cli ? pickString(cli, ['nombre']) || `Client ${cid}` : `Client ${cid}`
    entregaToClient.set(eid, { id: cid, nom })
  }

  const { data: detRows, error: detErr } = await sb.from(T_DET).select('*').eq(COL_TRANSPORTE, tid)

  if (detErr) {
    throw new Error(detErr.message)
  }

  const detalles = (detRows ?? []) as FilaSupabase[]
  if (detalles.length === 0) {
    return []
  }

  const materialIds = new Set<string>()
  for (const d of detalles) {
    const mid = idNormalitzat(d[COL_MAT_ID] ?? pickString(d, ['material_id']))
    if (mid) materialIds.add(mid)
  }

  const matMap = new Map<string, FilaSupabase>()

  function mergeRowsMateriales(rows: FilaSupabase[] | null | undefined): void {
    for (const m of rows ?? []) {
      const row = m as FilaSupabase
      const id = idNormalitzat(row[COL_MAT_ID] ?? pickString(row, ['material_id', 'id', 'codigo_material', 'cod_material']))
      if (!id) continue
      matMap.set(id, row)
      const asNum = Number(id)
      if (Number.isFinite(asNum)) matMap.set(String(asNum), row)
    }
  }

  if (materialIds.size > 0) {
    const idsArr = [...materialIds]
    const idsNumeric = idsArr.map((x) => Number(x)).filter((n) => Number.isFinite(n)) as number[]

    const { data: matsStr, error: matErr1 } = await sb.from(T_MAT).select('*').in(COL_MAT_ID, idsArr)
    if (matErr1) {
      throw new Error(matErr1.message)
    }
    mergeRowsMateriales(matsStr as FilaSupabase[])

    const faltaCatalogPerId = [...materialIds].some((id) => {
      const k = idNormalitzat(id)
      if (matMap.has(k)) return false
      const n = Number(k)
      return !(Number.isFinite(n) && matMap.has(String(n)))
    })

    /* Segona passada: `material_id` bigint vs string a `.in()` pot deixar el catàleg buit. */
    if (faltaCatalogPerId && idsNumeric.length > 0) {
      const { data: matsNum, error: matErr2 } = await sb.from(T_MAT).select('*').in(COL_MAT_ID, idsNumeric)
      if (matErr2) {
        console.warn('[distribucio] materiales (2a consulta numèrica):', matErr2.message)
      } else {
        mergeRowsMateriales(matsNum as FilaSupabase[])
      }
    }

    if (matMap.size === 0 && materialIds.size > 0) {
      console.warn(
        '[distribucio] Cap fila a «materiales» per als material_id demanats (comprova RLS, tipus id o nom de columna).',
      )
    }
  }

  /** IDs d’article comercial si la comanda els porta al detall (no pas `material_id`). */
  function idArticuloDesDeDetalle(d: FilaSupabase): string {
    return idNormalitzat(
      pickString(d, [
        'articulo_id',
        'id_articulo',
        'cod_articulo',
        'sku_articulo',
        'producto_id',
        'id_producto',
      ]),
    )
  }

  const artMap = new Map<string, FilaSupabase>()
  const T_ART = envTableOptional('VITE_SUPABASE_TABLE_ARTICULOS')

  function mergeRowsArticulos(rows: FilaSupabase[] | null | undefined, pkCol: string): void {
    for (const r of rows ?? []) {
      const row = r as FilaSupabase
      const id = idNormalitzat(row[pkCol] ?? pickString(row, ['id', 'articulo_id']))
      if (!id) continue
      artMap.set(id, row)
      const asNum = Number(id)
      if (Number.isFinite(asNum)) artMap.set(String(asNum), row)
    }
  }

  if (T_ART) {
    const COL_ART_PK = envColOptional('VITE_SUPABASE_COL_ARTICULOS_PK') ?? 'id'
    const articuloIds = new Set<string>()
    for (const d of detalles) {
      const aid = idArticuloDesDeDetalle(d)
      if (aid) articuloIds.add(aid)
    }
    if (articuloIds.size > 0) {
      const idsArr = [...articuloIds]
      const idsNumeric = idsArr.map((x) => Number(x)).filter((n) => Number.isFinite(n)) as number[]

      const { data: artStr, error: artErr1 } = await sb.from(T_ART).select('*').in(COL_ART_PK, idsArr)
      if (artErr1) {
        console.warn('[distribucio] articulos:', artErr1.message)
      } else {
        mergeRowsArticulos(artStr as FilaSupabase[], COL_ART_PK)
      }

      const faltaArt = [...articuloIds].some((id) => {
        const k = idNormalitzat(id)
        if (artMap.has(k)) return false
        const n = Number(k)
        return !(Number.isFinite(n) && artMap.has(String(n)))
      })
      if (faltaArt && idsNumeric.length > 0) {
        const { data: artNum, error: artErr2 } = await sb.from(T_ART).select('*').in(COL_ART_PK, idsNumeric)
        if (artErr2) {
          console.warn('[distribucio] articulos (2a consulta):', artErr2.message)
        } else {
          mergeRowsArticulos(artNum as FilaSupabase[], COL_ART_PK)
        }
      }
    }
  }

  function articuloDesDeMap(aid: string): FilaSupabase | undefined {
    const k = idNormalitzat(aid)
    let row = artMap.get(k)
    if (row) return row
    const n = Number(k.replace(',', '.'))
    if (Number.isFinite(n)) {
      row = artMap.get(String(n))
      if (row) return row
    }
    return undefined
  }

  function materialDesDeMap(mid: string): FilaSupabase | undefined {
    const k = idNormalitzat(mid)
    let row = matMap.get(k)
    if (row) return row
    const n = Number(k.replace(',', '.'))
    if (Number.isFinite(n)) {
      row = matMap.get(String(n))
      if (row) return row
    }
    return undefined
  }

  const linies: LiniaDistribucio[] = []
  const PES_FALLBACK_KG = 1

  for (const d of detalles) {
    const idEntrega = idNormalitzat(d[COL_ENTREGA] ?? pickString(d, ['entrega_id']))
    const idClienteDet = idNormalitzat(pickString(d, ['cliente_id', 'id_cliente']))

    let paradaIndex = 0
    if (idEntrega && entregaToParada.has(idEntrega)) {
      paradaIndex = entregaToParada.get(idEntrega)!
    } else if (idClienteDet && clienteToParada.has(idClienteDet)) {
      paradaIndex = clienteToParada.get(idClienteDet)!
    } else if (cabeceras.length === 1) {
      paradaIndex = 1
    }

    if (paradaIndex < 1) {
      console.warn('[distribucio] Línia sense parada (entrega/client)', d)
      continue
    }

    const materialId = idNormalitzat(d[COL_MAT_ID] ?? pickString(d, ['material_id']))
    if (!materialId) {
      console.warn('[distribucio] Línia sense material_id', d)
      continue
    }

    const matRow = materialDesDeMap(materialId)

    const nomComanda = nomProducteDesDeDetalleEntrega(d).trim()
    const aid = idArticuloDesDeDetalle(d)
    const artRow = aid ? articuloDesDeMap(aid) : undefined
    const nomArticle = artRow ? nomMaterialDesDeFila(artRow, '').trim() : ''
    const nomCatalog = matRow ? nomMaterialDesDeFila(matRow, '').trim() : ''

    /* Prioritat: text de la línia de comanda → article comercial → catàleg material (incl. jerarquia si no hi ha descripció). */
    let producteNom = nomComanda || nomArticle || nomCatalog
    if (!producteNom) {
      console.warn(
        '[distribucio] Sense descripció comercial: es mostra material_id (afegeix columna al detall o descripció a materiales). material_id=',
        materialId,
      )
      producteNom = materialId
    }

    let quantitat = pickNumber(d, ['cantidad', 'cantidad_entregada', 'unidades'])
    const unitatRaw = pickString(d, ['unidad_medida', 'unidad', 'tipo_unidad'])
    const unitat = normalitzarUnitat(unitatRaw !== '' ? unitatRaw : d.unidad_medida)

    if (unitat === 'CAIXA' && Number.isFinite(quantitat)) {
      quantitat = Math.round(quantitat)
    }

    if (!Number.isFinite(quantitat) || quantitat <= 0 || !unitat) {
      console.warn('[distribucio] Línia incompleta (quantitat/unitat)', d)
      continue
    }

    let pesKgPerUnitat = matRow ? pesKgPerUnitatDesDeMaterial(matRow, unitat) : NaN
    if (!Number.isFinite(pesKgPerUnitat) || pesKgPerUnitat <= 0) {
      pesKgPerUnitat = pickNumber(d, ['peso_kg_unidad', 'pes_kg_per_unitat', 'peso_unitario'])
    }
    if (!Number.isFinite(pesKgPerUnitat) || pesKgPerUnitat <= 0) {
      pesKgPerUnitat = PES_FALLBACK_KG
      console.warn('[distribucio] Pes absent o zero per material', materialId, '— s’usa', PES_FALLBACK_KG, 'kg')
    }

    const ec = idEntrega ? entregaToClient.get(idEntrega) : undefined
    let clienteIdLinia = ''
    let empresaNomLinia = ''
    if (ec) {
      clienteIdLinia = ec.id
      empresaNomLinia = ec.nom
    } else if (idClienteDet) {
      clienteIdLinia = idClienteDet
      const cli = clientMap.get(idClienteDet)
      empresaNomLinia = cli ? pickString(cli, ['nombre']) || `Client ${idClienteDet}` : `Client ${idClienteDet}`
    } else {
      const cab = cabeceras[paradaIndex - 1]
      const cidCab = cab ? idNormalitzat(cab[COL_CLIENTE_CAB]) : ''
      if (cidCab) {
        clienteIdLinia = cidCab
        const cli = clientMap.get(cidCab)
        empresaNomLinia = cli ? pickString(cli, ['nombre']) || `Client ${cidCab}` : `Client ${cidCab}`
      }
    }

    linies.push({
      paradaIndex,
      producteId: materialId,
      producteNom,
      materialId,
      materialNom: nomCatalog || nomArticle || producteNom,
      quantitat,
      unitat,
      pesKgPerUnitat,
      clienteId: clienteIdLinia || undefined,
      empresaNom: empresaNomLinia || undefined,
    })
  }

  return linies
}

/**
 * Fusiona línies de diversos `transporte_id` en una sola ruta, ajustant `paradaIndex` a l’ordre global de parades.
 */
export async function fetchLiniesDistribucioEmpresaDesDeOrdre(
  rutaId: string,
  ordreEntregues: ReadonlyArray<OrdreEntregaRuta>,
): Promise<LiniaDistribucio[]> {
  if (ordreEntregues.length === 0) return []

  const sb = getSupabaseBrowser()
  if (!sb) {
    throw new Error('Supabase no està configurat (falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY).')
  }

  const T_CAB = envTableVar('VITE_SUPABASE_TABLE_CABECERA', 'cabecera_transporte')
  const COL_ENTREGA = 'entrega_id'
  const COL_TRANSPORTE = 'transporte_id'

  const posicionsPerClau = new Map<string, number[]>()
  for (let i = 0; i < ordreEntregues.length; i++) {
    const o = ordreEntregues[i]!
    const k = `${o.transporteId}|${o.entregaId}`
    const arr = posicionsPerClau.get(k) ?? []
    arr.push(i + 1)
    posicionsPerClau.set(k, arr)
  }

  const tids = [...new Set(ordreEntregues.map((x) => x.transporteId))].filter((n) => Number.isFinite(n)) as number[]
  if (tids.length === 0) return []

  const { data: cabAll, error: cabErr } = await sb
    .from(T_CAB)
    .select('*')
    .in(COL_TRANSPORTE, tids)
    .order(COL_ENTREGA, { ascending: true })

  if (cabErr) {
    throw new Error(cabErr.message)
  }

  const cabByTid = new Map<number, FilaSupabase[]>()
  for (const row of cabAll ?? []) {
    const r = row as FilaSupabase
    const tid = Number(r[COL_TRANSPORTE])
    if (!Number.isFinite(tid)) continue
    const arr = cabByTid.get(tid) ?? []
    arr.push(r)
    cabByTid.set(tid, arr)
  }
  for (const arr of cabByTid.values()) {
    arr.sort((a, b) => Number(a[COL_ENTREGA]) - Number(b[COL_ENTREGA]))
  }

  const liniesOut: LiniaDistribucio[] = []
  let lineKey = 0

  for (const tid of tids) {
    let liniesT: LiniaDistribucio[]
    try {
      liniesT = await fetchLiniesDistribucioEmpresa(rutaId, tid)
    } catch {
      continue
    }

    const cabRows = cabByTid.get(tid) ?? []

    for (const lin of liniesT) {
      const localP = lin.paradaIndex
      const cab = cabRows[localP - 1]
      const eid = idNormalitzat(cab?.[COL_ENTREGA] ?? pickString(cab as FilaSupabase, ['entrega_id']))
      if (!eid) continue

      const poss = posicionsPerClau.get(`${tid}|${eid}`)
      if (!poss?.length) continue

      for (const g of poss) {
        liniesOut.push({
          ...lin,
          paradaIndex: g,
          producteId: `${lin.materialId}-${tid}-${lineKey++}`,
        })
      }
    }
  }

  return liniesOut
}
