import { configuredPayload } from '@/actions'
import CartDetails from '@/modules/cart/components/cart-details'
import BreadCrumb from '@/modules/shared/components/bread-crumb'
import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const t = await getTranslations()
  const payload = await configuredPayload()

  const cookieStore = await cookies()
  const headers = new Headers()
  headers.set('cookie', cookieStore.toString())

  let user = null
  try {
    const { user: authUser } = await payload.auth({ headers })
    user = authUser || null
  } catch (err) {
    console.error('Auth check failed:', err)
  }

  return (
    <main className="bg-black flex flex-col gap-5 lg:gap-10 pt-5">
      <BreadCrumb
        image={'/bread-crumb-image.webp'}
        links={[
          {
            text: t('cart'),
            url: '#',
          },
        ]}
        title={t('cart')}
      />
      <CartDetails user={user} />
    </main>
  )
}
