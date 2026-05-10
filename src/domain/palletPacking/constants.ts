import type { TipusCamio } from '@/models/Camio'
import { TipusCamio as Tipus } from '@/models/Camio'

/** Caixes que caben en un palet (regla de negoci). */
export const CAIXES_PER_PALLET = 60

/**
 * Mida física d’un paquet (24 llaunes / caixa). A l’algorisme de palets, una línia en `LLAUNA`
 * compta com **1 caixa equivalent per unitat de comanda** (el paquet sencer), no com 1/24.
 */
export const LLAUNES_PER_CAIXA = 24

/** 1 barril ≡ 4 caixes (volum); 1 caixa ≡ 1/4 barril. */
export const CAIXES_PER_BARRIL = 4

/**
 * Pisos verticals del palet al model 3D (coincideix amb la vista per pisos a la UI).
 * Índex 0 = base, índex 4 = pis 5 (superior).
 */
export const PALLET_VERTICAL_PISOS = 5

/**
 * Màxim de barrils que poden «tocar» un mateix pis (càrrega normal apilada en vertical).
 */
export const BARRILS_MAX_PER_PIS = 6

/**
 * Volum màxim en caixes eq. per pis (60 / 5): barrils + caixes junts no poden superar-ho.
 * No és una «divisió prèvia en 12»: primer es reserven fins a 6 barrils/pis; el que sobra és per caixes.
 */
export const VOLUM_CAIXES_EQ_MAX_PER_PIS = 12

/**
 * Fracció de l’espai lliure d’un pis que es pot omplir amb caixes (rest = forat d’alineació amb barrils).
 */
export const FORAT_ALINEACIO_CAIXES = 0.9

const PALETS_PER_TIPUS: Record<TipusCamio, number> = {
  [Tipus.Gran]: 8,
  [Tipus.Mitja]: 6,
  [Tipus.Petit]: 3,
}

export function paletsMaximsPerTipus(tipus: TipusCamio): number {
  return PALETS_PER_TIPUS[tipus]
}
