'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle } from 'lucide-react'

interface CartItem {
  id: string
  plan: {
    title: string
    price: number
    priceBeforeDiscount: number
  }
  quantity: number
}

interface AbandonedCart {
  id: string
  user: {
    email: string
    phone: string
  }
  items: CartItem[]
  createdAt: string
}

interface AbandonedCartListProps {
  carts: AbandonedCart[]
  onSendMessage: (cartId: string, userEmail: string) => void
}

export default function AbandonedCartList({ carts, onSendMessage }: AbandonedCartListProps) {
  return (
    <div className="space-y-3">
      {carts.map((cart) => (
        <Card key={cart.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm text-muted-foreground mb-1">{cart.user.email}</div>
              <div className="space-y-1">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <span>{item.plan.title}</span>
                    <span className="text-muted-foreground">×{item.quantity}</span>
                    <span className="font-medium">${item.plan.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => onSendMessage(cart.id, cart.user.email)}
              className="ml-4"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Send
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
