'use client'

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const t = useTranslations()
  const pathName = usePathname()
  const isActive = (url: string) => pathName === url

  const navItems = [
    { href: '/', label: t('homePage'), highlight: true },
    { href: '/#subscriptions', label: t('subscriptions') },
    { href: '/#features', label: t('features') },
    { href: '/#contact-us', label: t('contact-us') },
    { href: '/#blogs', label: t('blogs') },
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
