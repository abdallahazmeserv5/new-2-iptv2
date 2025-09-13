'use client'
import { ShoppingCart } from 'lucide-react'
import React from 'react'
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
import { T } from 'vitest/dist/chunks/reporters.d.DL9pg5DB.js'
import Link from 'next/link'

interface Props {
  user:
    | (User & {
        collection: 'users'
      })
    | null
}

export default function Cart({ user }: Props) {
  const t = useTranslations()
  const lang = useLocale()
  const { data: cart } = useQuery({
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
  })

  const totalQuantity = cart?.items?.reduce((acc: any, item: any) => acc + item.quantity, 0)
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
            Your Cart
          </DropdownMenuLabel>

          {cart?.items?.length === 0 ? (
            <p className="text-sm text-gray-400 mt-2">Cart is empty</p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {cart?.items?.map((item: any) => (
                <DropdownMenuItem
                  key={item.id}
                  className="flex justify-between items-center py-2 hover:bg-gray-800 rounded-md"
                >
                  <div className="flex gap-3 items-center">
                    <img
                      src={item.plan.image?.url}
                      alt={item.plan.title}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{item.plan.title}</span>
                      <span className="text-sm text-gray-400">
                        {item.quantity} × {item.plan.price} riyals
                      </span>
                    </div>
                  </div>
                  <span className="font-semibold">{item.quantity * item.plan.price} ر.س</span>
                </DropdownMenuItem>
              ))}
            </div>
          )}

          {cart?.items?.length > 0 && (
            <>
              <DropdownMenuSeparator className="my-2 border-gray-700" />
              <div className="flex justify-between px-2">
                <span className="font-semibold">Total:</span>
                {/* <span className="font-semibold">{totalPrice} ر.س</span> */}
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
