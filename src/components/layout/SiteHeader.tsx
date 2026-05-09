import { Container } from '@/components/ui/Container'
import { navigationItems } from '@/data/navigation'
import { siteConfig } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="border-b border-cream-300 bg-cream-50">
      <Container className="flex h-16 items-center justify-between gap-6">
        <a className="text-lg font-semibold tracking-tight text-ink" href="/">
          {siteConfig.name}
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted md:flex">
          {navigationItems.map((item) => (
            <a className="transition hover:text-red-600" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </Container>
    </header>
  )
}
