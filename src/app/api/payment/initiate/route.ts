import { NextResponse } from 'next/server'
import type { Plan } from '@/payload-types'
import { getMyFatoorahKey } from '@/actions/get-myfatorah-key'

export async function POST(req: Request) {
  try {
    // Parse request body to get payment method ID
    const { paymentMethodId } = await req.json()
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

    const payload = paymentMethodId
      ? {
          InvoiceValue: total,
          CustomerName: user?.user?.email || 'Guest',
          PaymentMethodId: paymentMethodId, // required for ExecutePayment
          CallBackUrl: `${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/payment/success`,
          ErrorUrl: `${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/payment/failed`,
          Language: 'en',
          DisplayCurrencyIso: 'SAR',
        }
      : {
          InvoiceValue: total,
          CustomerName: user?.user?.email || 'Guest',
          CallBackUrl: `${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/payment/success`,
          ErrorUrl: `${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/payment/failed`,
          Language: 'en',
          DisplayCurrencyIso: 'SAR',
          NotificationOption: 'LNK',
        }

    const myfatorahKey = await getMyFatoorahKey()

    // 5. Call MyFatoorah to create payment link
    const res = await fetch(
      paymentMethodId
        ? `${process.env.MYFATOORAH_BASE_URL}/v2/ExecutePayment`
        : `${process.env.MYFATOORAH_BASE_URL}/v2/SendPayment`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${myfatorahKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    )

    const data = await res.json()

    // 6. Return payment link data
    return NextResponse.json(data)
  } catch (err) {
    console.error('Payment error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
