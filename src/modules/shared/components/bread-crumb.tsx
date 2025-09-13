import React from 'react'
import ImageFallBack from './image-fall-back'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { House } from 'lucide-react'

interface Props {
  image: string
  title: string
  links: {
    text: string
    url: string
  }[]
}
export default async function BreadCrumb({ image, title, links }: Props) {
  const t = await getTranslations()
  return (
    <section className="container mx-auto px-4">
      <div className="w-full h-[260px] relative">
        <ImageFallBack src={image} alt={title} fill className=" object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          {/* links */}
          <ul className="absolute start-2 top-2 text-white flex items-stretch  gap-2">
            <li className="py-2 px-4 bg-[#1D1B1B] rounded-md">
              <Link href={'/'}>
                <House size={18} />
              </Link>
            </li>
            {links.map((link) => (
              <li key={link.url} className="py-2 px-4 text-sm text-primary bg-[#1D1B1B] rounded-md">
                <Link href={link.url}>{link.text}</Link>
              </li>
            ))}
          </ul>
          {/* main title */}
          <h1 className="font-bold text-xl sm:text-3xl xl:text-6xl text-primary">
            <span className="text-white">{t('subscriptions')}</span> {title}
          </h1>
        </div>
      </div>
    </section>
  )
}
