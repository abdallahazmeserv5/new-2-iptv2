'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { baseFetch } from '@/actions/fetch'
import { SendCredentialsForm } from './credentail-form'

type Plan = {
  id: string
  title: string
  description?: string
  image?: { filename: string; alt?: string }
  price: number
}

type OrderItem = {
  plan: Plan
  quantity: number
  price: number
}

type Order = {
  id: string
  total: number
  createdAt: string
  status: string
  user: { id: string; email: string }
  items: OrderItem[]
  paymentInfo?: Record<string, any>
}

export function NotificationIcon() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      const res = await baseFetch({ url: '/api/orders?status=paid' })
      if (res?.docs) setOrders(res.docs)
      else setOrders([])
      setLoading(false)
    }

    // Fetch immediately on mount
    fetchOrders()

    // Set up interval to fetch every 1 minute (60,000 ms)
    const interval = setInterval(fetchOrders, 60_000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [])

  const count = orders.length

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger className="flex items-center justify-center rounded-full size-12 grow-0 shrink-0 mx-auto">
        <div className="relative cursor-pointer p-2 w-fit">
          <Bell size={20} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {count}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-96 bg-gray-400 text-white">
        <DropdownMenuLabel>Paid Orders ({count})</DropdownMenuLabel>

        {loading ? (
          <DropdownMenuItem>Loading...</DropdownMenuItem>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <DropdownMenuItem
              key={order.id}
              asChild
              className="flex flex-col gap-2 py-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-500"
            >
              {/* Clicking the card navigates directly to the order page */}
              <Link href={`/admin/collections/orders/${order.id}`} className="w-full">
                <div className="font-semibold">
                  Order #{order.id} - ${order.total.toFixed(2)}
                </div>

                <div className="mt-1 flex flex-col gap-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm text-white">
                      <div className="flex items-center gap-2">
                        {item.plan.image?.filename && (
                          <img
                            src={`${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/media/${item.plan.image.filename}`}
                            alt={item.plan.image.alt || item.plan.title}
                            className="w-6 h-6 object-cover rounded"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{item.plan.title}</span>
                          {item.plan.description && (
                            <span className="text-xs text-white">{item.plan.description}</span>
                          )}
                        </div>
                      </div>
                      <span className="font-medium">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem>No paid orders</DropdownMenuItem>
        )}

        <DropdownMenuItem>
          <Link href="/admin/collections/orders">View all orders</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
