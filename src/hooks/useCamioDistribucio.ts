import { useEffect, useState } from 'react'

import type { Camio } from '@/models/Camio'
import { fetchLiniesDistribucioAmbOrigen } from '@/services/distribucioApi'
import {
  fingerprintLiniesDistribucio,
  haIniciatRutaConductorSession,
  loadCamioDistribucioSnapshot,
  saveCamioDistribucioSnapshot,
} from '@/utils/camioDistribucioPersistence'
import { loadConductorRouteSession } from '@/utils/conductorRoutePersistence'

/**
 * Carrega línies de distribució des de Supabase/mock i recalcula `plaCarrega` al camió.
 * Si la sessió del conductor indica que la ruta ja s’havia iniciat i hi ha un pla guardat
 * (mateixa empremta de línies), restaura posicions de caixes i retornables sense tornar a planificar.
 */
export function useCamioDistribucio(camio: Camio) {
  const [error, setError] = useState<string | null>(null)
  const [, bump] = useState(0)
  const ruta = camio.ruta

  useEffect(() => {
    if (!ruta) return
    let cancelled = false

    const run = async () => {
      await Promise.resolve()
      if (cancelled) return
      setError(null)
      try {
        const sessioConductor = loadConductorRouteSession(camio.codi, ruta.id)
        const res = await fetchLiniesDistribucioAmbOrigen(
          ruta.id,
          ruta.parades.length,
          ruta.transporteId,
          ruta.ordreEntregues,
          camio.tipus,
        )
        if (cancelled) return

        const fp = fingerprintLiniesDistribucio(res.linies)
        const guardat = loadCamioDistribucioSnapshot(camio.codi, ruta.id)

        if (
          haIniciatRutaConductorSession(sessioConductor) &&
          guardat &&
          guardat.rutaId === ruta.id &&
          guardat.liniesFingerprint === fp
        ) {
          camio.aplicarSnapshotDistribucioPersistit(guardat)
          bump((n) => n + 1)
          return
        }

        camio.actualitzarDistribucio(res.linies)
        if (haIniciatRutaConductorSession(sessioConductor)) {
          const snap = camio.extreureSnapshotDistribucioPersistit(fp)
          if (snap) {
            saveCamioDistribucioSnapshot(camio.codi, ruta.id, snap)
          }
        }
        bump((n) => n + 1)
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error de càrrega.')
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [ruta, camio])

  return {
    error: ruta ? error : null,
    plaCarrega: camio.plaCarrega,
    liniesCarregades: camio.liniesDistribucio !== null,
  }
}
