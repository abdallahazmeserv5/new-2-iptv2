'use client'

import { AreaChart, Area, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, Calendar, Clock, BarChart3 } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function UserStatisticsClient({
  totalUsers,
  totalToday,
  totalThisWeek,
  totalThisMonth,
  prevDay,
  prevWeek,
  prevMonth,
}: {
  totalUsers: number
  totalToday: number
  totalThisWeek: number
  totalThisMonth: number
  prevDay: number
  prevWeek: number
  prevMonth: number
}) {
  const t = useTranslations()

  const percentageChange = (current: number, previous: number) => {
    if (previous === 0) return current === 0 ? 0 : 100
    return Math.round(((current - previous) / previous) * 100)
  }

  const metrics = [
    {
      title: t('dashboard.users.total'),
      value: totalUsers,
      icon: Users,
      description: t('dashboard.users.totalDesc'),
    },
    {
      title: t('dashboard.users.today'),
      value: totalToday,
      change: percentageChange(totalToday, prevDay),
      icon: Clock,
      description: t('dashboard.users.todayDesc'),
    },
    {
      title: t('dashboard.users.week'),
      value: totalThisWeek,
      change: percentageChange(totalThisWeek, prevWeek),
      icon: Calendar,
      description: t('dashboard.users.weekDesc'),
    },
    {
      title: t('dashboard.users.month'),
      value: totalThisMonth,
      change: percentageChange(totalThisMonth, prevMonth),
      icon: BarChart3,
      description: t('dashboard.users.monthDesc'),
    },
  ]

  return (
    <div className="space-y-6 bg-[#222222] p-4 rounded-md border border-[#3c3c3c]">
      <h2 className="text-center my-5 font-bold">{t('dashboard.users.statistics')}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.title}>
            <CardHeader>
              <CardTitle className="text-sm">{m.title}</CardTitle>
              <CardDescription>{m.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{m.value}</div>
              {m.change !== undefined && (
                <div className="flex items-center gap-1 text-xs">
                  {m.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span>{Math.abs(m.change)}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={[
            { day: t('dashboard.users.yesterday'), users: prevDay },
            { day: t('dashboard.users.today'), users: totalToday },
          ]}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Area type="monotone" dataKey="users" stroke="#4ade80" fill="#4ade80" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
