import type { PropsWithChildren } from 'react'
import { SiteHeader } from '@/components/layout/SiteHeader'

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <SiteHeader />
      <main>{children}</main>
    </div>
  )
}
