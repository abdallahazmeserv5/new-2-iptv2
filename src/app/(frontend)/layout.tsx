import { configuredPayload } from '@/actions'
import { Toaster } from '@/components/ui/sonner'
import Footer from '@/modules/shared/components/footer'
import Navbar from '@/modules/shared/components/navbar/navbar'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import React from 'react'
import Providers from './providers'
import './styles.css'
import WhatsAppFab from '@/modules/shared/components/whatsapp-fab'

export const revalidate = 30

export const metadata = {
  description: 'Best site to watch the latest movies.',
  title: 'Tornado 4K',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  const lang = await getLocale()
  const payload = await configuredPayload()

  const queryClient = new QueryClient()
  const [pages, settings] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ['/pages', lang],
      queryFn: async () =>
        await payload.find({
          collection: 'pages',
          where: {},
          pagination: false,
        }),
      staleTime: Infinity,
    }),
    queryClient.fetchQuery({
      queryKey: ['/settings', lang],
      queryFn: async () =>
        await payload.findGlobal({
          slug: 'settings',
        }),
      staleTime: Infinity,
    }),
  ])
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  return (
    <html lang={lang} dir={dir} className="scroll-smooth">
      <Providers>
        <NextIntlClientProvider>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <body className="min-h-screen flex flex-col">
              <Navbar settings={settings} pages={pages} />
              <main className="flex-1"> {children}</main>
              <Footer settings={settings} pages={pages} />
              <WhatsAppFab
                number={
                  (settings as any)?.whatsappNumber
                    ? (settings as any).whatsappNumber.replace(/^\+/, '')
                    : null
                }
              />
              <Toaster richColors closeButton />
            </body>
          </HydrationBoundary>
          <ReactQueryDevtools initialIsOpen={false} />
        </NextIntlClientProvider>
      </Providers>
    </html>
  )
}
