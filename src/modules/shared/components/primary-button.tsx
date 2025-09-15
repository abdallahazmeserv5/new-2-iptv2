'use client'

import { ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export default function PrimaryButton({ asChild, className, children, ...props }: Props) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      {...props}
      className={cn(
        `px-6 py-4 rounded-lg bg-primary text-white font-medium
         transition-all duration-300
         hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5
         active:scale-95 cursor-pointer`,
        className,
      )}
    >
      {children ?? 'primary-button'}
    </Comp>
  )
}
