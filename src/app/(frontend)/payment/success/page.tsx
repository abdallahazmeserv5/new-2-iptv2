'use client'

import { baseFetch } from '@/actions/fetch'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

async function verifyPayment(paymentId: string) {
  const data = await baseFetch({
    url: '/api/payment/callback',
    method: 'POST',
    body: { paymentId },
  })

  if (!data?.order) {
    throw new Error(data?.error || 'Failed to verify payment')
  }

  return data.order
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations()
  const queryClient = useQueryClient()
  const paymentId = searchParams.get('paymentId')
  const lang = useLocale()

  const {
    mutate: runVerifyPayment,
    data: order,
    error,
    isPending: isLoading,
  } = useMutation({
    mutationFn: (paymentId: string) => verifyPayment(paymentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/cart', lang] })
    },
  })

  useEffect(() => {
    if (paymentId) {
      runVerifyPayment(paymentId)
    } else {
      router.push('/')
    }
  }, [paymentId, runVerifyPayment, router])

  if (isLoading) {
    return <p className="p-10 text-center text-gray-300 bg-[#151515]">{t('finishingPayment')}</p>
  }

  if (error) {
    return (
      <p className="p-10 text-center text-red-400 bg-[#151515]">❌ {(error as Error).message}</p>
    )
  }

  // because of first state showing the empty invoice
  if (paymentId && !order) {
    return null
  }
  return (
    <div className="flex flex-col items-center justify-center bg-[#151515] text-white p-5">
      <h1 className="text-3xl sm:text-4xl font-bold text-green-400 mb-4">{t('successPayment')}</h1>
      <p className="text-gray-300 mb-6">{t('thankYou')}</p>

      <div className="bg-[#1f1f1f] p-6 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-3 text-white">{t('orderDetails')}</h2>
        <p className="mb-1 text-gray-200">
          {t('orderId')}: <span className="text-white">{order?.id}</span>
        </p>
        <p className="mb-1 text-gray-200">
          {t('status')}: <span className="text-green-400">{order?.status}</span>
        </p>
        <p className="mb-3 text-gray-200">
          {t('totalPrice')}:{' '}
          <span className="text-white">
            {order?.total} {t('sar')}
          </span>
        </p>

        <h3 className="text-lg font-semibold mb-2 text-white">Items:</h3>
        <ul className="list-disc list-inside text-gray-200">
          {order?.items?.map((item: any, idx: number) => (
            <li key={idx}>
              {item.quantity} × {item.plan?.title || 'Unknown Plan'} — {item.price * item.quantity}{' '}
              {t('sar')}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
