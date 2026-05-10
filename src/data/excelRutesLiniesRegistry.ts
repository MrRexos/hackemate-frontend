import type { LiniaDistribucio } from '@/domain/palletPacking'

let liniesPerRutaId: Readonly<Record<string, LiniaDistribucio[]>> = {}

export function setExcelRutesLiniesPerRuta(map: Record<string, LiniaDistribucio[]>): void {
  liniesPerRutaId = map
}

export function getLiniesExcelRutesSiExisteix(rutaId: string): LiniaDistribucio[] | null {
  const linies = liniesPerRutaId[rutaId]
  return linies?.length ? linies.map((l) => ({ ...l })) : null
}
