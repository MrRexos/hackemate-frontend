import type { ParadaRuta } from '@/models/Ruta'

const EPS = 1e-5

export function mateixesCoordenadesParada(a: ParadaRuta, b: ParadaRuta): boolean {
  return Math.abs(a.lat - b.lat) < EPS && Math.abs(a.lng - b.lng) < EPS
}

/** Primera i última parada del model actual = magatzem Mollet. */
export function esParadaMagatzem(index: number, totalParades: number): boolean {
  if (totalParades === 0) return false
  return index === 0 || index === totalParades - 1
}

/**
 * Si sortida i tornada són el mateix punt, només un marcador gran al mapa (evita superposició).
 */
export function ometreMarcadorFiSiMateixMagatzem(
  parades: readonly ParadaRuta[],
  index: number,
): boolean {
  if (parades.length < 2 || index !== parades.length - 1) return false
  return mateixesCoordenadesParada(parades[0], parades[parades.length - 1])
}
