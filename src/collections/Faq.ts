import { isAdmin } from '@/modules/payload/utils'
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
  access: {
    create: isAdmin, // only admin can create
    read: () => true, // everyone can read/query
    update: isAdmin, // only admin can update
    delete: isAdmin, // only admin can delete
  },
  admin: {
    useAsTitle: 'question', // show question as title in dashboard
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
