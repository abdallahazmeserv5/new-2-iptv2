'use client'

import { useTranslations } from 'next-intl'
import { useMutation } from '@tanstack/react-query'
import PrimaryButton from '@/modules/shared/components/primary-button'
import { baseFetch } from '@/actions/fetch'
import { toast } from 'sonner'

export default function CheckoutButton({ selected }: { selected: number | null }) {
  const t = useTranslations()

  const checkoutMutation = useMutation({
    mutationFn: async ({ paymentMethodId }: { paymentMethodId: number | null }) =>
      baseFetch({
        url: '/api/payment/initiate',
        method: 'POST',
        body: { paymentMethodId },
      }),
    onSuccess: (data) => {
      if (data?.IsSuccess && data?.Data?.PaymentURL) {
        window.location.href = data.Data.PaymentURL
      } else {
        toast('faildToCreateOrder')
      }
    },
    onError: () => {
      toast('faildToCreateOrder')
    },
  })

  return (
    <PrimaryButton
      onClick={() => checkoutMutation.mutate({ paymentMethodId: selected })}
      className="disabled:bg-muted disabled:cursor-not-allowed cursor-pointer w-fit text-center mx-auto"
      disabled={checkoutMutation.isPending}
    >
      {checkoutMutation.isPending ? t('loading') : t('buyNow')}
    </PrimaryButton>
  )
}
