'use client'

import ImageFallBack from '@/modules/shared/components/image-fall-back'
import React, { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useCart } from '@/modules/cart/hooks/use-cart' // Import the useCart hook

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
  cartItems: CartItem[]
  cartId: string
  user?: any
}

export default function CartItems({ cartItems, cartId, user }: Props) {
  const [isClient, setIsClient] = useState(false)
  const [updatingItemIds, setUpdatingItemIds] = useState<string[]>([])
  const t = useTranslations()
  const queryClient = useQueryClient()
  const lang = useLocale()

  // Use the cart hook for guest cart management
  const { items: guestCartItems, updateItemQuantity, removeFromCart } = useCart()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const mutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const updatedItems = cartItems.map((item) =>
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
    onMutate: ({ itemId }) => {
      // Add item to updating list when mutation starts
      setUpdatingItemIds((prev) => [...prev, itemId])
    },
    onSettled: (data, error, { itemId }) => {
      // Remove item from updating list when mutation completes
      setUpdatingItemIds((prev) => prev.filter((id) => id !== itemId))
      queryClient.refetchQueries({ queryKey: ['/cart', lang] })
    },
  })

  const handleUpdate = (itemId: string, newQuantity: number) => {
    if (updatingItemIds.includes(itemId)) return

    if (newQuantity < 1) {
      handleRemove(itemId)
      return
    }

    mutation.mutate({ itemId, quantity: newQuantity })
  }

  const handleGuestUpdate = (planId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(planId)
      toast.success('Item removed from cart')
    } else {
      updateItemQuantity(planId, newQuantity)
      toast.success('Cart updated')
    }
  }

  const handleGuestRemove = (planId: string) => {
    removeFromCart(planId)
    toast.success('Item removed from cart')
  }

  const handleRemove = (itemId: string) => handleUpdate(itemId, 0)

  // Use guest cart items from the hook instead of local state
  const itemsToDisplay = user?.id ? cartItems : guestCartItems
  const hasItems = itemsToDisplay.length > 0

  if (!isClient) return <div className="text-white">{t('loadingCart')}</div>
  if (!hasItems)
    return (
      <section className="bg-[#151515] flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border border-[#262626]">
        <div className="text-center">
          <h3 className="text-white font-bold text-xl mb-2">{t('cartEmpty')}</h3>
        </div>
      </section>
    )

  return (
    <section className="bg-[#151515] flex flex-wrap items-start sm:items-center gap-4 sm:gap-6 p-3 rounded-2xl border border-[#262626] max-h-[500px] overflow-y-auto">
      {itemsToDisplay.map((item: any) => {
        const isGuestItem = !user?.id
        const itemKey = isGuestItem ? item.planId : item.id
        const { plan, quantity } = item
        const img = plan.image?.url
        const title = plan.title
        const price = plan.price * quantity
        const priceBeforeDiscount = plan.priceBeforeDiscount
          ? plan.priceBeforeDiscount * quantity
          : null
        const isUpdating = updatingItemIds.includes(item.id)

        return (
          <div
            key={itemKey}
            className="bg-[#151515] flex items-start sm:items-center gap-2 p-3 rounded-2xl border border-[#262626] w-full"
          >
            <ImageFallBack
              width={103}
              height={109}
              className="w-20 h-20 sm:w-[103px] sm:h-[109px] flex-shrink-0"
              src={img || ''}
              alt={title}
            />

            <div className="space-y-3 flex-1">
              <h2 className="text-white font-bold text-xl sm:text-2xl break-words">{title}</h2>

              {isGuestItem && <p className="text-gray-400 text-sm">{t('guestMode')}</p>}

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

              <div className="flex items-center gap-3 flex-wrap">
                {/* Quantity Controls */}
                <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
                  <button
                    className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={isUpdating || quantity <= 1}
                    onClick={() => {
                      if (isGuestItem) {
                        handleGuestUpdate(item.planId, quantity - 1)
                      } else {
                        handleUpdate(item.id, quantity - 1)
                      }
                    }}
                  >
                    -
                  </button>

                  <span className="text-white font-medium min-w-[2rem] text-center">
                    {quantity}
                    {isUpdating && <span className="ml-1 animate-pulse">⏳</span>}
                  </span>

                  <button
                    className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={isUpdating}
                    onClick={() => {
                      if (isGuestItem) {
                        handleGuestUpdate(item.planId, quantity + 1)
                      } else {
                        handleUpdate(item.id, quantity + 1)
                      }
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                  disabled={isUpdating}
                  onClick={() => {
                    if (isGuestItem) {
                      handleGuestRemove(item.planId)
                    } else {
                      handleRemove(item.id)
                    }
                  }}
                >
                  {t('remove')}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}
