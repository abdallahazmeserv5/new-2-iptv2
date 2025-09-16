import { isAdmin } from '@/modules/payload/utils'
import { CollectionConfig } from 'payload'

export const Features: CollectionConfig = {
  slug: 'features',
  labels: {
    singular: {
      en: 'Feature',
      ar: 'ميزة',
    },
    plural: {
      en: 'Features',
      ar: 'الميزات',
    },
  },
  access: {
    create: isAdmin, // only admin can create
    read: () => true, // everyone can read/query
    update: isAdmin, // only admin can update
    delete: isAdmin, // only admin can delete
  },
  admin: {
    useAsTitle: 'title', // show feature title in dashboard
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      localized: true,
      label: {
        en: 'Feature Image',
        ar: 'صورة الميزة',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: {
        en: 'Feature Title',
        ar: 'عنوان الميزة',
      },
    },
  ],
}
