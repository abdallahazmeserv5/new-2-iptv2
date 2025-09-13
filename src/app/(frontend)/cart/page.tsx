import { configuredPayload } from '@/actions'
import CartDetails from '@/modules/cart/components/cart-details'
import PlanDetails from '@/modules/palns/components/plan-details'
import BreadCrumb from '@/modules/shared/components/bread-crumb'
import { getTranslations } from 'next-intl/server'

export default async function page() {
  const t = await getTranslations()
  const payload = await configuredPayload()

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
      <CartDetails />
    </main>
  )
}
