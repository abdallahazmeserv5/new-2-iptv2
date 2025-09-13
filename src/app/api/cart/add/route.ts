// src/app/api/cart/add/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { configuredPayload } from '@/actions' // use your helper that returns a payload instance
import { PayloadRequest } from 'payload'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { planId, quantity = 1 } = body as { planId?: string; quantity?: number }

    if (!planId) {
      return NextResponse.json({ success: false, error: 'planId required' }, { status: 400 })
    }

    const payload = await configuredPayload()

    const headers = new Headers()
    headers.set('cookie', cookies().toString())

    // Get the current user from Payload (v3)
    const { user } = await payload.auth({
      headers,
    })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 1) Look for existing cart for this user
    const found = await payload.find({
      collection: 'carts',
      where: {
        user: { equals: user.id },
      },
      limit: 1,
    })

    let cart = found?.docs?.[0] ?? null

    if (!cart) {
      // create a new cart with the item
      const created = await payload.create({
        collection: 'carts',
        data: {
          user: user.id,
          items: [{ plan: planId, quantity }],
        },
      })
      return NextResponse.json({ success: true, cart: created }, { status: 201 })
    }

    // cart exists -> update items: increment quantity if plan exists, otherwise push
    const items = Array.isArray(cart.items) ? [...cart.items] : []

    const idx = items.findIndex(
      (it: any) =>
        String(it.plan) === String(planId) ||
        (it.plan?.id && String(it.plan.id) === String(planId)),
    )

    if (idx > -1) {
      // increment existing item quantity
      const currentQty = items[idx].quantity ?? 0
      items[idx] = { ...items[idx], quantity: currentQty + quantity }
    } else {
      // add new item
      items.push({ plan: planId, quantity })
    }

    const updated = await payload.update({
      collection: 'carts',
      id: cart.id,
      data: { items },
    })

    return NextResponse.json({ success: true, cart: updated }, { status: 200 })
  } catch (err: any) {
    console.error('Add to cart error:', err)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
