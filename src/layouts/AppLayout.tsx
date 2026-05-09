import type { PropsWithChildren } from 'react'
import { SiteHeader } from '@/components/layout/SiteHeader'
import type { AppView } from '@/types/navigation'

type AppLayoutProps = PropsWithChildren<{
  activeView: AppView
  onNavigate: (view: AppView) => void
}>

export function AppLayout({ activeView, children, onNavigate }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#fdf4ec] text-[#47392b]">
      <SiteHeader activeView={activeView} onNavigate={onNavigate} />
      <main>{children}</main>
    </div>
  )
}
