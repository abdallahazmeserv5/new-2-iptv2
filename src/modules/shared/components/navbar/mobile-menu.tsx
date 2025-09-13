'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Star, Phone, Newspaper } from 'lucide-react'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'

export default function MobileMenu() {
  const pathname = usePathname()
  const t = useTranslations()

  const tabs = [
    { href: '/', label: t('homePage'), icon: Home },
    { href: '/#subscriptions', label: t('subscriptions'), icon: BookOpen },
    { href: '/#features', label: t('features'), icon: Star },
    { href: '/#contact-us', label: t('contact-us'), icon: Phone },
    { href: '/#blogs', label: t('blogs'), icon: Newspaper },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-lg lg:hidden">
      <ul className="flex justify-around items-center h-16">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  'flex flex-col items-center text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
