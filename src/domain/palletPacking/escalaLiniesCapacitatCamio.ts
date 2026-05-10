import type { TipusCamio } from '@/models/Camio'

import { CAIXES_PER_PALLET, paletsMaximsPerTipus } from './constants'
import type { LiniaDistribucio } from './types'
import { volumEnCaixes } from './volum'

const EPS = 1e-9

/** Capacitat total en «caixes equivalents» segons tipus de camió (palets × 60 caixes). */
export function capacitatCaixesCamio(tipus: TipusCamio): number {
  return paletsMaximsPerTipus(tipus) * CAIXES_PER_PALLET
}

export function volumTotalLiniesEnCaixes(linies: readonly LiniaDistribucio[]): number {
  let s = 0
  for (const l of linies) {
    s += volumEnCaixes(l.quantitat, l.unitat)
  }
  return s
}

function copiaLinia(l: LiniaDistribucio): LiniaDistribucio {
  return { ...l }
}

function quantitatMinima(): number {
  return 1
}

/**
 * Escala les quantitats perquè la suma de volums (caixes eq.) no superi `capacitatCaixes`.
 * Manté proporcions el màxim possible; després retalla per sobre de la capacitat (sense tornar enrere des del punt de vista del palet).
 */
export function escalarLiniesPerCapacitatCaixes(
  linies: readonly LiniaDistribucio[],
  capacitatCaixes: number,
): LiniaDistribucio[] {
  if (linies.length === 0 || capacitatCaixes <= EPS) {
    return linies.map(copiaLinia)
  }

  let total = volumTotalLiniesEnCaixes(linies)
  if (total <= capacitatCaixes + EPS) {
    return linies.map(copiaLinia)
  }

  const out = linies.map(copiaLinia)
  const factor = capacitatCaixes / total

  for (const l of out) {
    const raw = l.quantitat * factor
    let q = Math.floor(Number.isFinite(raw) ? raw : 0)
    if (q < 1) q = quantitatMinima()
    l.quantitat = q
  }

  total = volumTotalLiniesEnCaixes(out)

  while (total > capacitatCaixes + EPS) {
    let bestDec = -1
    let bestVol = -1
    for (let i = 0; i < out.length; i++) {
      const l = out[i]!
      if (l.quantitat <= quantitatMinima()) continue
      const v = volumEnCaixes(l.quantitat, l.unitat)
      if (v > bestVol) {
        bestVol = v
        bestDec = i
      }
    }

    if (bestDec >= 0) {
      out[bestDec]!.quantitat -= 1
      total = volumTotalLiniesEnCaixes(out)
      continue
    }

    let bestZero = -1
    let smallest = Infinity
    for (let i = 0; i < out.length; i++) {
      const l = out[i]!
      if (l.quantitat <= 0) continue
      const v = volumEnCaixes(l.quantitat, l.unitat)
      if (v < smallest && v > EPS) {
        smallest = v
        bestZero = i
      }
    }

    if (bestZero < 0) break
    out[bestZero]!.quantitat = 0
    total = volumTotalLiniesEnCaixes(out)
  }

  return out.filter((l) => l.quantitat > 0)
}
