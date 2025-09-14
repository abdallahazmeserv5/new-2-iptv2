'use client'

import { useTranslations } from 'next-intl'
import { useMutation } from '@tanstack/react-query'
import PrimaryButton from '@/modules/shared/components/primary-button'
import { baseFetch } from '@/actions/fetch'
import { toast } from 'sonner'

export default function CheckoutButton() {
  const t = useTranslations()

  const checkoutMutation = useMutation({
    mutationFn: async () =>
      baseFetch({
        url: '/api/payment/initiate',
        method: 'POST',
      }),
    onSuccess: (data) => {
      if (data?.IsSuccess && data?.Data?.InvoiceURL) {
        window.location.href = data.Data.InvoiceURL
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
      onClick={() => checkoutMutation.mutate()}
      className="disabled:bg-muted disabled:cursor-not-allowed cursor-pointer"
      disabled={checkoutMutation.isPending}
    >
      {checkoutMutation.isPending ? t('loading') : t('buyNow')}
    </PrimaryButton>
  )
}
