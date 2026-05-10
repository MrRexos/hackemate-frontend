import type { LiniaDistribucio, PlaCarrega } from '@/domain/palletPacking'
import { planificarCarregaPalets } from '@/domain/palletPacking'

import type { Ruta } from './Ruta'

export const TipusCamio = {
  Petit: 'PETIT',
  Mitja: 'MITJA',
  Gran: 'GRAN',
} as const

export type TipusCamio = (typeof TipusCamio)[keyof typeof TipusCamio]

export class Camio {
  public readonly codi: string
  public readonly tipus: TipusCamio
  public teRutaDisponible: boolean

  public ruta: Ruta | null

  /** Línies de distribució carregades (mock / Supabase); base del pla de palets. */
  public liniesDistribucio: LiniaDistribucio[] | null
  /** Pla optimitzat: palets, ordre des de cabina, fragments amb densitat a la pila. */
  public plaCarrega: PlaCarrega | null

  constructor(codi: string, tipus: TipusCamio) {
    this.codi = codi
    this.tipus = tipus
    this.teRutaDisponible = true
    this.ruta = null
    this.liniesDistribucio = null
    this.plaCarrega = null
  }

  /**
   * Actualitza la distribució emmagatzemada i recalcula el pla de palets (60 caixes/palet, ordre cabina, últimes entregues primer).
   */
  actualitzarDistribucio(linies: LiniaDistribucio[]): void {
    this.liniesDistribucio = linies
    if (!this.ruta) {
      this.plaCarrega = null
      return
    }
    this.plaCarrega = planificarCarregaPalets(this.ruta.parades, this.tipus, linies)
  }

  assignarRuta(ruta: Ruta): void {
    this.ruta = ruta
    this.teRutaDisponible = false
    this.liniesDistribucio = null
    this.plaCarrega = null
  }

  desassignarRuta(): void {
    this.ruta = null
    this.teRutaDisponible = true
    this.liniesDistribucio = null
    this.plaCarrega = null
  }

  setDisponibilitat(disponible: boolean): void {
    this.teRutaDisponible = disponible
  }
}
