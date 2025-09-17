'use client'
import { baseFetch } from '@/actions/fetch'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import UserAvatar from './user-avatar'
import { useUser } from '../../hooks/use-user'

export default function AuthButton() {
  const t = useTranslations()
  const { user, isLoading } = useUser()

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
