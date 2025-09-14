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
import { Separator } from '@/components/ui/separator'
import ImageFallBack from '@/modules/shared/components/image-fall-back'
import SectionHeader from '@/modules/shared/components/section-header'
import { Media, Testimonial } from '@/payload-types'
import { Star } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { PaginatedDocs } from 'payload'
import { useEffect, useState } from 'react'

interface Props {
  testimonial: PaginatedDocs<Testimonial>
}

export default function TestimonialSection({ testimonial }: Props) {
  const t = useTranslations('')
  const [api, setApi] = useState<CarouselApi>()
  const lang = useLocale()
  const [current, setCurrent] = useState(0)

  const [count, setCount] = useState(0)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const slideItems = testimonial.docs

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
    <section className="container mx-auto px-4">
      <SectionHeader sectionHeader={t('testimonials')} />

      <Carousel
        plugins={[
          Autoplay({
            delay: Number(process.env.NEXT_PUBLIC_CAROUSEL_DELAY) || 2000,
          }),
        ]}
        setApi={setApi}
        className="w-full h-full relative  "
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
                className="basis-[800px] lg:items-start max-w-[80%] flex flex-col lg:flex-row gap-6 md:gap-10 shrink-0 h-full bg-[#050505] p-6 rounded-2xl me-5 group border border-primary items-center md:items-stretch"
              >
                {/* image */}
                <ImageFallBack
                  alt={img.alt}
                  width={397}
                  height={370}
                  className="object-cover transform transition-transform duration-300 rounded-2xl w-full md:w-[250px] md:h-[240px]"
                  src={img.url || ''}
                />

                {/* review body */}
                <div className="flex flex-col gap-6 md:gap-8 w-full">
                  {/* stars */}
                  <div className="flex items-center gap-[2px]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={index}
                        size={32}
                        className={
                          index < (slideItem.rate || 0)
                            ? 'fill-[#E4AD35] text-[#E4AD35]'
                            : 'fill-gray-300 text-gray-300'
                        }
                      />
                    ))}
                  </div>

                  <p className="text-white text-lg md:text-xl line-clamp-4 min-h-[114px]">
                    {slideItem.review}
                  </p>
                  <Separator className="bg-primary mt-auto" />
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <p className="text-xl md:text-2xl text-white font-medium">
                      {slideItem.reviewer}
                    </p>
                    <p className="text-[#B1B1B1] text-sm">{slideItem.reviewerJob}</p>
                  </div>
                </div>
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
