import type { TipusCamio } from '@/models/Camio'
import type { ParadaRuta } from '@/models/Ruta'
import { pesCaixaMaterialSiExisteix } from '@/data/materialsPesCaixa'
import { esParadaMagatzem } from '@/utils/paradaMap'

import {
  afegirCaixesDistribuïdes,
  espaiTotalDistribuibleCaixes,
  pisosBuides,
  reservarFinsNBarrils,
} from './barrilsEmmagatzematgePalet'
import { compararFragmentPerBasePrimer } from './densitatFragment'
import { CAIXES_PER_BARRIL, CAIXES_PER_PALLET, paletsMaximsPerTipus } from './constants'
import type { FragmentPalet, LiniaDistribucio, PaletOmplert, PlaCarrega } from './types'
import { quantitatFisicaDesDeVolumCaixes, volumEnCaixes } from './volum'

const EPS = 1e-6

type LiniaAmbVolum = LiniaDistribucio & {
  volumTotalCaixes: number
  pesTotalKg: number
  /** kg per caixa equivalent (densitat de la línia). */
  pesPerCaixaEq: number
}

function liniesAmbVolum(linies: LiniaDistribucio[]): LiniaAmbVolum[] {
  return linies.map((l) => {
    const volumTotalCaixes = volumEnCaixes(l.quantitat, l.unitat)
    const pesTotalKg = l.quantitat * l.pesKgPerUnitat
    const perFragment = volumTotalCaixes > EPS ? pesTotalKg / volumTotalCaixes : 0
    const catalog = pesCaixaMaterialSiExisteix(l.materialId)
    const pesPerCaixaEq =
      catalog != null && catalog > 0 ? Math.max(perFragment, catalog) : perFragment
    return { ...l, volumTotalCaixes, pesTotalKg, pesPerCaixaEq }
  })
}

/**
 * Ordre d’índex de palet en què s’omple el camió: primer els més propers a la cabina
 * (parell visual 1–2, després 3–4, …), fins al fons (primera entrega de la ruta).
 */
export function indicesPaletsOmplimentDesDeCabina(nPalets: number): number[] {
  return Array.from({ length: nPalets }, (_, i) => nPalets - 1 - i)
}

/**
 * Pla de càrrega optimitzat:
 * - Palets segons tipus de camió (gran 8, mitjà 6, petit 3); 60 caixes per palet.
 * - Es processen les entregues en ordre invers al de la ruta (última parada primer) per col·locar-les
 *   des dels palets més propers a la cabina cap al fons (primera entrega de la ruta al darrere del camió).
 * - Ordre d’ompliment dels palets: primer el més proper a la cabina, el segon de la fila, després el parell següent…
 *   Si un palet no té prou espai, es continua al següent (sense tornar enrere).
 * - Dins cada palet, fragments ordenats per densitat (kg/caixa): més dens a la base de la pila.
 * - **Barrils primer**: 6 ranures màx. per pis; vertical 2+2 caixes eq. al tall de dos pisos; tombat +2 al pis 5.
 *   Volum total camió: 4 caixes eq. per barril.
 * - **Caixes / llaunes**: només el volum que sobra per pis (≤12 caixes eq./pis totals), amb forat d’alineació.
 */
