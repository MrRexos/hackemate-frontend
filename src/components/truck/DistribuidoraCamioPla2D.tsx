/* eslint-disable react-refresh/only-export-components -- graellaPalets i catCarrega: helpers compartits amb altres vistes */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import truckImg from '@/assets/img/truck_top.png'
import { buttonCn } from '@/components/ui/Button'
import {
  CAIXES_PER_PALLET,
  compararFragmentPerBasePrimer,
  paletsMaximsPerTipus,
} from '@/domain/palletPacking'
import type { FragmentPalet, PaletOmplert, PlaCarrega } from '@/domain/palletPacking'
import type { TipusCamio } from '@/models/Camio'

/* ─── Types ──────────────────────────────────────────────────────────────── */

type Props = {
  pla: PlaCarrega
  tipusCamio: TipusCamio
  teDesbordament?: boolean
  /** Només destaca i mostra la mercaderia d’aquesta parada (índex a la ruta, mateix que `FragmentPalet.paradaIndex`). */
  paradaEntregaIndex?: number
  /** Vista més petita (p. ex. modal conductor). */
  compacte?: boolean
  /** Escala el dibuix perquè càpiga al contenidor (sense scroll). */
  encaixaSenseScroll?: boolean
  /** Amaga la llegenda de categories (p. ex. modal conductor amb poc espai). */
  senseLlegenda?: boolean
  /** Parades ja descarregades: els fragments es treuen de la vista sense recalcular el pla (la pila es compacta sola). */
  paradesCompletades?: ReadonlySet<number>
  /** Parades arribades però cancel·lades (no entregades). */
  paradesCancelades?: ReadonlySet<number>
}

export function graellaPalets(nPalets: number): { cols: number; rows: number } {
  if (nPalets <= 3) return { cols: nPalets, rows: 1 }
  if (nPalets === 6) return { cols: 3, rows: 2 }
  if (nPalets === 8) return { cols: 4, rows: 2 }
  return { cols: Math.ceil(nPalets / 2), rows: 2 }
}

function celdaGrid(ordre: number, cols: number, rows: number) {
  if (rows === 2) {
    // Ordre visual en columnes d'esquerra a dreta:
    // fila superior: 1,3,5... | fila inferior: 2,4,6...
    const pairIndex = Math.floor((ordre - 1) / 2)
    return {
      row: ordre % 2 === 1 ? 1 : 2,
      col: pairIndex + 1,
    }
  }
  const i = ordre - 1
  return { row: Math.floor(i / cols) + 1, col: (i % cols) + 1 }
}

function paletPerOrdre(pla: PlaCarrega, nPalets: number, ordre: number): PaletOmplert {
  return pla.palets.find((p) => nPalets - p.index === ordre) ?? pla.palets[ordre - 1]
}

type SegmentMiniaturaPalet = {
  cat: CatCarrega
  volum: number
}

const EPS_PIS = 1e-6

function segmentsMiniaturaPerCategoria(frags: readonly FragmentPalet[]): SegmentMiniaturaPalet[] {
  const ordreCats: CatCarrega[] = ['retornable', 'barril', 'caja', 'lata', 'otros']
  const acum = new Map<CatCarrega, number>()
  for (const f of frags) {
    const c = catCarrega(f)
    acum.set(c, (acum.get(c) ?? 0) + Math.max(0, f.volumCaixes))
  }
  const out = ordreCats
    .map((cat) => ({ cat, volum: acum.get(cat) ?? 0 }))
    .filter((x) => x.volum > EPS_PIS)
  const total = out.reduce((s, x) => s + x.volum, 0)
  if (total <= EPS_PIS) return []
  return out
}

/** Nom de producte llegible (mai mostrar `material_id` com si fos nom). */
function nomProducteVisible(f: FragmentPalet): string {
  const nom = f.producteNom?.trim() ?? ''
  const mat = f.materialNom?.trim() ?? ''
  const mid = f.producteId?.trim() ?? ''
  const esId = (s: string) => /^\d+$/.test(s)
  if (nom && !(esId(nom) && mid && nom === mid)) return nom
  if (mat && !(esId(mat) && mid && mat === mid)) return mat
  return nom || mat || 'Producte sense nom'
}

