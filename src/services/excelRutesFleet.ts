import type { LiniaDistribucio, UnitatVolum } from '@/domain/palletPacking'
import { capacitatCaixesCamio } from '@/domain/palletPacking'
import type { TipusCamio } from '@/models/Camio'
import { TipusCamio as TipusCamioConst } from '@/models/Camio'
import type { ParadaRuta } from '@/models/Ruta'
import { Ruta } from '@/models/Ruta'

type ExcelCoord = { x: number; y: number }

type ExcelPedido = {
  nom: string
  producte: string
  tipusCarrega: string
  factorCaixesPerUnitat?: number
  quantitatCaixes: number
  volumTotal: number
}

type ExcelEntrega = {
  identificador: string
  coordenades: ExcelCoord
  volumTotal: number
  horaInici: string | null
  horaFinal: string | null
  /** Hora aproximada d’arribada (backend / planificador); prioritat sobre `horaInici`. */
  arribadaHoraAproximada?: string | null
  sortidaHoraAproximada?: string | null
  pedidos: ExcelPedido[]
}

type ExcelRutaBloc = {
  camio: { id: string; capacitatMaxima: number }
  horaSortidaMagatzem: string
  horaTornadaMagatzem: string
  entregues: ExcelEntrega[]
}

export type ExcelRutesDocument = {
  magatzem: ExcelCoord
  rutes: ExcelRutaBloc[]
}

function codiTipusCarrega(raw: string | undefined): string {
  if (raw == null || String(raw).trim() === '') return ''
  const t = String(raw).trim().toUpperCase()
  const token = (t.split(/[\s\-_/]+/)[0] ?? '').trim()
  if (token.startsWith('CAJ')) return 'CAJ'
  if (token.startsWith('BRL')) return 'BRL'
  if (token === 'UN') return 'UN'
  return ''
}

function unitatIQuantitatDesDePedido(p: ExcelPedido): { unitat: UnitatVolum; quantitat: number } {
  const codi = codiTipusCarrega(p.tipusCarrega)
  const qRaw = Number(p.quantitatCaixes)
  const q = Number.isFinite(qRaw) ? Math.max(0, Math.floor(qRaw)) : 0

  if (codi === 'CAJ') return { unitat: 'CAIXA', quantitat: q }
  if (codi === 'BRL') return { unitat: 'BARRIL', quantitat: q }
  if (codi === 'UN') return { unitat: 'LLAUNA', quantitat: q }

  const gen = Math.max(1, Math.ceil(q / 12))
  return { unitat: 'CAIXA', quantitat: gen }
}

function pesKgPerUnitatDefecte(unitat: UnitatVolum): number {
  switch (unitat) {
    case 'CAIXA':
      return 12
    case 'LLAUNA':
      return 0.5
    case 'BARRIL':
      return 40
    default: {
      const _: never = unitat
      return _
    }
  }
}

function materialIdDesProducte(producte: string, idx: number): string {
  const base = producte.trim().slice(0, 64)
  const slug = base.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '')
  return slug ? `EXCEL:${slug}` : `EXCEL:idx-${idx}`
}

function tipusCamioDesCapacitatExcel(capacitatMaxima: number): TipusCamio {
  const petit = capacitatCaixesCamio(TipusCamioConst.Petit)
  const mitja = capacitatCaixesCamio(TipusCamioConst.Mitja)
  const gran = capacitatCaixesCamio(TipusCamioConst.Gran)
  const v = Number(capacitatMaxima)
  if (!Number.isFinite(v)) return TipusCamioConst.Mitja

  const dist = [
    { t: TipusCamioConst.Petit, d: Math.abs(v - petit) },
    { t: TipusCamioConst.Mitja, d: Math.abs(v - mitja) },
    { t: TipusCamioConst.Gran, d: Math.abs(v - gran) },
  ].sort((a, b) => a.d - b.d)
  return dist[0]!.t
}

function paradesMagatzem(
  magatzem: ExcelCoord,
  horaSortida: string,
  horaTornada: string,
): [ParadaRuta, ParadaRuta] {
  const lat = magatzem.y
  const lng = magatzem.x
  return [
    {
      nom: 'Magatzem — sortida',
      lat,
      lng,
      horaArribadaAprox: horaSortida,
    },
    {
      nom: 'Magatzem — tornada',
      lat,
      lng,
      horaArribadaAprox: horaTornada,
    },
  ]
}

function nomEntrega(e: ExcelEntrega): string {
  const primer = e.pedidos[0]?.nom?.trim()
  if (primer) return primer
  const parts = e.identificador.split('__')
  if (parts.length >= 2 && parts[1]) return parts[1]!.trim()
  return e.identificador
}

function idEntregaBase(e: ExcelEntrega): string {
  // El backend a vegades afegeix un sufix aleatori a `identificador` (ex: __adg72om8).
  // Ens quedem amb "dia__nom" per detectar duplicats de la mateixa empresa.
  const parts = e.identificador.split('__').map((p) => p.trim()).filter(Boolean)
  if (parts.length >= 2) return `${parts[0]}__${parts[1]}`
  return e.identificador.trim()
}

