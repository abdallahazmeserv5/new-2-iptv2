// src/modules/payload/components/user-statistics.tsx
import { configuredPayload } from '@/actions'
import { startOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths } from 'date-fns'
import UserStatisticsClient from './user-statistics-client'

export default async function UserStatistics() {
  const payload = await configuredPayload()
  const now = new Date()

  const getCount = async (start: Date, end?: Date) => {
    const result = await payload.count({
      collection: 'users',
      where: {
        createdAt: {
          greater_than_equal: start.toISOString(),
          ...(end ? { less_than: end.toISOString() } : {}),
        },
      },
    })
    return result.totalDocs
  }

  const totalUsers = await payload.find({ collection: 'users', limit: 1 }).then((r) => r.totalDocs)

  const totalToday = await getCount(startOfDay(now))
  const totalThisWeek = await getCount(startOfWeek(now))
  const totalThisMonth = await getCount(startOfMonth(now))

  const prevDay = await getCount(startOfDay(subDays(now, 1)), startOfDay(now))
  const prevWeek = await getCount(startOfWeek(subWeeks(now, 1)), startOfWeek(now))
  const prevMonth = await getCount(startOfMonth(subMonths(now, 1)), startOfMonth(now))

  return (
    <UserStatisticsClient
      totalUsers={totalUsers}
      totalToday={totalToday}
      totalThisWeek={totalThisWeek}
      totalThisMonth={totalThisMonth}
      prevDay={prevDay}
      prevWeek={prevWeek}
      prevMonth={prevMonth}
    />
  )
}
