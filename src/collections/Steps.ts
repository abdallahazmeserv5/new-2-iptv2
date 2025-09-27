import { isAdmin } from '@/modules/payload/utils'
import { CollectionConfig } from 'payload'

export const Steps: CollectionConfig = {
  slug: 'steps',
  labels: {
    singular: {
      en: 'Step',
      ar: 'خطوة الإشتراك',
    },
    plural: {
      en: 'Steps of subscriptions',
      ar: 'خطوات الإشتراك',
    },
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      localized: true,
      label: {
        en: 'Step Image',
        ar: 'صورة خطوة الإشتراك',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: {
        en: 'Step Title',
        ar: 'عنوان الخطوة',
      },
    },
  ],
}
