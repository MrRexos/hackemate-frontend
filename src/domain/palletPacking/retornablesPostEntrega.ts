import type { TipusCamio } from '@/models/Camio'
import { TipusCamio as TipusCamioConst } from '@/models/Camio'

import { CAIXES_PER_BARRIL, CAIXES_PER_PALLET } from './constants'
import { compararFragmentPerBasePrimer } from './densitatFragment'
import {
  afegirCaixesDistribuïdes,
  pisosBuides,
  reservarFinsNBarrils,
} from './barrilsEmmagatzematgePalet'
import type { FragmentPalet, LiniaDistribucio, PlaCarrega } from './types'
import { quantitatFisicaDesDeVolumCaixes, volumEnCaixes } from './volum'

const EPS = 1e-9

const PES_KG_PER_CAIXA_RETORN = 0.06

/** Camió petit: retornables cap a la cabina. Mitjà/gran: cap a la porta del darrere (fons). */
function retornablesOmplenPrimerPaletsPropCabina(tipus: TipusCamio): boolean {
  return tipus === TipusCamioConst.Petit
}

export function volumEntregatParadaEnCaixes(linies: readonly LiniaDistribucio[], paradaIndex: number): number {
  let s = 0
  for (const l of linies) {
    if (l.paradaIndex !== paradaIndex) continue
    s += volumEnCaixes(l.quantitat, l.unitat)
  }
  return s
}

export function volumMercaderiaNoRetornableParadaAlPla(pla: PlaCarrega, paradaIndex: number): number {
  let s = 0
  for (const p of pla.palets) {
    for (const f of p.fragments) {
      if (f.paradaIndex === paradaIndex && !f.esRetornable) s += f.volumCaixes
    }
  }
  return s
}

function targetCaixesEqRetorn60Percent(volumEntregatCaixes: number): number {
  if (!Number.isFinite(volumEntregatCaixes) || volumEntregatCaixes <= EPS) return 0
  return Math.max(0, Math.round(0.6 * volumEntregatCaixes))
}

export type RepartimentRetornCaixesBarrils = { caixes: number; barrils: number }

export function repartirRetorn60PercentEnCaixesIBarrils(volumEntregatCaixes: number): RepartimentRetornCaixesBarrils {
  const target = targetCaixesEqRetorn60Percent(volumEntregatCaixes)
  if (target <= 0) return { caixes: 0, barrils: 0 }
  const barrils = Math.floor(target / CAIXES_PER_BARRIL)
  const caixes = target % CAIXES_PER_BARRIL
  return { caixes, barrils }
}

/** Text llegible per al modal (quantitats aproximades del 60%). */
export function resumRepartimentRetornText(r: RepartimentRetornCaixesBarrils): string {
  const { caixes, barrils } = r
  if (caixes <= 0 && barrils <= 0) {
    return 'Cap unitat de retorn (el volum entregat als palets és zero o massa petit per arrodonir).'
  }
  const parts: string[] = []
  if (barrils > 0) parts.push(`${barrils} barril${barrils === 1 ? '' : 's'}`)
  if (caixes > 0) parts.push(`${caixes} caix${caixes === 1 ? 'a' : 'es'}`)
  return `${parts.join(' i ')} (~60% del volum que baixaves del camió en aquesta parada).`
}

export function treureMercaderiaParadaDelPla(pla: PlaCarrega, paradaIndex: number): PlaCarrega {
  const palets = pla.palets.map((p) => {
    const fragments = p.fragments.filter((f) => !(f.paradaIndex === paradaIndex && !f.esRetornable))
    const ocupatCaixes = fragments.reduce((s, f) => s + f.volumCaixes, 0)
    return { ...p, fragments, ocupatCaixes, planPisos: recomputarPlanPisosDesDeFragments(fragments) }
  })
  return { ...pla, palets }
}

let retornSeq = 0

function recomputarPlanPisosDesDeFragments(fragments: readonly FragmentPalet[]) {
  const pisos = pisosBuides()
  for (const frag of fragments) {
    if (frag.volumCaixes <= EPS) continue
    if (frag.unitat === 'BARRIL') {
      const nb = Math.max(0, Math.floor((frag.volumCaixes + EPS) / CAIXES_PER_BARRIL))
      if (nb > 0) reservarFinsNBarrils(pisos, nb)
      continue
    }
    afegirCaixesDistribuïdes(pisos, frag.volumCaixes)
  }
  return pisos.map((x) => ({ ...x }))
}

function fragmentRetornCaixes(paradaIndex: number, paradaNom: string, nCaixes: number): FragmentPalet {
  retornSeq += 1
  const vol = nCaixes
  return {
    paradaIndex,
    paradaNom,
    producteId: `RETORN-C-${paradaIndex}-${retornSeq}`,
    producteNom: `Retornables — ${nCaixes} caix${nCaixes === 1 ? 'a' : 'es'}`,
    materialId: 'RETORN-VIRTUAL-CAIXA',
    materialNom: 'Envàs retornable (caixa)',
    unitat: 'CAIXA',
    esRetornable: true,
    volumCaixes: vol,
    quantitatUnitatComanda: quantitatFisicaDesDeVolumCaixes(vol, 'CAIXA'),
    pesKg: vol * PES_KG_PER_CAIXA_RETORN,
    empresaNom: paradaNom,
  }
}

