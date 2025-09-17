import { sendMessage } from '@/actions/need-bot'
import { isAdmin } from '@/modules/payload/utils'
import type { CollectionConfig, PayloadRequest } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: { en: 'Order', ar: 'الطلب' }, plural: { en: 'Orders', ar: 'الطلبات' } },
  admin: { useAsTitle: 'id' },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      return isAdmin({ req }) ? true : { user: { equals: req.user.id } }
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => true,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'userPhone',
      type: 'text',
      label: { en: 'User Phone', ar: 'هاتف المستخدم' },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'messageToUser',
      type: 'textarea',
      label: { en: 'Message to user (admin)', ar: 'رسالة إلى المستخدم (مشرف)' },
      admin: {
        description:
          'Visible only when order status is "Paid". Enter the message and save to send to the user.',
        condition: (data, siblingData) => siblingData?.status === 'paid',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: { en: 'User', ar: 'المستخدم' },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      label: { en: 'Items', ar: 'العناصر' },
      admin: {
        readOnly: true,
      },
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
          label: { en: 'Quantity', ar: 'الكمية' },
        },
        { name: 'price', type: 'number', required: true, label: { en: 'Price', ar: 'السعر' } },
      ],
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      label: { en: 'Total', ar: 'الإجمالي' },
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'paymentInfo',
      type: 'json',
      label: { en: 'Payment Info', ar: 'معلومات الدفع' },
      admin: { readOnly: true, hidden: true },
    },
    {
      name: 'status',
      type: 'select',
      label: { en: 'Status', ar: 'الحالة' },
      options: [
        { label: { en: 'Pending', ar: 'قيد الانتظار' }, value: 'pending' },
        { label: { en: 'Paid', ar: 'مدفوع' }, value: 'paid' },
        { label: { en: 'Failed', ar: 'فشل' }, value: 'failed' },
        { label: { en: 'Cancelled', ar: 'ألغيت' }, value: 'cancelled' },
        { label: { en: 'Completed', ar: 'مكتمل' }, value: 'completed' },
      ],
      defaultValue: 'pending',
    },
    {
      name: 'createdAt',
      type: 'date',
      label: { en: 'Created At', ar: 'تاريخ الإنشاء' },
      defaultValue: () => new Date(),
      admin: { readOnly: true },
    },
  ],
  hooks: {
    afterRead: [
      async ({ doc, req }) => {
        try {
          const userId: string | undefined = typeof doc.user === 'string' ? doc.user : doc.user?.id
          if (!userId) return doc
          const user = await req.payload.findByID({ collection: 'users', id: userId, depth: 0 })
          const phoneRaw: string | undefined = user?.phone
          const phone = phoneRaw?.startsWith('+') ? phoneRaw.slice(1) : phoneRaw
          return { ...doc, userPhone: phone || '' }
        } catch (e) {
          return doc
        }
      },
    ],
    afterChange: [
      async ({ req, doc, previousDoc }) => {
        try {
          // Only for paid orders
          if (doc.status !== 'paid') return

          // Only when messageToUser has changed (admin typed something new)
          if (!doc.messageToUser || doc.messageToUser === previousDoc?.messageToUser) return

          // Ensure we have user ID
          const userId: string | undefined = typeof doc.user === 'string' ? doc.user : doc.user?.id

          if (!userId) return console.warn(`Order ${doc.id} has no user`)

          const user = await req.payload.findByID({
            collection: 'users',
            id: userId,
            depth: 0,
          })

          const phoneRaw: string | undefined = user?.phone

          if (!phoneRaw) {
            return
          }

          const phone = phoneRaw.startsWith('+') ? phoneRaw.slice(1) : phoneRaw
          const message = doc.messageToUser

          const res = sendMessage({ number: phone, message })
          const res2 = sendMessage({ number: phone, message })

          if (res || res2) {
            // Mark that the message has been sent
            await req.payload.update({
              collection: 'orders',
              id: doc.id,
              data: { updatedAt: new Date().toISOString(), status: 'completed' },
              overrideAccess: true,
              req,
            })
          }
        } catch (err) {}
      },
    ],
    beforeChange: [
      async ({ data, req }) => {
        try {
          const userId: string | undefined =
            typeof data.user === 'string' ? data.user : data.user?.id
          if (!userId) return data
          const user = await req.payload.findByID({ collection: 'users', id: userId, depth: 0 })
          const phoneRaw: string | undefined = user?.phone
          const phone = phoneRaw?.startsWith('+') ? phoneRaw.slice(1) : phoneRaw
          return { ...data, userPhone: phone || '' }
        } catch (e) {
          return data
        }
      },
    ],
  },
}

export default Orders
