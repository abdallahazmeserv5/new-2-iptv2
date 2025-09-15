import { isAdmin } from '@/modules/payload/utils'
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: isAdmin, // only admin can upload media
    read: () => true, // everyone can read/query media
    update: isAdmin, // only admin can update
    delete: isAdmin, // only admin can delete
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true, // make alt text localized
      label: {
        en: 'Alt Text',
        ar: 'النص البديل',
      },
    },
  ],
  upload: {
    staticDir: 'public/media',
    mimeTypes: ['image/*'],
  },
  admin: {
    useAsTitle: 'alt',
  },
}
