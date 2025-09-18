import { configuredPayload } from '@/actions'
import { Button } from '@/components/ui/button'
import { QueryClient } from '@tanstack/react-query'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

export default async function Page() {
  const queryClient = new QueryClient()
  const lang = await getLocale()
  const t = await getTranslations()
  const payload = await configuredPayload()

  // Fetch settings to get WhatsApp number
  const settings = await queryClient.fetchQuery({
    queryKey: ['/settings', lang],
    queryFn: async () =>
      await payload.findGlobal({
        slug: 'settings',
      }),
    staleTime: Infinity,
  })

  const whatsappNumber = (settings as any)?.whatsappNumber?.replace(/^\+/, '') || null
  const encodedMessage = encodeURIComponent('مرحباً! واجهت مشكلة في عملية الدفع وأحتاج مساعدة.')
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    : '#'

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-red-800 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">❌ حدث خطأ في عملية الدفع</h1>
        <p className="text-lg mb-8 text-red-700">
          نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى أو التواصل معنا للحصول على المساعدة.
        </p>

        <div className="flex flex-col gap-4 items-center">
          <Link href="/" className="w-full">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              العودة للصفحة الرئيسية
            </Button>
          </Link>

          {whatsappNumber && (
            <Link href={whatsappUrl} target="_blank" className="w-full">
              <Button
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50 flex items-center gap-2"
              >
                <Image
                  src="/whatsapp.webp"
                  alt="WhatsApp"
                  width={20}
                  height={20}
                  className="rounded"
                />
                تواصل معنا عبر واتساب
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
