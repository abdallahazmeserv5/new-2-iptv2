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

export default function SignupForm() {
  const router = useRouter()
  const t = useTranslations()

  const formSchema = z.object({
    email: z.string().email(t('enterValidEmail') || 'Please enter a valid email'),
    password: z
      .string()
      .min(6, t('passwordInvalid') || 'Password must be at least 6 characters')
      .max(100, t('passwordInvalid') || 'Password is too long'),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange', // Enable real-time validation
  })

  const [submitting, setSubmitting] = React.useState(false)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PAYLOAD_SERVER_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || t('signupFailed') || 'Signup failed')
        return
      }

      toast.success(t('signupSuccess') || 'Account created successfully!')
      router.push('/signin')
    } catch (err) {
      console.error('Signup error:', err)
      toast.error(t('somethingWentWrong') || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="bg-[#151515] p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white w-full">
      <div className="h-auto my-auto flex flex-col gap-5 sm:gap-10">
        <h1 className="font-bold text-3xl lg:text-5xl">{t('signUp') || 'Sign Up'}</h1>
        <p className="text-xs sm:text-base">{t('welcomeSignUp') || 'Create your account'}</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
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
              <p>{t('haveAccount')}</p>
              <Link href={'/signin'} className="hover:underline hover:text-primary">
                <span>{t('login')}</span>
              </Link>
            </div>

            <Button
              variant="outline"
              type="submit"
              disabled={submitting || !form.formState.isValid}
              className="w-full sm:w-auto"
            >
              {submitting ? 'Creating Account...' : t('signUp') || 'Sign Up'}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  )
}
