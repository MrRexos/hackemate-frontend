export const TipusCamio = {
  Petit: 'PETIT',
  Mitja: 'MITJA',
  Gran: 'GRAN',
} as const;

export type TipusCamio = (typeof TipusCamio)[keyof typeof TipusCamio];

export class Camio {
  public readonly codi: string;
  public readonly tipus: TipusCamio;
  public teRutaDisponible: boolean;

  // TODO: canviar 'unknown' per la classe Ruta quan estigui disponible.
  public ruta: unknown | null;

  constructor(codi: string, tipus: TipusCamio) {
    this.codi = codi;
    this.tipus = tipus;
    this.teRutaDisponible = true;
    this.ruta = null;
  }

  assignarRuta(ruta: unknown): void {
    this.ruta = ruta;
    this.teRutaDisponible = false;
  }

  desassignarRuta(): void {
    this.ruta = null;
    this.teRutaDisponible = true;
  }

  setDisponibilitat(disponible: boolean): void {
    this.teRutaDisponible = disponible;
  }
}
