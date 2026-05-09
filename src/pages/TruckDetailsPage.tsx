import { Link, useParams } from 'react-router-dom'
import { useState } from 'react'

import { getCamioPerCodi } from '@/data/camions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

type TruckViewTab = 'distribuidora' | 'conductor'

export function TruckDetailsPage() {
  const { codi = '' } = useParams()
  const normalizedCode = codi.trim().toUpperCase()
  const camio = getCamioPerCodi(normalizedCode)
  const [activeTab, setActiveTab] = useState<TruckViewTab>('distribuidora')

  useDocumentTitle(camio ? `Camió ${camio.codi}` : 'Camió no trobat')

  return (
    <main className="min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-6">
      <section className="mx-auto w-full max-w-6xl rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-200/70 backdrop-blur sm:p-8">
        {!camio ? (
          <div className="space-y-5">
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
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Link
                aria-label="Tornar enrere"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-100"
                to="/"
              >
                ←
              </Link>
              <h1 className="text-2xl font-semibold text-slate-900">{camio.codi}</h1>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex gap-2 rounded-xl bg-slate-100 p-1">
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
                  <p className="text-slate-600">
                    Aqui mostrarem la manera mes optima d&apos;omplir el camio per aquest codi.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900">Vista conductor</h2>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      <iframe
                        className="h-[420px] w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src="https://www.openstreetmap.org/export/embed.html?bbox=2.10%2C41.33%2C2.21%2C41.45&layer=mapnik"
                        title="Mapa de ruta del conductor"
                      />
                    </div>

                    <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="text-base font-semibold text-slate-900">Punts de ruta</h3>
                      <p className="mt-2 text-sm text-slate-600">Ordre de parades a visitar.</p>

                      <ol className="mt-4 space-y-2">
                        <li className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">
                          No hi ha cap ruta assignada encara.
                        </li>
                      </ol>
                    </aside>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
