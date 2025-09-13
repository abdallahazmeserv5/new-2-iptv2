'use client'
import { ShoppingCart } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User } from '@/payload-types'
import { configuredPayload } from '@/actions'
import { useQuery } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { getPayload } from 'payload'
import Link from 'next/link'

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

  // Fetch authenticated user's cart
  const { data: authCart } = useQuery({
    queryKey: ['cart', lang],
    queryFn: async () => {
      if (!user?.id) return { items: [] } // no user logged in

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/api/carts?where[user][equals]=${user.id}&limit=1`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // ✅ include cookies automatically
        },
      )

      if (!res.ok) {
        console.error('Failed to fetch cart', await res.text())
        return { items: [] }
      }

      const data = await res.json()
      return data.docs[0] || { items: [] } // return the cart or empty structure
    },
    enabled: !!user?.id, // Only run if user is authenticated
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

  // Listen for localStorage changes (when items are added from other components)
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

      // Also listen for custom events (for same-tab updates)
      window.addEventListener('guestCartUpdated', handleStorageChange)

      return () => {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('guestCartUpdated', handleStorageChange)
      }
    }
  }, [user?.id])

  // Determine which cart to use
  const cart = user?.id ? authCart : { items: guestCart }

  const totalQuantity = cart?.items?.reduce((acc: any, item: any) => acc + item.quantity, 0)

  // Calculate total price
  const totalPrice = cart?.items?.reduce((acc: any, item: any) => {
    const price = user?.id ? item.plan.price : item.plan.price
    return acc + item.quantity * price
  }, 0)

  // Remove item from guest cart
  const removeFromGuestCart = (planId: string) => {
    try {
      const updatedCart = guestCart.filter((item) => item.planId !== planId)
      localStorage.setItem('guestCart', JSON.stringify(updatedCart))
      setGuestCart(updatedCart)
      // Dispatch custom event for same-tab updates
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
            Your Cart {!user?.id && '(Guest)'}
          </DropdownMenuLabel>

          {cart?.items?.length === 0 ? (
            <p className="text-sm text-gray-400 mt-2">Cart is empty</p>
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
                        src={user?.id ? item.plan.image.url : item.plan.image.url}
                        alt={item.plan.image.alt || item.plan.title}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">{item.plan.title}</span>
                      <span className="text-sm text-gray-400">
                        {item.quantity} × {item.plan.price} riyals
                      </span>
                      {item.plan.numberOfSubscriptions && (
                        <span className="text-xs text-gray-500">
                          {item.plan.numberOfSubscriptions} subscribers
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.quantity * item.plan.price} ر.س</span>
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
