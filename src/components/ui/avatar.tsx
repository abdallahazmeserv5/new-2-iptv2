'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

import { cn } from '@/lib/utils'
import ImageFallBack from '@/modules/shared/components/image-fall-back' // adjust path

function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  src,
  alt,
  ...props
}: Omit<React.ComponentProps<typeof AvatarPrimitive.Image>, 'asChild'> & {
  src?: string
  alt?: string
}) {
  return (
    <AvatarPrimitive.Image data-slot="avatar-image" asChild {...props}>
      <ImageFallBack
        src={src}
        alt={alt ?? 'avatar'}
        className={cn('aspect-square size-full object-cover', className)}
      />
    </AvatarPrimitive.Image>
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn('bg-muted flex size-full items-center justify-center rounded-full', className)}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
