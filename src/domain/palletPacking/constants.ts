import type { TipusCamio } from '@/models/Camio'
import { TipusCamio as Tipus } from '@/models/Camio'

/** Caixes que caben en un palet (regla de negoci). */
export const CAIXES_PER_PALLET = 60

/** 1 caixa ≡ 24 llaunes (volum). */
export const LLAUNES_PER_CAIXA = 24

/** 1 barril ≡ 4 caixes (volum); 1 caixa ≡ 1/4 barril. */
export const CAIXES_PER_BARRIL = 4

const PALETS_PER_TIPUS: Record<TipusCamio, number> = {
  [Tipus.Gran]: 8,
  [Tipus.Mitja]: 6,
  [Tipus.Petit]: 3,
}

export function paletsMaximsPerTipus(tipus: TipusCamio): number {
  return PALETS_PER_TIPUS[tipus]
}
