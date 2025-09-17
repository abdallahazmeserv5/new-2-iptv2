'use client'

import { baseFetch } from '@/actions/fetch'
import { useCart } from '@/modules/cart/hooks/use-cart'
import { Plan } from '@/payload-types'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowUpRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useUser } from '../hooks/use-user'
import PrimaryButton from './primary-button'

export default function AddToCartButtons({ plan }: { plan: Plan }) {
  const { user } = useUser()
  const lang = useLocale()
  const queryClient = useQueryClient()
  const router = useRouter()
  const t = useTranslations()
  // Use the custom cart hook
  const { addToCart: addToCartHook } = useCart()

  // Add to cart for authenticated users
  const addToCartAuth = async (planId: string) => {
    try {
      const data = await baseFetch({
        url: '/api/cart/add',
        method: 'POST',
        body: {
          items: [{ planId, quantity: 1 }],
        },
      })

      if (!data || data?.error) {
        toast.error(data?.error || 'Could not add to cart')
        return false
      }

      // ✅ Refetch cart so UI updates
      queryClient.refetchQueries({ queryKey: ['/cart', lang] })

      toast.success(t('cartUpdatedSuccessfully'), {
        duration: 3000,
      })
      return true
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
      return false
    }
  }

  const addToLocalStorage = (planId: string) => {
    try {
      addToCartHook(plan, 1)
      toast.success(t('addToCartGuestMode'))
    } catch (err) {
      toast.error('Could not add to cart')
    }
  }

  // Main add to cart function
  const addToCart = async (planId: string) => {
    let success = false

    if (!!user) {
      success = await addToCartAuth(planId)
    } else {
      addToLocalStorage(planId)
      success = true // Local storage operations are synchronous
    }

    // Only navigate to cart if the operation was successful
    if (success) {
      router.push('/cart')
    }
  }

  return (
    <PrimaryButton
      className="flex gap-2 items-center justify-center"
      onClick={() => addToCart(plan.id)}
    >
      <ArrowUpRight className="text-[#9EFF3E] " />
      {t('subscripe')}
    </PrimaryButton>
  )
}
