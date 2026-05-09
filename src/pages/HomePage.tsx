import { useState } from 'react'
import type { FormEvent } from 'react'

import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function HomePage() {
  const [truckCode, setTruckCode] = useState('')

  useDocumentTitle('Buscador de camions')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // TODO: connectar la cerca i navegar a la fitxa del camió.
  }

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-lg shadow-slate-200/70 backdrop-blur sm:p-10">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-600" htmlFor="truck-code">
            Introdueix el codi del camió
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              autoComplete="off"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              id="truck-code"
              onChange={(event) => setTruckCode(event.target.value)}
              placeholder="Introdueix el codi"
              required
              type="text"
              value={truckCode}
            />

            <button
              className="h-12 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
              type="submit"
            >
              Buscar
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}


