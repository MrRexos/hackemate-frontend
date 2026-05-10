import materialsJson from './materials.json'

type EntradaMaterial = { codi: string; pesCaixa: number }

const materialsList = (materialsJson as { materials: EntradaMaterial[] }).materials

/** pesCaixa del catàleg (kg/caixa) indexat per `codi` de material. */
const PES_CAIXA_PER_CODI = new Map<string, number>()
for (const m of materialsList) {
  if (m?.codi && Number.isFinite(m.pesCaixa)) {
    PES_CAIXA_PER_CODI.set(String(m.codi).trim(), m.pesCaixa)
  }
}

/**
 * Retorna el pes per caixa del catàleg `materials.json` si el `codi` coincideix amb `materialId`.
 * Per ordenar la pila del palet (més dens a la base).
 */
export function pesCaixaMaterialSiExisteix(materialId: string): number | undefined {
  const v = PES_CAIXA_PER_CODI.get(materialId.trim())
  return v != null && v > 0 ? v : undefined
}
