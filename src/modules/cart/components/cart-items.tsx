'use client'

import ImageFallBack from '@/modules/shared/components/image-fall-back'
import React from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocale } from 'next-intl'

interface CartItem {
  id: string
  plan: {
    id: string
    title: string
    price: number
    priceBeforeDiscount?: number
    image?: { url: string }
  }
  quantity: number
}

interface Props {
  cartItems: any
  cartId: any
}

export default function CartItems({ cartItems, cartId }: Props) {
  const queryClient = useQueryClient()
  const lang = useLocale()
  const mutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const updatedItems = cartItems.map((item: any) =>
        item.id === itemId ? { ...item, quantity } : item,
      )

      const res = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/api/carts/${cartId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items: updatedItems }),
      })

      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      // refetch cart after updating
      queryClient.refetchQueries({ queryKey: ['cart', lang] })
    },
  })

  const handleUpdate = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    mutation.mutate({ itemId, quantity: newQuantity })
  }

  return (
    <section className="bg-[#151515] flex  flex-wrap items-start sm:items-center gap-4 sm:gap-6 p-3 rounded-2xl border border-[#262626]">
      {cartItems.map((item: any) => {
        const { plan, quantity } = item
        const img = plan.image?.url
        const title = plan.title
        const price = plan.price * quantity
        const priceBeforeDiscount = plan.priceBeforeDiscount
          ? plan.priceBeforeDiscount * quantity
          : null

        return (
          <div
            key={item.id}
            className="bg-[#151515] flex items-start sm:items-center gap-2 p-3 rounded-2xl border border-[#262626]  "
          >
            <ImageFallBack
              width={103}
              height={109}
              className="w-20 h-20 sm:w-[103px] sm:h-[109px]"
              src={img || ''}
              alt={title}
            />

            <div className="space-y-3 flex-1">
              <h2 className="text-white font-bold text-xl sm:text-2xl break-words">{title}</h2>

              <div className="flex gap-2 sm:gap-3 items-center">
                <p className="font-bold text-2xl sm:text-3xl text-primary">{price}</p>
                <ImageFallBack
                  src="/sar.webp"
                  alt="SAR"
                  width={24}
                  height={26}
                  className="w-[20px] h-[22px] sm:w-[24px] sm:h-[26px] object-contain"
                />
                {!!priceBeforeDiscount && (
                  <p className="text-muted text-lg sm:text-2xl line-through">
                    {priceBeforeDiscount}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                  onClick={() => handleUpdate(item.id, quantity - 1)}
                >
                  -
                </button>
                <span className="text-white font-medium">{quantity}</span>
                <button
                  className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
                  onClick={() => handleUpdate(item.id, quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}
