import { CollectionConfig } from 'payload'
import { FixedToolbarFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { isAdmin } from '@/modules/payload/utils'

export const Banners: CollectionConfig = {
  slug: 'banners',
  labels: {
    singular: { en: 'Banner', ar: 'إعلان' },
    plural: { en: 'Banners', ar: 'الإعلانات' },
  },
  access: {
    create: isAdmin,
    read: () => true, // normal users can see banners
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
      label: { en: 'Banner Image', ar: 'صورة السلايدر' },
    },
    {
      name: 'title',
      type: 'richText',
      required: true,
      localized: true,
      label: { en: 'Banner Main Text', ar: 'العنوان الرئيسي' },
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [FixedToolbarFeature(), ...defaultFeatures],
      }),
    },
    {
      type: 'row',
      fields: [
        {
          name: 'buttonText',
          type: 'text',
          localized: true,
          required: true,
          label: { en: 'Banner Button Text', ar: 'نص الزرار' },
        },
        {
          name: 'buttonUrl',
          type: 'text',
          localized: true,
          required: true,
          admin: {
            description: {
              en: 'Where to go after clicking the button?',
              ar: 'أين تذهب بعد الضغط علي الزر؟',
            },
          },
          label: { en: 'Banner Button URL', ar: 'رابط الزرار' },
        },
      ],
    },
  ],
}
