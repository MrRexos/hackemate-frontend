import type { PropsWithChildren } from 'react'
import { cn } from '@/utils/cn'

type ContainerProps = PropsWithChildren<{
  className?: string
}>

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}
