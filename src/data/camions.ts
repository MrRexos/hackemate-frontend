import { Camio, TipusCamio } from '../models/Camio'
import { FLEET_EXCEL_CAMIO_ALIASES } from './fleetExcelCamioAliases'
import { getInternalCamioCodeFromExcel } from './camioLookupRegistry'
/**hola*/ 
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
]

/** Les rutes s’assignen a l’arranc via `inicialitzarFlotaDesExcel` a `main.tsx`. */

export function getCamions(): Camio[] {
  return camions;
}

function normalitzaCodiCamio(s: string): string {
  return s.trim().toUpperCase()
}

function mapaAliasesDesEnv(): Map<string, string> {
  const raw = import.meta.env.VITE_FLEET_CAMIO_ALIASES?.trim()
  const m = new Map<string, string>()
  if (!raw) return m
  for (const part of raw.split(',')) {
    const [excel, intern] = part.split('=').map((x: string) => x.trim().toUpperCase())
    if (excel && intern) m.set(excel, intern)
  }
  return m
}

function resoldreCodiCamioEntrada(codiEntrada: string): string {
  const c = normalitzaCodiCamio(codiEntrada)
  if (!c) return ''

  const aliasEnv = mapaAliasesDesEnv().get(c)
  if (aliasEnv) return aliasEnv

  const aliasFitxer = FLEET_EXCEL_CAMIO_ALIASES[c]
  if (aliasFitxer) return normalitzaCodiCamio(aliasFitxer)

  const desAssignacioActual = getInternalCamioCodeFromExcel(c)
  if (desAssignacioActual) return normalitzaCodiCamio(desAssignacioActual)

  return c
}

export function getCamioPerCodi(codi: string): Camio | undefined {
  const resolt = resoldreCodiCamioEntrada(codi)
  return camions.find((camio) => normalitzaCodiCamio(camio.codi) === resolt)
}

export function setDisponibilitatCamio(codi: string, disponible: boolean): boolean {
  const camio = getCamioPerCodi(codi);

  if (!camio) {
    return false;
  }

  camio.setDisponibilitat(disponible);
  return true;
}

