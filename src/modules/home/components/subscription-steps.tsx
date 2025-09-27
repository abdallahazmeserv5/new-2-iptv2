'use client'

import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import ImageFallBack from '@/modules/shared/components/image-fall-back'
import SectionHeader from '@/modules/shared/components/section-header'
import { Media, Step } from '@/payload-types'
import Autoplay from 'embla-carousel-autoplay'
import { useLocale, useTranslations } from 'next-intl'

export default function SubscriptionSteps({ steps = [] }: { steps: Step[] }) {
  const t = useTranslations()
  const lang = useLocale()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  // Sort steps by createdAt ascending (oldest first)
  const sortedSteps = [...steps].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  // Map steps from collection
  const mappedSteps = sortedSteps.map((step) => ({
    label: step.title || '',
    icon: typeof step.image === 'string' ? step.image : step.image.url,
  }))

  // Add arrows for desktop
  const desktopSteps: ((typeof mappedSteps)[number] | { img: string })[] = []
  mappedSteps.forEach((step, i) => {
    desktopSteps.push(step)
    if (i < mappedSteps.length - 1) {
      desktopSteps.push({ img: '/home/subscription-steps/arrow-svg.svg' })
    }
  })

  return (
    <section className="container mx-auto px-4">
      <SectionHeader sectionHeader={t('subscriptionsSteps')} />

      {/* Desktop */}
      <ul className="hidden md:flex justify-evenly items-center flex-wrap gap-2">
        {desktopSteps.map((step, index) => {
          if ('img' in step) {
            return (
              <li
                key={`arrow-${index}`}
                className="relative w-64 h-32 hidden xl:block flex-shrink-0"
              >
                <ImageFallBack alt="Arrow" src={step.img} fill className="object-contain" />
              </li>
            )
          }
          return (
            <li
              key={step.label}
              className="bg-[#262626] gap-6 flex flex-col items-center rounded-xl p-6 sm:p-12 relative flex-shrink-0"
            >
              <ImageFallBack alt={step.label} src={step.icon} width={80} height={80} />
              <p className="text-white font-semibold text-base sm:text-lg text-center">
                {step.label}
              </p>
            </li>
          )
        })}
      </ul>

      {/* Mobile Carousel */}
      <div className="block md:hidden">
        <Carousel
          plugins={[
            Autoplay({
              delay: Number(process.env.NEXT_PUBLIC_CAROUSEL_DELAY) || 1500,
            }),
          ]}
          className="w-full"
          opts={{
            align: 'center',
            loop: true,
            direction: dir,
          }}
        >
          <CarouselContent className="gap-4 px-1">
            {mappedSteps.map((step) => (
              <CarouselItem key={step.label} className="basis-[70%]">
                <div className="bg-[#262626] gap-6 flex flex-col items-center rounded-xl p-6 sm:p-12 relative flex-shrink-0">
                  <ImageFallBack alt={step.label} src={step.icon} width={80} height={80} />
                  <p className="text-white font-semibold text-base sm:text-lg text-center">
                    {step.label}
                  </p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}
