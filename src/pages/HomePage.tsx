import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function HomePage() {
  const [truckCode, setTruckCode] = useState('')
  const navigate = useNavigate()

  useDocumentTitle('Buscador de camions')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const normalizedCode = truckCode.trim().toUpperCase()
    if (!normalizedCode) return
    navigate(`/camio/${normalizedCode}`)
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center overscroll-none px-4 py-0">
      <div className="w-full max-w-[17.5rem] text-center sm:max-w-xs">
        <h1 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-[1.75rem]">
           CODI DEL CAMIÓ
        </h1>

        <form className="mt-12 space-y-6" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="truck-code">
            CODI DEL CAMIÓ
          </label>
          <input
            autoComplete="off"
            className="w-full border-0 border-b border-slate-300 bg-transparent py-3 text-center text-2xl font-semibold  tracking-[0.28em] text-slate-900 placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-700 focus:outline-none focus:ring-0"
            id="truck-code"
            onChange={(event) => setTruckCode(event.target.value.toUpperCase())}
            placeholder="Introdueix el codi aquí"
            required
            type="text"
            value={truckCode}
          />

          <button
            className="w-full rounded-md border border-slate-200 py-2.5 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-100/70 active:bg-slate-100"
            type="submit"
          >
            Obrir fitxa
          </button>
        </form>
      </div>
    </div>
  )
}
