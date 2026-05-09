import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'

import { getCamioPerCodi } from '@/data/camions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { TruckConductorPanel } from '@/pages/TruckConductorPanel'

type TruckViewTab = 'distribuidora' | 'conductor'

export function TruckDetailsPage() {
  const { codi = '' } = useParams()
  const normalizedCode = codi.trim().toUpperCase()
  const camio = getCamioPerCodi(normalizedCode)
  const [activeTab, setActiveTab] = useState<TruckViewTab>('distribuidora')

  useDocumentTitle(camio ? `Camió ${camio.codi}` : 'Camió no trobat')

  return (
    <main className="min-h-[calc(100vh-5rem)] w-full px-4 py-4 sm:px-6 sm:py-5">
      {!camio ? (
        <div className="mx-auto max-w-lg space-y-5 rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-semibold text-slate-900">Camió no trobat</h1>
          <p className="text-slate-600">
            No existeix cap camió amb el codi <span className="font-semibold">{normalizedCode}</span>.
          </p>
          <Link
            className="inline-flex h-11 items-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            to="/"
          >
            Tornar al cercador
          </Link>
        </div>
      ) : (
        <div className="w-full">
          <div className="mb-4 flex gap-2 rounded-xl bg-slate-100 p-1 sm:mb-5">
            <button
              className={`h-10 flex-1 rounded-lg text-sm font-semibold transition ${
                activeTab === 'distribuidora'
                  ? 'bg-white text-slate-900 shadow'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => setActiveTab('distribuidora')}
              type="button"
            >
              Distribuidora
            </button>
            <button
              className={`h-10 flex-1 rounded-lg text-sm font-semibold transition ${
                activeTab === 'conductor'
                  ? 'bg-white text-slate-900 shadow'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              onClick={() => setActiveTab('conductor')}
              type="button"
            >
              Conductor
            </button>
          </div>

          {activeTab === 'distribuidora' ? (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-slate-900">Vista distribuidora</h2>
              <p className="max-w-3xl text-slate-600">
                Aqui mostrarem la manera mes optima d&apos;omplir el camio per aquest codi.
              </p>
            </div>
          ) : (
            <TruckConductorPanel
              camio={camio}
              key={`${camio.codi}-${camio.ruta?.id ?? 'sense-ruta'}`}
            />
          )}
        </div>
      )}
    </main>
  )
}
