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
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
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
