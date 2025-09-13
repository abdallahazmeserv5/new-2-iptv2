import ImageFallBack from '@/modules/shared/components/image-fall-back'
import SectionHeader from '@/modules/shared/components/section-header'
import { Faq } from '@/payload-types'
import { getLocale, getTranslations } from 'next-intl/server'
import { PaginatedDocs } from 'payload'
import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface Props {
  faqs: PaginatedDocs<Faq>
}

export default async function FaqSection({ faqs }: Props) {
  const t = await getTranslations('')
  const lang = await getLocale()
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  return (
    <section className="container mx-auto px-4">
      <SectionHeader className="text-start" sectionHeader={t('commenQuestions')} />
      {/* questions */}
      <div className="flex gap-30 justify-between items-center ">
        <div className="flex-2">
          <Accordion type="single" collapsible className="w-full text-white" defaultValue="item-0">
            {faqs.docs.map((oneFaq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger
                  className={`
                  text-lg font-medium px-4 py-3  
                  ${index % 2 === 0 ? 'bg-black' : 'bg-[#292525]'}
                  data-[state=open]:bg-primary
                `}
                >
                  {oneFaq['question']}
                </AccordionTrigger>

                <AccordionContent className="flex flex-col gap-4 text-balance px-4 py-3">
                  <p>{oneFaq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        {/* decorations */}
        <div className="flex-1 hidden sm:block">
          <ImageFallBack
            src="/home/qa.webp"
            alt="Decoration for question"
            width={414}
            height={414}
            className="size-[414px]"
          />
        </div>
      </div>
    </section>
  )
}
