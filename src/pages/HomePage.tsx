import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { starterFeatures } from '@/data/starterFeatures'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { siteConfig } from '@/lib/site'

export function HomePage() {
  useDocumentTitle(`${siteConfig.name} | Base del hackathon`)

  return (
    <Container className="py-16 sm:py-20">
      <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center" id="features">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
            Base lista para construir rápido cuando empiece el reto.
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted">
            Proyecto inicial con Vite, React, TypeScript, Tailwind CSS y una
            estructura pensada para crecer sin rehacer la organización.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button>Crear primera funcionalidad</Button>
            <Button variant="secondary">Ver estructura</Button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" id="stack">
          <p className="text-sm font-semibold text-brand-600">Stack inicial</p>
          <ul className="mt-5 space-y-4">
            {starterFeatures.map((feature) => (
              <li className="rounded-xl bg-slate-50 p-4" key={feature.title}>
                <h2 className="font-semibold text-ink">{feature.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{feature.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" id="roadmap">
        <h2 className="text-xl font-semibold text-ink">Siguientes pasos</h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Cuando se conozca el reto, esta base ya permite añadir rutas, integrar APIs,
          crear componentes concretos y desplegar en Vercel sin rehacer el setup.
        </p>
      </section>
    </Container>
  )
}
