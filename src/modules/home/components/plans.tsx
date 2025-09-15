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
import { Media, Plan } from '@/payload-types'
import { ArrowUpRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { PaginatedDocs } from 'payload'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import ImageFallBack from '@/modules/shared/components/image-fall-back'
import { useRouter } from 'next/navigation'
import { baseFetch } from '@/actions/fetch'
import PrimaryButton from '@/modules/shared/components/primary-button'

interface HeroProps {
  plans: PaginatedDocs<Plan>
}

export default function Plans({ plans }: HeroProps) {
  const lang = useLocale()
  const queryClient = useQueryClient()
  const router = useRouter()

  // Check if user is authenticated
  const checkUserAuth = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include',
      })

      if (res.ok) {
        const userData = await res.json()
        return userData && userData.user // Payload v3 returns user data in this format
      }
      return false
    } catch (error) {
      console.error('Auth check failed:', error)
      return false
    }
  }

  // Add to cart for authenticated users
  const addToCartAuth = async (planId: string) => {
    try {
      const data = await baseFetch({
        url: '/api/cart/add',
        method: 'POST',
        body: { planId, quantity: 1 },
      })

      if (!data || data?.error) {
        toast.error(data?.error || 'Could not add to cart')
        return
      }

      // ✅ Refetch cart so UI updates
      queryClient.refetchQueries({ queryKey: ['/cart', lang] })

      toast.success(
        <div>
          <Link href="/cart" className="text-white underline">
            {t('goToCart')}
          </Link>
        </div>,
        {
          duration: Infinity, // keeps toast visible
        },
      )
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    }
  }

  const addToLocalStorage = (planId: string) => {
    try {
      // Find the plan data to store complete information
      const selectedPlan = slideItems.find((plan) => plan.id === planId)
      if (!selectedPlan) {
        toast.error('Plan not found')
        return
      }

      const existingCart = localStorage.getItem('guestCart')
      let cartItems = existingCart ? JSON.parse(existingCart) : []

      // Check if item already exists
      const existingItemIndex = cartItems.findIndex((item: any) => item.planId === planId)

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        cartItems[existingItemIndex].quantity += 1
      } else {
        // Add new item with complete plan data (matching the actual structure)
        cartItems.push({
          planId,
          quantity: 1,
          addedAt: new Date().toISOString(),
          plan: {
            id: selectedPlan.id,
            title: selectedPlan.title,
            price: selectedPlan.price,
            priceBeforeDiscount: selectedPlan.priceBeforeDiscount,
            description: selectedPlan.description,
            numberOfSubscriptions: selectedPlan.numberOfSubscriptions,
            image: selectedPlan.image
              ? {
                  //@ts-ignore
                  url: selectedPlan.image?.url,
                  //@ts-ignore
                  alt: selectedPlan.image?.alt,
                }
              : null,
            features: selectedPlan.features || [],
            downloadPlatforms: selectedPlan.downloadPlatforms || [],
            reviews: selectedPlan.reviews || [],
            createdAt: selectedPlan.createdAt,
            updatedAt: selectedPlan.updatedAt,
          },
        })
      }

      localStorage.setItem('guestCart', JSON.stringify(cartItems))

      // Dispatch custom event for same-tab cart updates
      window.dispatchEvent(new CustomEvent('guestCartUpdated'))

      toast.success('Added to cart (guest mode)')
    } catch (err) {
      toast.error('Could not add to cart')
    }
  }

  // Main add to cart function
  const addToCart = async (planId: string) => {
    const isAuthenticated = await checkUserAuth()

    if (isAuthenticated) {
      await addToCartAuth(planId)
    } else {
      addToLocalStorage(planId)
    }
    router.push('/cart')
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
                  className="basis-[330px] sm:basis-[410px] shrink-0   bg-[#050505] p-8  rounded-2xl me-5 group  border-2 border-primary text-white h-auto flex flex-col gap-4 items-stretch  "
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

                  <PrimaryButton
                    className="flex gap-2 items-center justify-center"
                    onClick={() => addToCart(slideItem.id)}
                  >
                    <ArrowUpRight className="text-[#9EFF3E] " />
                    {t('subscripeInPlan')}
                  </PrimaryButton>
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
            <div
              key={index}
              className="basis-[270px] shrink-0 h-full bg-[#262626] p-2 sm:p-8 items-center rounded-2xl me-5 group cursor-pointer flex flex-col gap-2 "
            >
              <ImageFallBack
                alt={img?.alt}
                width={180}
                height={185}
                className="object-contain transform transition-transform duration-300 group-hover:scale-110 w-[150px] h-[150px]"
                src={img?.url || ''}
              />
              <p className="text-white font-semibold text-lg group-hover:text-primary">
                {slideItem.title}
              </p>

              <p className="font-bold text-primary">
                {slideItem.price} {t('sar')}
              </p>

              <p className="text-muted">
                {slideItem.duration} {t('monthes')}
              </p>

              <PrimaryButton
                className="flex gap-2 items-center justify-center"
                onClick={() => addToCart(slideItem.id)}
              >
                <ArrowUpRight className="text-[#9EFF3E] hidden sm:block " />
                {t('subscripeInPlan')}
              </PrimaryButton>
            </div>
          )
        })}
      </section>
    </>
  )
}
