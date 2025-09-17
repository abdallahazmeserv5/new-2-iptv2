import type { CollectionConfig } from 'payload'

export const Cart: CollectionConfig = {
  slug: 'carts',
  labels: {
    singular: { en: 'Cart', ar: 'سلة' },
    plural: { en: 'Carts', ar: 'السلات' },
  },
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: ({ req }) => true,
    create: ({ req }) => true,
    update: ({ req }) => true,
    delete: ({ req }) => true,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true, // one cart per user
      label: { en: 'User', ar: 'المستخدم' },
    },
    {
      name: 'items',
      type: 'array',
      label: { en: 'Items', ar: 'العناصر' },
      fields: [
        {
          name: 'plan',
          type: 'relationship',
          relationTo: 'plans',
          required: true,
          label: { en: 'Plan', ar: 'الخطة' },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          defaultValue: 1,
          min: 0,
          label: { en: 'Quantity', ar: 'الكمية' },
        },
      ],
    },
    {
      name: 'updatedAt',
      type: 'date',
      label: { en: 'Updated At', ar: 'تاريخ التحديث' },
      hooks: {
        beforeChange: [() => new Date()],
      },
    },
  ],
}
