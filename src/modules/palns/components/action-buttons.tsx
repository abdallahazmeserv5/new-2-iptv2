import { configuredPayload } from '@/actions'
import { Button } from '@/components/ui/button'
import AddToCartButtons from '@/modules/shared/components/add-to-cart-buttons'
import ImageFallBack from '@/modules/shared/components/image-fall-back'
import { Plan } from '@/payload-types'
import { QueryClient } from '@tanstack/react-query'
import { ShoppingCart } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function ActionButtons({ plan }: { plan: Plan }) {
  const queryClient = new QueryClient()
  const lang = await getLocale()
  const payload = await configuredPayload()

  const settings = await queryClient.fetchQuery({
    queryKey: ['/settings', lang],
    queryFn: async () =>
      await payload.findGlobal({
        slug: 'settings',
      }),
    staleTime: Infinity,
  })

  const t = await getTranslations()
  return (
    <section className="flex flex-col gap-4 items-stretch bg-[#151515] p-3 sm:p-8 lg:p-10 rounded-2xl border border-[#262626] text-white w-full">
      <AddToCartButtons plan={plan} />

      <Button
        className="w-full h-12 sm:h-14 px-4 flex gap-3 items-center justify-center cursor-pointer min-w-0"
        asChild
      >
        <Link
          href={`https://wa.me/${settings?.whatsappNumber?.replace(/^\+/, '') ?? '#'}?text=${plan?.title}`}
        >
          <ImageFallBack
            src="/whatsapp.webp"
            alt="Whats app Logo"
            className="w-5 h-5"
            width={23}
            height={23}
          />
          <span className="block">{t('whatsApp')}</span>
        </Link>
      </Button>
    </section>
  )
}
