/* eslint-disable react-refresh/only-export-components -- graellaPalets i catCarrega: helpers compartits amb altres vistes */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

import truckImg from '@/assets/img/truck_top.png'
import {
  CAIXES_PER_PALLET,
  densitatKgPerCaixaEq,
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

/**
 * Vista de la pila (dalt del tot → terra): invers de l’ordre d’emmagatzematge
 * (fragment[0] = base del palet amb barrils/densitat ja ordenats).
 */
function fragmentsPerVistaPilaDesDeDalt(frags: FragmentPalet[]): FragmentPalet[] {
  return [...frags].reverse()
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

/* ─── Categoria de càrrega ───────────────────────────────────────────────── */

export type CatCarrega = 'caja' | 'barril' | 'lata' | 'retornable' | 'otros'

export function catCarrega(f: FragmentPalet): CatCarrega {
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
  caja: 'Caja', barril: 'Barril', lata: 'Lata', retornable: 'Retornable', otros: 'Otros',
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
  onSelect: (p: PaletOmplert) => void
  paradaEntregaIndex?: number
  paradesCompletades?: ReadonlySet<number>
}) {
  const encaraAlCamio = palet.fragments.filter((f) => !paradesCompletades?.has(f.paradaIndex))
  const fragsMostrats =
    paradaEntregaIndex === undefined
      ? encaraAlCamio
      : encaraAlCamio.filter((f) => f.paradaIndex === paradaEntregaIndex)
  const filtreParada = paradaEntregaIndex !== undefined
  const senseMercaderiaAqui = filtreParada && fragsMostrats.length === 0
  const buitTotal = encaraAlCamio.length === 0
  const buit = fragsMostrats.length === 0
  const fragsVistaPila = fragmentsPerVistaPilaDesDeDalt(fragsMostrats)
  const vols = fragsVistaPila.map((f) => Math.max(0.05, f.volumCaixes / CAIXES_PER_PALLET))

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
      onClick={() => onSelect(palet)}
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

      {/* Càrrega apilada (sense etiquetes dalt/baix — només al modal de detall). */}
      {!buit && (
        <div className="pointer-events-none absolute inset-[8%] bottom-[10%] z-[2] flex flex-col justify-end">
          <div className="flex min-h-0 h-full w-full flex-col gap-[2px]">
            {fragsVistaPila.map((frag, j) => {
              const cat = catCarrega(frag)
              const color = CAT_COLOR[cat]
              const d = densitatKgPerCaixaEq(frag)
              return (
                <div
                  key={`${frag.paradaIndex}-${frag.producteId}-${j}`}
                  className="relative w-full min-h-[4px] overflow-hidden rounded-[3px]"
                  style={{
                    flexGrow: vols[j],
                    flexShrink: 1,
                    flexBasis: 0,
                    background: color,
                    opacity: 0.88,
                  }}
                  title={`${cat} · ~${d.toFixed(1)} kg/caixa eq.`}
                >
                  {cat === 'barril' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-[72%] aspect-square rounded-full border border-white/35 bg-black/10" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Número */}
      <div className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center">
        <div
          className="flex items-center justify-center rounded-full border-2 border-slate-300 bg-white/90 font-bold text-slate-900 shadow-md"
          style={{
            width: 'clamp(1.4rem, 27%, 2rem)',
            height: 'clamp(1.4rem, 27%, 2rem)',
            fontSize: 'clamp(0.6rem, 2vw, 0.85rem)',
          }}
        >
          {ordreCabina}
        </div>
      </div>

      {buit && (
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-end justify-center pb-[12%]">
          <span style={{ fontSize: '0.52rem', color: '#92400e', fontWeight: 600, opacity: 0.55 }}>
            {filtreParada && !buitTotal ? 'No' : 'Buit'}
          </span>
        </div>
      )}
    </button>
  )
}

/* ─── Modal detall ───────────────────────────────────────────────────────── */

function ModalDetall({
  palet,
  onTancar,
  paradaEntregaIndex,
  paradesCompletades,
}: {
  palet: PaletOmplert
  onTancar: () => void
  paradaEntregaIndex?: number
  paradesCompletades?: ReadonlySet<number>
}) {
  const [fragmentResaltatIndex, setFragmentResaltatIndex] = useState<number | null>(null)

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onTancar() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onTancar])

  const totsFrags = palet.fragments.filter((f) => !paradesCompletades?.has(f.paradaIndex))
  const sumRel = totsFrags.reduce((s, f) => s + Math.max(0.05, f.volumCaixes / CAIXES_PER_PALLET), 0) || 1

  const filaModalDescarrega =
    paradaEntregaIndex !== undefined
      ? [...totsFrags].sort((a, b) => {
          const pa = a.paradaIndex === paradaEntregaIndex ? 0 : 1
          const pb = b.paradaIndex === paradaEntregaIndex ? 0 : 1
          return pa - pb
        })
      : totsFrags

  return (
    <div aria-modal role="dialog" className="fixed inset-0 z-[2100] flex items-end justify-center p-4 sm:items-center">
      <button aria-label="Tancar" className="absolute inset-0 bg-black/40" onClick={onTancar} type="button" />
      <div className="relative z-10 w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <h3 className="text-base font-semibold text-slate-900">
            Detall del palet
            {paradaEntregaIndex !== undefined ? (
              <span className="mt-0.5 block text-xs font-normal text-slate-500">
                Marcat en verd: descàrrega en aquest punt · Gris: altres entregues
              </span>
            ) : null}
          </h3>
          <button
            className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onTancar}
            type="button"
          >
            Tancar
          </button>
        </div>
        <div className="mt-4 grid grid-cols-[260px_1fr] gap-4">
          <div className="flex h-[min(52vh,380px)] flex-col gap-1 sm:h-[360px]">
            <p className="shrink-0 text-center text-[0.68rem] font-medium leading-snug text-sky-900">
              ↑ Dalt de la pila{' '}
              <span className="font-normal text-slate-500">(lleuger — menys kg per caixa equivalent)</span>
            </p>
            <div className="min-h-0 flex flex-1 flex-col rounded border border-slate-200 bg-slate-50 p-2">
              {totsFrags.length === 0 ? (
                <p className="text-sm text-slate-500">Sense càrrega en aquest palet.</p>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col gap-[3px]">
                  {fragmentsPerVistaPilaDesDeDalt(totsFrags).map((f, i) => {
                    const cat = catCarrega(f)
                    const partRel = Math.max(0.05, f.volumCaixes / CAIXES_PER_PALLET) / sumRel
                    const descarregarAqui =
                      paradaEntregaIndex !== undefined && f.paradaIndex === paradaEntregaIndex
                    const d = densitatKgPerCaixaEq(f)
                    const idxTots = totsFrags.indexOf(f)
                    const esResaltat = fragmentResaltatIndex !== null && fragmentResaltatIndex === idxTots
                    const altresApagats =
                      fragmentResaltatIndex !== null && fragmentResaltatIndex !== idxTots
                    return (
                      <div
                        key={`pila-${palet.index}-${i}`}
                        className={`relative min-h-[8px] cursor-pointer rounded-[3px] transition-all duration-150 ${
                          paradaEntregaIndex !== undefined && !descarregarAqui ? 'opacity-[0.38]' : ''
                        } ${descarregarAqui ? 'ring-2 ring-emerald-600 ring-offset-1' : ''} ${
                          altresApagats ? '!opacity-[0.28]' : ''
                        } ${esResaltat ? 'z-[8] scale-[1.03] shadow-lg ring-[3px] ring-slate-900 ring-offset-2 !opacity-100' : ''}`}
                        style={{
                          flexGrow: partRel,
                          flexShrink: 1,
                          flexBasis: 0,
                          background: CAT_COLOR[cat],
                        }}
                        title={`~${d.toFixed(1)} kg/caixa eq.`}
                        onMouseEnter={() => setFragmentResaltatIndex(idxTots)}
                        onMouseLeave={() => setFragmentResaltatIndex(null)}
                      >
                        {descarregarAqui ? (
                          <span className="pointer-events-none absolute left-1 top-1 z-[1] rounded bg-emerald-700 px-1 py-0.5 text-[0.55rem] font-bold uppercase leading-none text-white shadow-sm">
                            Descarregar
                          </span>
                        ) : null}
                        {cat === 'barril' && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="h-[72%] aspect-square rounded-full border border-white/35 bg-black/10" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <p className="shrink-0 border-t border-amber-900/25 pt-1 text-center text-[0.68rem] font-semibold leading-snug text-amber-950">
              ↓ Base del palet{' '}
              <span className="font-normal text-slate-600">(més pesat per caixa — inclòs barrils densos)</span>
            </p>
          </div>

          <div className="max-h-[min(52vh,380px)] space-y-3 overflow-y-auto pr-1">
            {totsFrags.length === 0 ? (
              <p className="text-sm text-slate-500">Sense línies en aquest palet.</p>
            ) : (
              filaModalDescarrega.map((f, i) => {
                const nom = nomProducteVisible(f)
                const client = clientEntrega(f)
                const qInfo = etiquetaQuantitat(f)
                const descarregarAqui =
                  paradaEntregaIndex !== undefined && f.paradaIndex === paradaEntregaIndex
                const idxTots = totsFrags.indexOf(f)
                const cat = catCarrega(f)
                const colorCat = CAT_COLOR[cat]
                const esResaltat =
                  fragmentResaltatIndex !== null && fragmentResaltatIndex === idxTots
                return (
                  <div
                    className={`flex gap-3 rounded-lg border px-3 py-2.5 transition-all duration-150 ${
                      paradaEntregaIndex !== undefined
                        ? descarregarAqui
                          ? 'border-emerald-400 bg-emerald-50/90 shadow-sm'
                          : 'border-slate-200 bg-slate-100/70 opacity-80'
                        : 'border-slate-200 bg-slate-50/80'
                    } ${esResaltat ? 'border-slate-900 bg-white shadow-md ring-2 ring-slate-900/25' : ''}`}
                    key={`detall-${palet.index}-${i}-${f.producteId}-${f.paradaIndex}`}
                    onMouseEnter={() => setFragmentResaltatIndex(idxTots)}
                    onMouseLeave={() => setFragmentResaltatIndex(null)}
                  >
                    <div
                      aria-hidden
                      className="mt-0.5 shrink-0 rounded-md shadow-inner"
                      style={{
                        width: '10px',
                        alignSelf: 'stretch',
                        minHeight: '3rem',
                        background: colorCat,
                        boxShadow: `inset 0 0 0 1px rgba(0,0,0,0.06)`,
                      }}
                      title={CAT_LABEL[cat]}
                    />
                    <div className="min-w-0 flex-1">
                      {paradaEntregaIndex !== undefined ? (
                        <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wide">
                          {descarregarAqui ? (
                            <span className="text-emerald-800">Descarregar en aquest punt</span>
                          ) : (
                            <span className="text-slate-500">Altres entregues — mantenir al camió</span>
                          )}
                        </p>
                      ) : null}
                      <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span
                          className="inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white shadow-sm"
                          style={{ background: colorCat }}
                        >
                          {CAT_LABEL[cat]}
                        </span>
                      </div>
                      <p className="text-sm text-slate-900">
                        <span className="text-slate-500">Producte:</span>{' '}
                        <span className="font-medium">{nom}</span>
                      </p>
                      <p className="mt-1.5 text-sm text-slate-900">
                        <span className="text-slate-500">Client:</span>{' '}
                        <span className="font-medium">{client}</span>
                      </p>
                      <p className="mt-1.5 text-sm text-slate-900">
                        <span className="text-slate-500">{qInfo.label}:</span>{' '}
                        <span className="font-medium">{qInfo.valor}</span>
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
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
}: Props) {
  const nPalets = paletsMaximsPerTipus(tipusCamio)
  const { cols, rows } = graellaPalets(nPalets)
  const [sel, setSel] = useState<PaletOmplert | null>(null)
  const onTancar = useCallback(() => setSel(null), [])

  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const [escalaEncaix, setEscalaEncaix] = useState(1)

  const sc = compacte ? 0.72 : 1
  const paletW = Math.round((rows === 1 ? 170 : 178) * sc)
  const paletH = Math.round((rows === 1 ? 126 : 112) * sc)
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
                    actiu={sel?.index === palet.index}
                    onSelect={setSel}
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
        />
      )}
    </div>
  )
}