function etiquetaQuantitat(f: FragmentPalet): { label: string; valor: string } {
  const u = f.unitat ?? 'CAIXA'
  const q = f.quantitatUnitatComanda
  if (u === 'CAIXA') return { label: 'Caixes', valor: String(q) }
  if (u === 'LLAUNA') return { label: 'Llaunes', valor: String(q) }
  return { label: 'Barrils', valor: String(q) }
}

function clientEntrega(f: FragmentPalet): string {
  return (f.empresaNom ?? f.paradaNom ?? '').trim() || '—'
}

/** Mateix producte + mateixa empresa (sense parada): per ajuntar línies del mateix palet. */
function clauMergeMateixProducteEmpresa(f: FragmentPalet): string {
  const emp =
    (f.empresaNom ?? '').trim().toLowerCase() ||
    (f.paradaNom ?? '').trim().toLowerCase()
  const cli = (f.clienteId ?? '').trim()
  const u = f.unitat ?? 'CAIXA'
  const ret = f.esRetornable === true ? '1' : '0'
  return `${f.producteId}\x1e${u}\x1e${ret}\x1e${cli}\x1e${emp}`
}

type GrupOrdreCarregaPalet = {
  clau: string
  representant: FragmentPalet
  quantitatTotal: number
  fragments: FragmentPalet[]
  minOrdreIdx: number
}

function agrupaOrdreCarregaMateixProducteEmpresa(
  ordreDesDeBase: readonly FragmentPalet[],
): GrupOrdreCarregaPalet[] {
  const ordreClaus: string[] = []
  const mapa = new Map<string, { frags: FragmentPalet[]; minIdx: number }>()
  for (let i = 0; i < ordreDesDeBase.length; i++) {
    const f = ordreDesDeBase[i]!
    const clau = clauMergeMateixProducteEmpresa(f)
    let bucket = mapa.get(clau)
    if (!bucket) {
      bucket = { frags: [], minIdx: i }
      mapa.set(clau, bucket)
      ordreClaus.push(clau)
    }
    bucket.frags.push(f)
    bucket.minIdx = Math.min(bucket.minIdx, i)
  }
  return ordreClaus
    .map((clau) => {
      const b = mapa.get(clau)!
      const representant = b.frags[0]!
      const quantitatTotal = b.frags.reduce((s, x) => s + x.quantitatUnitatComanda, 0)
      return {
        clau,
        representant,
        quantitatTotal,
        fragments: b.frags,
        minOrdreIdx: b.minIdx,
      }
    })
    .sort((a, b) => a.minOrdreIdx - b.minOrdreIdx)
}

/* ─── Categoria de càrrega ───────────────────────────────────────────────── */

export type CatCarrega = 'caja' | 'barril' | 'lata' | 'retornable' | 'otros'

export function catCarrega(f: FragmentPalet): CatCarrega {
  if (f.esRetornable) return 'retornable'
  const s = `${f.materialNom} ${f.producteNom}`.toLowerCase()
  if (s.includes('retorn')) return 'retornable'
  if (f.unitat === 'BARRIL' || s.includes('barril') || s.includes('bidó')) return 'barril'
  if (f.unitat === 'LLAUNA' || s.includes('lata') || s.includes('llaun')) return 'lata'
  if (f.unitat === 'CAIXA') return 'caja'
  return 'otros'
}

const CAT_COLOR: Record<CatCarrega, string> = {
  caja:       '#E08070',
  barril:     '#C8B8A4',
  lata:       '#7AAED8',
  retornable: '#6AB87A',
  otros:      '#B09CD8',
}
const CAT_LABEL: Record<CatCarrega, string> = {
  caja: 'Caixa',
  barril: 'Barril',
  lata: 'Llauna',
  retornable: 'Retornable',
  otros: 'Altres',
}

/* ─── Cel·la palet ───────────────────────────────────────────────────────── */

