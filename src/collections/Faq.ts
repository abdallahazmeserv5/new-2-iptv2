import { CollectionConfig } from 'payload'

export const Faq: CollectionConfig = {
  slug: 'faq',
  labels: {
    singular: {
      en: 'FAQ Item',
      ar: 'عنصر سؤال شائع',
    },
    plural: {
      en: 'FAQ',
      ar: 'الأسئلة الأكثر شيوعًا',
    },
  },
  fields: [
    {
      required: true,
      name: 'question',
      type: 'text',
      label: {
        en: 'Question',
        ar: 'السؤال',
      },
      localized: true,
    },
    {
      required: true,
      name: 'answer',
      type: 'text',
      label: {
        en: 'Answer',
        ar: 'الإجابة',
      },
      localized: true,
    },
  ],
}
