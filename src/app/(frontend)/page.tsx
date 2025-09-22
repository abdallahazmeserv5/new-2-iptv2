import { configuredPayload } from '@/actions'
import { getMyFatoorahKey } from '@/actions/get-myfatorah-key'
import Banners from '@/modules/home/components/banners'
import Faq from '@/modules/home/components/faq-section'
import Features from '@/modules/home/components/features'
import Hero from '@/modules/home/components/hero'
import Packages from '@/modules/home/components/packages'
import Plans from '@/modules/home/components/plans'
import SubscriptionSteps from '@/modules/home/components/subscription-steps'
import TestimonialSection from '@/modules/home/components/testimonial-section'

export const revalidate = 30

export default async function HomePage() {
  const payload = await configuredPayload()

  const [heroSection, packages, plans, banners, faqs, features] = await Promise.all([
    payload.find({
      collection: 'hero-slides',
    }),
    payload.find({
      collection: 'packages',
    }),
    payload.find({
      collection: 'plans',
    }),

    payload.find({
      collection: 'banners',
    }),
    payload.find({
      collection: 'faq',
    }),
    payload.find({
      collection: 'features',
    }),
  ])

  const x = await getMyFatoorahKey()
  return (
    <main className="flex flex-col gap-10 lg:gap-16 ">
      <Hero heroSection={heroSection} />
      <SubscriptionSteps />
      <Plans plans={plans} />
      <Packages packages={packages} />
      <Features features={features} />
      <TestimonialSection plans={plans} />
      <Banners banners={banners} />
      <Faq faqs={faqs} />
    </main>
  )
}
