'use client'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import ImageFallBack from '@/modules/shared/components/image-fall-back'
import SectionHeader from '@/modules/shared/components/section-header'
import Autoplay from 'embla-carousel-autoplay'
import { useLocale, useTranslations } from 'next-intl'

export default function SubscriptionSteps() {
  const t = useTranslations()
  const lang = useLocale()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const steps = [
    {
      label: t('contact-us'),
      icon: '/home/subscription-steps/headphone-svg.svg',
    },
    {
      img: '/home/subscription-steps/arrow-svg.svg',
    },
    {
      label: t('startTransaction'),
      icon: '/home/subscription-steps/wallet-svg.svg',
    },
    {
      img: '/home/subscription-steps/arrow-svg.svg',
    },
    {
      label: t('enjoyOurServices'),
      icon: '/home/subscription-steps/tv-svg.svg',
    },
  ]
  return (
    <section className="container mx-auto px-4 hidden md:block">
      <SectionHeader sectionHeader={t('subscriptionsSteps')} />
      <div className="hidden md:block">
        <ul className="flex justify-evenly items-center flex-wrap gap-2">
          {steps.map((step, index) => {
            if (step?.img) {
              // arrows
              return (
                <li
                  key={`arrow-${index}`}
                  className="relative w-64 h-32 hidden xl:block flex-shrink-0"
                >
                  <ImageFallBack alt="Arrow" src={step.img} fill className="object-contain" />
                </li>
              )
            } else if (step.label) {
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
            }
          })}
        </ul>
      </div>

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
            {steps
              .filter((step) => step.label) // Only show steps with labels (not arrows)
              .map((step, index) => (
                <CarouselItem key={step.label} className="basis-[70%]">
                  <div className="bg-[#262626] gap-6 flex flex-col items-center rounded-xl p-6 sm:p-12 relative flex-shrink-0">
                    <ImageFallBack
                      alt={step.label || ''}
                      src={step.icon || ''}
                      width={80}
                      height={80}
                    />
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
