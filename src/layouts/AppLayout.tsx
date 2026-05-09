import type { PropsWithChildren } from 'react'
import { SiteHeader } from '@/components/layout/SiteHeader'

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-slate-50 text-ink">
      <SiteHeader />
      <main className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  )
}
