import { Container } from '@/components/ui/Container'

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-center">
        <a className="text-lg font-bold text-ink" href="/">
          Hacke Mate
        </a>
      </Container>
    </header>
  )
}
