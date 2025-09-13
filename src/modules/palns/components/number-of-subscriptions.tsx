import { getTranslations } from 'next-intl/server'
import React from 'react'

export default async function NumberOfSubscriptions({
  numberOfSubscriptions,
}: {
  numberOfSubscriptions: number
}) {
  const t = await getTranslations()
  return (
    <section className="bg-[#151515] flex flex-row sm:flex-col items-center gap-3 sm:gap-5 p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white w-full">
      <p className="font-semibold text-base sm:text-xl text-center">{t('numberOfBought')}</p>
      <p className="font-semibold text-4xl sm:text-6xl">{numberOfSubscriptions}</p>
    </section>
  )
}
