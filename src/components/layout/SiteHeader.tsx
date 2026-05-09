import { Link, useMatch } from 'react-router-dom'

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        clipRule="evenodd"
        d="M11.78 4.22a.75.75 0 010 1.06L7.06 10l4.72 4.72a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z"
        fillRule="evenodd"
      />
    </svg>
  )
}

export function SiteHeader() {
  const truckMatch = useMatch('/camio/:codi')
  const rawCodi = truckMatch?.params.codi ?? ''
  const displayCodi = rawCodi.trim().toUpperCase()

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto grid h-16 w-full max-w-none grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center justify-self-start">
          {truckMatch ? (
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <Link
                aria-label="Tornar al cercador"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition hover:bg-slate-100 sm:h-10 sm:w-10"
                to="/"
              >
                <IconChevronLeft className="h-5 w-5 -translate-x-px" />
              </Link>
              <span
                className="truncate font-semibold text-slate-900 sm:text-lg"
                title={displayCodi || rawCodi}
              >
                {displayCodi || rawCodi}
              </span>
            </div>
          ) : null}
        </div>
        <a className="justify-self-center text-lg font-bold text-ink" href="/">
          Hacke Mate
        </a>
        <span aria-hidden className="justify-self-end" />
      </div>
    </header>
  )
}
