'use client'

import { AreaChart, Area, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, ShoppingCart, Calendar, Clock, BarChart3 } from 'lucide-react'
import { useTranslation } from '@payloadcms/ui'
import { useTranslations } from 'next-intl'

export default function OrderStatisticsClient({
  totalOrders,
  totalToday,
  totalThisWeek,
  totalThisMonth,
  prevDay,
  prevWeek,
  prevMonth,
}: {
  totalOrders: number
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
      title: t('dashboard.orders.total'),
      value: totalOrders,
      icon: ShoppingCart,
      description: t('dashboard.orders.totalDesc'),
    },
    {
      title: t('dashboard.orders.today'),
      value: totalToday,
      change: percentageChange(totalToday, prevDay),
      icon: Clock,
      description: t('dashboard.orders.todayDesc'),
    },
    {
      title: t('dashboard.orders.week'),
      value: totalThisWeek,
      change: percentageChange(totalThisWeek, prevWeek),
      icon: Calendar,
      description: t('dashboard.orders.weekDesc'),
    },
    {
      title: t('dashboard.orders.month'),
      value: totalThisMonth,
      change: percentageChange(totalThisMonth, prevMonth),
      icon: BarChart3,
      description: t('dashboard.orders.monthDesc'),
    },
  ]

  return (
    <div className="space-y-6 bg-[#222222] p-4 rounded-md border border-[#3c3c3c]">
      <h2 className="text-center my-5 font-bold">{t('dashboard.orders.statistics')}</h2>
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
            { day: t('dashboard.orders.yesterday'), orders: prevDay },
            { day: t('dashboard.orders.today'), orders: totalToday },
          ]}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Area type="monotone" dataKey="orders" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
