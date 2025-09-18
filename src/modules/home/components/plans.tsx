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
import AddToCartButtons from '@/modules/shared/components/add-to-cart-buttons'
import ImageFallBack from '@/modules/shared/components/image-fall-back'
import SectionHeader from '@/modules/shared/components/section-header'
import { Media, Plan } from '@/payload-types'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { PaginatedDocs } from 'payload'
import { useEffect, useState } from 'react'

interface HeroProps {
  plans: PaginatedDocs<Plan>
}

export default function Plans({ plans }: HeroProps) {
  const lang = useLocale()
  const t = useTranslations('')

  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [count, setCount] = useState(0)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const slideItems = plans.docs

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
    <>
      <section className="container mx-auto px-4 hidden md:block " id="plans">
        <SectionHeader sectionHeader={t('avilablePlans')} />

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
              return (
                <CarouselItem
                  key={index}
                  className="basis-[330px] sm:basis-[410px] shrink-0   bg-[#050505] p-4  rounded-2xl me-5 group  border-2 border-primary text-white flex flex-col gap-4 items-stretch  "
                >
                  <Link
                    className="text-white font-medium text-sm hover:text-primary text-center"
                    href={`/plans/${slideItem.id}`}
                  >
                    {slideItem.title}
                  </Link>
                  <p className="flex gap-1 items-center font-medium text-2xl ">
                    <span className="text-primary">{slideItem.price}</span> {t('ryalPerMonth')}
                  </p>
                  <p className="text-sm line-clamp-3 min-h-10">{slideItem.description}</p>
                  <Separator className="w-[90%] mx-auto bg-primary" />
                  <p className="text-[#4EFC9A] text-sm font-medium">{t('planFeatures')}</p>
                  <ul className="list-image-[url('/home/right-check.webp')] list-inside text-xs sm:text-base space-y-2 flex flex-col gap-4">
                    {slideItem.features?.map((feature) => (
                      <li key={feature.id} className="">
                        {feature.feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto w-fit mx-auto">
                    <AddToCartButtons plan={slideItem} />
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

      <section className="grid grid-cols-2  gap-2 md:hidden" id="plans">
        {slideItems?.map((slideItem, index) => {
          const img = slideItem.image as Media
          return (
            <Link
              href={`/plans/${slideItem.id}`}
              key={index}
              className="basis-[270px] shrink-0 h-full bg-[#262626] p-2 sm:p-8 items-center rounded-2xl me-5 group cursor-pointer flex flex-col gap-2"
            >
              <ImageFallBack
                alt={img?.alt}
                width={180}
                height={185}
                className="object-contain transform transition-transform duration-300 group-hover:scale-110 w-[150px] h-[150px]"
                src={img?.url || ''}
              />

              <p className="text-white font-semibold text-sm group-hover:text-primary">
                {slideItem.title}
              </p>

              <p className="font-bold text-primary">
                {slideItem.price} {t('sar')}
              </p>

              <p className="text-muted hidden">
                {slideItem.duration} {t('monthes')}
              </p>

              <div
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                }}
              >
                <AddToCartButtons plan={slideItem} />
              </div>
            </Link>
          )
        })}
      </section>
    </>
  )
}
