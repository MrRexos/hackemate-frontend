import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
  }
>

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[#c53030] text-white hover:bg-[#b12b2b]',
  secondary: 'bg-[#fdf9f6] text-[#806a54] hover:bg-white',
}

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex min-h-10 items-center justify-center rounded-full px-5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c53030]',
        variants[variant],
        className,
      )}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}
