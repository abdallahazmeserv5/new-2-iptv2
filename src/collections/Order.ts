import { sendMessage } from '@/actions/need-bot'
import type { CollectionConfig, PayloadRequest } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Order', plural: 'Orders' },
  admin: { useAsTitle: 'id' },
  access: {
    read: ({ req }) => (req.user ? { user: { equals: req.user.id } } : false),
    create: ({ req }) => !!req.user,
    update: ({ req }) => {
      if (req.user?.collection === 'users') return { user: { equals: req.user.id } }
      if (req.headers?.get('authorization') === `Bearer ${process.env.PAYLOAD_API_KEY}`) return true
      return false
    },
  },
  fields: [
    {
      name: 'messageToUser',
      type: 'textarea',
      label: 'Message to user (admin)',
      admin: {
        description:
          'Visible only when order status is "Paid". Enter the message and save to send to the user.',
        condition: (data, siblingData) => siblingData?.status === 'paid',
      },
    },
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { name: 'plan', type: 'relationship', relationTo: 'plans', required: true },
        { name: 'quantity', type: 'number', required: true },
        { name: 'price', type: 'number', required: true },
      ],
    },
    { name: 'total', type: 'number', required: true },
    { name: 'paymentInfo', type: 'json', admin: { readOnly: true, hidden: true } },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Completed', value: 'completed' },
      ],
      defaultValue: 'pending',
    },
    { name: 'createdAt', type: 'date', defaultValue: () => new Date(), admin: { readOnly: true } },
  ],

  hooks: {
    afterChange: [
      async ({ req, doc }: { req: PayloadRequest; doc: any }) => {
        try {
          if (!doc || doc.status !== 'paid' || !doc.messageToUser || doc.messageSent) return

          // Resolve user id from relationship
          const userId: string | undefined = typeof doc.user === 'string' ? doc.user : doc.user?.id
          if (!userId) return console.warn(`Order ${doc.id} has no user`)

          const user = await req.payload.findByID({ collection: 'users', id: userId, depth: 0 })
          const phoneRaw: string | undefined = user?.phone
          if (!phoneRaw) {
            await req.payload.update({
              collection: 'orders',
              id: doc.id,
              data: { updatedAt: new Date().toISOString() },
              overrideAccess: true,
              req,
            })
            return
          }

          const phone = phoneRaw.startsWith('+') ? phoneRaw.slice(1) : phoneRaw
          const message = doc.messageToUser

          const res = await sendMessage({ number: phone, message })
          const res1 = await sendMessage({ number: phone, message })
          if (!res) {
            await req.payload.update({
              collection: 'orders',
              id: doc.id,
              data: { updatedAt: new Date().toISOString() },
              overrideAccess: true,
              req,
            })
            return
          }

          // Mark message as sent
          await req.payload.update({
            collection: 'orders',
            id: doc.id,
            data: { updatedAt: new Date().toISOString() },
            overrideAccess: true,
            req,
          })
        } catch (err: any) {
          console.error('Error in Orders.afterChange hook:', err)
          try {
            await req.payload.update({
              collection: 'orders',
              id: doc.id,
              data: { updatedAt: new Date().toISOString() },
              overrideAccess: true,
              req,
            })
          } catch {}
        }
      },
    ],
  },
}

export default Orders
