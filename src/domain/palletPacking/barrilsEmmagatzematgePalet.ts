import {
  BARRILS_MAX_PER_PIS,
  FORAT_ALINEACIO_CAIXES,
  PALLET_VERTICAL_PISOS,
  VOLUM_CAIXES_EQ_MAX_PER_PIS,
} from './constants'

const ULTIM_PIS = PALLET_VERTICAL_PISOS - 1
const EPS = 1e-9

/**
 * Estat d’un pis: prioritat **6 ranures de barril**; el volum de barrils en caixes eq.
 * ocupat al tall del pis; després les **caixes** omplen el que queda (amb forat d’alineació).
 */
export type PisEmmagatzematge = {
  barrilsQueTocquen: number
  /** Volum en caixes eq. que els barrils ocupen en aquest pis (2 si toca mig barril vertical, 2 si tombat al pis 5). */
  volumBarrilsCaixesEq: number
  ocupacioCaixes: number
}

export function pisosBuides(): PisEmmagatzematge[] {
  return Array.from({ length: PALLET_VERTICAL_PISOS }, () => ({
    barrilsQueTocquen: 0,
    volumBarrilsCaixesEq: 0,
    ocupacioCaixes: 0,
  }))
}

export function espaiLliureBrut(p: PisEmmagatzematge): number {
  return VOLUM_CAIXES_EQ_MAX_PER_PIS - p.volumBarrilsCaixesEq - p.ocupacioCaixes
}

export function espaiLliurePerCaixesAmbForat(p: PisEmmagatzematge): number {
  return Math.floor(Math.max(0, espaiLliureBrut(p)) * FORAT_ALINEACIO_CAIXES)
}

export function espaiTotalDistribuibleCaixes(pisos: readonly PisEmmagatzematge[]): number {
  let s = 0
  for (const p of pisos) s += espaiLliurePerCaixesAmbForat(p)
  return s
}

export function espaiTeoricCaixesSenseBarrils(p: PisEmmagatzematge): number {
  return Math.max(0, VOLUM_CAIXES_EQ_MAX_PER_PIS - p.volumBarrilsCaixesEq)
}

/**
 * Distribueix caixes eq. als pisos amb més marge primer (només espai **després** dels barrils).
 */
export function afegirCaixesDistribuïdes(pisos: PisEmmagatzematge[], quantitat: number): number {
  let queda = quantitat
  while (queda > EPS) {
    let bf = -1
    let best = -1
    for (let f = 0; f < pisos.length; f++) {
      const r = espaiLliurePerCaixesAmbForat(pisos[f]!)
      if (r > best) {
        best = r
        bf = f
      }
    }
    if (best <= 0 || bf < 0) break
    const add = Math.min(queda, best)
    pisos[bf]!.ocupacioCaixes += add
    queda -= add
  }
  return quantitat - queda
}

/**
 * Prioritat barrils: com a màxim 6 per pis.
 * Vertical: +2 caixes eq. de volum al pis baix i +2 al dalt (4 al camió per barril).
 * Tombat (només si no hi ha parella): +2 al pis superior (6 tombats caben en el tall de 12).
 */
export function intentarReservarUnBarril(pisos: PisEmmagatzematge[]): boolean {
  for (let baix = 0; baix < ULTIM_PIS; baix++) {
    const p0 = pisos[baix]!
    const p1 = pisos[baix + 1]!
    if (
      p0.barrilsQueTocquen < BARRILS_MAX_PER_PIS &&
      p1.barrilsQueTocquen < BARRILS_MAX_PER_PIS &&
      espaiLliureBrut(p0) >= 2 &&
      espaiLliureBrut(p1) >= 2
    ) {
      p0.barrilsQueTocquen++
      p1.barrilsQueTocquen++
      p0.volumBarrilsCaixesEq += 2
      p1.volumBarrilsCaixesEq += 2
      return true
    }
  }
  const pt = pisos[ULTIM_PIS]!
  if (pt.barrilsQueTocquen < BARRILS_MAX_PER_PIS && espaiLliureBrut(pt) >= 2) {
    pt.barrilsQueTocquen++
    pt.volumBarrilsCaixesEq += 2
    return true
  }
  return false
}

export function reservarFinsNBarrils(pisos: PisEmmagatzematge[], n: number): number {
  let r = 0
  for (; r < n; r++) {
    if (!intentarReservarUnBarril(pisos)) break
  }
  return r
}
