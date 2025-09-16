// src/app/api/cart/add/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { configuredPayload } from '@/actions' // use your helper that returns a payload instance
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    console.log({ body })
    const { planId, quantity = 1 } = body as { planId?: string; quantity?: number }
    console.log({ planId, quantity })

    if (!planId) {
      return NextResponse.json({ success: false, error: 'planId is required' }, { status: 400 })
    }

    if (quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'quantity must be at least 1' },
        { status: 400 },
      )
    }

    const payload = await configuredPayload()

    // Get cookies properly
    const cookieStore = await cookies()
    const headers = new Headers()
    headers.set('cookie', cookieStore.toString())

    // Get the current user from Payload (v3)
    const { user } = await payload.auth({
      headers,
    })
    console.log({ user })

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - please log in' },
        { status: 401 },
      )
    }

    // Verify the plan exists first
    try {
      const plan = await payload.findByID({
        collection: 'plans', // adjust collection name if different
        id: planId,
      })
      console.log({ plan })

      if (!plan) {
        return NextResponse.json({ success: false, error: 'Plan not found' }, { status: 404 })
      }
    } catch (planError) {
      console.error('Plan verification error:', planError)
      return NextResponse.json({ success: false, error: 'Invalid plan ID' }, { status: 404 })
    }

    // 1) Look for existing cart for this user
    const found = await payload.find({
      collection: 'carts',
      where: {
        user: { equals: user.id },
      },
      limit: 1,
    })
    console.log({ found })

    let cart = found?.docs?.[0] ?? null
    console.log({ cart })

    if (!cart) {
      // Create a new cart with the item

      const created = await payload.create({
        collection: 'carts',
        data: {
          user: user.id,
          items: [{ plan: planId, quantity }],
        },
      })

      return NextResponse.json({ success: true, cart: created }, { status: 201 })
    }

    // Cart exists -> update items

    // Ensure items is an array
    const items = Array.isArray(cart.items) ? [...cart.items] : []
    console.log({ items })

    // Find existing item with this plan
    const existingItemIndex = items.findIndex((item: any) => {
      // Handle both populated and non-populated plan references
      const itemPlanId = typeof item.plan === 'object' ? item.plan?.id : item.plan
      return String(itemPlanId) === String(planId)
    })

    if (existingItemIndex > -1) {
      // Increment existing item quantity
      const currentQuantity = Number(items[existingItemIndex].quantity) || 0
      const newQuantity = currentQuantity + Number(quantity)

      items[existingItemIndex] = {
        ...items[existingItemIndex],
        quantity: newQuantity,
      }
    } else {
      // Add new item
      items.push({ plan: planId, quantity: Number(quantity) })
    }

    // Update the cart
    const updated = await payload.update({
      collection: 'carts',
      id: cart.id,
      data: { items },
    })
    console.log({ updated })

    return NextResponse.json({ success: true, cart: updated }, { status: 200 })
  } catch (err: any) {
    console.error('Add to cart error:', err)

    if (err.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error: ' + (err.message || 'Invalid data'),
        },
        { status: 400 },
      )
    }

    if (err.name === 'NotFoundError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Resource not found',
        },
        { status: 404 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    )
  }
}
