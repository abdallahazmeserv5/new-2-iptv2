import { Button } from '@/components/ui/button'
import ImageFallBack from '@/modules/shared/components/image-fall-back'
import PrimaryButton from '@/modules/shared/components/primary-button'
import { BanknoteArrowUp, ShoppingCart } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import React from 'react'

export default async function ActionButtons({ packageId }: { packageId: string }) {
  const t = await getTranslations()
  return (
    <section className="flex  sm:flex-col gap-4 sm:gap-5 items-center bg-[#151515] p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white w-full">
      <Button
        variant="outline"
        className="flex-1 h-12 sm:h-14 sm:max-w-[260px] flex gap-3 sm:gap-5 items-center justify-center cursor-pointer"
      >
        <ShoppingCart />
        {t('addToCart')}
      </Button>

      <Button className="flex-1 h-12 sm:h-14 sm:max-w-[260px] bg-[#333333] text-white flex gap-3 sm:gap-5 items-center justify-center cursor-pointer hover:bg-[#333333] hover:text-primary">
        <BanknoteArrowUp /> {t('buy')}
      </Button>

      <Button className="flex-1 h-12 sm:h-14 sm:max-w-[260px] flex gap-3 sm:gap-5 items-center justify-center cursor-pointer">
        <ImageFallBack
          src="/whatsapp.webp"
          alt="Whats app Logo"
          className="size-5 sm:size-[23px]"
          width={23}
          height={23}
        />
        <span className="hidden sm:block">{t('whatsApp')}</span>
      </Button>
    </section>
  )
}
