'use client'

import ImageFallBack from '@/modules/shared/components/image-fall-back'
import React, { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'

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

interface LocalStorageCartItem {
  planId: string
  quantity: number
  addedAt: string
  plan: {
    id: string
    title: string
    price: number
    priceBeforeDiscount?: number
    description: string
    image?: {
      id: string
      url: string
      alt: string
      filename: string
      width: number
      height: number
      mimeType: string
    } | null
  }
}

interface Props {
  cartItems: CartItem[]
  cartId: string
  user?: any
}

export default function CartItems({ cartItems, cartId, user }: Props) {
  const [guestCart, setGuestCart] = useState<LocalStorageCartItem[]>([])
  const [isClient, setIsClient] = useState(false)
  const [updatingItemIds, setUpdatingItemIds] = useState<string[]>([])
  const t = useTranslations()
  const queryClient = useQueryClient()
  const lang = useLocale()

  useEffect(() => {
    setIsClient(true)
    if (!user?.id) {
      try {
        const storedCart = localStorage.getItem('guestCart')
        if (storedCart) setGuestCart(JSON.parse(storedCart))
      } catch {
        setGuestCart([])
      }
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id && isClient) {
      const handleStorageChange = () => {
        const storedCart = localStorage.getItem('guestCart')
        if (storedCart) setGuestCart(JSON.parse(storedCart))
        else setGuestCart([])
      }

      window.addEventListener('storage', handleStorageChange)
      window.addEventListener('guestCartUpdated', handleStorageChange)

      return () => {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('guestCartUpdated', handleStorageChange)
      }
    }
  }, [user?.id, isClient])

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
    onSettled: () => {
      queryClient.refetchQueries({ queryKey: ['/cart', lang] })
    },
  })

  const handleUpdate = (itemId: string, newQuantity: number) => {
    if (updatingItemIds.includes(itemId)) return
    mutation.mutate({ itemId, quantity: newQuantity })
  }

  const handleGuestUpdate = (planId: string, newQuantity: number) => {
    if (newQuantity < 1) return handleGuestRemove(planId)
    const updatedCart = guestCart.map((item) =>
      item.planId === planId ? { ...item, quantity: newQuantity } : item,
    )
    setGuestCart(updatedCart)
    localStorage.setItem('guestCart', JSON.stringify(updatedCart))
    window.dispatchEvent(new CustomEvent('guestCartUpdated'))
    toast.success('Cart updated')
  }

  const handleGuestRemove = (planId: string) => {
    const updatedCart = guestCart.filter((item) => item.planId !== planId)
    setGuestCart(updatedCart)
    localStorage.setItem('guestCart', JSON.stringify(updatedCart))
    window.dispatchEvent(new CustomEvent('guestCartUpdated'))
    toast.success('Item removed from cart')
  }

  const handleRemove = (itemId: string) => handleUpdate(itemId, 0)

  const itemsToDisplay = user?.id ? cartItems : guestCart
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
            className="bg-[#151515] flex items-start sm:items-center gap-2 p-3 rounded-2xl border border-[#262626]"
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

              <div className="flex items-center gap-3">
                <button
                  className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-white disabled:opacity-50 hidden"
                  disabled={isUpdating}
                  onClick={() => {
                    isGuestItem
                      ? handleGuestUpdate(item.planId, quantity - 1)
                      : handleUpdate(item.id, quantity - 1)
                  }}
                >
                  -
                </button>
                <span className="text-white font-medium hidden">
                  {quantity} {isUpdating && <span className="ml-1 animate-pulse">⏳</span>}
                </span>
                <button
                  className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-white disabled:opacity-50 hidden"
                  disabled={isUpdating}
                  onClick={() => {
                    isGuestItem
                      ? handleGuestUpdate(item.planId, quantity + 1)
                      : handleUpdate(item.id, quantity + 1)
                  }}
                >
                  +
                </button>

                {isGuestItem ? (
                  <button
                    className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-white ml-2"
                    onClick={() => handleGuestRemove(item.planId)}
                  >
                    {t('remove')}
                  </button>
                ) : (
                  <button
                    className="px-3 py-1 hidden bg-red-600 rounded hover:bg-red-700 text-white ml-2"
                    onClick={() => handleRemove(item.id)}
                  >
                    {t('remove')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}
