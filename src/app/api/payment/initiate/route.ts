import { NextResponse } from 'next/server'
import type { Plan } from '@/payload-types'

export async function POST(req: Request) {
  try {
    // 1. Get current user
    const userRes = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/api/users/me`, {
      headers: {
        cookie: req.headers.get('cookie') || '',
      },
      cache: 'no-store',
    })

    if (!userRes.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await userRes.json()
    // 2. Get cart for this user
    const cartRes = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/api/carts?where[user][equals]=${user?.user?.id}`,
      {
        headers: {
          cookie: req.headers.get('cookie') || '',
        },
        cache: 'no-store',
      },
    )

    if (!cartRes.ok) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    const cartData = await cartRes.json()
    if (!cartData.docs?.length) {
      return NextResponse.json({ error: 'Empty cart' }, { status: 404 })
    }

    const cart = cartData.docs[0]

    // 3. Calculate total + build items array for the order
    let total = 0
    const items = cart.items.map((item: any) => {
      const plan = item.plan as Plan

      const price = plan?.price || 0

      total += price * item.quantity
      return {
        plan: plan.id,
        quantity: item.quantity,
        price,
      }
    })

    if (total <= 0) {
      return NextResponse.json({ error: 'Invalid cart total' }, { status: 400 })
    }

    // 4. Create pending order in Payload
    const orderRes = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: req.headers.get('cookie') || '',
      },
      body: JSON.stringify({
        user: user.user.id,
        items,
        total,
        status: 'pending',
      }),
    })

    if (!orderRes.ok) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // 5. Call MyFatoorah to create payment link
    const res = await fetch(`${process.env.MYFATOORAH_BASE_URL}/v2/SendPayment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MYFATOORAH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        NotificationOption: 'LNK',
        InvoiceValue: total,
        CustomerName: user.user.email || 'Guest',
        CallBackUrl: `${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/payment/success`,
        ErrorUrl: `${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/payment/failed`,
        Language: 'en',
        DisplayCurrencyIso: 'SAR',
      }),
    })

    const data = await res.json()

    // 6. Return payment link data
    return NextResponse.json(data)
  } catch (err) {
    console.error('Payment error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
