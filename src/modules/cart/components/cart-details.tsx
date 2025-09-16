'use client'

import { baseFetch } from '@/actions/fetch'
import SigninForm from '@/modules/auth/components/signin-form'
import { useQuery } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import CartItems from './cart-items'
import CheckoutButton from './checkout-button'
import PaymentMethods from './payment-methods'
import { useState } from 'react'

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
  const [selected, setSelected] = useState<number | null>(null)

  const { data: rawCartData, isLoading } = useQuery({
    queryKey: ['/cart', lang],
    queryFn: () =>
      baseFetch({
        url: '/api/carts',
      }),
    enabled: !!user?.id,
  })

  // Normalize cartData: always use the first cart from docs if present
  const cartData = rawCartData?.docs?.[0] || rawCartData || { items: [] }

  const cartItems = cartData?.items || []
  const cartId = cartData?.id || null

  return (
    <section className="container mx-auto p-4 flex flex-col gap-8 items-center">
      {isLoading && user?.id ? (
        <p className="text-gray-400">{t('loadingCart')}</p>
      ) : (
        <CartItems cartItems={cartItems} cartId={cartId} user={user} />
      )}
      {user?.id ? (
        <div className="flex gap-5 flex-col ">
          <PaymentMethods setSelected={setSelected} selected={selected} />
          <CheckoutButton selected={selected} />
        </div>
      ) : (
        <SigninForm isCart />
      )}
    </section>
  )
}
