'use client'
import { Button } from '@/components/ui/button'
import { User } from '@/payload-types'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import UserAvatar from './user-avatar'
import { baseFetch } from '@/actions/fetch'
import { useQuery } from '@tanstack/react-query'

export default function AuthButton() {
  const t = useTranslations()
  const { data, isLoading } = useQuery({
    staleTime: Infinity,
    queryKey: ['/me'],
    queryFn: async () => {
      const res = await baseFetch({ url: '/api/users/me' })
      return res?.user ?? null
    },
  })
  const user = data?.user

  if (isLoading) {
    return <div className="size-8" />
  }

  return (
    <>
      {!!user ? (
        <UserAvatar user={user} />
      ) : (
        <Button variant={'outline'} asChild>
          <Link className="font-bold" href={'/signin'}>
            {t('login')}
          </Link>
        </Button>
      )}
    </>
  )
}
