import { DistribuidoraCamioPla2D } from '@/components/truck/DistribuidoraCamioPla2D'
import { useCamioDistribucio } from '@/hooks/useCamioDistribucio'
import type { Camio } from '@/models/Camio'

type Props = {
  camio: Camio
}

export function DistribuidoraPalletPlan({ camio }: Props) {
  const ruta = camio.ruta
  const { error } = useCamioDistribucio(camio)

  const pla = camio.plaCarrega
  const linies = camio.liniesDistribucio

  if (!ruta) {
    return (
      <div className="rounded-2xl border border-amber-900/40 bg-amber-950/40 p-8 text-center text-amber-100/90">
        Sense ruta assignada.
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-800/50 bg-red-950/50 p-8 text-center text-red-100">
        {error}
      </div>
    )
  }

  if (!pla || linies === null) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl bg-slate-900/60 text-slate-400">
        Carregant organització…
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-full justify-center">
      <DistribuidoraCamioPla2D pla={pla} teDesbordament={pla.teDesbordament} tipusCamio={camio.tipus} />
    </div>
  )
}
