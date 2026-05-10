/** Unitats de volum segons regles d’equivalència (caixa / llauna / barril). */
export type UnitatVolum = 'CAIXA' | 'LLAUNA' | 'BARRIL'

/**
 * Línia de distribució per una parada (vindrà de l’API / BD).
 * `pesKgPerUnitat`: pes d’una unitat en l’empaquetat indicat (caixa, llauna o barril).
 */
export type LiniaDistribucio = {
  paradaIndex: number
  producteId: string
  producteNom: string
  materialId: string
  materialNom: string
  quantitat: number
  unitat: UnitatVolum
  pesKgPerUnitat: number
  /** Client destinatari (BD). */
  clienteId?: string
  empresaNom?: string
}

/** Fragment col·locat en un palet (pot ser part d’una línia si s’ha partit). */
export type FragmentPalet = {
  paradaIndex: number
  paradaNom: string
  producteId: string
  producteNom: string
  materialNom: string
  /** Unitat de la línia d’origen (per llegenda visual caixa / llauna / barril). */
  unitat?: UnitatVolum
  volumCaixes: number
  /** Quantitat d’aquest tros en unitat de comanda (caixes / llaunes / barrils), enter per UI. */
  quantitatUnitatComanda: number
  pesKg: number
  clienteId?: string
  empresaNom?: string
}

export type PaletOmplert = {
  /** 0 = davant del camió (primera entrega); últim índex = darrere (última entrega). */
  index: number
  capacitatCaixes: number
  ocupatCaixes: number
  /** Ordre d’apilament: primer element = baix del palet, últim = a dalt. */
  fragments: FragmentPalet[]
}

export type PlaCarrega = {
  palets: PaletOmplert[]
  volumDesbordamentCaixes: number
  teDesbordament: boolean
}
