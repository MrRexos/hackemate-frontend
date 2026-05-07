import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { navigationItems } from '@/data/navigation'
import { siteConfig } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-6">
        <a className="text-lg font-bold text-ink" href="/">
          {siteConfig.name}
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          {navigationItems.map((item) => (
            <a className="transition hover:text-ink" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <Button className="hidden sm:inline-flex">Empezar</Button>
      </Container>
    </header>
  )
}
