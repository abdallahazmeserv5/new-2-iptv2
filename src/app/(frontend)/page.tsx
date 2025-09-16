import { configuredPayload } from '@/actions'
import Banners from '@/modules/home/components/banners'
import Faq from '@/modules/home/components/faq-section'
import Hero from '@/modules/home/components/hero'
import Packages from '@/modules/home/components/packages'
import Plans from '@/modules/home/components/plans'
import SubscriptionSteps from '@/modules/home/components/subscription-steps'
import TestimonialSection from '@/modules/home/components/testimonial-section'

export default async function HomePage() {
  const payload = await configuredPayload()

  const [heroSection, packages, plans, testimonial, banners, faqs] = await Promise.all([
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
      collection: 'testimonial',
    }),
    payload.find({
      collection: 'banners',
    }),
    payload.find({
      collection: 'faq',
    }),
  ])
  console.log({ heroSection })
  return (
    <main className="flex flex-col gap-10 lg:gap-16 ">
      <Hero heroSection={heroSection} />
      <SubscriptionSteps />
      <Packages packages={packages} />
      <Plans plans={plans} />
      <TestimonialSection testimonial={testimonial} />
      <Banners banners={banners} />
      <Faq faqs={faqs} />
    </main>
  )
}
