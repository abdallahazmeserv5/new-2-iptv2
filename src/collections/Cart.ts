// src/collections/Cart.ts
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
      // only allow the logged-in user to read their own cart
      if (req.user) return { user: { equals: req.user.id } }
      return false
    },
    create: ({ req }) => !!req.user, // must be logged in
    update: ({ req }) => !!req.user,
    delete: ({ req }) => !!req.user,
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
      admin: { readOnly: true },
      hooks: {
        beforeChange: [
          () => new Date(), // auto update timestamp
        ],
      },
    },
  ],
}
