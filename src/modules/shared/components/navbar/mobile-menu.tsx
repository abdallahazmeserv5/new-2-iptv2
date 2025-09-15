'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Star, Phone, Newspaper } from 'lucide-react'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'
import Cart from './cart'

export default function MobileMenu({ user }: { user: any }) {
  const pathname = usePathname()
  const t = useTranslations()

  const tabs = [
    { href: '/', label: t('homePage'), icon: Home },
    { href: '/#plans', label: t('subscriptions'), icon: BookOpen },
    {
      href: `https://wa.me/${process.env.NEXT_PUBLIC_PHONE}`,
      label: t('contact-us'),
      icon: Phone,
      target: true,
    },
    // { href: '/#blogs', label: t('blogs'), icon: Newspaper },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background shadow-lg lg:hidden">
      <ul className="flex justify-around items-center h-16">
        {tabs.map(({ href, label, icon: Icon, target }) => {
          const isActive = pathname === href
          return (
            <li key={href}>
              <Link
                target={target ? '_blank' : undefined}
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

        <li
          className={clsx(
            'flex flex-col items-center text-xs font-medium transition-colors',
            pathname === '/cart' ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          <Cart />
          {t('cart')}
        </li>
      </ul>
    </nav>
  )
}
