import type { TipusCamio } from '@/models/Camio'
import type { ParadaRuta } from '@/models/Ruta'
import { esParadaMagatzem } from '@/utils/paradaMap'

import { CAIXES_PER_PALLET, paletsMaximsPerTipus } from './constants'
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
    const pesPerCaixaEq = volumTotalCaixes > EPS ? pesTotalKg / volumTotalCaixes : 0
    return { ...l, volumTotalCaixes, pesTotalKg, pesPerCaixaEq }
  })
}

/**
 * Pla de carrega: omple des del darrere del camió cap al davant.
 * Per cada parada es processa en ordre invers a la ruta (última entrega primer).
 * Dins cada parada, les línies es col·loquen per densitat (kg/caixa eq., descendent): més dens a la base del palet.
 * Es reutilitza l’espai lliure del palet actual abans de passar al següent (cap al davant).
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

  let p = nPalets - 1
  let desbord = 0

  for (const paradaIndex of [...indicesEntrega].reverse()) {
    const grup = perParada.get(paradaIndex) ?? []
    const paradaNom = parades[paradaIndex]?.nom ?? `Parada ${paradaIndex}`

    for (const linia of grup) {
      let restVol = linia.volumTotalCaixes
      const pesPerCaixa = linia.volumTotalCaixes > EPS ? linia.pesTotalKg / linia.volumTotalCaixes : 0

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

        const hiCap = Math.min(restVol, espai)
        const pesTros = hiCap * pesPerCaixa

        const frag: FragmentPalet = {
          paradaIndex,
          paradaNom,
          producteId: linia.producteId,
          producteNom: linia.producteNom,
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
    palet.fragments.sort((a, b) => {
      const ra = a.volumCaixes > EPS ? a.pesKg / a.volumCaixes : 0
      const rb = b.volumCaixes > EPS ? b.pesKg / b.volumCaixes : 0
      return rb - ra
    })
  }

  return {
    palets,
    volumDesbordamentCaixes: desbord,
    teDesbordament: desbord > EPS,
  }
}
