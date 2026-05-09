import { ambSortidaITornadaMollet } from '../data/magatzemMollet'
import type { Camio } from '../models/Camio'
import { TipusCamio } from '../models/Camio'
import type { ParadaRuta } from '../models/Ruta'
import { Ruta } from '../models/Ruta'

function pt(nom: string, lat: number, lng: number, horaArribadaAprox: string): ParadaRuta {
  return { nom, lat, lng, horaArribadaAprox }
}

/**
 * Simula l’entrada de rutes des del backend (una per cada camió del flota actual).
 * Totes comencen al magatzem de Mollet i hi tornen al final.
 */
export function crearRutesSimulades(): Ruta[] {
  return [
    new Ruta(
      'R-MIT-01',
      ambSortidaITornadaMollet(
        [
          pt('Centre Logístic Nord', 41.4187, 2.2015, '07:30'),
          pt('Distribuïdora Costa', 41.4036, 2.1744, '08:15'),
          pt('Magatzem Delta', 41.3851, 2.1734, '09:05'),
        ],
        '06:40',
        '09:50',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-02',
      ambSortidaITornadaMollet(
        [
          pt('Plataforma Est', 41.4252, 2.1773, '07:45'),
          pt('Hub Tarragona', 41.1189, 1.2445, '09:40'),
          pt('Client Retail 12', 41.134, 1.2458, '10:10'),
        ],
        '06:55',
        '11:00',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-03',
      ambSortidaITornadaMollet(
        [
          pt('Nau Central', 41.6488, 0.6222, '08:00'),
          pt('Punt Fresc Lleida', 41.6176, 0.62, '08:35'),
        ],
        '07:00',
        '09:15',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-04',
      ambSortidaITornadaMollet(
        [
          pt('Base Girona', 41.9794, 2.8214, '07:20'),
          pt('Carrefour Platja', 41.6551, 2.7416, '08:50'),
          pt('Botiga 44', 41.6178, 2.6721, '09:25'),
        ],
        '06:25',
        '10:05',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-05',
      ambSortidaITornadaMollet(
        [
          pt('CD Reus', 41.1561, 1.1067, '08:10'),
          pt('Supermercats Muntanya', 41.2258, 1.0636, '08:55'),
        ],
        '07:15',
        '09:40',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-06',
      ambSortidaITornadaMollet(
        [
          pt('Port de Barcelona', 41.3504, 2.1754, '07:00'),
          pt('ZAL', 41.339, 2.1452, '07:40'),
          pt('Última milla Sant Martí', 41.4181, 2.1993, '08:30'),
        ],
        '06:15',
        '09:15',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-07',
      ambSortidaITornadaMollet(
        [
          pt('Polígon Terrassa', 41.5631, 2.0084, '08:25'),
          pt('Magatzem secundari', 41.5729, 2.0172, '08:50'),
        ],
        '07:40',
        '09:35',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-08',
      ambSortidaITornadaMollet(
        [
          pt('Hub Sabadell', 41.5433, 2.1094, '07:55'),
          pt('Parada urbana 1 (Eix)', 41.3874, 2.1686, '08:40'),
          pt('Parada urbana 2 (Gràcia)', 41.402, 2.158, '09:05'),
        ],
        '07:05',
        '09:45',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-09',
      ambSortidaITornadaMollet(
        [
          pt('Vilafranca', 41.3442, 1.6979, '08:05'),
          pt('Manresa express', 41.7293, 1.8282, '09:00'),
        ],
        '07:20',
        '09:50',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-10',
      ambSortidaITornadaMollet(
        [
          pt('Mataró', 41.5381, 2.4445, '07:35'),
          pt('Blanes', 41.6759, 2.7904, '08:20'),
          pt('Lloret', 41.6999, 2.8456, '08:45'),
        ],
        '06:50',
        '09:30',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-MIT-11',
      ambSortidaITornadaMollet(
        [
          pt('Granollers', 41.608, 2.2872, '07:50'),
          pt('Vic', 41.9301, 2.2549, '08:45'),
          pt('Ripoll', 42.201, 2.1909, '09:35'),
        ],
        '07:00',
        '10:20',
      ),
      TipusCamio.Mitja,
    ),
    new Ruta(
      'R-GRA-01',
      ambSortidaITornadaMollet(
        [
          pt('Nau 1 – Recepció', 41.3622, 2.139, '06:30'),
          pt('Nau 2 – Cross-dock', 41.355, 2.128, '07:10'),
          pt('Hub Nacional', 41.32, 2.095, '07:55'),
          pt('Sortida port', 41.3504, 2.1754, '08:35'),
        ],
        '05:45',
        '09:20',
      ),
      TipusCamio.Gran,
    ),
    new Ruta(
      'R-GRA-02',
      ambSortidaITornadaMollet(
        [
          pt('Planta principal', 41.575, 2.008, '06:45'),
          pt('Satèl·lit Oest', 41.385, 2.05, '07:50'),
          pt('Magatzem refrigerat', 41.4, 2.12, '08:25'),
          pt('Export', 41.303, 2.083, '09:05'),
        ],
        '05:55',
        '09:55',
      ),
      TipusCamio.Gran,
    ),
    new Ruta(
      'R-GRA-03',
      ambSortidaITornadaMollet(
        [
          pt('Consolidació', 41.448, 2.22, '07:00'),
          pt('Rampa 12-18', 41.43, 2.19, '07:35'),
          pt('Client majorista A', 41.41, 2.17, '08:05'),
          pt('Client majorista B', 41.39, 2.15, '08:35'),
        ],
        '06:10',
        '09:25',
      ),
      TipusCamio.Gran,
    ),
    new Ruta(
      'R-GRA-04',
      ambSortidaITornadaMollet(
        [
          pt('Origen', 41.5, 2.1, '06:40'),
          pt('Intercanvi Cornellà', 41.36, 2.07, '07:25'),
          pt('Zona franc', 41.34, 2.13, '07:55'),
          pt('Última milla sud', 41.32, 2.14, '08:30'),
        ],
        '05:50',
        '09:15',
      ),
      TipusCamio.Gran,
    ),
    new Ruta(
      'R-PET-01',
      ambSortidaITornadaMollet(
        [
          pt('Parking flota', 41.4036, 2.1744, '09:00'),
          pt('Urgent Sant Cugat', 41.4721, 2.0865, '09:35'),
          pt('Farmàcia Girada', 41.3984, 2.1741, '10:05'),
        ],
        '08:15',
        '10:40',
      ),
      TipusCamio.Petit,
    ),
  ]
}

export type ResultatAssignacio = {
  rutesAssignades: number
  rutesSenseCamioDisponible: Ruta[]
}

/**
 * Assigna cada ruta al primer camió disponible amb el mateix tipus que demana la ruta.
 */
export function assignarRutesACamions(camions: Camio[], rutes: Ruta[]): ResultatAssignacio {
  for (const camio of camions) {
    camio.desassignarRuta()
  }

  const senseCamioDisponible: Ruta[] = []

  for (const ruta of rutes) {
    const camio = camions.find(
      (c) => c.tipus === ruta.tipusCamioRequerit && c.teRutaDisponible,
    )
    if (!camio) {
      senseCamioDisponible.push(ruta)
      continue
    }
    camio.assignarRuta(ruta)
  }

  return {
    rutesAssignades: rutes.length - senseCamioDisponible.length,
    rutesSenseCamioDisponible: senseCamioDisponible,
  }
}