function fragmentRetornBarrils(paradaIndex: number, paradaNom: string, nBarrils: number): FragmentPalet {
  retornSeq += 1
  const vol = nBarrils * CAIXES_PER_BARRIL
  return {
    paradaIndex,
    paradaNom,
    producteId: `RETORN-B-${paradaIndex}-${retornSeq}`,
    producteNom: `Retornables — ${nBarrils} barril${nBarrils === 1 ? '' : 's'}`,
    materialId: 'RETORN-VIRTUAL-BARRIL',
    materialNom: 'Envàs retornable (barril)',
    unitat: 'BARRIL',
    esRetornable: true,
    volumCaixes: vol,
    quantitatUnitatComanda: quantitatFisicaDesDeVolumCaixes(vol, 'BARRIL'),
    pesKg: vol * PES_KG_PER_CAIXA_RETORN,
    empresaNom: paradaNom,
  }
}

/**
 * Ordre d’ompliment entre palets: petit → cap a la cabina (índex alt primer); mitjà/gran → cap al fons (índex 0 primer).
 * Dins cada palet: barrils sota caixes després de sort.
 */
export function afegirRetornablesAlPla(
  pla: PlaCarrega,
  paradaIndex: number,
  paradaNom: string,
  repartiment: RepartimentRetornCaixesBarrils,
  tipusCamio: TipusCamio,
): PlaCarrega {
  const { caixes, barrils } = repartiment
  if (caixes <= 0 && barrils <= 0) return pla

  const palets = pla.palets.map((p) => ({
    ...p,
    fragments: [...p.fragments],
    ocupatCaixes: p.ocupatCaixes,
  }))

  let remainingBarrils = barrils
  let remainingCaixes = caixes
  let desbord = pla.volumDesbordamentCaixes

  const ordenarPiletSiCal = (palet: (typeof palets)[number]) => {
    if (palet.fragments.length > 1) palet.fragments.sort(compararFragmentPerBasePrimer)
  }

  const cabinaPrimer = retornablesOmplenPrimerPaletsPropCabina(tipusCamio)

  const iterarPalets = (): Iterable<number> => {
    if (cabinaPrimer) {
      return (function* () {
        for (let pi = palets.length - 1; pi >= 0; pi--) yield pi
      })()
    }
    return (function* () {
      for (let pi = 0; pi < palets.length; pi++) yield pi
    })()
  }

  for (const pi of iterarPalets()) {
    if (remainingBarrils <= 0 && remainingCaixes <= 0) break
    const palet = palets[pi]!

    while (remainingBarrils > 0 || remainingCaixes > 0) {
      const espai = CAIXES_PER_PALLET - palet.ocupatCaixes
      if (espai <= EPS) break

      if (remainingBarrils > 0 && espai >= CAIXES_PER_BARRIL - EPS) {
        const nb = Math.min(remainingBarrils, Math.floor(espai / CAIXES_PER_BARRIL))
        const frag = fragmentRetornBarrils(paradaIndex, paradaNom, nb)
        palet.fragments.push(frag)
        palet.ocupatCaixes += frag.volumCaixes
        remainingBarrils -= nb
        ordenarPiletSiCal(palet)
        continue
      }

      if (remainingCaixes > 0 && espai >= 1 - EPS) {
        const nc = Math.min(remainingCaixes, Math.floor(espai))
        const frag = fragmentRetornCaixes(paradaIndex, paradaNom, nc)
        palet.fragments.push(frag)
        palet.ocupatCaixes += frag.volumCaixes
        remainingCaixes -= nc
        ordenarPiletSiCal(palet)
        continue
      }

      break
    }
  }

  const restVol = remainingBarrils * CAIXES_PER_BARRIL + remainingCaixes
  if (restVol > EPS) desbord += restVol

  for (const palet of palets) {
    palet.planPisos = recomputarPlanPisosDesDeFragments(palet.fragments)
  }

  return {
    palets,
    volumDesbordamentCaixes: desbord,
    teDesbordament: desbord > EPS,
  }
}

export function descripcioUbicacioRetornablesParada(
  pla: PlaCarrega | null,
  paradaIndex: number,
  tipusCamio: TipusCamio,
): string {
  if (!pla) return 'No hi ha pla de càrrega per indicar la ubicació.'
  const idxs = pla.palets
    .filter((p) => p.fragments.some((f) => f.paradaIndex === paradaIndex && f.esRetornable))
    .map((p) => p.index)
  if (idxs.length === 0) {
    return 'No s’han pogut col·locar retornables al pla (sense espai al camió). Pots continuar la ruta.'
  }

  const cabinaPrimer = retornablesOmplenPrimerPaletsPropCabina(tipusCamio)
  idxs.sort((a, b) => (cabinaPrimer ? b - a : a - b))

  const nums = idxs.map((i) => i + 1).join(', ')
  if (cabinaPrimer) {
    return `Col·loca’ls el més a prop del conductor que puguis (camió petit: el pla omple primer els palets amb número més alt). Palets: ${nums} (1 = fons/porta de darrere; número més alt = més a prop del conductor). Dins de cada palet: barrils a baix, caixes a sobre.`
  }
  return `Col·loca’ls el més a prop de la porta del darrere que puguis (camió mitjà o gran: el pla omple primer el fons del camió). Palets: ${nums} (1 = més a prop de la porta del darrere; número més alt = més a prop de la cabina). Dins de cada palet: barrils a baix, caixes a sobre.`
}
