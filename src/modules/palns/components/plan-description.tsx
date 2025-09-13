import { getTranslations } from 'next-intl/server'
import React from 'react'

export default async function PlanDescription({ description }: { description: string }) {
  const t = await getTranslations()
  return (
    <section className="flex flex-col gap-3 sm:gap-5 bg-[#151515] p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white w-full">
      <h3 className="font-bold text-base sm:text-lg">{t('subscriptionDescription')}</h3>
      <p className="text-sm sm:text-base leading-relaxed break-words">{description}</p>
    </section>
  )
}
