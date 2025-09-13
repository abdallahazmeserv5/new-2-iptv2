import { Plan } from '@/payload-types'
import { getTranslations } from 'next-intl/server'
import React from 'react'

interface Props {
  features: Plan['features']
}
export default async function PlanFeatures({ features }: Props) {
  const t = await getTranslations()
  return (
    <section className="flex flex-col gap-3 sm:gap-5 list-inside bg-[#151515] p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white w-full">
      <h3 className="text-white font-bold text-base sm:text-lg">{t('features')}</h3>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 items-start list-inside list-image-[url('/home/right-mark.webp')]">
        {features?.map((feature) => (
          <li className="text-xs sm:text-base leading-relaxed break-words">{feature.feature}</li>
        ))}
      </ul>
    </section>
  )
}
