import type { TipusCamio } from './Camio'

/** Ordre d’entregues per fusionar diversos `transporte_id` en una sola ruta (simulació / BD). */
export type OrdreEntregaRuta = {
  transporteId: number
  entregaId: string
}

export type ParadaRuta = {
  nom: string
  lat: number
  lng: number
  /** Hora aproximada d’arribada (simulació), p. ex. "08:45". */
  horaArribadaAprox: string
  /** Opcional (BD / identificador client per parada). */
  clienteId?: string
}

/**
 * Ruta definida pel servei: ordre de parades, coordenades per al mapa i tipus de camió necessari.
 */
export class Ruta {
  public readonly id: string
  public readonly parades: readonly ParadaRuta[]
  public readonly tipusCamioRequerit: TipusCamio
  /**
   * Identificador del transport a `cabecera_transporte` / `detalle_entrega` (Supabase).
   * Si és null, la distribució es basa en mock o simulació des de `materiales`.
   */
  public readonly transporteId: number | null
  /**
   * Quan hi ha diversos transports fusionats, defineix l’ordre de parades per mapejar `detalle_entrega`.
   */
  public readonly ordreEntregues: readonly OrdreEntregaRuta[] | null

  constructor(
    id: string,
    parades: readonly ParadaRuta[],
    tipusCamioRequerit: TipusCamio,
    transporteId: number | null = null,
    ordreEntregues: readonly OrdreEntregaRuta[] | null = null,
  ) {
    this.id = id
    this.parades = parades
    this.tipusCamioRequerit = tipusCamioRequerit
    this.transporteId = transporteId
    this.ordreEntregues = ordreEntregues
  }

  /** Nom de cada parada, en ordre (compatibilitat). */
  get companyies(): readonly string[] {
    return this.parades.map((p) => p.nom)
  }
}
