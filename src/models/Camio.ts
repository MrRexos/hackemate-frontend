import type { LiniaDistribucio, PlaCarrega, RepartimentRetornCaixesBarrils } from '@/domain/palletPacking'
import type { CamioDistribucioPersistSnapshot } from '@/utils/camioDistribucioPersistence'
import {
  afegirRetornablesAlPla,
  planificarCarregaPalets,
  repartirRetorn60PercentEnCaixesIBarrils,
  treureMercaderiaParadaDelPla,
  volumMercaderiaNoRetornableParadaAlPla,
} from '@/domain/palletPacking'

import type { Ruta } from './Ruta'

export const TipusCamio = {
  Petit: 'PETIT',
  Mitja: 'MITJA',
  Gran: 'GRAN',
} as const

export type TipusCamio = (typeof TipusCamio)[keyof typeof TipusCamio]

type BlocRetornDespresEntrega = {
  paradaIndex: number
  paradaNom: string
  repartiment: RepartimentRetornCaixesBarrils
}

export class Camio {
  public readonly codi: string
  public readonly tipus: TipusCamio
  public teRutaDisponible: boolean

  public ruta: Ruta | null

  public liniesDistribucio: LiniaDistribucio[] | null
  public plaCarrega: PlaCarrega | null

  private blocsRetornDespresEntrega: BlocRetornDespresEntrega[] = []
  private paradesEntregadesSimulacio = new Set<number>()

  constructor(codi: string, tipus: TipusCamio) {
    this.codi = codi
    this.tipus = tipus
    this.teRutaDisponible = true
    this.ruta = null
    this.liniesDistribucio = null
    this.plaCarrega = null
    this.blocsRetornDespresEntrega = []
    this.paradesEntregadesSimulacio = new Set()
  }

  actualitzarDistribucio(linies: LiniaDistribucio[]): void {
    this.liniesDistribucio = linies
    if (!this.ruta) {
      this.plaCarrega = null
      return
    }
    const liniesBase = linies.filter((l) => !this.paradesEntregadesSimulacio.has(l.paradaIndex))
    const base = planificarCarregaPalets(this.ruta.parades, this.tipus, liniesBase)
    this.plaCarrega = this.reaplicarRetornablesSobrePla(base)
  }

  /**
   * Restaura pla i estat de simulació des de sessió (mateixes posicions de caixes / retornables).
   */
  aplicarSnapshotDistribucioPersistit(snapshot: CamioDistribucioPersistSnapshot): void {
    if (!this.ruta || this.ruta.id !== snapshot.rutaId) return
    this.liniesDistribucio = snapshot.linies.map((l) => ({ ...l }))
    this.plaCarrega = structuredClone(snapshot.plaCarrega)
    this.paradesEntregadesSimulacio = new Set(snapshot.paradesEntregadesSimulacio)
    this.blocsRetornDespresEntrega = snapshot.blocsRetornDespresEntrega.map((b) => ({
      paradaIndex: b.paradaIndex,
      paradaNom: b.paradaNom,
      repartiment: { ...b.repartiment },
    }))
  }

  /** Serialitza l’estat del pla per guardar-lo (mateixa empremta de línies que `liniesFingerprint`). */
  extreureSnapshotDistribucioPersistit(liniesFingerprint: string): CamioDistribucioPersistSnapshot | null {
    if (!this.ruta || this.liniesDistribucio === null || this.plaCarrega === null) return null
    return {
      v: 1,
      rutaId: this.ruta.id,
      liniesFingerprint,
      linies: this.liniesDistribucio.map((l) => ({ ...l })),
      plaCarrega: structuredClone(this.plaCarrega),
      paradesEntregadesSimulacio: [...this.paradesEntregadesSimulacio.values()].sort((a, b) => a - b),
      blocsRetornDespresEntrega: this.blocsRetornDespresEntrega.map((b) => ({
        paradaIndex: b.paradaIndex,
        paradaNom: b.paradaNom,
        repartiment: { ...b.repartiment },
      })),
    }
  }

  private reaplicarRetornablesSobrePla(pla: PlaCarrega): PlaCarrega {
    let p = pla
    for (const b of this.blocsRetornDespresEntrega) {
      p = afegirRetornablesAlPla(p, b.paradaIndex, b.paradaNom, b.repartiment, this.tipus)
    }
    return p
  }

  /**
   * Restaura mercaderia i retornables al pla inicial de la ruta (com al primer carregament),
   * eliminant l’estat de la simulació del conductor (entregues i retorn creats després de parades).
   */
  reiniciarEstatDistribucioSimulacio(): void {
    this.paradesEntregadesSimulacio = new Set()
    this.blocsRetornDespresEntrega = []
    if (!this.ruta || this.liniesDistribucio === null) {
      return
    }
    this.actualitzarDistribucio(this.liniesDistribucio)
  }

  finalitzarEntregaSenseRetorn(paradaIndex: number): void {
    if (!this.plaCarrega || !this.liniesDistribucio?.length || !this.ruta) return
    if (this.paradesEntregadesSimulacio.has(paradaIndex)) return
    this.paradesEntregadesSimulacio.add(paradaIndex)
    this.plaCarrega = treureMercaderiaParadaDelPla(this.plaCarrega, paradaIndex)
  }

  afegirRetornablesDespresEntrega(paradaIndex: number): void {
    if (!this.plaCarrega || !this.liniesDistribucio?.length || !this.ruta) return
    if (this.paradesEntregadesSimulacio.has(paradaIndex)) return

    const volEnt = volumMercaderiaNoRetornableParadaAlPla(this.plaCarrega, paradaIndex)
    const repartiment = repartirRetorn60PercentEnCaixesIBarrils(volEnt)
    if (repartiment.caixes <= 0 && repartiment.barrils <= 0) {
      this.paradesEntregadesSimulacio.add(paradaIndex)
      this.plaCarrega = treureMercaderiaParadaDelPla(this.plaCarrega, paradaIndex)
      return
    }

    const nomParada = this.ruta.parades[paradaIndex]?.nom ?? `Parada ${paradaIndex}`
    this.paradesEntregadesSimulacio.add(paradaIndex)
    let pla = treureMercaderiaParadaDelPla(this.plaCarrega, paradaIndex)
    this.blocsRetornDespresEntrega.push({
      paradaIndex,
      paradaNom: nomParada,
      repartiment,
    })
    pla = afegirRetornablesAlPla(pla, paradaIndex, nomParada, repartiment, this.tipus)
    this.plaCarrega = pla
  }

  assignarRuta(ruta: Ruta): void {
    this.ruta = ruta
    this.teRutaDisponible = false
    this.liniesDistribucio = null
    this.plaCarrega = null
    this.blocsRetornDespresEntrega = []
    this.paradesEntregadesSimulacio = new Set()
  }

  desassignarRuta(): void {
    this.ruta = null
    this.teRutaDisponible = true
    this.liniesDistribucio = null
    this.plaCarrega = null
    this.blocsRetornDespresEntrega = []
    this.paradesEntregadesSimulacio = new Set()
  }

  setDisponibilitat(disponible: boolean): void {
    this.teRutaDisponible = disponible
  }
}
