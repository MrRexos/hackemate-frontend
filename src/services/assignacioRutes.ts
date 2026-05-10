import { FLEET_EXCEL_CAMIO_ALIASES } from '../data/fleetExcelCamioAliases'
import { ambSortidaITornadaMollet } from '../data/magatzemMollet'
import type { Camio } from '../models/Camio'
import { TipusCamio } from '../models/Camio'
import type { ParadaRuta } from '../models/Ruta'
import { Ruta } from '../models/Ruta'
import { setCamioLookupFromExcel } from '@/data/camioLookupRegistry'

function pt(nom: string, lat: number, lng: number, horaArribadaAprox: string): ParadaRuta {
  return { nom, lat, lng, horaArribadaAprox }
}

/**
 * Simula l’entrada de rutes des del backend (una per cada camió del flota actual).
 * Totes comencen al magatzem de Mollet i hi tornen al final.
 * Parades més dens que abans (més entregues per camió).
 */
export function crearRutesSimulades(): Ruta[] {
  return [
    new Ruta(
      'R-MIT-01',
      ambSortidaITornadaMollet(
        [
          pt('Centre Logístic Nord', 41.4187, 2.2015, '07:30'),
          pt('Retail Hospitalet', 41.3625, 2.0998, '07:52'),
          pt('Distribuïdora Costa', 41.4036, 2.1744, '08:15'),
          pt('Cash & Carry Sud', 41.3755, 2.1412, '08:38'),
          pt('Magatzem Delta', 41.3851, 2.1734, '09:05'),
          pt('Última milla Sant Adrià', 41.4238, 2.2189, '09:28'),
        ],
        '06:40',
        '09:55',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-02',
      ambSortidaITornadaMollet(
        [
          pt('Plataforma Est', 41.4252, 2.1773, '07:45'),
          pt('Centre Cornellà', 41.3547, 2.0841, '08:05'),
          pt('Mercabarna satellite', 41.3412, 2.1356, '08:35'),
          pt('Hub Tarragona', 41.1189, 1.2445, '09:40'),
          pt('Polígon Constantí', 41.1544, 1.2123, '09:58'),
          pt('Client Retail 12', 41.134, 1.2458, '10:15'),
        ],
        '06:55',
        '11:05',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-03',
      ambSortidaITornadaMollet(
        [
          pt('Nau Central', 41.6488, 0.6222, '08:00'),
          pt('Polígon Secà Lleida', 41.6344, 0.6148, '08:18'),
          pt('Punt Fresc Lleida', 41.6176, 0.62, '08:35'),
          pt('Mercat Agro Ponent', 41.6033, 0.6289, '08:52'),
        ],
        '07:00',
        '09:25',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-04',
      ambSortidaITornadaMollet(
        [
          pt('Base Girona', 41.9794, 2.8214, '07:20'),
          pt('Polígon Celrà', 41.8723, 2.8734, '07:55'),
          pt('Carrefour Platja', 41.6551, 2.7416, '08:50'),
          pt('Centre Comercial Girona', 41.6412, 2.7589, '09:08'),
          pt('Botiga 44', 41.6178, 2.6721, '09:25'),
          pt('Hostaleria Platja d’Aro', 41.5727, 2.8178, '09:48'),
        ],
        '06:25',
        '10:15',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-05',
      ambSortidaITornadaMollet(
        [
          pt('CD Reus', 41.1561, 1.1067, '08:10'),
          pt('Polígon Vandellòs', 41.1812, 1.0526, '08:32'),
          pt('Supermercats Muntanya', 41.2258, 1.0636, '08:55'),
          pt('Hospitalitat Salou', 41.0769, 1.1339, '09:18'),
        ],
        '07:15',
        '09:45',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-06',
      ambSortidaITornadaMollet(
        [
          pt('Port de Barcelona', 41.3504, 2.1754, '07:00'),
          pt('ZAL', 41.339, 2.1452, '07:40'),
          pt('Ciutat Vella retail', 41.3827, 2.1779, '08:05'),
          pt('Eixample carrer Mallorca', 41.3945, 2.1627, '08:18'),
          pt('Última milla Sant Martí', 41.4181, 2.1993, '08:30'),
          pt('Besòs retail park', 41.4345, 2.2124, '08:48'),
        ],
        '06:15',
        '09:25',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-07',
      ambSortidaITornadaMollet(
        [
          pt('Polígon Terrassa', 41.5631, 2.0084, '08:25'),
          pt('Rubí centre', 41.4923, 2.0324, '08:42'),
          pt('Magatzem secundari', 41.5729, 2.0172, '08:50'),
          pt('Sabadell sud', 41.5298, 2.1097, '09:08'),
        ],
        '07:40',
        '09:45',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-08',
      ambSortidaITornadaMollet(
        [
          pt('Hub Sabadell', 41.5433, 2.1094, '07:55'),
          pt('Cerdanyola Riera', 41.4918, 2.1407, '08:22'),
          pt('Parada urbana 1 (Eix)', 41.3874, 2.1686, '08:40'),
          pt('Les Corts express', 41.3879, 2.1338, '08:52'),
          pt('Parada urbana 2 (Gràcia)', 41.402, 2.158, '09:05'),
          pt('Clinic Sarrià', 41.3969, 2.1215, '09:22'),
        ],
        '07:05',
        '09:55',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-09',
      ambSortidaITornadaMollet(
        [
          pt('Vilafranca', 41.3442, 1.6979, '08:05'),
          pt('Igualada hub', 41.5789, 1.6172, '08:35'),
          pt('Manresa express', 41.7293, 1.8282, '09:00'),
          pt('Cardona distribució', 41.9148, 1.6812, '09:28'),
        ],
        '07:20',
        '09:55',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-10',
      ambSortidaITornadaMollet(
        [
          pt('Mataró', 41.5381, 2.4445, '07:35'),
          pt('Premià de Mar', 41.4924, 2.3567, '07:52'),
          pt('Blanes', 41.6759, 2.7904, '08:20'),
          pt('Tossa outlet', 41.7224, 2.9326, '08:38'),
          pt('Lloret', 41.6999, 2.8456, '08:45'),
          pt('Sta. Cristina urbanització', 41.6714, 2.7989, '09:05'),
        ],
        '06:50',
        '09:35',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-11',
      ambSortidaITornadaMollet(
        [
          pt('Granollers', 41.608, 2.2872, '07:50'),
          pt('Cardedeu', 41.6418, 2.3588, '08:18'),
          pt('Vic', 41.9301, 2.2549, '08:45'),
          pt('Ruta del Formatge', 41.9598, 2.2834, '09:08'),
          pt('Ripoll', 42.201, 2.1909, '09:35'),
        ],
        '07:00',
        '10:25',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-GRA-01',
      ambSortidaITornadaMollet(
        [
          pt('Nau 1 – Recepció', 41.3622, 2.139, '06:30'),
          pt('Nau 2 – Cross-dock', 41.355, 2.128, '07:10'),
          pt('Consolidació Sant Boi', 41.3427, 2.0357, '07:35'),
          pt('Hub Nacional', 41.32, 2.095, '07:55'),
          pt('Zona Franca rampes', 41.3512, 2.1418, '08:18'),
          pt('Sortida port', 41.3504, 2.1754, '08:35'),
        ],
        '05:45',
        '09:25',
      ),
      TipusCamio.Gran,
    ),
    new Ruta(
      'R-GRA-02',
      ambSortidaITornadaMollet(
        [
          pt('Planta principal', 41.575, 2.008, '06:45'),
          pt('Terrassa nord', 41.5698, 2.0324, '07:18'),
          pt('Satèl·lit Oest', 41.385, 2.05, '07:50'),
          pt('Cornellà refrigerat', 41.3544, 2.0846, '08:08'),
          pt('Magatzem refrigerat', 41.4, 2.12, '08:25'),
          pt('Export', 41.303, 2.083, '09:05'),
        ],
        '05:55',
        '10:00',
      ),
      TipusCamio.Gran,
    ),
    new Ruta(
      'R-GRA-03',
      ambSortidaITornadaMollet(
        [
          pt('Consolidació', 41.448, 2.22, '07:00'),
          pt('Badalona platja', 41.4428, 2.2477, '07:22'),
          pt('Rampa 12-18', 41.43, 2.19, '07:35'),
          pt('Santa Coloma hub', 41.4515, 2.2088, '07:52'),
          pt('Client majorista A', 41.41, 2.17, '08:05'),
          pt('Client majorista B', 41.39, 2.15, '08:35'),
        ],
        '06:10',
        '09:35',
      ),
      TipusCamio.Gran,
    ),
    new Ruta(
      'R-GRA-04',
      ambSortidaITornadaMollet(
        [
          pt('Origen', 41.5, 2.1, '06:40'),
          pt('Esplugues rampa', 41.3766, 2.0898, '07:08'),
          pt('Intercanvi Cornellà', 41.36, 2.07, '07:25'),
          pt('El Prat industrial', 41.3245, 2.0915, '07:42'),
          pt('Zona franc', 41.34, 2.13, '07:55'),
          pt('Última milla sud', 41.32, 2.14, '08:30'),
        ],
        '05:50',
        '09:25',
      ),
      TipusCamio.Gran,
    ),
    new Ruta(
      'R-PET-01',
      ambSortidaITornadaMollet(
        [
          pt('Parking flota', 41.4036, 2.1744, '09:00'),
          pt('Urgent Sant Just', 41.3839, 2.0748, '09:22'),
          pt('Urgent Sant Cugat', 41.4721, 2.0865, '09:35'),
          pt('Farmàcia Girada', 41.3984, 2.1741, '10:05'),
          pt('Hospital Docència', 41.3876, 2.1599, '10:22'),
        ],
        '08:15',
        '10:45',
      ),
      TipusCamio.Petit,
    ),
  ]
}

export type ResultatAssignacio = {
  rutesAssignades: number
  rutesSenseCamioDisponible: Ruta[]
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

function codiCamioObjectiuDesExcel(excelIdRaw: string): string {
  const excelId = normalitzaCodiCamio(excelIdRaw)
  if (!excelId) return ''
  const desEnv = mapaAliasesDesEnv().get(excelId)
  if (desEnv) return normalitzaCodiCamio(desEnv)
  const taula = FLEET_EXCEL_CAMIO_ALIASES[excelId]
  if (taula) return normalitzaCodiCamio(taula)
  return excelId
}

/**
 * Assigna rutes als camions: primer per `codi` Excel (o àlies) coincident i tipus adequat,
 * després primer camió lliure del mateix `tipusCamioRequerit`.
 */
export function assignarRutesACamionsDesExcel(
  camions: Camio[],
  rutes: Ruta[],
  codiCamioExcelPerRutaId: Record<string, string>,
): ResultatAssignacio {
  const lookupExcelToInternal: Record<string, string> = {}

  for (const camio of camions) {
    camio.desassignarRuta()
  }

  const senseCamioDisponible: Ruta[] = []

  for (const ruta of rutes) {
    const excelId = (codiCamioExcelPerRutaId[ruta.id] ?? '').trim()
    const codiObjectiu = excelId ? codiCamioObjectiuDesExcel(excelId) : ''
    const codiNorm = codiObjectiu ? normalitzaCodiCamio(codiObjectiu) : ''

    let camio: Camio | undefined

    if (codiNorm) {
      camio = camions.find((c) => normalitzaCodiCamio(c.codi) === codiNorm && c.teRutaDisponible)
    }

    if (!camio) {
      camio = camions.find((c) => c.tipus === ruta.tipusCamioRequerit && c.teRutaDisponible)
    }

    if (!camio) {
      senseCamioDisponible.push(ruta)
      continue
    }
    camio.assignarRuta(ruta)
    if (excelId) {
      lookupExcelToInternal[excelId] = camio.codi
    }
  }

  setCamioLookupFromExcel(lookupExcelToInternal)

  return {
    rutesAssignades: rutes.length - senseCamioDisponible.length,
    rutesSenseCamioDisponible: senseCamioDisponible,
  }
}

/**
 * Assigna cada ruta al primer camió disponible amb el mateix tipus que demana la ruta.
 */
export function assignarRutesACamions(camions: Camio[], rutes: Ruta[]): ResultatAssignacio {
  const buit: Record<string, string> = {}
  return assignarRutesACamionsDesExcel(camions, rutes, buit)
}
