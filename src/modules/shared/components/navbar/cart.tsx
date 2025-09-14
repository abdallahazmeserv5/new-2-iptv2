'use client'
import { ShoppingCart } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User } from '@/payload-types'
import { useQuery } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { baseFetch } from '@/actions/fetch'

interface Props {
  user:
    | (User & {
        collection: 'users'
      })
    | null
}

interface LocalStorageCartItem {
  planId: string
  quantity: number
  addedAt: string
  plan: {
    id: string
    title: string
    price: number
    description: string
    image?: any
    features?: any[]
  }
}

export default function Cart({ user }: Props) {
  const t = useTranslations()
  const lang = useLocale()
  const [guestCart, setGuestCart] = useState<LocalStorageCartItem[]>([])

  const { data: authCart } = useQuery({
    queryKey: ['/cart', lang],
    queryFn: async () => {
      if (!user?.id) return { items: [] }
      const data = await baseFetch({
        url: `/api/carts?where[user][equals]=${user.id}&limit=1`,
      })
      return data?.docs?.[0] || { items: [] }
    },

    enabled: !!user?.id,
  })

  // Load guest cart from localStorage
  useEffect(() => {
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
    if (!user?.id) {
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
  }, [user?.id])

  const cart = user?.id ? authCart : { items: guestCart }

  const totalQuantity = cart?.items?.reduce((acc: number, item: any) => acc + item.quantity, 0)
  const totalPrice = cart?.items?.reduce(
    (acc: number, item: any) => acc + item.quantity * item.plan.price,
    0,
  )

  const removeFromGuestCart = (planId: string) => {
    try {
      const updatedCart = guestCart.filter((item) => item.planId !== planId)
      localStorage.setItem('guestCart', JSON.stringify(updatedCart))
      setGuestCart(updatedCart)
      window.dispatchEvent(new CustomEvent('guestCartUpdated'))
    } catch (error) {
      console.error('Error removing from guest cart:', error)
    }
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="relative border-none">
            <ShoppingCart className="text-white" />
            {cart?.items?.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                {totalQuantity}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-80 p-2 bg-gray-900 text-white shadow-lg rounded-lg"
          align="end"
        >
          <DropdownMenuLabel className="text-lg font-semibold border-b border-gray-700 pb-2">
            {t('yourCart')} {!user?.id && '(Guest)'}
          </DropdownMenuLabel>

          {cart?.items?.length === 0 ? (
            <p className="text-sm text-gray-400 mt-2">{t('cartIsEmpty')}</p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {cart?.items?.map((item: any) => (
                <DropdownMenuItem
                  key={user?.id ? item.id : item.planId}
                  className="flex justify-between items-center py-2 hover:bg-gray-800 rounded-md"
                >
                  <div className="flex gap-3 items-center">
                    {item.plan.image?.url && (
                      <img
                        src={item.plan.image.url}
                        alt={item.plan.image.alt || item.plan.title}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{item.plan.title}</span>
                      <span className="text-sm text-gray-400">
                        {item.quantity} × {item.plan.price} {t('sar')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {item.quantity * item.plan.price} {t('sar')}
                    </span>
                    {!user?.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromGuestCart(item.planId)
                        }}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}

          {cart?.items?.length > 0 && (
            <>
              <DropdownMenuSeparator className="my-2 border-gray-700" />
              <div className="flex justify-between px-2">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">{totalPrice} ر.س</span>
              </div>

              <Button
                asChild
                variant="default"
                className="w-full mt-3 text-black bg-green-400 hover:bg-green-500"
              >
                <Link href="/cart">{t('buy')}</Link>
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
