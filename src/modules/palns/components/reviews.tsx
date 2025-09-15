'use client'
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import ImageFallBack from '@/modules/shared/components/image-fall-back'
import { Plan } from '@/payload-types'
import Autoplay from 'embla-carousel-autoplay'
import { Star } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { ReviewDialog } from './review-dialog'

interface Props {
  planDetails: Plan
}
export default function Reviews({ planDetails }: Props) {
  const t = useTranslations()
  const [api, setApi] = useState<CarouselApi>()
  const lang = useLocale()
  const [current, setCurrent] = useState(0)

  const [count, setCount] = useState(0)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const slideItems = planDetails?.reviews

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
    <section className="flex flex-col gap-3 sm:gap-5 bg-[#151515] p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{t('reviews')}</h3>
        <ReviewDialog planDetails={planDetails} />
      </div>

      <div className=" relative pb-16">
        <Carousel
          plugins={[
            Autoplay({
              delay: Number(process.env.NEXT_PUBLIC_CAROUSEL_DELAY) || 2000,
            }),
          ]}
          setApi={setApi}
          className="w-full"
          opts={{
            align: 'center',
            loop: true,
            direction: dir,
          }}
        >
          <CarouselContent className="w-full gap-3 px-1">
            {slideItems
              ?.filter((item) => item?.hasReviewed)
              .map((slideItem, index) => {
                return (
                  <CarouselItem
                    key={index}
                    className="basis-full sm:basis-[360px] md:basis-[400px  flex flex-col gap-3 sm:gap-4 shrink-0 bg-[#050505] p-4 sm:p-6 rounded-2xl border border-primary pl-3"
                  >
                    {/* image */}
                    <div className=" flex justify-between">
                      <div className="flex gap-2">
                        <ImageFallBack
                          alt={'Tornado 4k tv logo'}
                          width={40}
                          height={40}
                          className="object-contain transform transition-transform duration-300 rounded-2xl size-10"
                          src={'/tornado.svg'}
                        />

                        <p className="text-base sm:text-xl text-[#999999] font-medium break-words">
                          {slideItem.reviewer}
                        </p>
                      </div>

                      <div className="flex items-center gap-[2px] flex-shrink-0">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            size={20}
                            className={
                              index < (slideItem.rate || 0)
                                ? 'fill-[#E4AD35] text-[#E4AD35]'
                                : 'fill-gray-300 text-gray-300'
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* review body */}
                    <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 w-full min-w-0">
                      {/* stars */}

                      <p className="text-[#999999] text-sm sm:text-base line-clamp-4 min-h-[90px] sm:min-h-[114px] break-words">
                        {slideItem.review}
                      </p>
                    </div>
                  </CarouselItem>
                )
              })}
          </CarouselContent>

          {/* Navigation controls */}

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
      </div>
    </section>
  )
}
