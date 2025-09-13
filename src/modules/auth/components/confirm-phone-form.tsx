'use client'
import { PhoneInput } from '@/components/ui/phone-input'
import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

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
import { useForm } from 'react-hook-form'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import React from 'react'

export default function ConfirmPhoneForm() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const phoneNumber = searchParams.get('phoneNumber')?.trim()
   const router = useRouter()
  const [cooldownMs, setCooldownMs] = React.useState(0)
  const [timerId, setTimerId] = React.useState<NodeJS.Timeout | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (cooldownMs <= 0) {
      if (timerId) clearInterval(timerId)
      return
    }
    const id = setInterval(() => {
      setCooldownMs((ms) => (ms > 1000 ? ms - 1000 : 0))
    }, 1000)
    setTimerId(id)
    return () => clearInterval(id)
  }, [cooldownMs])

 
  const formSchema = z.object({
    otp: z.string().length(6, t('enterValidOTP')),
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { otp: '' },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
     if (!phoneNumber) return
    setSubmitting(true)
    const res = await fetch('/api/users/login', {
      method: 'POST',

      headers: { 'Content-Type': 'application/json', 'x-phone': phoneNumber, 'x-otp': values.otp },
      body: JSON.stringify({ phone: phoneNumber, otp: values.otp, strategy: 'phone-otp' }),
      credentials: 'include',
    })
    const data = await res.json()
     if (res.ok) router.push('/')
    else {
      toast.error(t('enterValidOTP'))
      setSubmitting(false)
    }
  }

  return (
    <section className="  bg-[#151515] p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white w-full ">
      <div className="h-auto my-auto flex flex-col gap-5 sm:gap-10  ">
        <h1 className="font-bold text-3xl lg:text-5xl">{t('confrimPhoneNumber')}</h1>

        <p className="text-xs sm:text-base">
          {t('otpSent')} <span className="text-primary">{phoneNumber}</span>
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 ">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="max-w-[600px]">
                  <FormLabel>{t('confirmNumber')}</FormLabel>
                  <FormControl dir="ltr">
                    <InputOTP maxLength={6} {...field} dir="ltr">
                      <InputOTPGroup dir="ltr">
                        <InputOTPSlot index={0} dir="ltr" className="border border-primary" />
                        <InputOTPSlot index={1} dir="ltr" className="border border-primary" />
                        <InputOTPSlot index={2} dir="ltr" className="border border-primary" />
                        <InputOTPSlot index={3} dir="ltr" className="border border-primary" />
                        <InputOTPSlot index={4} dir="ltr" className="border border-primary" />
                        <InputOTPSlot index={5} dir="ltr" className="border border-primary" />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-3">
              <Button
                variant={'outline'}
                type="submit"
                disabled={submitting || !form.formState.isValid}
              >
                {t('confirmNumber')}
              </Button>
              <Button
                variant={'secondary'}
                type="button"
                onClick={async () => {
                  if (!phoneNumber) return
                  const res = await fetch('/api/users/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: phoneNumber }),
                  })
                  if (res.ok) {
                    toast.success(t('sendOtp'))
                    // server may include msLeft on 429, but if ok, set 30s by default
                    setCooldownMs(30_000)
                  } else if (res.status === 429) {
                    try {
                      const data = await res.json()
                      setCooldownMs(typeof data.msLeft === 'number' ? data.msLeft : 30_000)
                    } catch {
                      setCooldownMs(30_000)
                    }
                    toast.error(t('enterValidPhoneNumber'))
                  } else {
                    toast.error(t('enterValidPhoneNumber'))
                  }
                }}
                disabled={cooldownMs > 0}
              >
                {cooldownMs > 0 ? Math.ceil(cooldownMs / 1000) + 's' : t('sendOtp')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  )
}
