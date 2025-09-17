import { isAdmin } from '@/modules/payload/utils'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { en: 'Media', ar: 'وسائط' },
    plural: { en: 'Media', ar: 'الوسائط' },
  },
  access: {
    create: isAdmin,
    read: () => true,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      label: { en: 'Alt Text', ar: 'نص بديل' },
    },
  ],
  upload: true,
  admin: { useAsTitle: 'alt' },
}
