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
import SectionHeader from '@/modules/shared/components/section-header'
import { Plan } from '@/payload-types'
import { ArrowUpRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { PaginatedDocs } from 'payload'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

interface HeroProps {
  plans: PaginatedDocs<Plan>
}

export default function Plans({ plans }: HeroProps) {
  const lang = useLocale()
  const queryClient = useQueryClient()
  async function addToCart(planId: string) {
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ planId, quantity: 1 }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data?.error || 'Could not add to cart')
        return
      }
      queryClient.refetchQueries({
        queryKey: ['cart', lang],
      })

      toast.success('Added to cart')
      // optionally update UI / cart count here, or refetch cart
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    }
  }

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
    <section className="container mx-auto px-4">
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
                className="basis-[330px] sm:basis-[410px] shrink-0  bg-[#050505] p-8  rounded-2xl me-5 group  border-2 border-primary text-white h-auto flex flex-col gap-4 items-stretch"
              >
                <Link
                  className="text-white font-medium text-2xl hover:text-primary"
                  href={`/plans/${slideItem.id}`}
                >
                  {slideItem.title}
                </Link>
                <p className="flex gap-1 items-center font-medium text-2xl ">
                  <span className="text-primary">{slideItem.price}</span> {t('ryalPerMonth')}
                </p>
                <p className="text-sm">{slideItem.description}</p>
                <Separator className="w-[90%] mx-auto bg-primary" />
                <p className="text-[#4EFC9A] text-sm font-medium">{t('planFeatures')}</p>
                <ul className="list-image-[url('/home/right-check.webp')] list-inside text-xs sm:text-base space-y-2 flex flex-col gap-4">
                  {slideItem.features?.map((feature) => (
                    <li key={feature.id} className="">
                      {feature.feature}
                    </li>
                  ))}
                </ul>

                <button
                  className="px-12 py-2 w-fit cursor-pointer text-white border border-[#0DB981] border-t-transparent rounded-md flex items-center gap-1 sm:gap-5 hover:bg-[#0DB981] mt-auto"
                  onClick={() => addToCart(slideItem.id)}
                >
                  <ArrowUpRight className="text-[#9EFF3E] " />
                  {t('subscripeInPlan')}
                </button>
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
