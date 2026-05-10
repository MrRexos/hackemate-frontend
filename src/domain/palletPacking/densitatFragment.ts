import { pesCaixaMaterialSiExisteix } from '@/data/materialsPesCaixa'

import type { FragmentPalet } from './types'

const EPS = 1e-9

export function densitatKgPerCaixaEq(f: FragmentPalet): number {
  if (f.esRetornable) return 0.05
  const vol = f.volumCaixes
  const perFragment = vol > EPS ? f.pesKg / vol : 0
  const codi = f.materialId?.trim()
  const catalog = codi ? pesCaixaMaterialSiExisteix(codi) : undefined
  if (catalog != null && catalog > 0) {
    return Math.max(perFragment, catalog)
  }
  return perFragment
}

/**
 * Ordre cap a la base del palet (índex 0 = terra).
 * Retornables al final (van a dalt de tot del palet); dins cada grup barrils sota caixes i llaunes
 * (pack = mateixa capa que caixa).
 */
export function compararFragmentPerBasePrimer(a: FragmentPalet, b: FragmentPalet): number {
  const capBase = (f: FragmentPalet) => (f.esRetornable ? 1 : 0)
  const ca = capBase(a)
  const cb = capBase(b)
  if (ca !== cb) return ca - cb

  const rankBase = (u: string | undefined) =>
    u === 'BARRIL' ? 0 : u === 'CAIXA' || u === 'LLAUNA' ? 1 : 2
  const ra = rankBase(a.unitat)
  const rb = rankBase(b.unitat)
  if (ra !== rb) return ra - rb
  const da = densitatKgPerCaixaEq(a)
  const db = densitatKgPerCaixaEq(b)
  if (Math.abs(db - da) > 1e-6) return db - da
  return (b.volumCaixes ?? 0) - (a.volumCaixes ?? 0)
}
