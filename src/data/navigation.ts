import type { NavigationItem } from '@/types/navigation'

export const navigationItems = [
  { view: 'pedidos', label: 'Pedidos' },
  { view: 'organizacion', label: 'Organización' },
  { view: 'ruta', label: 'Ruta' },
] satisfies readonly NavigationItem[]
