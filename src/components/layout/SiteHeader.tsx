import { Container } from '@/components/ui/Container'
import { navigationItems } from '@/data/navigation'
import { siteConfig } from '@/lib/site'
import type { AppView } from '@/types/navigation'
import { cn } from '@/utils/cn'

type SiteHeaderProps = {
  activeView: AppView
  onNavigate: (view: AppView) => void
}

export function SiteHeader({ activeView, onNavigate }: SiteHeaderProps) {
  return (
    <header className="border-b border-cream-300 bg-cream-50">
      <Container className="flex h-16 items-center justify-between gap-6">
        <button
          className="text-left text-lg font-semibold tracking-tight text-ink transition hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
          onClick={() => onNavigate('pedidos')}
          type="button"
        >
          {siteConfig.name}
        </button>

        <nav className="flex items-center gap-4 text-sm font-medium text-muted md:gap-8">
          {navigationItems.map((item) => (
            <button
              className={cn(
                'transition hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
              )}
              key={item.view}
              onClick={() => onNavigate(item.view)}
              style={activeView === item.view ? { color: '#9B2C2C' } : undefined}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </Container>
    </header>
  )
}