export function planificarCarregaPalets(
  parades: readonly ParadaRuta[],
  tipusCamio: TipusCamio,
  linies: LiniaDistribucio[],
): PlaCarrega {
  const nPalets = paletsMaximsPerTipus(tipusCamio)
  const palets: PaletOmplert[] = Array.from({ length: nPalets }, (_, index) => ({
    index,
    capacitatCaixes: CAIXES_PER_PALLET,
    ocupatCaixes: 0,
    fragments: [],
  }))

  const estatPisPerPalet = Array.from({ length: nPalets }, () => pisosBuides())

  const n = parades.length
  if (n < 3) {
    return { palets, volumDesbordamentCaixes: 0, teDesbordament: false }
  }

  const indicesEntrega: number[] = []
  for (let i = 1; i <= n - 2; i++) {
    if (!esParadaMagatzem(i, n)) indicesEntrega.push(i)
  }

  const perParada = new Map<number, LiniaAmbVolum[]>()
  for (const raw of liniesAmbVolum(linies)) {
    if (raw.paradaIndex <= 0 || raw.paradaIndex >= n - 1) continue
    if (esParadaMagatzem(raw.paradaIndex, n)) continue
    if (raw.volumTotalCaixes <= EPS) continue
    const arr = perParada.get(raw.paradaIndex) ?? []
    arr.push(raw)
    perParada.set(raw.paradaIndex, arr)
  }

  for (const arr of perParada.values()) {
    arr.sort((a, b) => b.pesPerCaixaEq - a.pesPerCaixaEq)
  }

  /** Palet actiu: comença pel més proper a la cabina (índex més alt). */
  let p = nPalets - 1
  let desbord = 0

  for (const paradaIndex of [...indicesEntrega].reverse()) {
    const grup = perParada.get(paradaIndex) ?? []
    const paradaNom = parades[paradaIndex]?.nom ?? `Parada ${paradaIndex}`

    for (const linia of grup) {
      let restVol = linia.volumTotalCaixes
      const pesPerCaixa = linia.volumTotalCaixes > EPS ? linia.pesTotalKg / linia.volumTotalCaixes : 0
      const esBarril = linia.unitat === 'BARRIL'

      while (restVol > EPS) {
        if (p < 0) {
          desbord += restVol
          break
        }

        const espai = CAIXES_PER_PALLET - palets[p].ocupatCaixes
        if (espai <= EPS) {
          p--
          continue
        }

        let hiCap: number

        if (esBarril) {
          const barrilsQueCabenVolum = Math.min(
            Math.floor((restVol + EPS) / CAIXES_PER_BARRIL),
            Math.floor((espai + EPS) / CAIXES_PER_BARRIL),
          )
          if (barrilsQueCabenVolum <= 0) {
            p--
            continue
          }
          const estatPis = estatPisPerPalet[p]!
          const nReservats = reservarFinsNBarrils(estatPis, barrilsQueCabenVolum)
          if (nReservats <= 0) {
            p--
            continue
          }
          hiCap = nReservats * CAIXES_PER_BARRIL
        } else {
          const estatPis = estatPisPerPalet[p]!
          const distribuible = espaiTotalDistribuibleCaixes(estatPis)
          const hiCapDesitjat = Math.min(restVol, espai, distribuible)
          if (hiCapDesitjat <= EPS) {
            p--
            continue
          }
          const hiCapReal = afegirCaixesDistribuïdes(estatPis, hiCapDesitjat)
          if (hiCapReal <= EPS) {
            p--
            continue
          }
          hiCap = hiCapReal
        }

        const pesTros = hiCap * pesPerCaixa

        const frag: FragmentPalet = {
          paradaIndex,
          paradaNom,
          producteId: linia.producteId,
          producteNom: linia.producteNom,
          materialId: linia.materialId,
          materialNom: linia.materialNom,
          unitat: linia.unitat,
          volumCaixes: hiCap,
          quantitatUnitatComanda: quantitatFisicaDesDeVolumCaixes(hiCap, linia.unitat),
          pesKg: pesTros,
          clienteId: linia.clienteId,
          empresaNom: linia.empresaNom ?? paradaNom,
        }

        palets[p].fragments.push(frag)
        palets[p].ocupatCaixes += hiCap
        restVol -= hiCap

        if (CAIXES_PER_PALLET - palets[p].ocupatCaixes <= EPS) {
          p--
        }
      }
    }
  }

  for (const palet of palets) {
    if (palet.fragments.length <= 1) continue
    palet.fragments.sort(compararFragmentPerBasePrimer)
  }

  for (let i = 0; i < nPalets; i++) {
    palets[i]!.planPisos = estatPisPerPalet[i]!.map((x) => ({ ...x }))
  }

  return {
    palets,
    volumDesbordamentCaixes: desbord,
    teDesbordament: desbord > EPS,
  }
}
