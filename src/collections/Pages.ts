import { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: { en: 'Page', ar: 'صفحة' },
    plural: { en: 'Pages', ar: 'صفحات' },
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publish', 'showInHeader', 'showInNavbar'],
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: { en: 'Title', ar: 'العنوان' },
      localized: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: { en: 'Page Image', ar: 'صورة الصفحة' },
    },
    {
      name: 'content',
      type: 'richText',
      label: { en: 'Page Content', ar: 'محتوى الصفحة' },
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'publish',
          type: 'checkbox',
          label: { en: 'Publish', ar: 'نشر' },
          defaultValue: false,
          admin: { width: '10%' },
        },
        {
          name: 'showInHeader',
          type: 'checkbox',
          label: { en: 'Show in Header', ar: 'عرض في الهيدر' },
          defaultValue: false,
          admin: { width: '10%' },
        },
        {
          name: 'showInFooter',
          type: 'checkbox',
          label: { en: 'Show in Footer', ar: 'عرض في الفوتر' },
          defaultValue: false,
          admin: { width: '10%' },
        },
      ],
    },
  ],
}
