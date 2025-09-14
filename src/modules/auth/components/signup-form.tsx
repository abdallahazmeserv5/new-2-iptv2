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
import { useMutation } from '@tanstack/react-query'
import { baseFetch } from '@/actions/fetch'
import { sendMessage } from '@/actions/need-bot'

export default function SignupForm() {
  const router = useRouter()
  const t = useTranslations()

  // Form schema
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

  // React Query mutation
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) =>
      baseFetch({ url: '/api/users', method: 'POST', body: values }),
    onSuccess: async (data, values) => {
      toast.success(t('signupSuccess') || 'Account created successfully!')

      const message = `Welcome to our platform! Your email is ${values.email} and your password is ${values.password}`
      const phoneNumber = values.phone.startsWith('+') ? values.phone.slice(1) : values.phone

      try {
        // Send the message twice
        await sendMessage({
          number: phoneNumber,
          message: t('welcomeAtTornado', { email: values.email, password: values.password }),
        })
        await sendMessage({
          number: phoneNumber,
          message: t('welcomeAtTornado', { email: values.email, password: values.password }),
        })
      } catch (err) {
        console.error('Send message error:', err)
      }

      router.push('/signin')
    },
    onError: (err: any) => {
      console.error('Signup error:', err)
      toast.error(err?.message || t('signupFailed') || 'Signup failed')
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values)
  }

  return (
    <section className="bg-[#151515] p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white w-full">
      <div className="flex flex-col gap-5 sm:gap-10">
        <h1 className="font-bold text-3xl lg:text-5xl">{t('signUp') || 'Sign Up'}</h1>
        <p className="text-xs sm:text-base">{t('welcomeSignUp') || 'Create your account'}</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 max-w-[600px]">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email') || 'Email'}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('enterEmail') || 'Enter your email'}
                      {...field}
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Field */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phone') || 'Phone Number'}</FormLabel>
                  <FormControl>
                    <div dir="ltr">
                      <PhoneInput {...field} disabled={mutation.isPending} defaultCountry="SA" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password') || 'Password'}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t('enterPassword') || 'Enter your password'}
                      {...field}
                      disabled={mutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={mutation.isPending || !form.formState.isValid}
              className="w-full sm:w-auto"
            >
              {mutation.isPending ? t('createingAccount') : t('signUp') || 'Sign Up'}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  )
}
