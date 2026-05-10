/**
 * Mapa opcional: id de vehicle al JSON Excel (`camio.id`) → `codi` intern del `Camio`.
 * Omple’l si els codis del Excel (p. ex. VHC-MOL-01) no coincideixen amb els de la flota.
 *
 * Alternativa sense tocar codi: defineix `VITE_FLEET_CAMIO_ALIASES` al `.env.local`
 * com a `VHC-MOL-01=A1B2C3D,VHC-MOL-02=E4F5G6H`.
 */
export const FLEET_EXCEL_CAMIO_ALIASES: Readonly<Record<string, string>> = {
  // Exemple (descomenta i ajusta si cal):
  // 'VHC-MOL-01': 'A1B2C3D',
}
