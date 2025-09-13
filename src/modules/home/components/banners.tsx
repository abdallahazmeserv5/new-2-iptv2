'use client'
import Autoplay from 'embla-carousel-autoplay'
import { RichText } from '@payloadcms/richtext-lexical/react'

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import ImageFallBack from '@/modules/shared/components/image-fall-back'
import { Banner, HeroSlide, Media } from '@/payload-types'
import { useLocale } from 'next-intl'
import { PaginatedDocs } from 'payload'
import { useEffect, useState } from 'react'
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'
import PrimaryButton from '@/modules/shared/components/primary-button'
import Link from 'next/link'

interface Props {
  banners: PaginatedDocs<Banner>
}
export default function Banners({ banners }: Props) {
  const [api, setApi] = useState<CarouselApi>()
  const lang = useLocale()
  const [current, setCurrent] = useState(0)

  const [count, setCount] = useState(0)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  const slideItems = banners.docs

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
    <section className="container mx-auto px-4 my-7">
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
        <CarouselContent className="w-full h-64 lg:h-80  ">
          {slideItems?.map((slideItem, index) => {
            const mainImg = slideItem.image as Media
            return (
              <CarouselItem key={index} className="w-full h-64 lg:h-80  ">
                <div className="relative w-full h-full">
                  <ImageFallBack
                    alt={mainImg?.alt || 'Website preview'}
                    src={mainImg?.url || ''}
                    fill
                    className="object-cover"
                  />

                  {/* overlay */}
                  <div className="absolute inset-0 bg-black/50" />

                  {/* content */}
                  <div className="absolute inset-0 gap-16 flex flex-col items-start justify-center text-white p-6 z-10">
                    {slideItem.title && (
                      <RichText
                        className="text-3xl md:text-5xl max-w-[772px]"
                        data={slideItem.title as SerializedEditorState<SerializedLexicalNode>}
                      />
                    )}
                    <PrimaryButton asChild>
                      <Link href={slideItem.buttonUrl}>{slideItem.buttonText}</Link>
                    </PrimaryButton>
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
