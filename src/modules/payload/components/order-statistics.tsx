// src/modules/payload/components/order-statistics.tsx
import { configuredPayload } from '@/actions'
import { getTranslations } from 'next-intl/server'
import { startOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths } from 'date-fns'
import OrderStatisticsClient from './order-statistics-client'

export default async function OrderStatistics() {
  const payload = await configuredPayload()
  // 👇 Use the namespace 'dashboard.orders' since your JSON is nested
  const now = new Date()

  const getCount = async (start: Date, end?: Date) => {
    const result = await payload.count({
      collection: 'orders',
      where: {
        createdAt: {
          greater_than_equal: start.toISOString(),
          ...(end ? { less_than: end.toISOString() } : {}),
        },
      },
    })
    return result.totalDocs
  }

  const totalOrders = await payload
    .find({ collection: 'orders', limit: 1 })
    .then((r) => r.totalDocs)

  const totalToday = await getCount(startOfDay(now))
  const totalThisWeek = await getCount(startOfWeek(now))
  const totalThisMonth = await getCount(startOfMonth(now))

  const prevDay = await getCount(startOfDay(subDays(now, 1)), startOfDay(now))
  const prevWeek = await getCount(startOfWeek(subWeeks(now, 1)), startOfWeek(now))
  const prevMonth = await getCount(startOfMonth(subMonths(now, 1)), startOfMonth(now))

  return (
    <OrderStatisticsClient
      totalOrders={totalOrders}
      totalToday={totalToday}
      totalThisWeek={totalThisWeek}
      totalThisMonth={totalThisMonth}
      prevDay={prevDay}
      prevWeek={prevWeek}
      prevMonth={prevMonth}
    />
  )
}
