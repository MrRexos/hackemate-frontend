import type { TipusCamio } from './Camio'

export type ParadaRuta = {
  nom: string
  lat: number
  lng: number
  /** Hora aproximada d’arribada (simulació), p. ex. "08:45". */
  horaArribadaAprox: string
}

/**
 * Ruta definida pel servei: ordre de parades, coordenades per al mapa i tipus de camió necessari.
 */
export class Ruta {
  public readonly id: string
  public readonly parades: readonly ParadaRuta[]
  public readonly tipusCamioRequerit: TipusCamio

  constructor(id: string, parades: readonly ParadaRuta[], tipusCamioRequerit: TipusCamio) {
    this.id = id
    this.parades = parades
    this.tipusCamioRequerit = tipusCamioRequerit
  }

  /** Nom de cada parada, en ordre (compatibilitat). */
  get companyies(): readonly string[] {
    return this.parades.map((p) => p.nom)
  }
}
