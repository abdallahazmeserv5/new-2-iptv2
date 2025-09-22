import { configuredPayload } from '@/actions'
import Banners from '@/modules/home/components/banners'
import PlanDetails from '@/modules/palns/components/plan-details'
import BreadCrumb from '@/modules/shared/components/bread-crumb'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ planId: string }>
}

export const revalidate = 30

export default async function page({ params }: Props) {
  const { planId } = await params
  const t = await getTranslations()
  const payload = await configuredPayload()

  const [banners, planDetails] = await Promise.all([
    payload.find({
      collection: 'banners',
    }),
    payload.findByID({
      collection: 'plans',
      id: planId,
      depth: 2,
    }),
  ])

  if (!planDetails) {
    return notFound()
  }

  return (
    <main className="bg-black flex flex-col gap-5 lg:gap-10 pt-5">
      <BreadCrumb
        image={'/bread-crumb-image.webp'}
        links={[
          {
            text: planDetails.title || t('plan'),
            url: '#',
          },
        ]}
        title={planDetails.title || ''}
      />
      <PlanDetails planDetails={planDetails} />
      <Banners banners={banners} />
    </main>
  )
}
