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
    numberOfSubscriptions?: number
    image?: {
      id: string
      url: string
      alt: string
      filename: string
      width: number
      height: number
      mimeType: string
    } | null
    features?: any[]
    downloadPlatforms?: any[]
    reviews?: any[]
    createdAt?: string
    updatedAt?: string
  }
}

interface Props {
  cartItems: any
  cartId: any
  user?: any // Add user prop to check authentication
}

export default function CartItems({ cartItems, cartId, user }: Props) {
  const [guestCart, setGuestCart] = useState<LocalStorageCartItem[]>([])
  const [isClient, setIsClient] = useState(false)
  const t = useTranslations()
  const queryClient = useQueryClient()
  const lang = useLocale()

  // Load guest cart from localStorage on client side
  useEffect(() => {
    setIsClient(true)
    if (!user?.id) {
      try {
        const storedCart = localStorage.getItem('guestCart')
        if (storedCart) {
          setGuestCart(JSON.parse(storedCart))
        }
      } catch (error) {
        console.error('Error loading guest cart:', error)
        setGuestCart([])
      }
    }
  }, [user?.id])

  // Listen for localStorage changes
  useEffect(() => {
    if (!user?.id && isClient) {
      const handleStorageChange = () => {
        try {
          const storedCart = localStorage.getItem('guestCart')
          if (storedCart) {
            setGuestCart(JSON.parse(storedCart))
          } else {
            setGuestCart([])
          }
        } catch (error) {
          console.error('Error loading guest cart:', error)
          setGuestCart([])
        }
      }

      window.addEventListener('storage', handleStorageChange)
      window.addEventListener('guestCartUpdated', handleStorageChange)

      return () => {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('guestCartUpdated', handleStorageChange)
      }
    }
  }, [user?.id, isClient])

  // Mutation for authenticated users
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
      queryClient.refetchQueries({ queryKey: ['/cart', lang] })
    },
  })

  // Handle quantity updates for authenticated users
  const handleUpdate = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    mutation.mutate({ itemId, quantity: newQuantity })
  }

  // Handle quantity updates for guest users (localStorage)
  const handleGuestUpdate = (planId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      // Remove item if quantity becomes 0
      handleGuestRemove(planId)
      return
    }

    try {
      const updatedCart = guestCart.map((item) =>
        item.planId === planId ? { ...item, quantity: newQuantity } : item,
      )

      localStorage.setItem('guestCart', JSON.stringify(updatedCart))
      setGuestCart(updatedCart)
      window.dispatchEvent(new CustomEvent('guestCartUpdated'))
      toast.success('Cart updated')
    } catch (error) {
      console.error('Error updating guest cart:', error)
      toast.error('Failed to update cart')
    }
  }

  // Remove item from guest cart
  const handleGuestRemove = (planId: string) => {
    try {
      const updatedCart = guestCart.filter((item) => item.planId !== planId)
      localStorage.setItem('guestCart', JSON.stringify(updatedCart))
      setGuestCart(updatedCart)
      window.dispatchEvent(new CustomEvent('guestCartUpdated'))
      toast.success('Item removed from cart')
    } catch (error) {
      console.error('Error removing from guest cart:', error)
      toast.error('Failed to remove item')
    }
  }

  // Determine which items to display
  const itemsToDisplay = user?.id ? cartItems : guestCart
  const hasItems = itemsToDisplay && itemsToDisplay.length > 0

  if (!isClient) {
    return <div className="text-white">{t('loadingCart')}</div>
  }

  if (!hasItems) {
    return (
      <section className="bg-[#151515] flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border border-[#262626]">
        <div className="text-center">
          <h3 className="text-white font-bold text-xl mb-2">{t('cartEmpty')}</h3>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#151515] flex flex-wrap items-start sm:items-center gap-4 sm:gap-6 p-3 rounded-2xl border border-[#262626] max-h-[500px] overflow-y-auto">
      {itemsToDisplay.map((item: any) => {
        // Handle both authenticated cart items and guest cart items
        const isGuestItem = !user?.id
        const itemKey = isGuestItem ? item.planId : item.id
        const { plan, quantity } = item
        const img = plan.image?.url
        const title = plan.title
        const price = plan.price * quantity
        const priceBeforeDiscount = plan.priceBeforeDiscount
          ? plan.priceBeforeDiscount * quantity
          : null

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

              {isGuestItem && <p className="text-gray-400 text-sm">(Guest Mode)</p>}

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
                  className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-white"
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
                <span className="text-white font-medium">{quantity}</span>
                <button
                  className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-white"
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

                {isGuestItem && (
                  <button
                    className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-white ml-2"
                    onClick={() => handleGuestRemove(item.planId)}
                  >
                    Remove
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
