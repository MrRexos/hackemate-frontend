import type { NavigationItem } from '@/types/navigation'

export const navigationItems = [
  { href: '#piloto', label: 'Piloto' },
  { href: '#mapa', label: 'Mapa' },
  { href: '#carga', label: 'Carga' },
  { href: '#score', label: 'Score' },
] satisfies readonly NavigationItem[]
