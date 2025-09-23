import React from 'react'
import OrderStatistics from './order-statistics'
import UserStatistics from './user-statistics'

export function Statistics() {
  return (
    <section className="grid md:grid-cols-2 gap-5 text-white ">
      <OrderStatistics />
      <UserStatistics />
    </section>
  )
}
