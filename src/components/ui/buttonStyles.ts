import { cn } from '@/utils/cn'

/**
 * Radi lleugerament fora de l’escala Tailwind per defecte: modern però no “pastilla IA”.
 * Ombra sòlida + micro-moviment: es conserva el caràcter; les cantonades suavitzen el conjunt.
 */
const r = 'rounded-[10px]'

const shadowBlock = 'shadow-[4px_4px_0_0_#171717]'
const shadowBlockSm = 'shadow-[2px_2px_0_0_#171717]'

const base = cn(
  'inline-flex items-center justify-center gap-2 border-2 border-neutral-900 text-sm font-semibold tracking-tight',
  r,
  'transition-[transform,box-shadow,background-color,color,border-color] duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0',
  'hover:-translate-x-px hover:-translate-y-px',
  shadowBlock,
  'hover:shadow-[3px_3px_0_0_#171717]',
  'active:translate-x-0 active:translate-y-0 active:shadow-none',
)

export type ButtonVariant = 'primary' | 'outline' | 'ghost'

export type ButtonSize = 'default' | 'comfortable' | 'full'

const variants: Record<ButtonVariant, string> = {
  primary: cn(
    'bg-neutral-900 text-white',
    'hover:bg-neutral-800 hover:text-white',
  ),
  outline: cn('bg-white text-neutral-900', 'hover:bg-neutral-50'),
  ghost: cn(
    'border-transparent bg-transparent text-neutral-600 shadow-none',
    'hover:border-neutral-900 hover:bg-white hover:text-neutral-900',
    shadowBlockSm,
    'hover:shadow-[2px_2px_0_0_#171717] hover:-translate-x-px hover:-translate-y-px',
    'active:shadow-none',
  ),
}

const sizes: Record<ButtonSize, string> = {
  default: 'min-h-10 px-4 py-2.5',
  comfortable: 'min-h-11 px-4 py-2.5',
  full: 'w-full min-h-10 px-4 py-2.5',
}

export function buttonCn(
  variant: ButtonVariant = 'outline',
  size: ButtonSize = 'default',
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className)
}

/** Pestañes: bloc amb el mateix radi i ombra; overflow retalla les cel·les interiors. */
export const segmentTrackCn = cn(
  'mb-4 flex shrink-0 overflow-hidden border-2 border-neutral-900 bg-neutral-50',
  r,
  'shadow-[4px_4px_0_0_#171717] sm:mb-5',
)

export function segmentTabCn(active: boolean, className?: string): string {
  return cn(
    'h-10 min-h-10 flex-1 border-r-2 border-neutral-900 text-sm font-semibold tracking-tight transition-colors duration-150 last:border-r-0',
    active
      ? 'bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white'
      : 'bg-white text-neutral-800 hover:bg-neutral-100',
    className,
  )
}

/** Mapa / enrere: mateix radi per coherència amb la resta de botons. */
export const mapControlFabCn = cn(
  'flex h-9 w-9 shrink-0 items-center justify-center border-2 border-neutral-900 bg-white text-neutral-900',
  r,
  'shadow-[3px_3px_0_0_#171717] transition-[transform,box-shadow,background-color] duration-150 ease-out',
  'hover:-translate-x-px hover:-translate-y-px hover:bg-neutral-50 hover:shadow-[2px_2px_0_0_#171717]',
  'active:translate-x-0 active:translate-y-0 active:shadow-none',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2',
)