function CeldaPalet({
  palet,
  ordreCabina,
  actiu,
  onSelect,
  paradaEntregaIndex,
  paradesCompletades,
}: {
  palet: PaletOmplert
  ordreCabina: number
  actiu: boolean
  onSelect: (paletIndex: number) => void
  paradaEntregaIndex?: number
  paradesCompletades?: ReadonlySet<number>
}) {
  const encaraAlCamio = palet.fragments.filter(
    (f) => f.esRetornable === true || !paradesCompletades?.has(f.paradaIndex),
  )
  const fragsMostrats =
    paradaEntregaIndex === undefined
      ? encaraAlCamio
      : encaraAlCamio.filter((f) => f.paradaIndex === paradaEntregaIndex)
  const filtreParada = paradaEntregaIndex !== undefined
  const senseMercaderiaAqui = filtreParada && fragsMostrats.length === 0
  const buit = fragsMostrats.length === 0
  const segsMini = segmentsMiniaturaPerCategoria(fragsMostrats)

  const destacatEntrega = filtreParada && fragsMostrats.length > 0
  const ringClass = senseMercaderiaAqui
    ? ''
    : actiu
      ? 'ring-[3px] ring-red-600 ring-offset-2'
      : destacatEntrega
        ? 'ring-[3px] ring-emerald-600 ring-offset-2'
        : 'hover:ring-2 hover:ring-slate-400/50'

  return (
    <button
      className={`group relative h-full w-full overflow-hidden rounded-md outline-none transition-all ${
        senseMercaderiaAqui ? 'cursor-not-allowed opacity-[0.28] pointer-events-none' : ''
      } ${ringClass}`}
      disabled={senseMercaderiaAqui}
      onClick={() => onSelect(palet.index)}
      type="button"
    >
      {/* Fons fusta */}
      <div className="absolute inset-0 rounded-md" style={{ background: '#F0E4C4' }} />
      {/* Llistons */}
      <div className="pointer-events-none absolute inset-[5%] flex flex-col gap-[4%]">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="flex-1 rounded-[1px]"
            style={{
              background: i % 2 === 0 ? '#A0622A' : '#C47D3A',
              opacity: 0.7,
            }}
          />
        ))}
      </div>
      {/* Vora palet */}
      <div className="pointer-events-none absolute inset-0 rounded-md border-2 border-[#7A4820]/50" />

      {/* Càrrega: miniatura simplificada per categoria, proporcional al volum real del palet. */}
      {!buit && (
        <div className="pointer-events-none absolute inset-[3%] bottom-[5%] z-[2] flex flex-col justify-end rounded-[2px] shadow-[inset_0_1px_4px_rgba(45,35,20,0.18)]">
          <div className="flex min-h-0 h-full w-full flex-col gap-[4px]">
            {segsMini.map((seg) => (
              <div
                key={`seg-${palet.index}-${seg.cat}`}
                className="relative w-full min-h-[10px] overflow-hidden rounded-[4px] border border-black/12"
                style={{
                  flexGrow: Math.max(0.12, seg.volum / CAIXES_PER_PALLET),
                  flexShrink: 1,
                  flexBasis: 0,
                  background: CAT_COLOR[seg.cat],
                  opacity: 0.86,
                }}
                title={`${CAT_LABEL[seg.cat]} · ${seg.volum.toFixed(1)} caixes eq.`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Número */}
      <div className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center">
        <div
          className="flex items-center justify-center rounded-full border-2 border-slate-400/90 bg-white/88 font-bold text-slate-900 shadow-md backdrop-blur-[1px]"
          style={{
            width: 'clamp(1.25rem, 22%, 1.75rem)',
            height: 'clamp(1.25rem, 22%, 1.75rem)',
            fontSize: 'clamp(0.55rem, 1.75vw, 0.78rem)',
          }}
        >
          {ordreCabina}
        </div>
      </div>

    </button>
  )
}

/* ─── Modal detall ───────────────────────────────────────────────────────── */

function ModalDetall({
  palet,
  onTancar,
  paradaEntregaIndex,
  paradesCompletades,
  paradesCancelades,
}: {
  palet: PaletOmplert
  onTancar: () => void
  paradaEntregaIndex?: number
  paradesCompletades?: ReadonlySet<number>
  paradesCancelades?: ReadonlySet<number>
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onTancar()
    }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onTancar])

  const totsFrags = palet.fragments.filter(
    (f) => f.esRetornable === true || !paradesCompletades?.has(f.paradaIndex),
  )
  const enContextRuta = paradaEntregaIndex !== undefined
  const enContextRetornable =
    paradaEntregaIndex !== undefined &&
    totsFrags.some((f) => f.paradaIndex === paradaEntregaIndex && f.esRetornable === true)

  /** Ordre cap a la base (terra primer): el mateix criteri que `compararFragmentPerBasePrimer`. */
  const ordreDesDeBase = useMemo(
    () => [...totsFrags].sort((a, b) => compararFragmentPerBasePrimer(a, b)),
    [totsFrags, palet.index],
  )

  const grupsCarrega = useMemo(
    () => agrupaOrdreCarregaMateixProducteEmpresa(ordreDesDeBase),
    [ordreDesDeBase],
  )

  const n = grupsCarrega.length

  return (
    <div
      aria-modal
      role="dialog"
      className="fixed inset-0 z-[2100] flex items-end justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-4"
    >
      <button aria-label="Tancar" className="absolute inset-0 bg-black/40" onClick={onTancar} type="button" />
      <div className="relative z-10 flex max-h-[min(92dvh,880px)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {enContextRetornable
                ? 'Envasos retornats'
                : enContextRuta
                  ? 'Productes a lliurar'
                  : 'Ordre de càrrega'}
            </h3>
            
            {paradaEntregaIndex !== undefined ? (
              <p className="mt-1.5 text-xs text-slate-500">
                {enContextRetornable
                  ? 'Emmagatzema aquí els envasos retornats:'
                  : 'Verd: descàrrega en aquest punt · Gris: altres parades'}
              </p>
            ) : null}
          </div>
          <button
            className={buttonCn('outline', 'default', 'shrink-0 px-3 py-1.5')}
            onClick={onTancar}
            type="button"
          >
            Tancar
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-4 py-3 sm:px-5 sm:py-4">
          {totsFrags.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-10">
              <p className="text-center text-sm text-slate-500">Sense càrrega en aquest palet.</p>
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50/80">
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                <ul className="divide-y divide-slate-200">
                  {grupsCarrega.map((grup, idxVisual) => {
                    const f = grup.representant
                    const pasDesDeBase = idxVisual + 1
                    const nom = nomProducteVisible(f)
                    const client = clientEntrega(f)
                    const qInfo = etiquetaQuantitat({
                      ...f,
                      quantitatUnitatComanda: grup.quantitatTotal,
                    })
                    const cat = catCarrega(f)
                    const colorCat = CAT_COLOR[cat]
                    const descarregarAqui =
                      paradaEntregaIndex !== undefined &&
                      grup.fragments.some((x) => x.paradaIndex === paradaEntregaIndex)
                    const teEntregaCancelada =
                      paradaEntregaIndex !== undefined &&
                      grup.fragments.some((x) => paradesCancelades?.has(x.paradaIndex))
                    const esPrimer = pasDesDeBase === 1
                    const esDarrer = pasDesDeBase === n
                    const nLiniesAgrupades = grup.fragments.length
                    return (
                      <li
                        className={`flex gap-3 px-3 py-2.5 sm:px-4 ${
                          paradaEntregaIndex !== undefined
                            ? descarregarAqui
                              ? 'bg-emerald-50/95'
                              : 'bg-slate-100/60 opacity-85'
                            : 'bg-white'
                        }`}
                        key={`${palet.index}-${grup.clau}-${grup.minOrdreIdx}`}
                      >
                        <div className="flex shrink-0 flex-col items-center gap-0.5 pt-0.5">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                              esPrimer
                                ? 'bg-amber-100 text-amber-950 ring-2 ring-amber-400/80'
                                : esDarrer
                                  ? 'bg-slate-200 text-slate-800'
                                  : 'bg-slate-200/90 text-slate-800'
                            }`}
                            title={
                              esPrimer
                                ? 'Col·locar primer (terra del palet)'
                                : esDarrer
                                  ? 'Darrera capa (damunt del palet)'
                                  : `Capa ${pasDesDeBase} des de la base`
                            }
                          >
                            {pasDesDeBase}
                          </span>
                        </div>
                        <div
                          aria-hidden
                          className="mt-0.5 w-2 shrink-0 self-stretch rounded-sm"
                          style={{ background: colorCat, minHeight: '2.75rem' }}
                          title={CAT_LABEL[cat]}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span
                              className="inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white"
                              style={{ background: colorCat }}
                            >
                              {CAT_LABEL[cat]}
                            </span>
                            {esPrimer ? (
                              <span className="text-[0.65rem] font-semibold uppercase text-amber-800">
                                Primer a col·locar
                              </span>
                            ) : null}
                            {esDarrer && n > 1 ? (
                              <span className="text-[0.65rem] font-medium text-slate-500">Damunt del tot</span>
                            ) : null}
                          </div>
                          <p className="text-sm text-slate-900">
                            <span className="text-slate-500">Producte:</span>{' '}
                            <span className="font-medium">{nom}</span>
                          </p>
                          <p className="mt-1 text-sm text-slate-900">
                            <span className="text-slate-500">Client:</span>{' '}
                            <span className="font-medium">{client}</span>
                          </p>
                          <p className="mt-1 text-sm text-slate-900">
                            <span className="text-slate-500">{qInfo.label}:</span>{' '}
                            <span className="font-medium">{qInfo.valor}</span>
                            {nLiniesAgrupades > 1 ? (
                              <span className="ml-1.5 text-xs font-normal text-slate-500">
                                (suma de {nLiniesAgrupades} línies)
                              </span>
                            ) : null}
                          </p>
                          {paradaEntregaIndex !== undefined ? (
                            <p className="mt-1.5 text-[0.65rem] text-slate-600">
                              {teEntregaCancelada ? (
                                <span className="font-semibold text-rose-700">Entrega cancel·lada</span>
                              ) : descarregarAqui ? (
                                <span className="font-medium text-emerald-800">Descarregar en aquest punt</span>
                              ) : (
                                <span>Altres entregues — mantenir al camió</span>
                              )}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Llegenda ───────────────────────────────────────────────────────────── */

function Llegenda() {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 border-t border-slate-200 pt-3">
      {(Object.keys(CAT_LABEL) as CatCarrega[]).map((cat) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700" key={cat}>
          <span
            style={{
              background: CAT_COLOR[cat],
              display: 'inline-block',
              width: cat === 'barril' ? '0.75rem' : '1rem',
              height: '0.75rem',
              borderRadius: cat === 'barril' ? '50%' : '2px',
              opacity: 0.85,
            }}
          />
          {CAT_LABEL[cat]}
        </div>
      ))}
    </div>
  )
}

/* ─── Component principal ────────────────────────────────────────────────── */

export function DistribuidoraCamioPla2D({
  pla,
  tipusCamio,
  teDesbordament,
  paradaEntregaIndex,
  compacte,
  encaixaSenseScroll,
  senseLlegenda,
  paradesCompletades,
  paradesCancelades,
}: Props) {
  const nPalets = paletsMaximsPerTipus(tipusCamio)
  const { cols, rows } = graellaPalets(nPalets)
  const [selIndex, setSelIndex] = useState<number | null>(null)
  const onTancar = useCallback(() => setSelIndex(null), [])
  const sel = useMemo(
    () => (selIndex == null ? null : pla.palets.find((p) => p.index === selIndex) ?? null),
    [pla.palets, selIndex],
  )

  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [escalaEncaix, setEscalaEncaix] = useState(1)

  const sc = compacte ? 0.72 : 1
  /** Miniatures una mica més grans per veure millor barrils/caixes des de fora. */
  const paletW = Math.round((rows === 1 ? 198 : 206) * sc)
  const paletH = Math.round((rows === 1 ? 148 : 130) * sc)
  const gridGap = Math.round(9 * sc)
  const gridPad = Math.round(14 * sc)
  const boxHeight = rows * paletH + (rows - 1) * gridGap + gridPad * 2
  const boxWidth = cols * paletW + (cols - 1) * gridGap + gridPad * 2 + Math.round(58 * sc)
  const cabinaWidth = Math.round((rows === 1 ? 180 : 222) * sc)

  useLayoutEffect(() => {
    if (!encaixaSenseScroll) return
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    const update = () => {
      const ow = outer.clientWidth
      const oh = outer.clientHeight
      const iw = inner.scrollWidth
      const ih = inner.scrollHeight
      if (iw <= 0 || ih <= 0) return
      const marge = 10
      const sx = (ow - marge) / iw
      const sy = oh > marge ? (oh - marge) / ih : 1
      const s = Math.min(1, sx, sy)
      setEscalaEncaix((prev) => (Math.abs(prev - s) < 0.002 ? prev : s))
    }

    update()
    const ro = new ResizeObserver(() => requestAnimationFrame(update))
    ro.observe(outer)
    ro.observe(inner)
    const raf = requestAnimationFrame(update)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [encaixaSenseScroll, pla, tipusCamio, compacte, teDesbordament, paradaEntregaIndex, paradesCompletades])

  const cosCamio = (
    <div className="relative w-fit">
      {teDesbordament && (
        <div className="absolute right-3 top-3 z-10 rounded border border-amber-400 bg-amber-100 px-2.5 py-1 text-[0.65rem] font-semibold text-amber-900">
          Excés de volum
        </div>
      )}

      <div className="relative mx-auto flex w-fit items-center gap-0">
        <div className="shrink-0" style={{ width: `${cabinaWidth}px`, height: `${boxHeight}px` }}>
          <img alt="Cabina del camió (vista superior)" className="h-full w-full object-contain" src={truckImg} />
        </div>

        <div className="-ml-10 shrink-0 rounded-[20px] border border-[#EAE4D8] bg-[#FFF9F2] p-[14px]" style={{ width: `${boxWidth}px` }}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${paletW}px)`,
              gridTemplateRows: `repeat(${rows}, ${paletH}px)`,
              gap: `${gridGap}px`,
            }}
          >
            {Array.from({ length: nPalets }, (_, i) => {
              const ordre = i + 1
              const palet = paletPerOrdre(pla, nPalets, ordre)
              const { row, col } = celdaGrid(ordre, cols, rows)
              return (
                <div className="min-h-0 min-w-0" key={palet.index} style={{ gridColumn: col, gridRow: row }}>
                  <CeldaPalet
                    actiu={selIndex === palet.index}
                    onSelect={setSelIndex}
                    ordreCabina={ordre}
                    palet={palet}
                    paradaEntregaIndex={paradaEntregaIndex}
                    paradesCompletades={paradesCompletades}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )

  const paddingCaixa = encaixaSenseScroll ? 'p-2' : 'p-5'

  return (
    <div
      ref={encaixaSenseScroll ? outerRef : undefined}
      className={`relative mx-auto h-full min-h-0 w-full max-w-full rounded-2xl bg-[#F0E9DF] ${paddingCaixa} ${
        encaixaSenseScroll
          ? 'flex flex-1 flex-col items-center justify-center overflow-hidden'
          : 'flex flex-col items-center overflow-x-auto'
      }`}
    >
      {encaixaSenseScroll ? (
        <div
          ref={innerRef}
          className="w-fit shrink-0"
          style={{
            transform: `scale(${escalaEncaix})`,
            transformOrigin: 'center center',
          }}
        >
          {cosCamio}
        </div>
      ) : (
        cosCamio
      )}

      {!senseLlegenda ? <Llegenda /> : null}

      {sel && (
        <ModalDetall
          onTancar={onTancar}
          palet={sel}
          paradaEntregaIndex={paradaEntregaIndex}
          paradesCompletades={paradesCompletades}
          paradesCancelades={paradesCancelades}
        />
      )}
    </div>
  )
}
