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
    {
      name: 'lastReminderAt',
      type: 'date',
      label: { en: 'Last Reminder At', ar: 'تاريخ آخر تذكير' },
      admin: { description: 'Timestamp of last abandoned cart reminder message' },
    },
    {
      name: 'isAbandoned',
      type: 'checkbox',
      label: { en: 'Abandoned Cart', ar: 'سلة مهجورة' },
      admin: {
        description: 'Shows when cart has not been updated for more than 1 hour',
        condition: (data, siblingData, { user }) => {
          // Only show to admins
          if (!user || user.role !== 'admin') {
            return false
          }

          // Check if cart hasn't been updated for more than 1 hour
          if (siblingData?.updatedAt) {
            const updatedAt = new Date(siblingData.updatedAt)
            const now = new Date()
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

            return updatedAt < oneHourAgo
          }

          return false
        },
      },
      defaultValue: false,
    },
  ],
}
