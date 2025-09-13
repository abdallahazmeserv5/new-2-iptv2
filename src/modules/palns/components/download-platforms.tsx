import ImageFallBack from '@/modules/shared/components/image-fall-back'
import { Media, Plan } from '@/payload-types'
import { getTranslations } from 'next-intl/server'
import React from 'react'

interface Props {
  platforms: Plan['downloadPlatforms']
}
export default async function DownloadPlatforms({ platforms }: Props) {
  const t = await getTranslations('')
  return (
    <section className="flex flex-col gap-3 sm:gap-5 bg-[#151515] p-6 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white w-full">
      <h3 className="text-white font-bold text-base sm:text-lg">{t('downloadPlatForms')}</h3>

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {platforms?.map((platform) => {
          const img = platform.platformImage as Media
          return (
            <li className="bg-[#2A2A2A] rounded-xl flex flex-col items-center gap-2 w-full py-4">
              <ImageFallBack
                alt={platform.title || ''}
                src={img.url || ''}
                width={22}
                height={22}
                className="size-5 sm:size-[22px]"
              />
              <p className="font-medium text-xs sm:text-sm ">{platform.title}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
