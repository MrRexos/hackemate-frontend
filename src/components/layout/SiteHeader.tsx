import { navigationItems } from '@/data/navigation'
import { siteConfig } from '@/lib/site'
import type { AppView } from '@/types/navigation'
import { cn } from '@/utils/cn'
import dammLogo from '../../../assets/damm.png'

type SiteHeaderProps = {
  activeView: AppView
  onNavigate: (view: AppView) => void
}

export function SiteHeader({ activeView, onNavigate }: SiteHeaderProps) {
  return (
    <header className="border-b border-[#f0e4d8] bg-[#fdf4ec]">
      <div
        className={cn(
          'mx-auto flex h-12 w-full items-center justify-between gap-3 min-[1100px]:h-[70px]',
          activeView === 'ruta'
            ? 'max-w-[1168px] px-2 sm:px-3 min-[1100px]:gap-6 min-[1100px]:px-3'
            : 'max-w-[924px] px-5 sm:px-6 lg:px-0 min-[1100px]:max-w-[1104px] min-[1100px]:gap-6',
        )}
      >
        <button
          aria-label={siteConfig.name}
          className="flex items-center gap-[9px] text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c53030] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf4ec]"
          onClick={() => onNavigate('pedidos')}
          type="button"
        >
          <img
            alt="Damm"
            className="h-[15px] w-[52px] object-contain min-[1100px]:h-[19px] min-[1100px]:w-[65px]"
            src={dammLogo}
          />
          <span className="whitespace-nowrap text-[11px] font-bold leading-none text-[#8f7e7e] min-[1100px]:text-[14px]">
            x HackeMate
          </span>
        </button>

        <nav className="flex h-full items-center gap-[16px] text-[12px] font-bold text-[#8f7e7e] min-[1100px]:gap-[34px] min-[1100px]:text-[14px]">
          {navigationItems.map((item) => (
            <button
              className={cn(
                'relative h-full transition hover:text-[#c53030] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c53030] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf4ec]',
                activeView === item.view && 'text-[#c53030]',
              )}
              key={item.view}
              onClick={() => onNavigate(item.view)}
              type="button"
            >
              <span className="flex h-full items-center">{item.label}</span>
              {activeView === item.view ? (
                <span className="absolute bottom-[-1px] left-1/2 h-[2px] w-[49px] -translate-x-1/2 bg-[#c53030] min-[1100px]:w-[58px]" />
              ) : null}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
