import type { CollectionConfig } from 'payload'
import { sendMessage } from '@/actions/need-bot'
import { isAdmin } from '@/modules/payload/utils'

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
    read: ({ req }) => {
      if (!req.user) return false

      if (isAdmin({ req })) {
        return true // full access
      }

      // normal users can only see their own
      return {
        user: { equals: req.user.id },
      }
    },
    create: ({ req }) => {
      return !!req.user
    },
    update: () => true,
    delete: ({ req }) => {
      if (!req.user) return false

      if (isAdmin({ req })) {
        return true
      }

      return false
    },
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update') return

        const currentNotes = doc.abandonedNotes
        const previousNotes = previousDoc?.abandonedNotes

        if (currentNotes && currentNotes !== previousNotes && currentNotes.trim() !== '') {
          try {
            const user = await req.payload.findByID({
              collection: 'users',
              id: doc.user,
            })

            if (user?.phone) {
              await sendMessage({
                number: user.phone,
                message: `مرحباً! 👋\n\nلديك رسالة من فريق الدعم:\n\n${currentNotes}\n\nشكراً لاختيارك خدماتنا! 🛒✨`,
              })
            }
          } catch (error) {
            console.error('Error sending message for abandoned cart notes:', error)
          }
        }
      },
    ],
  },
  fields: [
    {
      name: 'abandonedNotes',
      type: 'text',
      label: { en: 'Abandoned Cart Notes', ar: 'ملاحظات السلة المهجورة' },
      admin: {
        description: {
          ar: 'عميلك ساب منتجاته في السلة 👀، ذكّره برسالة لطيفة وخليه يكمل الشراء 🛒✨',
          en: 'Your customer left items in their cart 👀. Send them a friendly reminder to complete the purchase 🛒✨',
        },
        condition: (data, siblingData, { user }) => {
          if (!user || user.role !== 'admin') return false

          if (siblingData?.updatedAt) {
            const updatedAt = new Date(siblingData.updatedAt)
            const now = new Date()
            const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

            return updatedAt < oneHourAgo
          }

          return false
        },
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
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
  ],
}
