'use client'
import Autoplay from 'embla-carousel-autoplay'

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import ImageFallBack from '@/modules/shared/components/image-fall-back'
import { Media, Feature } from '@/payload-types'
import { useLocale, useTranslations } from 'next-intl'
import { PaginatedDocs } from 'payload'
import { useEffect, useState } from 'react'
import SectionHeader from '@/modules/shared/components/section-header'

interface FeaturesProps {
  features: PaginatedDocs<Feature>
}

export default function Features({ features }: FeaturesProps) {
  const t = useTranslations('')
  const [api, setApi] = useState<CarouselApi>()
  const lang = useLocale()
  const [current, setCurrent] = useState(0)

  const [count, setCount] = useState(0)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const slideItems = features.docs

  useEffect(() => {
    if (!api) {
      return
    }
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])

  return (
    <section className="container mx-auto px-4  hidden md:block" id="features">
      <SectionHeader sectionHeader={t('features')} />

      <Carousel
        plugins={[
          Autoplay({
            delay: Number(process.env.NEXT_PUBLIC_CAROUSEL_DELAY) || 2000,
          }),
        ]}
        setApi={setApi}
        className="w-full h-full relative"
        opts={{
          align: 'center',
          loop: true,
          direction: dir,
        }}
      >
        <CarouselContent className="w-full gap-3">
          {slideItems?.map((slideItem, index) => {
            const img = slideItem.image as Media
            return (
              <CarouselItem
                key={index}
                className="basis-[270px] shrink-0 h-full bg-[#262626] p-8 flex flex-col items-center rounded-2xl me-5 group cursor-pointer"
              >
                <ImageFallBack
                  alt={img?.alt}
                  width={180}
                  height={185}
                  className="object-contain transform transition-transform duration-300 group-hover:scale-110 w-[150px] h-[150px]"
                  src={img.url || ''}
                />
                <p className="text-white font-semibold text-lg group-hover:text-primary">
                  {slideItem.title}
                </p>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        <div className="container px-4 mx-auto relative">
          {/* arrows */}
          <div className="absolute -bottom-10">
            <CarouselPrevious className=" start-12" />
            <CarouselNext className="start-0" />
          </div>
          {/* points */}
          <div className="absolute -bottom-10 end-0 flex items-center gap-2">
            {Array.from({ length: count }).map((_, index: number) => {
              const isActive = current - 1 === index
              return (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={`w-4 h-1 transition-colors ${isActive ? 'bg-primary' : 'bg-muted'}`}
                />
              )
            })}
          </div>
        </div>
      </Carousel>
    </section>
  )
}
