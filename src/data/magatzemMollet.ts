import type { ParadaRuta } from '@/models/Ruta'

/** Magatzem base: sortida i tornada de totes les rutes. */
export const MAGATZEM_MOLLET = {
  lat: 41.53975,
  lng: 2.21405,
  adrecaCurta: 'Carrer del Molí de Can Bassa, 1, 08100 Mollet del Vallès',
} as const

export const NOM_PARADA_SORTIDA_MOLLET = `Magatzem Mollet — sortida (${MAGATZEM_MOLLET.adrecaCurta})`
export const NOM_PARADA_TORNADA_MOLLET = `Magatzem Mollet — tornada (${MAGATZEM_MOLLET.adrecaCurta})`

export function paradaMagatzemMollet(nom: string, horaArribadaAprox: string): ParadaRuta {
  return {
    nom,
    lat: MAGATZEM_MOLLET.lat,
    lng: MAGATZEM_MOLLET.lng,
    horaArribadaAprox,
  }
}

/** Encapsula les parades intermèdies amb sortida des de Mollet i tornada al mateix magatzem. */
export function ambSortidaITornadaMollet(
  paradesIntermedies: readonly ParadaRuta[],
  horaSortida: string,
  horaTornada: string,
): ParadaRuta[] {
  return [
    paradaMagatzemMollet(NOM_PARADA_SORTIDA_MOLLET, horaSortida),
    ...paradesIntermedies,
    paradaMagatzemMollet(NOM_PARADA_TORNADA_MOLLET, horaTornada),
  ]
}
