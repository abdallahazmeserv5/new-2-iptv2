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
import { useQuery } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { baseFetch } from '@/actions/fetch'
import { useUser } from '../../hooks/use-user'
import { useCart } from '@/modules/cart/hooks/use-cart'
import { usePathname } from 'next/navigation'

export default function Cart() {
  const { user } = useUser()
  const t = useTranslations()
  const lang = useLocale()
  const pathname = usePathname()
  const {
    items: guestCartItems,
    totalItems: guestTotalQuantity,
    totalPrice: guestTotalPrice,
    removeFromCart: removeFromGuestCart,
  } = useCart()

  const [isClient, setIsClient] = useState(false)
  useEffect(() => setIsClient(true), [])

  // Dropdown open state
  const [open, setOpen] = useState(false)

  // Close dropdown when visiting /cart
  useEffect(() => {
    if (pathname === '/cart') {
      setOpen(false)
    }
  }, [pathname])

  // Fetch authenticated user's cart
  const { data: rawAuthCart } = useQuery({
    queryKey: ['/cart', lang],
    queryFn: async () => {
      if (!user?.id) return { items: [] }
      const data = await baseFetch({
        url: `/api/carts`,
      })
      return data // keep raw data for normalization
    },
    enabled: !!user?.id,
  })

  if (!isClient) return null // Prevent hydration issues

  // Normalize authCart: always use the first cart from docs if present
  const authCart = rawAuthCart?.docs?.at(-1) || rawAuthCart || { items: [] }

  console.log({ authCart })
  // Decide which cart to display
  const cartItems = user?.id ? authCart?.items || [] : guestCartItems || []

  const totalQuantity = cartItems.reduce((acc, i) => acc + (i.quantity || 0), 0)
  const totalPrice = cartItems.reduce((acc, i) => acc + (i.quantity || 0) * (i.plan?.price || 0), 0)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative border-none">
          <ShoppingCart className="text-white" />
          {totalQuantity > 0 && (
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

        {cartItems.length === 0 ? (
          <p className="text-sm text-gray-400 mt-2">{t('cartIsEmpty')}</p>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {cartItems.map((item: any) => (
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

        {cartItems.length > 0 && (
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
  )
}
