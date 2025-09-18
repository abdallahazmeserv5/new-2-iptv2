'use client'

import { baseFetch } from '@/actions/fetch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, ShoppingBag, Clock, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

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
      const res = await baseFetch({
        url: '/api/orders?where[status][equals]=paid&limit=0&sort=-createdAt',
      })

      if (res?.docs) setOrders(res.docs)
      else setOrders([])

      setLoading(false)
    }

    // Fetch immediately on mount
    fetchOrders()

    // Set up interval to fetch every 1 minute
    const interval = setInterval(fetchOrders, 60_000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [])

  const count = orders.length

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger className="relative flex items-center justify-center rounded-full size-12 hover:bg-accent/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mx-auto">
        <div className="relative">
          <Bell
            size={20}
            className={`transition-all duration-200 ${count > 0 ? 'text-primary animate-pulse' : 'text-muted-foreground'}`}
          />
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-full min-w-5 h-5 flex items-center justify-center px-1 shadow-lg animate-bounce">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-96 bg-black/80 border border-border shadow-xl rounded-xl p-0 overflow-hidden z-[9999]">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-3 border-b border-border">
          <DropdownMenuLabel className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary" />
            اخر الطلبات ({count})
          </DropdownMenuLabel>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            /* Enhanced loading state */
            <div className="p-6 text-center bg-background/95 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-muted-foreground text-sm">جاري تحميل الطلبات...</p>
            </div>
          ) : orders.length > 0 ? (
            orders.slice(0, 10).map((order, index) => (
              <DropdownMenuItem
                key={order.id}
                asChild
                className="p-0 focus:bg-accent/50 hover:bg-accent/30 transition-colors duration-200 cursor-pointer"
              >
                <Link
                  href={`/admin/collections/orders/${order.id}`}
                  className="block p-4 border-b border-border/50 last:border-b-0 bg-background/95 backdrop-blur-sm hover:bg-accent/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          الطلب #{order.id.slice(-8)}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          مدفوعة
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock size={12} />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        ${order.total.toFixed(2)}
                      </div>
                      <ExternalLink size={12} className="text-muted-foreground ml-auto" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg backdrop-blur-sm"
                      >
                        {/* <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">
                            {item.plan.title}
                          </div>
                          {item.plan.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {item.plan.description}
                            </div>
                          )}
                        </div> */}
                        <div className="text-right">
                          <div className="text-sm font-semibold text-foreground">
                            ${item.price.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            الكمية: {item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            /* Enhanced empty state */
            <div className="p-8 text-center bg-background/95 backdrop-blur-sm">
              <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={24} className="text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm font-medium mb-1">
                لا يوجد طلبات مدفوعة بعد
              </p>
              <p className="text-muted-foreground text-xs">ستظهر الطلبات عندما يتم دفعها</p>
            </div>
          )}
        </div>

        {orders.length > 0 && (
          <div className="border-t border-border bg-muted/30 backdrop-blur-sm p-3">
            <DropdownMenuItem
              asChild
              className="w-full justify-center hover:bg-accent/50 transition-colors duration-200"
            >
              <Link
                href="/admin/collections/orders?limit=0&where[status][equals]=paid&sort=-createdAt"
                className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 cursor-pointer"
              >
                عرض كل الطلبات
                <ExternalLink size={14} />
              </Link>
            </DropdownMenuItem>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
