import { Media, Plan } from '@/payload-types'
import ActionButtons from './action-buttons'
import DownloadPlatforms from './download-platforms'
import NumberOfSubscriptions from './number-of-subscriptions'
import PlanDescription from './plan-description'
import PlanFeatures from './plan-features'
import PlanPrice from './plan-price'
import Reviews from './reviews'

interface Props {
  planDetails: Plan
}
export default async function PlanDetails({ planDetails }: Props) {
  const img = planDetails.image as Media
  return (
    <section className="container mx-auto px-4 flex flex-col md:flex-row gap-5">
      <div className="w-full md:w-[350px] lg:w-[400px] space-y-5">
        <PlanPrice
          img={img.url || ''}
          price={planDetails.price || 0}
          priceBeforeDiscount={planDetails.price || 0}
          title={planDetails.title || ''}
        />
        <NumberOfSubscriptions numberOfSubscriptions={planDetails.numberOfSubscriptions || 1000} />
        <ActionButtons plan={planDetails} />
      </div>
      {/* second coulm */}
      <div className="flex-1 min-w-0 space-y-5">
        <PlanDescription description={planDetails.description || ''} />
        <Reviews planDetails={planDetails} />
        <PlanFeatures features={planDetails.features || []} />
        <DownloadPlatforms platforms={planDetails.downloadPlatforms || []} />
      </div>
    </section>
  )
}
