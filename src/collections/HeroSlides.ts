import { CollectionConfig } from 'payload'

export const HeroSlides: CollectionConfig = {
  slug: 'hero-slides',
  labels: {
    singular: {
      en: 'Hero Slide',
      ar: 'سلايد في الصفحة الرئيسية',
    },
    plural: {
      en: 'Hero Slides',
      ar: 'السلايد في الصفحة الرئيسية',
    },
  },
  fields: [
    {
      name: 'mainImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: {
        en: 'Main Image',
        ar: 'الصورة الرئيسية',
      },
    },
    {
      name: 'secondaryImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: {
        en: 'Secondary Image',
        ar: 'الصورة الثانوية',
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: {
        en: 'Main Text',
        ar: 'العنوان الرئيسي',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'buttonText',
          type: 'text',
          required: true,
          localized: true,
          label: {
            en: 'Button Text',
            ar: 'نص الزرار',
          },
        },
        {
          name: 'buttonUrl',
          type: 'text',
          required: true,
          localized: true,
          admin: {
            description: {
              en: 'Where to go after clicking the button?',
              ar: 'أين تذهب بعد الضغط علي الزر؟',
            },
          },
          label: {
            en: 'Button URL',
            ar: 'رابط الزرار',
          },
        },
      ],
    },
  ],
}
