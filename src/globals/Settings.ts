import { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: {
    en: 'Settings',
    ar: 'الإعدادات',
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },

    {
      name: 'socialMedia',
      type: 'array',
      fields: [
        {
          name: 'socialMediaName',
          type: 'text',
          localized: true,
          label: {
            ar: 'اسم المنصة',
            en: 'Social Platform name',
          },
        },
        {
          name: 'socialMediaLink',
          type: 'text',
          label: {
            ar: 'لينك المنصة',
            en: 'Social media link',
          },
        },
        {
          name: 'socialMediaImage',
          type: 'upload',
          relationTo: 'media',
          label: {
            ar: 'شعار المنصة',
            en: 'Social media logo',
          },
        },
      ],
    },
  ],
}
