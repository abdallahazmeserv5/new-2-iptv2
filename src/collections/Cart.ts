import { isAdmin } from '@/modules/payload/utils'
import type { CollectionConfig } from 'payload'

export const Cart: CollectionConfig = {
  slug: 'carts',
  labels: {
    singular: 'Cart',
    plural: 'Carts',
  },
  admin: {
    useAsTitle: 'id',
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false
      return isAdmin({ req }) ? true : { user: { equals: req.user.id } }
    },
    create: ({ req }) => !!req.user,
    update: ({ req }) => {
      if (!req.user) return false
      if (isAdmin({ req })) return true
      return { user: { equals: req.user.id } }
    },
    delete: ({ req }) => {
      if (!req.user) return false
      return isAdmin({ req }) ? true : { user: { equals: req.user.id } }
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true, // one cart per user
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'plan',
          type: 'relationship',
          relationTo: 'plans',
          required: true,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          defaultValue: 1,
          min: 1,
        },
      ],
    },
    {
      name: 'updatedAt',
      type: 'date',
      hooks: {
        beforeChange: [
          () => new Date(), // auto update timestamp
        ],
      },
    },
  ],
}
