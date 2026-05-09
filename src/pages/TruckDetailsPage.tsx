import { Link, useParams } from 'react-router-dom'

import { getCamioPerCodi } from '@/data/camions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function TruckDetailsPage() {
  const { codi = '' } = useParams()
  const normalizedCode = codi.trim().toUpperCase()
  const camio = getCamioPerCodi(normalizedCode)

  useDocumentTitle(camio ? `Camió ${camio.codi}` : 'Camió no trobat')

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-lg shadow-slate-200/70 backdrop-blur sm:p-10">
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
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Fitxa de camió</p>
              <h1 className="mt-1 text-3xl font-semibold text-slate-900">{camio.codi}</h1>
            </div>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-sm text-slate-500">Codi</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900">{camio.codi}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-sm text-slate-500">Tipus</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900">{camio.tipus}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-sm text-slate-500">Disponible</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900">
                  {camio.teRutaDisponible ? 'Sí' : 'No'}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <dt className="text-sm text-slate-500">Ruta assignada</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-900">
                  {camio.ruta ? 'Assignada' : 'Cap'}
                </dd>
              </div>
            </dl>

            <Link
              className="inline-flex h-11 items-center rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              to="/"
            >
              Tornar al cercador
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
