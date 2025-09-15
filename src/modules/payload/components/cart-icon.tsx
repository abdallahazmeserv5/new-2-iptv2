'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { sendMessage } from '@/actions/need-bot'
import { baseFetch } from '@/actions/fetch'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function CartIcon() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const settings = await baseFetch({ url: '/api/globals/settings' })
      // TODO
      const abandonAfterMs =
        (settings?.cartSettings?.abandonAfterMinutes ?? 60) * 60 * 1000 + 500000
      // const abandonAfterMs = 1000
      const messageIntervalMs =
        (settings?.cartSettings?.messageIntervalMinutes ?? 60) * 60 * 1000 + 500000

      // compute abandoned carts
      const abandonedAt = new Date(Date.now() - abandonAfterMs).toISOString()
      const data = await baseFetch({
        url: `/api/carts?where[updatedAt][less_than]=${encodeURIComponent(abandonedAt)}&depth=1`,
      })

      if (!data) {
        setCount(0)
        return
      }

      setCount(data.totalDocs ?? 0)

      if (data?.docs?.length) {
        for (let i = 0; i < data.docs.length; i++) {
          const cart = data.docs[i]
          const phone = cart?.user?.phone
          if (!phone) continue

          try {
            const res1 = await sendMessage({
              number: phone,
              message: 'complete buying',
            })
          } catch (err) {
            console.error(`Failed to send message to ${phone}`, err)
          }

          await sleep(100)
        }
      }

      const interval = setInterval(fetchData, messageIntervalMs)
      return () => clearInterval(interval)
    }

    fetchData()
  }, [])

  return (
    <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
      <h3>🛒 Abandoned Carts</h3>
      <p>{count === null ? 'Loading...' : `${count} carts abandoned`}</p>
      <Link href="/admin/collections/carts">
        <button style={{ marginTop: '0.5rem' }}>View All</button>
      </Link>
    </div>
  )
}
