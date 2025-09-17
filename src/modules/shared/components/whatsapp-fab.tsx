'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from 'next-intl'

type WhatsAppFabProps = {
  number?: string | null
}

export default function WhatsAppFab(props: WhatsAppFabProps) {
  const { number } = props
  const locale = useLocale()

  if (!number) return null

  const encodedText = encodeURIComponent('Hello! I need help with my order.')
  const href = `https://wa.me/${number.replace(/[^\d+]/g, '')}?text=${encodedText}`

  return (
    <div className="whatsapp-fab">
      <Link href={href} target="_blank" aria-label="Chat on WhatsApp">
        <Image
          src={'/floating-ws.webp'}
          alt={locale === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
          width={56}
          height={56}
          priority
          className="rounded-full shadow-lg transition-transform duration-300 hover:scale-110 hover:rotate-6"
        />
      </Link>
    </div>
  )
}
