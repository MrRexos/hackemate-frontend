/** Unitats de volum: `LLAUNA` = paquet (24 unitats) ≡ 1 caixa eq. al palet, mateix que `CAIXA`. */
export type UnitatVolum = 'CAIXA' | 'LLAUNA' | 'BARRIL'

/**
 * Línia de distribució per una parada (vindrà de l’API / BD).
 * `pesKgPerUnitat`: pes d’una **unitat de comanda** (caixa, paquet de llaunes o barril).
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

/** Plànol d’emmagatzematge per pis (5 pisos), després de planificar. */
export type PisPlaEmmagatzematge = {
  barrilsQueTocquen: number
  volumBarrilsCaixesEq: number
  ocupacioCaixes: number
}

/** Fragment col·locat en un palet (pot ser part d’una línia si s’ha partit). */
export type FragmentPalet = {
  paradaIndex: number
  paradaNom: string
  producteId: string
  producteNom: string
  /** Codi de material (catàleg `materials.json`); per densitat kg/caixa a la pila. */
  materialId?: string
  materialNom: string
  /** Unitat de la línia d’origen (per llegenda visual caixa / llauna / barril). */
  unitat?: UnitatVolum
  volumCaixes: number
  /** Quantitat d’aquest tros en unitat de comanda (caixes / llaunes / barrils), enter per UI. */
  quantitatUnitatComanda: number
  pesKg: number
  /** Mercaderia de retorn (lleugera); ordenació especial a la pila i als palets. */
  esRetornable?: boolean
  clienteId?: string
  empresaNom?: string
}

export type PaletOmplert = {
  /**
   * Índex físic al llarg del camió: el més alt és el més proper a la cabina (es carrega primer amb les últimes entregues).
   * El 0 és el fons cap a la porta de càrrega (primeres entregues de la ruta).
   */
  index: number
  capacitatCaixes: number
  ocupatCaixes: number
  /** Ordre d’apilament (emmagatzematge): índex 0 = base del palet (més kg/caixa eq.); l’últim = a dalt. La vista UI pot mostrar la pila de dalt a baix. */
  fragments: FragmentPalet[]
  /**
   * Ocupació per pis (6 ranures de barril com a màxim; caixes amb forats respecte barrils).
   * Índex 0 = base, 4 = pis superior.
   */
  planPisos?: readonly PisPlaEmmagatzematge[]
}

export type PlaCarrega = {
  palets: PaletOmplert[]
  volumDesbordamentCaixes: number
  teDesbordament: boolean
}
