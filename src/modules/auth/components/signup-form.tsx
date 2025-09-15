'use client'

import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { baseFetch } from '@/actions/fetch'
import { sendMessage } from '@/actions/need-bot'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useUser } from '@/modules/shared/hooks/use-user'

interface LocalStorageCartItem {
  planId: string
  quantity: number
  addedAt: string
  plan: { id: string; title: string; price: number }
}

export default function SignupForm({ isCart }: { isCart?: boolean }) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const t = useTranslations()
  const [submitting, setSubmitting] = React.useState(false)
  const [isTransferringCart, setIsTransferringCart] = React.useState(false)

  // Get user data using your existing hook
  const { user, isLoading: userLoading } = useUser()

  const formSchema = z.object({
    email: z.string().email(t('enterEmail') || 'Please enter a valid email'),
    phone: z.string().min(1, t('enterPhone') || 'Please enter your phone number'),
    password: z
      .string()
      .min(6, t('passwordInvalid') || 'Password must be at least 6 characters')
      .max(100, t('passwordInvalid') || 'Password is too long'),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', phone: '', password: '' },
    mode: 'onChange',
  })

  const transferGuestCartToBackend = async (): Promise<boolean> => {
    const guestCart = localStorage.getItem('guestCart')
    if (!guestCart) return true

    try {
      const guestCartItems: LocalStorageCartItem[] = JSON.parse(guestCart)

      if (!guestCartItems.length) return true

      setIsTransferringCart(true)
      let successCount = 0
      let failedItems: LocalStorageCartItem[] = []

      // Process items one by one to handle individual failures
      for (const item of guestCartItems) {
        try {
          const res = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
            },
            credentials: 'include',
            body: JSON.stringify({
              planId: item.planId,
              quantity: item.quantity,
            }),
          })

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Unknown error' }))

            console.error(`Failed to add ${item.plan.title}:`, errorData.message)
            failedItems.push(item)
          } else {
            successCount++
          }
        } catch (error) {
          console.error(`Error adding ${item.plan.title} to cart:`, error)
          failedItems.push(item)
        }
      }

      // Only remove successfully transferred items from localStorage
      if (successCount > 0) {
        if (failedItems.length > 0) {
          // Keep failed items in localStorage
          localStorage.setItem('guestCart', JSON.stringify(failedItems))
          toast.success(
            `Transferred ${successCount} item(s). ${failedItems.length} item(s) failed to transfer.`,
          )
        } else {
          // All items transferred successfully, clear the cart
          localStorage.removeItem('guestCart')
          toast.success(`Successfully transferred all ${successCount} item(s) to your account!`)
        }

        // Dispatch event to update cart UI
        window.dispatchEvent(new CustomEvent('guestCartUpdated'))

        // Invalidate cart queries to refresh cart data
        await queryClient.invalidateQueries({ queryKey: ['cart'] })

        return failedItems.length === 0
      } else {
        toast.error('Failed to transfer cart items. Please try again or add them manually.')
        return false
      }
    } catch (err) {
      console.error('Cart transfer error:', err)
      toast.error('Failed to process cart transfer. Please try again.')
      return false
    } finally {
      setIsTransferringCart(false)
    }
  }

  // useEffect to handle cart transfer when user logs in
  React.useEffect(() => {
    const handleCartTransfer = async () => {
      // Check if user is logged in and not currently loading
      if (user && !userLoading && !isTransferringCart) {
        const guestCart = localStorage.getItem('guestCart')
        if (guestCart) {
          try {
            const guestCartItems: LocalStorageCartItem[] = JSON.parse(guestCart)
            if (guestCartItems.length > 0) {
              await transferGuestCartToBackend()
            }
          } catch (error) {
            console.error('Error parsing guest cart:', error)
            // If cart data is corrupted, remove it
            localStorage.removeItem('guestCart')
          }
        }
      }
    }

    handleCartTransfer()
  }, [user, userLoading, isTransferringCart]) // Dependencies

  const performLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const loginRes = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const loginData = await loginRes.json()

      if (!loginRes.ok) {
        throw new Error(loginData.error || 'Login failed after signup')
      }

      return true
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) =>
      baseFetch({ url: '/api/users', method: 'POST', body: values }),
    onSuccess: async (data, values) => {
      toast.success(t('signupSuccess'))
      // Send welcome message (don't let this fail the signup process)
      const phoneNumber = values.phone.startsWith('+') ? values.phone.slice(1) : values.phone
      try {
        await sendMessage({
          number: phoneNumber,
          message: t('welcomeAtTornado', { email: values.email, password: values.password }),
        })
      } catch (err) {
        console.error('Send message error:', err)
      }

      try {
        // Step 1: Login to get authentication cookies
        await performLogin(values.email, values.password)

        // Step 2: Wait for cookies to be properly set
        await new Promise((resolve) => setTimeout(resolve, 800))

        await queryClient.refetchQueries({ queryKey: ['/me'] })

        // Step 4: Wait for user data to be updated (the useEffect will handle cart transfer)
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Step 5: Navigate to cart page
        router.push('/#plans')

        // Optional: Force a page refresh to ensure all data is synced
        setTimeout(() => {
          router.refresh()
        }, 200)
      } catch (err) {
        console.error('Auto-login failed:', err)
        toast.error('Account created successfully! Please sign in to continue.')
        router.push('/signin')
      }
    },
    onError: (err: any) => {
      console.error('Signup error:', err)
      const errorMessage =
        err?.message || err?.response?.data?.message || t('signupFailed') || 'Signup failed'
      toast.error(errorMessage)
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setSubmitting(true)
    mutation.mutate(values, {
      onSettled: () => setSubmitting(false),
    })
  }

  return (
    <section
      className={cn(
        'bg-[#151515] p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white',
        isCart ? 'w-fit min-w-96 max-w-full' : 'w-full',
      )}
    >
      <div className={cn('h-auto my-auto flex gap-5 sm:gap-10', isCart ? '' : 'flex-col')}>
        {!isCart && <h1 className="font-bold text-3xl lg:text-5xl">{t('signUp') || 'Sign Up'}</h1>}

        {/* Show transfer status if in progress */}
        {isTransferringCart && (
          <div className="mb-4 p-3 bg-blue-600/20 border border-blue-600/30 rounded-lg">
            <p className="text-sm text-blue-300">Transferring cart items...</p>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn('space-y-5 ', isCart ? 'w-full' : 'max-w-[600px]')}
          >
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl font-medium">{t('email') || 'Email'}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('enterEmail')} {...field} disabled={submitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl font-medium">
                    {t('phone') || 'Phone Number'}
                  </FormLabel>
                  <FormControl>
                    <div dir="ltr">
                      <PhoneInput {...field} defaultCountry="SA" disabled={submitting} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl font-medium">
                    {t('password') || 'Password'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('enterPassword')}
                      {...field}
                      disabled={submitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isCart && (
              <div className="flex items-center text-xs text-muted gap-1">
                <p>{t('alreadyHaveAccount')}</p>
                <Link href="/signin" className="hover:underline hover:text-primary">
                  {t('signIn')}
                </Link>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || !form.formState.isValid || isTransferringCart}
              className={cn('w-full', isCart ? 'w-full' : 'sm:w-auto')}
            >
              {submitting ? t('creatingAccount') : t('signUp') || 'Sign Up'}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  )
}
