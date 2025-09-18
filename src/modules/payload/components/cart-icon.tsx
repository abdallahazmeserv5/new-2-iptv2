'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export function CartIcon() {
  const sendReminders = async () => {
    try {
      const response = await fetch('/api/reminders/abandoned', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
    } catch (error) {}
  }

  useEffect(() => {
    const isProduction = process.env.VERCEL_ENV === 'production' ? 1000 : 1
    // Send reminders every minute (60 seconds)
    const reminderInterval = setInterval(sendReminders, isProduction ? 60000 : 60)

    return () => {
      clearInterval(reminderInterval)
    }
  }, [])

  const isProduction = process.env.VERCEL_ENV === 'production' ? 1000 : 1

  return (
    <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
      <h3>🛒 إرسال تذكيرات السلات المهجورة</h3>
      <div className="">
        <p>نظام إرسال تذكيرات تلقائي للسلات المهجورة</p>
        <p className="text-xs mt-5">
          يتم ارسال رسائل تلقائية من النظام للمستخدمين الذين لم يكملوا عملية الشراء
        </p>
      </div>

      <div style={{ marginTop: '0.5rem' }}>
        <Link
          href={`/admin/collections/carts?where[updatedAt][less_than]=${new Date(Date.now() - 60 * 60 * isProduction).toISOString()}`}
          className="hover:text-primary"
        >
          <button
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            عرض السلات المتروكة
          </button>
        </Link>
      </div>
    </div>
  )
}
