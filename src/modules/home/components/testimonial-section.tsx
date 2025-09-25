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
import { Plan } from '@/payload-types'
import { Star } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { PaginatedDocs } from 'payload'
import { useEffect, useMemo, useState } from 'react'

interface Props {
  plans: PaginatedDocs<Plan>
}

type ReviewSlide = {
  reviewer?: string
  reviewerJob?: string
  reviewerCountry?: string
  review?: string
  rate?: number
  hasReviewed?: boolean
  // extra meta from the plan
  planTitle?: string
  planId?: string
  planImage?: string
  // optional avatar if your review stores one
  avatar?: string
}

export default function TestimonialSection({ plans }: Props) {
  const t = useTranslations()
  const [api, setApi] = useState<CarouselApi>()
  const lang = useLocale()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)

  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  // Build slides: take up to N reviews per plan and flatten
  const PER_PLAN_REVIEWS = 3 // change to 2 if you want exactly 2
  const slideItems: ReviewSlide[] = useMemo(() => {
    if (!plans?.docs) return []
    return plans.docs.flatMap((plan) => {
      const reviews = (plan as any).reviews || []
      return reviews.slice(0, PER_PLAN_REVIEWS).map((r: any) => ({
        reviewer: r.reviewer,
        reviewerJob: r.reviewerJob,
        reviewerCountry: r.reviewerCountry,
        review: r.review,
        rate: r.rate,
        hasReviewed: r.hasReviewed,
        avatar: r.avatarUrl || r.avatar || undefined, // adjust if your schema uses a different field
        planTitle: (plan as any).title,
        planId: (plan as any).id || (plan as any)._id,
        planImage: (plan as any).image?.url || (plan as any).image?.filename || undefined,
      }))
    })
  }, [plans])

  // Embla hooks
  useEffect(() => {
    if (!api) return

    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)

    const onSelect = () => setCurrent(api.selectedScrollSnap() + 1)
    api.on('select', onSelect)
    // cleanup
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  // fallback when no reviews found
  if (!slideItems || slideItems.length === 0) {
    return (
      <section className="flex flex-col gap-3 sm:gap-5 bg-[#151515] p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">{t('testimonials')}</h3>
        </div>
        <div className="text-[#999999]">لا توجد تقييمات متاحة الآن.</div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-3 sm:gap-5 bg-[#151515] p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white w-full overflow-hidden mt-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{t('testimonials')}</h3>
      </div>

      <div className="relative pb-16">
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
            {slideItems.map((slideItem, index) => {
              const avatarSrc = slideItem.avatar || slideItem.planImage || '/tornado.svg'
              return (
                <CarouselItem
                  key={`${slideItem.planId ?? 'p'}-${index}`}
                  className="basis-full sm:basis-[360px] md:basis-[400px] flex flex-col gap-3 sm:gap-4 shrink-0 bg-[#050505] p-4 sm:p-6 rounded-2xl border border-primary"
                >
                  {/* Header (image + name + stars) */}
                  <div className="flex justify-between">
                    <div className="flex gap-2 min-w-0">
                      <ImageFallBack
                        alt={slideItem.reviewer || slideItem.planTitle || 'avatar'}
                        width={40}
                        height={40}
                        className="object-contain transform transition-transform duration-300 rounded-2xl size-10"
                        src={avatarSrc}
                      />
                      <div className="flex flex-col min-w-0">
                        <p className="text-base sm:text-xl text-[#999999] font-medium break-words truncate">
                          {slideItem.reviewer || slideItem.planTitle}
                        </p>
                        {slideItem.reviewerJob && (
                          <p className="text-xs text-[#777777] truncate">{slideItem.reviewerJob}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-[2px] flex-shrink-0">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={20}
                          className={
                            idx < (slideItem.rate || 0)
                              ? 'fill-[#E4AD35] text-[#E4AD35]'
                              : 'fill-gray-300 text-gray-300'
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 w-full min-w-0">
                    <p className="text-[#999999] text-sm sm:text-base line-clamp-4 min-h-[90px] sm:min-h-[114px] break-words">
                      {slideItem.review}
                    </p>
                    {/* optional: show plan title */}
                    {slideItem.planTitle && (
                      <p className="text-xs text-[#777777]">الخطة: {slideItem.planTitle}</p>
                    )}
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>

          {/* Navigation controls */}
          <div className="container px-4 mx-auto relative">
            <div className="absolute -bottom-10">
              <CarouselPrevious className=" start-12" />
              <CarouselNext className="start-0" />
            </div>
            <div className="absolute -bottom-10 end-0 flex items-center gap-2">
              {Array.from({ length: count }).map((_, idx: number) => {
                const isActive = current - 1 === idx
                return (
                  <button
                    key={idx}
                    onClick={() => api?.scrollTo(idx)}
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
