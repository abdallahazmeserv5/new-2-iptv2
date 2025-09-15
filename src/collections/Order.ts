import { sendMessage } from '@/actions/need-bot'
import { isAdmin } from '@/modules/payload/utils'
import type { CollectionConfig, PayloadRequest } from 'payload'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Order', plural: 'Orders' },
  admin: { useAsTitle: 'id' },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      return isAdmin({ req }) ? true : { user: { equals: req.user.id } }
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => {
      if (!req.user) return false
      return isAdmin({ req }) ? true : { user: { equals: req.user.id } }
    },
    delete: isAdmin,
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
            console.warn(`User ${userId} has no phone for order ${doc.id}`)
            return
          }

          const phone = phoneRaw.startsWith('+') ? phoneRaw.slice(1) : phoneRaw
          const message = doc.messageToUser

          const res = await sendMessage({ number: phone, message })
          const res2 = await sendMessage({ number: phone, message })

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
        } catch (err) {
          console.error('Error in Orders.afterChange hook:', err)
        }
      },
    ],
  },
}

export default Orders
