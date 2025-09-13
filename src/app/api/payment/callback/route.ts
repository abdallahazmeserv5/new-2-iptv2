// src/app/api/payment/callback/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    // 1. استخرج PaymentId من body
    const { paymentId } = await req.json()
    if (!paymentId) {
      return NextResponse.json({ error: 'Missing PaymentId' }, { status: 400 })
    }

    // 2. Verify payment مع MyFatoorah
    const res = await fetch(`${process.env.MYFATOORAH_BASE_URL}/v2/GetPaymentStatus`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MYFATOORAH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ Key: paymentId, KeyType: 'paymentId' }),
    })
    const data = await res.json()
    if (!data.IsSuccess) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // 3. جلب المستخدم
    const userRes = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/api/users/me`, {
      headers: { cookie: req.headers.get('cookie') || '' },
      cache: 'no-store',
    })
    const userData = await userRes.json()
    const userId = userData.user.id

    // 4. جلب آخر order pending
    const ordersRes = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/api/orders?where[user][equals]=${userId}&where[status][equals]=pending&sort=-createdAt&limit=1`,
      { headers: { cookie: req.headers.get('cookie') || '' }, cache: 'no-store' },
    )
    const ordersData = await ordersRes.json()
    const order = ordersData.docs[0]
    if (!order) return NextResponse.json({ error: 'No pending order found' }, { status: 404 })

    // 5. تحديث order إلى completed
    await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.PAYLOAD_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'completed',
        paymentInfo: data.Data,
      }),
    })

    // 6. مسح الـ cart الخاص بالمستخدم
    const cartsRes = await fetch(
      `${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/api/carts?where[user][equals]=${userId}&limit=1`,
      { headers: { cookie: req.headers.get('cookie') || '' }, cache: 'no-store' },
    )
    const cartsData = await cartsRes.json()
    const cart = cartsData.docs[0]
    if (cart) {
      await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/api/carts/${cart.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${process.env.PAYLOAD_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: [] }), // تفريغ العناصر
      })
    }

    return NextResponse.json({ success: true, order })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
