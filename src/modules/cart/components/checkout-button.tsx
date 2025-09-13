'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import PrimaryButton from '@/modules/shared/components/primary-button'

export default function CheckoutButton() {
  const t = useTranslations()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setLoading(true)

      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      const data = await res.json()

      if (data?.IsSuccess && data?.Data?.InvoiceURL) {
        // ✅ Redirect to MyFatoorah payment page
        window.location.href = data.Data.InvoiceURL
      } else {
        alert('Failed to create invoice')
        console.error(data)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrimaryButton
      onClick={handleCheckout}
      className="disabled:bg-muted cursor-not-allowed"
      disabled={loading}
    >
      {loading ? t('loading') : t('buyNow')}
    </PrimaryButton>
  )
}
