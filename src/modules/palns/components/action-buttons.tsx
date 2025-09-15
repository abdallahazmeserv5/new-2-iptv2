import { Button } from '@/components/ui/button'
import ImageFallBack from '@/modules/shared/components/image-fall-back'
import PrimaryButton from '@/modules/shared/components/primary-button'
import { BanknoteArrowUp, ShoppingCart } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import React from 'react'

export default async function ActionButtons({ packageId }: { packageId: string }) {
  const t = await getTranslations()
  return (
    <section className="flex flex-col gap-4 items-stretch bg-[#151515] p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white w-full">
      <Button
        variant="outline"
        className="w-full h-12 sm:h-14 px-4 flex gap-3 items-center justify-center cursor-pointer min-w-0"
      >
        <ShoppingCart />
        {t('addToCart')}
      </Button>

      <Button className="w-full h-12 sm:h-14 px-4 bg-[#333333] text-white flex gap-3 items-center justify-center cursor-pointer hover:bg-[#333333] hover:text-primary min-w-0">
        <BanknoteArrowUp /> {t('buy')}
      </Button>

      <Button className="w-full h-12 sm:h-14 px-4 flex gap-3 items-center justify-center cursor-pointer min-w-0">
        <ImageFallBack
          src="/whatsapp.webp"
          alt="Whats app Logo"
          className="w-5 h-5"
          width={23}
          height={23}
        />
        <span className="block">{t('whatsApp')}</span>
      </Button>
    </section>
  )
}
