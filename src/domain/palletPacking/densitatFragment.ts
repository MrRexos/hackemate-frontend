import { pesCaixaMaterialSiExisteix } from '@/data/materialsPesCaixa'

import type { FragmentPalet } from './types'

const EPS = 1e-9

/**
 * kg per «caixa equivalent» de volum: pes real del fragment / volum en caixes eq.
 * Si hi ha `pesCaixa` al catàleg per `materialId`, es fa servir com a referència mínima de pes del material (barrils / vidre dens no queden «lleugers» per error de dades).
 */
export function densitatKgPerCaixaEq(f: FragmentPalet): number {
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
 * Ordre cap a la base del palet (índex 0 = sobre el terra del palet).
 * 1) Barrils sempre per sota de caixes i aquestes per sota de llaunes (format estable i dens).
 * 2) Dins cada tipus: més kg/caixa equivalent més avall.
 * 3) Empat: més volum de fragment més avall (base més estable).
 */
export function compararFragmentPerBasePrimer(a: FragmentPalet, b: FragmentPalet): number {
  const rankBase = (u: string | undefined) =>
    u === 'BARRIL' ? 0 : u === 'CAIXA' ? 1 : 2
  const ra = rankBase(a.unitat)
  const rb = rankBase(b.unitat)
  if (ra !== rb) return ra - rb
  const da = densitatKgPerCaixaEq(a)
  const db = densitatKgPerCaixaEq(b)
  if (Math.abs(db - da) > 1e-6) return db - da
  return (b.volumCaixes ?? 0) - (a.volumCaixes ?? 0)
}
