import { CAIXES_PER_BARRIL } from './constants'
import type { UnitatVolum } from './types'

/**
 * Converteix quantitat + unitat a «equivalents de caixa» (volum per omplir palets).
 * `LLAUNA`: cada unitat de comanda és un paquet de 24 llaunes (= 1 caixa eq.), mateix tractament que `CAIXA`.
 */
export function volumEnCaixes(quantitat: number, unitat: UnitatVolum): number {
  if (!Number.isFinite(quantitat) || quantitat <= 0) return 0
  switch (unitat) {
    case 'CAIXA':
    case 'LLAUNA':
      return quantitat
    case 'BARRIL':
      return quantitat * CAIXES_PER_BARRIL
    default: {
      const _: never = unitat
      return _
    }
  }
}

const EPS = 1e-9

/**
 * Part de volum en «caixa equivalent» → quantitat **entera** en la unitat de comanda original
 * (caixes / llaunes / barrils). Per mostrar a la UI (no fraccions de caixa).
 */
export function quantitatFisicaDesDeVolumCaixes(volumCaixesFragment: number, unitat: UnitatVolum): number {
  if (!Number.isFinite(volumCaixesFragment) || volumCaixesFragment <= EPS) return 0
  switch (unitat) {
    case 'CAIXA':
    case 'LLAUNA': {
      const q = Math.round(volumCaixesFragment)
      return q > 0 ? q : volumCaixesFragment > EPS ? 1 : 0
    }
    case 'BARRIL': {
      const barrils = volumCaixesFragment / CAIXES_PER_BARRIL
      const q = Math.round(barrils)
      return q > 0 ? q : volumCaixesFragment > EPS ? 1 : 0
    }
    default: {
      const _: never = unitat
      return _
    }
  }
}
