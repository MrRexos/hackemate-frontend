import type { NavigationItem } from '@/types/navigation'

export const navigationItems = [
  { view: 'pedidos', label: 'Home' },
  { view: 'organizacion', label: 'Distribución' },
  { view: 'ruta', label: 'Rutas' },
] satisfies readonly NavigationItem[]
