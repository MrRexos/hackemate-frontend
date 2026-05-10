import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

import { buttonCn, type ButtonSize, type ButtonVariant } from '@/components/ui/buttonStyles'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
    size?: ButtonSize
  }
>

export function Button({
  children,
  className,
  variant = 'outline',
  size = 'default',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button className={buttonCn(variant, size, className)} type={type} {...props}>
      {children}
    </button>
  )
}

export { buttonCn, mapControlFabCn, segmentTabCn, segmentTrackCn } from '@/components/ui/buttonStyles'
export type { ButtonVariant, ButtonSize } from '@/components/ui/buttonStyles'
