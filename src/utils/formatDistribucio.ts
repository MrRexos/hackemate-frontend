import type { LiniaDistribucio, UnitatVolum } from '@/domain/palletPacking'
import { volumEnCaixes } from '@/domain/palletPacking'

export function etiquetaUnitatComanda(u: UnitatVolum): string {
  switch (u) {
    case 'CAIXA':
      return 'caix.'
    case 'LLAUNA':
      return 'llaunes'
    case 'BARRIL':
      return 'barrils'
    default: {
      const _: never = u
      return _
    }
  }
}

/** Una línia llegible: producte, quantitat en unitat de comanda, volum equivalent en caixes, material. */
export function resumLiniaDistribucio(l: LiniaDistribucio): string {
  const vol = volumEnCaixes(l.quantitat, l.unitat)
  const volTxt = vol.toLocaleString('ca-ES', { maximumFractionDigits: 1 })
  return `${l.producteNom} · ${l.quantitat} ${etiquetaUnitatComanda(l.unitat)} (~${volTxt} caixes eq.) · ${l.materialNom}`
}

function quantitatAmbUnitatCa(q: number, u: UnitatVolum): string {
  const qTxt = Number.isInteger(q) ? String(q) : q.toLocaleString('ca-ES', { maximumFractionDigits: 2 })
  switch (u) {
    case 'CAIXA':
      return q === 1 ? `${qTxt} caixa` : `${qTxt} caixes`
    case 'BARRIL':
      return q === 1 ? `${qTxt} barril` : `${qTxt} barrils`
    case 'LLAUNA':
      return q === 1 ? `${qTxt} llauna` : `${qTxt} llaunes`
    default: {
      const _: never = u
      return _
    }
  }
}

/** Text per al modal d’entrega: nom del producte i quantitat en caixes / barrils / llaunes (sense equivalent en caixes). */
export function resumLiniaEntregaModal(l: LiniaDistribucio): string {
  return `${l.producteNom} — ${quantitatAmbUnitatCa(l.quantitat, l.unitat)}`
}

export function volumTotalCaixesEq(linies: readonly LiniaDistribucio[]): number {
  let t = 0
  for (const l of linies) {
    t += volumEnCaixes(l.quantitat, l.unitat)
  }
  return t
}
