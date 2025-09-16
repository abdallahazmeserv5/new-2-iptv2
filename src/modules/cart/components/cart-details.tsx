'use client'

import { useQuery } from '@tanstack/react-query'
import CartItems from './cart-items'
import CheckoutButton from './checkout-button'
import SigninForm from '@/modules/auth/components/signin-form'
import { baseFetch } from '@/actions/fetch'
import { useLocale, useTranslations } from 'next-intl'
import SignupForm from '@/modules/auth/components/signup-form'

// 👇 add type for the prop
type CartDetailsProps = {
  user: {
    id: string
    email?: string
    [key: string]: any
  } | null
}

export default function CartDetails({ user }: CartDetailsProps) {
  const lang = useLocale()
  const t = useTranslations()

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['/cart', lang],
    queryFn: () =>
      baseFetch({
        url: '/api/carts?limit=1',
      }),
    enabled: !!user?.id,
  })

  const cartItems = cartData?.items || []
  const cartId = cartData?.id || null

  return (
    <section className="container mx-auto p-4 flex flex-col gap-5 items-center">
      {isLoading && user?.id ? (
        <p className="text-gray-400">{t('loadingCart')}</p>
      ) : (
        <CartItems cartItems={cartItems} cartId={cartId} user={user} />
      )}
      {user?.id ? <CheckoutButton /> : <SignupForm isCart />}
    </section>
  )
}
