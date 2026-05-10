import { useEffect, useState } from 'react'

import type { Camio } from '@/models/Camio'
import { fetchLiniesDistribucioAmbOrigen } from '@/services/distribucioApi'

/**
 * Carrega línies de distribució des de Supabase/mock i recalcula `plaCarrega` al camió.
 * Mateixa lògica que la vista Distribuidora; necessària al conductor per veure paletes per parada.
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
        const res = await fetchLiniesDistribucioAmbOrigen(
          ruta.id,
          ruta.parades.length,
          ruta.transporteId,
          ruta.ordreEntregues,
          camio.tipus,
        )
        if (cancelled) return
        camio.actualitzarDistribucio(res.linies)
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
