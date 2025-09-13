import { Button } from '@/components/ui/button'
import { User } from '@/payload-types'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import React from 'react'

export default async function AuthButton({
  user,
}: {
  user:
    | (User & {
        collection: 'users'
      })
    | null
}) {
  const t = await getTranslations()
  return (
    <>
      {!!user ? (
        <p className="text-white">
          {user?.email?.length > 5 ? user.email.slice(0, 5) + '…' : user.email}
        </p>
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
