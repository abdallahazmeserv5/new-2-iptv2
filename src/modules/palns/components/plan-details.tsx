import { Media, Plan } from '@/payload-types'
import { getTranslations } from 'next-intl/server'
import ActionButtons from './action-buttons'
import NumberOfSubscriptions from './number-of-subscriptions'
import PlanDescription from './plan-description'
import PlanFeatures from './plan-features'
import PlanPrice from './plan-price'
import Reviews from './reviews'
import DownloadPlatforms from './download-platforms'

interface Props {
  planDetails: Plan
}
export default async function PlanDetails({ planDetails }: Props) {
  const img = planDetails.image as Media
  return (
    <section className="container mx-auto px-4 flex flex-col md:flex-row gap-5">
      {/* first coulm */}
      <div className="w-full md:w-[350px] lg:w-[400px] space-y-5">
        {/* plan name and price */}
        <PlanPrice
          img={img.url || ''}
          price={planDetails.price || 0}
          priceBeforeDiscount={planDetails.price || 0}
          title={planDetails.title || ''}
        />
        <NumberOfSubscriptions numberOfSubscriptions={planDetails.numberOfSubscriptions || 1000} />
        <ActionButtons packageId={planDetails.id} />
      </div>
      {/* second coulm */}
      <div className="flex-1 min-w-0 space-y-5">
        <PlanDescription description={planDetails.description || ''} />
        <Reviews reviews={planDetails.reviews || []} />
        <PlanFeatures features={planDetails.features || []} />
        <DownloadPlatforms platforms={planDetails.downloadPlatforms || []} />
      </div>
    </section>
  )
}
