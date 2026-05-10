import type { LiniaDistribucio } from '@/domain/palletPacking'

/**
 * Entrades manuals opcionals per ruta (demo). Si la ruta no hi és, es generen línies genèriques
 * per totes les parades d’entrega amb diverses referències cadascuna.
 * Regles de volum: 60 caixes/palet; 1 caixa = 24 llaunes; 1 barril = 4 caixes.
 * El volum total s’ajusta després a la capacitat del camió (`escalarLiniesPerCapacitatCaixes` a `distribucioApi`).
 */
const MOCK_PER_RUTA: Record<string, LiniaDistribucio[]> = {}

function liniesGeneriquesPerRuta(rutaId: string, nParadesEntrega: number): LiniaDistribucio[] {
  if (nParadesEntrega <= 0) return []
  const base = rutaId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const out: LiniaDistribucio[] = []
  const unitats = ['CAIXA', 'LLAUNA', 'BARRIL'] as const
  let k = 0
  for (let i = 0; i < nParadesEntrega; i++) {
    const paradaIndex = 1 + i
    const nLiniesParada = 3 + ((base + i * 5) % 4)
    for (let j = 0; j < nLiniesParada; j++) {
      const unitat = unitats[(base + i + j) % 3]
      /** Quantitats moderades; l’API escala el conjunt al volum del tipus de camió (gran/mitjà/petit). */
      const q = 4 + ((base + i * 11 + j * 3) % 18)
      out.push({
        paradaIndex,
        producteId: `P-GEN-${rutaId}-${i}-${j}`,
        producteNom: `Referència ${i + 1}.${j + 1} (${unitat.toLowerCase()})`,
        materialId: `M-MOCK-${(i + j) % 4}`,
        materialNom: ['Vidre', 'Alumini', 'PET', 'Acer'][(i + j) % 4],
        quantitat: q,
        unitat,
        pesKgPerUnitat: unitat === 'LLAUNA' ? 0.5 : unitat === 'BARRIL' ? 40 : 12 + k++,
      })
    }
  }
  return out
}

/** Retorna línies de distribució per id de ruta (mock). */
export function getLiniesDistribucioMock(rutaId: string, totalParades: number = 0): LiniaDistribucio[] {
  const especific = MOCK_PER_RUTA[rutaId]
  if (especific?.length) return especific
  const nEntrega = totalParades >= 3 ? totalParades - 2 : 0
  return liniesGeneriquesPerRuta(rutaId, nEntrega)
}
