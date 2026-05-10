import { CAIXES_PER_BARRIL, PALLET_VERTICAL_PISOS } from './constants'
import { compararFragmentPerBasePrimer } from './densitatFragment'
import {
  intentarReservarUnBarrilAmbDetall,
  pisosBuides,
  type PisEmmagatzematge,
} from './barrilsEmmagatzematgePalet'
import type { FragmentPalet, PisPlaEmmagatzematge } from './types'

const RANURES = 6

function fragmentEsBarril(f: FragmentPalet): boolean {
  if (f.unitat === 'BARRIL') return true
  const s = `${f.materialNom} ${f.producteNom}`.toLowerCase()
  return s.includes('barril') || s.includes('bidó')
}

function barrilsPerPisCoincideixen(
  simulat: readonly PisEmmagatzematge[],
  referencia: readonly PisPlaEmmagatzematge[],
): boolean {
  for (let p = 0; p < PALLET_VERTICAL_PISOS; p++) {
    if (simulat[p]!.barrilsQueTocquen !== referencia[p]!.barrilsQueTocquen) return false
  }
  return true
}

/**
 * Reprodueix les reserves de barril com al planificador i omple una graella 5×6:
 * per cada pis i ranura, índex del fragment a `frags` (mateix ordre que la llista del modal).
 *
 * Si cap ordre d’ompliment (base→dalt o invers) no reprodueix `barrilsQueTocquen` del pla,
 * retorna `mapa: null` i `confiable: false` (cal fallback volumètric a la UI).
 */
export function construirMapaRanuraBarrilFragIdx(
  frags: readonly FragmentPalet[],
  planPisosRef: readonly PisPlaEmmagatzematge[] | undefined,
): { mapa: (number | null)[][] | null; confiable: boolean } {
  if (!planPisosRef || planPisosRef.length !== PALLET_VERTICAL_PISOS) {
    return { mapa: null, confiable: false }
  }

  const ambIdx = frags.map((f, idx) => ({ f, idx }))
  const ordreBase = [...ambIdx].sort((a, b) => compararFragmentPerBasePrimer(a.f, b.f))
  const ordres = [ordreBase, [...ordreBase].reverse()]

  for (const ordre of ordres) {
    const pisos = pisosBuides()
    const mapa: (number | null)[][] = Array.from({ length: PALLET_VERTICAL_PISOS }, () =>
      Array.from({ length: RANURES }, () => null as number | null),
    )
    let trencat = false
    for (const { f, idx } of ordre) {
      if (!fragmentEsBarril(f)) continue
      const nBarrils = Math.max(0, Math.round(f.volumCaixes / CAIXES_PER_BARRIL))
      for (let u = 0; u < nBarrils; u++) {
        const r = intentarReservarUnBarrilAmbDetall(pisos)
        if (!r.ok) {
          trencat = true
          break
        }
        if (r.esVertical) {
          mapa[r.pisBaix]![r.ranura] = idx
          mapa[r.pisBaix + 1]![r.ranura] = idx
        } else {
          mapa[r.pisBaix]![r.ranura] = idx
        }
      }
      if (trencat) break
    }
    if (trencat) continue
    if (barrilsPerPisCoincideixen(pisos, planPisosRef)) {
      return { mapa, confiable: true }
    }
  }

  return { mapa: null, confiable: false }
}
