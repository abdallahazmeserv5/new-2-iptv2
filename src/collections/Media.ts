import { isAdmin } from '@/modules/payload/utils'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
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
      label: {
        en: 'Alt Text',
        ar: 'النص البديل',
      },
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
  },
  admin: {
    useAsTitle: 'alt',
  },
}
