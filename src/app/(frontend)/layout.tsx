import { configuredPayload } from '@/actions'
import Navbar from '@/modules/shared/components/navbar/navbar'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale } from 'next-intl/server'
import React from 'react'
import Providers from './providers'
import './styles.css'
import Footer from '@/modules/shared/components/footer'
import { Toaster } from '@/components/ui/sonner'
import { cookies, headers } from 'next/headers'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { baseFetch } from '@/actions/fetch'

export const metadata = {
  description: 'Best site to watch the latest movies.',
  title: 'Tornado 4K',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const lang = await getLocale()

  const payload = await configuredPayload()

  const settings = await payload.findGlobal({
    slug: 'settings',
  })

  const cookieStore = await cookies()

  // Turn them into a header
  const headers = new Headers()
  cookieStore.getAll().forEach((c) => {
    headers.append('cookie', `${c.name}=${c.value}`)
  })

  const queryClient = new QueryClient()
  const [user, pages] = await Promise.all([
    queryClient.fetchQuery({
      queryKey: ['/me'],
      queryFn: async () => await payload.auth({ headers }),
    }),
    queryClient.fetchQuery({
      queryKey: ['/pages', lang],
      queryFn: async () =>
        await payload.find({
          collection: 'pages',
          where: {},
          pagination: false,
        }),
    }),
  ])

  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  return (
    <html lang={lang} dir={dir} className="scroll-smooth">
      <Providers>
        <NextIntlClientProvider>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <body className="min-h-screen flex flex-col">
              <Navbar settings={settings} user={user} pages={pages} />
              <main className="flex-1"> {children}</main>
              <Footer settings={settings} pages={pages} />
              <Toaster richColors closeButton />
            </body>
          </HydrationBoundary>
          <ReactQueryDevtools initialIsOpen={false} />
        </NextIntlClientProvider>
      </Providers>
    </html>
  )
}
