import { Separator } from '@/components/ui/separator'
import { Media, Page, Setting } from '@/payload-types'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import React from 'react'
import ImageFallBack from './image-fall-back'
import { PaginatedDocs } from 'payload'
import PixelScript from '@/scripts/pixel-script'

interface Props {
  settings: Setting
  pages: PaginatedDocs<Page>
}

export default async function Footer({ settings, pages }: Props) {
  const t = await getTranslations()
  const socialMedia = settings.socialMedia || []

  const pagesFooter = pages.docs
    .filter((page) => page.publish && page.showInFooter)
    .map((page) => {
      return { link: `/page/${page.id}`, label: page.title }
    })

  const mainNav = [
    {
      label: t('packages'),
      link: '/#packages',
    },
    {
      label: t('plans'),
      link: '/#plans',
    },
    {
      label: t('offers'),
      link: '/#offers',
    },
    {
      label: t('faq'),
      link: '/#faq',
    },
  ]

  return (
    <footer className="bg-black mb-16 lg:mb-0 mt-10">
      <div className=" container mx-auto px-4 pt-10">
        {/* first part */}
        <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-3 gap-4 my-5">
          {/* first col */}
          <div className="">
            <h3 className="text-primary font-semibold text-lg">{t('homePage')}</h3>
            <ul className="flex flex-col gap-[14px] mt-8">
              {mainNav.map((item, index) => (
                <li key={`${item.link}-${index}`} className="text-[#999999] hover:text-white">
                  <Link href={item.link}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* second col */}
          <div className="">
            <h3 className="text-primary font-semibold text-lg">{t('addetionalPages')}</h3>
            <ul className="flex flex-col gap-[14px] mt-8">
              {pagesFooter.map((item) => (
                <li className="text-[#999999] hover:text-white " key={item.label}>
                  <Link href={item.link}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* third col */}
          <div className="col-span-2 lg:col-span-1 text-center">
            <h3 className="text-primary font-semibold text-lg">{t('socialMedia')}</h3>
            <ul className="flex justify-center gap-[14px] mt-8">
              {socialMedia.map((item) => {
                const image = item.socialMediaImage as Media
                return (
                  <li key={item.id} className="text-[#999999] hover:text-white">
                    <Link
                      href={item.socialMediaLink || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ImageFallBack
                        width={6}
                        height={6}
                        src={image.url || '#'}
                        alt={image.alt || 'social icon'}
                        className="w-6 h-6 object-contain"
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
        <Separator className="bg-[#262626] w-full" />
        {/* last part */}
        <div className="py-10  flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex gap-5">
            <Link
              href={'/terms-condtions'}
              className="text-[#999999] hover:text-white transition-all transform duration-300"
            >
              {t('termsCondtions')}
            </Link>
            <Link
              href={'/privacy'}
              className="text-[#999999] hover:text-white transition-all transform duration-300"
            >
              {t('privacy')}
            </Link>
          </div>
          <Link
            href={'https://tornado-tv4k.com/'}
            target="_blank"
            className="text-[#999999] hover:text-white transition-all transform duration-300 inline-block"
          >
            {t('madeWithLove')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
