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
    update: ({ req }) => {
      if (!req.user) return false

      if (isAdmin({ req })) {
        return true // admins can update any order
      }

      // only the creator (owner) can update their own order
      return {
        user: { equals: req.user.id },
      }
    },
    delete: ({ req }) => {
      if (!req.user) return false

      if (isAdmin({ req })) {
        return true // admins can update any order
      }

      // only the creator (owner) can update their own order
      return {
        user: { equals: req.user.id },
      }
    },
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

          const userPhone = phoneRaw.startsWith('+') ? phoneRaw.slice(1) : phoneRaw
          const message = doc.messageToUser

          await Promise.all([
            sendMessage({ number: userPhone, message }),
            sendMessage({ number: userPhone, message }),
            req.payload.update({
              collection: 'orders',
              id: doc.id,
              data: { updatedAt: new Date().toISOString(), status: 'completed' },
              overrideAccess: true,
              req,
            }),
          ])
        } catch (err) {}
      },

      async ({ req, doc, previousDoc }) => {
        try {
          if (doc.status !== 'paid' || previousDoc?.status === 'completed' || doc?.messageToUser)
            return

          const userId: string | undefined = typeof doc.user === 'string' ? doc.user : doc.user?.id

          if (!userId) return console.warn(`Order ${doc.id} has no user`)

          const [user, { adminWhatsApp = '' }, populatedOrder] = await Promise.all([
            req.payload.findByID({
              collection: 'users',
              id: userId,
              depth: 0,
            }),
            req.payload.findGlobal({ slug: 'settings' }),
            req.payload.findByID({
              collection: 'orders',
              id: doc.id,
              depth: 1,
            }),
          ])

          const phoneRaw: string | undefined = user?.phone
          if (!phoneRaw) return

          // Build order summary
          const itemsSummary = populatedOrder.items
            .map((item) => {
              const planTitle =
                typeof item.plan === 'object' && 'title' in item.plan
                  ? item.plan.title
                  : 'خطة غير معروفة'
              return `${planTitle} × ${item.quantity}`
            })
            .join(', ')

          const message =
            `📦 طلب شراء جديد\n` +
            `📞 رقم الهاتف: ${user.phone}\n` +
            `🛒 معلومات الطلب: ${itemsSummary}\n` +
            `💰 الإجمالي: ${doc.total}\n` +
            `🆔 رقم الطلب: ${doc.id}`

          await Promise.all([
            sendMessage({ number: adminWhatsApp, message }),
            sendMessage({ number: adminWhatsApp, message }),
          ])
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
