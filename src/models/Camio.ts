import type { Ruta } from './Ruta'

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

  public ruta: Ruta | null;

  constructor(codi: string, tipus: TipusCamio) {
    this.codi = codi;
    this.tipus = tipus;
    this.teRutaDisponible = true;
    this.ruta = null;
  }

  assignarRuta(ruta: Ruta): void {
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
