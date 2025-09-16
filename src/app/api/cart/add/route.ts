// src/app/api/cart/add/route.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { configuredPayload } from '@/actions' // helper returning Payload instance
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { items: newItems } = body as { items?: { planId: string; quantity: number }[] }

    if (!newItems || newItems.length === 0) {
      return NextResponse.json({ success: false, error: 'No items provided' }, { status: 400 })
    }

    const payload = await configuredPayload()

    // Get cookies for authentication
    const cookieStore = await cookies()
    const headers = new Headers()
    headers.set('cookie', cookieStore.toString())

    // Get current user
    const { user } = await payload.auth({ headers })

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - please log in' },
        { status: 401 },
      )
    }

    // Get existing cart
    const found = await payload.find({
      collection: 'carts',
      where: { user: { equals: user.id } },
      limit: 1,
    })

    let cart = found?.docs?.[0] ?? null

    if (!cart) {
      // Filter out items with quantity <= 0 when creating new cart
      const validItems = newItems
        .filter((item) => item.quantity > 0)
        .map((i) => ({ plan: i.planId, quantity: i.quantity }))

      if (validItems.length === 0) {
        return NextResponse.json(
          { success: true, message: 'No valid items to add' },
          { status: 200 },
        )
      }

      // Create cart with valid items only
      const created = await payload.create({
        collection: 'carts',
        data: {
          user: user.id,
          items: validItems,
        },
      })
      return NextResponse.json({ success: true, cart: created }, { status: 201 })
    }

    // Merge with existing items
    const existingItems = Array.isArray(cart.items) ? [...cart.items] : []

    for (const newItem of newItems) {
      const idx = existingItems.findIndex(
        (item) =>
          String(typeof item.plan === 'object' ? item.plan?.id : item.plan) ===
          String(newItem.planId),
      )

      if (idx > -1) {
        // Update existing item quantity
        const newQuantity = (existingItems[idx].quantity || 0) + newItem.quantity

        if (newQuantity <= 0) {
          // Remove item if quantity becomes 0 or negative
          existingItems.splice(idx, 1)
        } else {
          // Update quantity
          existingItems[idx].quantity = newQuantity
        }
      } else if (newItem.quantity > 0) {
        // Only add new item if quantity is positive
        existingItems.push({ plan: newItem.planId, quantity: newItem.quantity })
      }
    }

    // If no items left, delete the cart
    if (existingItems.length === 0) {
      await payload.delete({
        collection: 'carts',
        id: cart.id,
      })
      return NextResponse.json(
        { success: true, message: 'Cart emptied and removed' },
        { status: 200 },
      )
    }

    // Update the cart with filtered items
    const updated = await payload.update({
      collection: 'carts',
      id: cart.id,
      data: { items: existingItems },
    })

    return NextResponse.json({ success: true, cart: updated }, { status: 200 })
  } catch (err: any) {
    console.error('Add to cart error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
