import { NextResponse } from 'next/server'
import { configuredPayload } from '@/actions'
import { sendMessage } from '@/actions/need-bot'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function POST() {
  try {
    const payload = await configuredPayload()
    const { abandonAfterHours = 1 } = await payload.findGlobal({ slug: 'settings' })

    const isProduction = process.env.VERCEL_ENV === 'production' ? 1000 : 1

    const abondentTime = new Date(
      Date.now() - abandonAfterHours * 60 * 60 * isProduction,
    ).toISOString()

    // Find carts updated <= 1h ago and not reminded yet
    const carts = await payload.find({
      collection: 'carts',
      depth: 1,
      where: {
        and: [
          { updatedAt: { less_than_equal: abondentTime } },
          { lastReminderAt: { exists: false } },
        ],
      },
      limit: 100,
    })

    const docs = carts?.docs || []

    for (let i = 0; i < docs.length; i++) {
      const cart: any = docs[i]

      // Skip empty carts
      const hasItems = Array.isArray(cart.items) && cart.items.length > 0
      if (!hasItems) continue

      // Ensure not already converted into an order: check recent orders by user with status paid/completed
      const userId = typeof cart.user === 'object' ? cart.user?.id : cart.user
      if (!userId) continue

      try {
        const orders = await payload.find({
          collection: 'orders',
          where: {
            and: [{ user: { equals: userId } }, { status: { in: ['paid', 'completed'] } }],
          },
          limit: 1,
        })
      } catch {}

      // Double-check dedupe
      if (cart.lastReminderAt) continue

      const phone = (cart.user as any)?.phone
      if (!phone) continue

      const message =
        `عزيزي العميل،\n\n` +
        `لاحظنا أن سلتك مهجورة 🛒\n` +
        `يمكنك تكملة طلبك والتواصل معنا لتحصل على هديتك 🎁\n\n` +
        `Tornado-TV4k\n\n` +
        `https://tornado-tv4k.com/cart`

      try {
        const res = await sendMessage({ number: phone, message })
        const res2 = await sendMessage({ number: phone, message })

        if (res || res2) {
          await payload.update({
            collection: 'carts',
            id: cart.id,
            data: { lastReminderAt: new Date().toISOString() },
          })
        }
      } catch (err) {}

      await sleep(50)
    }

    return NextResponse.json({ success: true, processed: docs.length })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error' },
      { status: 500 },
    )
  }
}
