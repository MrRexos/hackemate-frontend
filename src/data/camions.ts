import { Camio, TipusCamio } from '../models/Camio';

export const camions: Camio[] = [
  new Camio('A1B2C3D', TipusCamio.Mitja),
  new Camio('E4F5G6H', TipusCamio.Mitja),
  new Camio('J7K8L9M', TipusCamio.Mitja),
  new Camio('N1P2Q3R', TipusCamio.Mitja),
  new Camio('S4T5U6V', TipusCamio.Mitja),
  new Camio('W7X8Y9Z', TipusCamio.Mitja),
  new Camio('B2D4F6H', TipusCamio.Mitja),
  new Camio('K3M5P7R', TipusCamio.Mitja),
  new Camio('T1V3X5Z', TipusCamio.Mitja),
  new Camio('C4E6G8J', TipusCamio.Mitja),
  new Camio('L2N4Q6S', TipusCamio.Mitja),

  new Camio('R8U2W4Y', TipusCamio.Gran),
  new Camio('D7H3K9N', TipusCamio.Gran),
  new Camio('F1J5M8P', TipusCamio.Gran),
  new Camio('G2L6R9T', TipusCamio.Gran),

  new Camio('Z3C7V1B', TipusCamio.Petit),
];

export function getCamions(): Camio[] {
  return camions;
}

export function getCamioPerCodi(codi: string): Camio | undefined {
  return camions.find((camio) => camio.codi === codi);
}

export function setDisponibilitatCamio(codi: string, disponible: boolean): boolean {
  const camio = getCamioPerCodi(codi);

  if (!camio) {
    return false;
  }

  camio.setDisponibilitat(disponible);
  return true;
}

