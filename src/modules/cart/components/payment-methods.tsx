import React, { Dispatch, SetStateAction, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { baseFetch } from '@/actions/fetch'
import { useLocale, useTranslations } from 'next-intl'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { PaymentMethod } from '@/payload-types'

export default function PaymentMethods({
  setSelected,
  selected,
}: {
  setSelected?: Dispatch<SetStateAction<number | null>>
  selected: number | null
}) {
  const lang = useLocale()
  const t = useTranslations()

  const { data, isLoading, error } = useQuery({
    queryKey: ['/payment-methods', lang],
    queryFn: async () =>
      baseFetch({
        url: `/api/payment-methods?where[active][equals]=true`,
      }),
  })

  const methods: PaymentMethod[] = data?.docs || []

  if (isLoading) return <div className="text-gray-400">{t('loading')}</div>
  if (error) return <div className="text-red-500">{t('somethingWentWrong')}</div>
  if (!methods.length)
    return (
      <div className="text-gray-400">{t('noPaymentMethods') || 'No payment methods available'}</div>
    )

  return (
    <RadioGroup
      value={selected?.toString() || ''}
      onValueChange={(value) => setSelected?.(parseInt(value))}
      className="flex gap-4 "
    >
      {methods.map((method) => (
        <label
          key={method.id}
          className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-muted"
        >
          <RadioGroupItem value={method.PaymentMethodId.toString()} />
          {method.image && typeof method.image === 'object' && 'url' in method.image ? (
            <img
              src={method.image.url}
              alt={
                method[`PaymentMethod${lang.charAt(0).toUpperCase() + lang.slice(1)}`] ||
                method.PaymentMethodEn
              }
              className="w-8 h-8 object-contain rounded"
            />
          ) : null}
          <span className="font-medium text-white">
            {method[`PaymentMethod${lang.charAt(0).toUpperCase() + lang.slice(1)}`] ||
              method.PaymentMethodEn}
          </span>
        </label>
      ))}
    </RadioGroup>
  )
}
