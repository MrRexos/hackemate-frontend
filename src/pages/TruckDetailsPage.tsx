import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'

import { DistribuidoraPalletPlan } from '@/components/truck/DistribuidoraPalletPlan'
import { buttonCn, segmentTabCn, segmentTrackCn } from '@/components/ui/Button'
import { getCamioPerCodi } from '@/data/camions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { TruckConductorPanel } from '@/pages/TruckConductorPanel'

type TruckViewTab = 'distribuidora' | 'conductor'

export function TruckDetailsPage() {
  const { codi = '' } = useParams()
  const normalizedCode = codi.trim().toUpperCase()
  const camio = getCamioPerCodi(normalizedCode)
  const [activeTab, setActiveTab] = useState<TruckViewTab>('distribuidora')
  const [plaDistribucioRevision, setPlaDistribucioRevision] = useState(0)

  useDocumentTitle(camio ? `Camió ${camio.codi}` : 'Camió no trobat')

  return (
    <main className="flex min-h-0 w-full flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5">
      {!camio ? (
        <div className="mx-auto max-w-lg space-y-5 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Camió no trobat</h1>
          <p className="text-slate-600">
            No existeix cap camió amb el codi <span className="font-semibold">{normalizedCode}</span>.
          </p>
          <Link className={buttonCn('primary', 'comfortable', 'inline-flex')} to="/">
            Tornar al cercador
          </Link>
        </div>
      ) : (
        <div className="flex w-full min-h-0 flex-1 flex-col">
          <div className={segmentTrackCn}>
            <button
              className={segmentTabCn(activeTab === 'distribuidora')}
              onClick={() => setActiveTab('distribuidora')}
              type="button"
            >
              Camió
            </button>
            <button
              className={segmentTabCn(activeTab === 'conductor')}
              onClick={() => setActiveTab('conductor')}
              type="button"
            >
              Ruta
            </button>
          </div>

          <div className={activeTab === 'distribuidora' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
            <div className="shrink-0 space-y-1 pb-2">
              <h2 className="text-lg font-semibold text-slate-900">Càrrega Camió:</h2>
              
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-6">
              <DistribuidoraPalletPlan camio={camio} plaDistribucioRevision={plaDistribucioRevision} />
            </div>
          </div>

          <div className={activeTab === 'conductor' ? 'flex min-h-0 flex-1 flex-col' : 'hidden'}>
            <TruckConductorPanel
              camio={camio}
              key={`${camio.codi}-${camio.ruta?.id ?? 'sense-ruta'}`}
              onReiniciSimulacioRuta={() => setPlaDistribucioRevision((n) => n + 1)}
              routeTabVisible={activeTab === 'conductor'}
            />
          </div>
        </div>
      )}
    </main>
  )
}
