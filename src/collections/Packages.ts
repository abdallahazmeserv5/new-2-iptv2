import { isAdmin } from '@/modules/payload/utils'
import { CollectionConfig } from 'payload'

export const Packages: CollectionConfig = {
  slug: 'packages',
  labels: {
    singular: {
      en: 'Package',
      ar: 'باقة',
    },
    plural: {
      en: 'Packages',
      ar: 'الباقات',
    },
  },
  access: {
    create: isAdmin, // only admin can create
    read: () => true, // everyone can read/query
    update: isAdmin, // only admin can update
    delete: isAdmin, // only admin can delete
  },
  admin: {
    useAsTitle: 'title', // show package title in dashboard
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      localized: true,
      label: {
        en: 'Package Image',
        ar: 'صورة الباقة',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: {
        en: 'Package Title',
        ar: 'اسم الباقة',
      },
    },
  ],
}
