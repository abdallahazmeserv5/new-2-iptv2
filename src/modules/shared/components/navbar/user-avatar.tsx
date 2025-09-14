'use client'

import { baseFetch } from '@/actions/fetch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User } from '@/payload-types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import ImageFallBack from '../image-fall-back'

export default function UserAvatar({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () =>
      baseFetch({
        method: 'POST',
        url: '/api/users/logout',
      }),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['/me'] })
    },
  })

  const t = useTranslations()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ImageFallBack
          width={32}
          height={32}
          className="rounded-full size-[32px] border-2 border-gray-400 cursor-pointer"
          src={'/home/avatar.webp'}
          alt={'User'}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuLabel>{user?.email ?? 'Anonymous User'}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => mutation.mutate()}>{t('logOut')}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