function horaArribadaDesEntrega(e: ExcelEntrega): string {
  const a = e.arribadaHoraAproximada?.trim()
  if (a) return a
  const hi = e.horaInici?.trim()
  if (hi) return hi
  const hf = e.horaFinal?.trim()
  if (hf) return hf
  return '—'
}

function isMateixaUbicacio(a: ExcelCoord, b: ExcelCoord): boolean {
  const eps = 1e-6
  return Math.abs(a.x - b.x) <= eps && Math.abs(a.y - b.y) <= eps
}

function compactarEntreguesConsecutives(entregues: ExcelEntrega[]): ExcelEntrega[] {
  if (entregues.length <= 1) return entregues
  const out: ExcelEntrega[] = []
  for (const e of entregues) {
    const prev = out[out.length - 1]
    if (
      prev &&
      idEntregaBase(prev) === idEntregaBase(e) &&
      nomEntrega(prev).trim().toUpperCase() === nomEntrega(e).trim().toUpperCase() &&
      isMateixaUbicacio(prev.coordenades, e.coordenades)
    ) {
      // Merge sense reordenar la ruta: només compactem si són consecutives.
      prev.pedidos = [...prev.pedidos, ...e.pedidos]
      prev.volumTotal = Number(prev.volumTotal) + Number(e.volumTotal || 0)
      // Manté la primera hora aproximada si ja existeix; sinó, agafa la nova.
      if (!prev.arribadaHoraAproximada && e.arribadaHoraAproximada) {
        prev.arribadaHoraAproximada = e.arribadaHoraAproximada
      }
      if (!prev.sortidaHoraAproximada && e.sortidaHoraAproximada) {
        prev.sortidaHoraAproximada = e.sortidaHoraAproximada
      }
      continue
    }
    out.push({ ...e, pedidos: [...e.pedidos] })
  }
  return out
}

function entregaAParada(e: ExcelEntrega): ParadaRuta {
  return {
    nom: nomEntrega(e),
    lat: e.coordenades.y,
    lng: e.coordenades.x,
    horaArribadaAprox: horaArribadaDesEntrega(e),
    clienteId: idEntregaBase(e),
  }
}

function liniesDesEntregues(rutaId: string, entregues: ExcelEntrega[]): LiniaDistribucio[] {
  const out: LiniaDistribucio[] = []
  let idxGlobal = 0

  entregues.forEach((entrega, ei) => {
    const paradaIndex = 1 + ei
    entrega.pedidos.forEach((p, pi) => {
      const { unitat, quantitat } = unitatIQuantitatDesDePedido(p)
      if (quantitat <= 0) return

      const producte = String(p.producte ?? '').trim() || `Producte ${pi + 1}`
      const empresa = String(p.nom ?? '').trim() || nomEntrega(entrega)
      idxGlobal += 1

      out.push({
        paradaIndex,
        producteId: `${rutaId}-e${ei}-p${pi}`,
        producteNom: producte,
        materialId: materialIdDesProducte(producte, idxGlobal),
        materialNom: producte,
        quantitat,
        unitat,
        pesKgPerUnitat: pesKgPerUnitatDefecte(unitat),
        clienteId: idEntregaBase(entrega),
        empresaNom: empresa,
      })
    })
  })

  return out
}

export type ResultatCarregaExcelRutes = {
  rutes: Ruta[]
  liniesPerRutaId: Record<string, LiniaDistribucio[]>
  /** `camio.id` del JSON Excel per assignar la ruta al camió correcte (si coincideix amb `Camio.codi` o àlies). */
  codiCamioExcelPerRutaId: Record<string, string>
}

/**
 * Construeix `Ruta` + línies de distribució des del JSON generat pel backend (`output/excel-rutes.json`).
 */
export function carregarRutesILiniesDesExcel(doc: ExcelRutesDocument): ResultatCarregaExcelRutes {
  const liniesPerRutaId: Record<string, LiniaDistribucio[]> = {}
  const codiCamioExcelPerRutaId: Record<string, string> = {}
  const rutes: Ruta[] = []

  doc.rutes.forEach((bloc, i) => {
    const rutaId = `excel-ruta-${String(i + 1).padStart(2, '0')}`
    const tipus = tipusCamioDesCapacitatExcel(bloc.camio.capacitatMaxima)
    const codiExcel = String(bloc.camio?.id ?? '').trim()
    codiCamioExcelPerRutaId[rutaId] = codiExcel
    const [sortida, tornada] = paradesMagatzem(
      doc.magatzem,
      bloc.horaSortidaMagatzem,
      bloc.horaTornadaMagatzem,
    )
    const entreguesCompactes = compactarEntreguesConsecutives(bloc.entregues)
    const intermedies = entreguesCompactes.map(entregaAParada)
    const parades: ParadaRuta[] = [sortida, ...intermedies, tornada]

    rutes.push(new Ruta(rutaId, parades, tipus, null, null))
    liniesPerRutaId[rutaId] = liniesDesEntregues(rutaId, entreguesCompactes)
  })

  return { rutes, liniesPerRutaId, codiCamioExcelPerRutaId }
}
