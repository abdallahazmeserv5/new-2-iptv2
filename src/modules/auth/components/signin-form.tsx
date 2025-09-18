'use client'

import { baseFetch } from '@/actions/fetch'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useCart } from '@/modules/cart/hooks/use-cart'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

export default function SigninForm({ isCart }: { isCart?: boolean }) {
  const lang = useLocale()
  const queryClient = useQueryClient()
  const t = useTranslations()
  const { items: guestCartItems, clearCart } = useCart()

  const formSchema = z.object({
    email: z.string().email(t('enterValidEmail') || 'Please enter a valid email'),
    password: z.string().min(1, 'Password is required').max(100, t('passwordInvalid')),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  })

  const [submitting, setSubmitting] = React.useState(false)

  // Transfer guest cart from Zustand store to backend
  const transferGuestCartToBackend = async (): Promise<boolean> => {
    if (guestCartItems.length === 0) return true

    try {
      // Transform guest cart items to match backend expected format
      const transformedItems = guestCartItems.map((item) => ({
        planId: item.planId,
        quantity: item.quantity,
      }))

      // Use baseFetch instead of fetch
      const response = await baseFetch({
        url: '/api/cart/add',
        method: 'POST',
        body: { items: transformedItems },
      })

      if (!response) {
        throw new Error('Failed to transfer guest cart')
      }

      // Clear guest cart
      clearCart()
      window.dispatchEvent(new CustomEvent('guestCartUpdated'))
      await queryClient.refetchQueries({ queryKey: ['/cart', lang] })

      toast.success(t('itemAddedToCart'))
      return true
    } catch (error) {
      toast.error('Failed to transfer some cart items. Please add them manually.')
      return false
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true)

    try {
      // Replace fetch with baseFetch
      const data = await baseFetch({
        url: '/api/users/login',
        method: 'POST',
        body: values,
      })

      if (!data) {
        return
      }

      toast.success(t('loginSucess'))

      await transferGuestCartToBackend()
      await queryClient.refetchQueries({ queryKey: ['/cart', lang] })

      window.location.href = '/cart'
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      className={cn(
        'bg-[#151515] p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white',
        isCart ? 'w-fit min-w-96 max-w-full' : 'w-full',
      )}
    >
      <div className={cn('h-auto my-auto flex gap-5 sm:gap-10', isCart ? '' : 'flex-col')}>
        {!isCart && <h1 className="font-bold text-3xl lg:text-5xl">{t('signin') || 'Sign In'}</h1>}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="max-w-[600px]">
                  <FormLabel className="text-xl font-medium">{t('email') || 'Email'}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t('enterEmail') || 'Enter your email'}
                      {...field}
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="max-w-[600px]">
                  <FormLabel className="text-xl font-medium">
                    {t('password') || 'Password'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('enterPassword') || 'Enter your password'}
                      {...field}
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center text-xs text-muted gap-1">
              <p>{t('dontHaveAccount')}</p>
              <Link href={'/signup'} className="hover:underline hover:text-primary">
                <span>{t('createAccount')}</span>
              </Link>
            </div>

            <Button
              variant="outline"
              type="submit"
              disabled={submitting || !form.formState.isValid}
              className="w-full sm:w-auto"
            >
              {submitting ? t('signingIn') : t('signin')}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  )
}
