import ImageFallBack from '@/modules/shared/components/image-fall-back'
import { getTranslations } from 'next-intl/server'
import React from 'react'

interface Props {
  img: string
  price: number
  priceBeforeDiscount: number
  title: string
}

export default async function PlanPrice({ img, price, priceBeforeDiscount, title }: Props) {
  return (
    <div className="bg-[#151515] flex flex-row items-start sm:items-center gap-4 sm:gap-6 p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626]">
      <ImageFallBack
        width={103}
        height={109}
        className="w-20 h-20 sm:w-[103px] sm:h-[109px]"
        src={img}
        alt={title}
      />
      {/* details */}
      <div className="space-y-3 sm:space-y-6">
        <h2 className="text-white font-bold text-xl sm:text-2xl break-words">{title}</h2>
        <div className="flex gap-2 sm:gap-3 items-center">
          <p className="font-bold text-2xl sm:text-3xl text-primary">{price}</p>
          <ImageFallBack
            src="/sar.webp"
            alt="SAR"
            width={24}
            height={26}
            className="w-[20px] h-[22px] sm:w-[24px] sm:h-[26px] object-contain"
          />
          {!!priceBeforeDiscount && (
            <p className="text-muted text-lg sm:text-2xl line-through">{priceBeforeDiscount}</p>
          )}
        </div>
      </div>
    </div>
  )
}
