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
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LocalStorageCartItem {
  planId: string
  quantity: number
  addedAt: string
  plan: {
    id: string
    title: string
    price: number
    priceBeforeDiscount?: number
    description: string
    numberOfSubscriptions?: number
    image?: {
      id: string
      url: string
      alt: string
      filename: string
      width: number
      height: number
      mimeType: string
    } | null
    features?: any[]
    downloadPlatforms?: any[]
    reviews?: any[]
    createdAt?: string
    updatedAt?: string
  }
}

export default function SigninForm({ isCart }: { isCart?: boolean }) {
  const router = useRouter()
  const t = useTranslations()

  const formSchema = z.object({
    email: z.string().email(t('enterValidEmail') || 'Please enter a valid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .max(100, t('passwordInvalid') || 'Password is too long'),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  })

  const [submitting, setSubmitting] = React.useState(false)

  // Function to transfer localStorage cart to backend
  const transferGuestCartToBackend = async (): Promise<boolean> => {
    try {
      const guestCart = localStorage.getItem('guestCart')
      if (!guestCart) {
        return true // No guest cart to transfer
      }

      const guestCartItems: LocalStorageCartItem[] = JSON.parse(guestCart)
      if (guestCartItems.length === 0) {
        return true // Empty guest cart
      }

 
      // Add each item from localStorage to the backend cart
      const transferPromises = guestCartItems.map(async (item) => {
        const response = await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            planId: item.planId,
            quantity: item.quantity,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error(`Failed to transfer item ${item.planId}:`, errorData)
          throw new Error(`Failed to transfer item: ${item.plan.title}`)
        }

        return response.json()
      })

      // Wait for all transfers to complete
      await Promise.all(transferPromises)

      // Clear localStorage cart after successful transfer
      localStorage.removeItem('guestCart')

      // Dispatch event to update other components
      window.dispatchEvent(new CustomEvent('guestCartUpdated'))

      toast.success(`Transferred ${guestCartItems.length} item(s) to your account!`)
      return true
    } catch (error) {
      console.error('Error transferring guest cart:', error)
      toast.error('Failed to transfer some cart items. Please add them manually.')
      return false // Don't fail the entire login process
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true)

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Login failed')
        return
      }

      toast.success('Login successful!')

      // Transfer guest cart items to backend after successful login
      await transferGuestCartToBackend()

      // Small delay to ensure cart transfer completes
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (isCart) {
        return router.refresh()
      }
      router.push('/')
      router.refresh() // Refresh to update auth state
    } catch (err) {
      console.error('Login error:', err)
      toast.error('Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section
      className={cn(
        'bg-[#151515] p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white ',
        isCart ? 'w-fit min-w-96 max-w-full ' : 'w-full',
      )}
    >
      <div className={cn('h-auto my-auto flexgap-5 sm:gap-10', isCart ? '' : ' flex-col ')}>
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
              {submitting ? 'Signing In...' : t('signin') || 'Sign In'}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  )
}
