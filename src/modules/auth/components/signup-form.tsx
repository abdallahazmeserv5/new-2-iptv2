'use client'

import { baseFetch } from '@/actions/fetch'
import { sendMessage } from '@/actions/need-bot'
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
import { PhoneInput } from '@/components/ui/phone-input'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

export default function SignupForm({ isCart }: { isCart?: boolean }) {
  const router = useRouter()
  const t = useTranslations()
  const [submitting, setSubmitting] = React.useState(false)

  const formSchema = z.object({
    email: z.string().email(t('enterEmail')),
    phone: z.string().min(1, t('enterPhone')),
    password: z.string().min(6, t('passwordInvalid')).max(100, t('passwordInvalid')),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', phone: '', password: '' },
    mode: 'onChange',
  })

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) =>
      baseFetch({ url: '/api/users', method: 'POST', body: values }),
    onSuccess: async (data, values) => {
      if (!data) {
        return
      }
      try {
        const message =
          `👋 أهلاً وسهلاً بك في Tornado-TV4K!\n\n` +
          `📧 الإيميل: ${values.email}\n` +
          `🔑 كلمة المرور: ${values.password}\n\n` +
          `✅ يمكنك الآن تسجيل الدخول والاستمتاع بخدماتنا.`

        sendMessage({
          number: values.phone,
          message,
        })
      } catch (err) {}
      router.push('/signin')
    },
    onError: (err: any) => {
      const errorMessage =
        err?.message || err?.response?.data?.message || t('signupFailed') || 'Signup failed'
      toast.error(errorMessage)
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setSubmitting(true)
    mutation.mutate(values, { onSettled: () => setSubmitting(false) })
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
              disabled={submitting || !form.formState.isValid}
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
