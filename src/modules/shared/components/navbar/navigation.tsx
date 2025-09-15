'use client'

import { cn } from '@/lib/utils'
import { Page } from '@/payload-types'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PaginatedDocs } from 'payload'

export default function Navigation({ pages }: { pages: PaginatedDocs<Page> }) {
  const t = useTranslations()
  const pathName = usePathname()
  const isActive = (url: string) => pathName === url

  const pagesOnNavbar = pages.docs
    .filter((page) => page.publish && page.showInHeader)
    .map((page) => {
      return { href: `/page/${page.id}`, label: page.title }
    })

  const navItems: {
    href: string
    label: string
    highlight?: boolean
  }[] = [
    { href: '/', label: t('homePage'), highlight: true },
    { href: '/#plans', label: t('subscriptions') },
    { href: '/#features', label: t('features') },
    ...pagesOnNavbar,

    // { href: '/#contact-us', label: t('contact-us') },
    // { href: '/#blogs', label: t('blogs') },
  ]

  return (
    <nav>
      <ul className="flex flex-col lg:flex-row gap-7 lg:items-center">
        {navItems.map(({ href, label, highlight }) => (
          <li key={href} className="flex items-center gap-2">
            <Link
              href={href}
              className={cn(
                'text-lg hover:text-primary',
                isActive(href) ? 'text-primary font-bold' : 'text-muted',
              )}
            >
              {label}
            </Link>

            {/* Optional vertical highlight bar (only for homepage in your example) */}
            {highlight && isActive(href) && (
              <span className="w-[2px] hidden lg:inline-block h-8 bg-primary" />
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
